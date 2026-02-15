<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\Business;
use App\Models\Services;
use App\Models\Schedules;
use App\Mail\AppointmentConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Check if business owner is active
     */
    private function checkBusinessActive($businessId): ?JsonResponse
    {
        Log::info("=== Checking Business Active ===");
        Log::info("Business ID received: " . $businessId);
        Log::info("Business ID type: " . gettype($businessId));

        // Try to find business
        $business = Business::with('user')->find($businessId);

        Log::info("Business query result:", ['found' => $business ? 'YES' : 'NO']);

        if (!$business) {
            Log::error("❌ Business NOT FOUND with ID: {$businessId}");
            
            // Let's check if ANY businesses exist
            $allBusinessIds = Business::pluck('id')->toArray();
            Log::info("All business IDs in database:", $allBusinessIds);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Biznesi nuk u gjet.',
                'debug' => [
                    'searched_id' => $businessId,
                    'existing_ids' => $allBusinessIds
                ]
            ], 404);
        }

        Log::info("✅ Business found:", [
            'id' => $business->id,
            'shop_name' => $business->shop_name,
            'user_id' => $business->user_id
        ]);

        // Check if owner exists
        if (!$business->user) {
            Log::error("❌ Business owner NOT FOUND for business ID: {$businessId}");
            return response()->json([
                'status' => 'error',
                'message' => 'Pronari i biznesit nuk u gjet.'
            ], 404);
        }

        Log::info("✅ Owner found:", [
            'user_id' => $business->user->id,
            'name' => $business->user->name,
            'status' => $business->user->status
        ]);

        // Check if owner is active
        if ($business->user->status !== 'active') {
            Log::warning("⚠️ Business owner is NOT ACTIVE. Status: " . $business->user->status);
            return response()->json([
                'status' => 'error',
                'message' => 'Ky biznes është i çaktivizuar momentalisht. Ju lutemi provoni më vonë.'
            ], 403);
        }

        Log::info("✅ Business active check PASSED");
        return null; // All good
    }

    public function getAvailableSlots(Request $request): JsonResponse
    {
        Log::info("=== Get Available Slots Request ===");
        Log::info("Request data:", $request->all());

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'service_id'  => 'required|exists:services,id',
            'date'        => 'required|date|after_or_equal:today',
        ]);

        $service = Services::findOrFail($request->service_id);
        $businessId = $service->business_id;

        Log::info("Service found:", [
            'service_id' => $service->id,
            'business_id' => $businessId,
            'business_id_type' => gettype($businessId)
        ]);

        // CHECK IF BUSINESS OWNER IS ACTIVE
        $businessCheck = $this->checkBusinessActive($businessId);
        if ($businessCheck) {
            return $businessCheck;
        }

        $duration = $service->service_duration; 
        $date = $request->date;

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        
        $schedule = Schedules::where('business_id', $businessId)
            ->where('day_of_week', $dayOfWeek)
            ->where(function($q) use ($request) {
                $q->where('employee_id', $request->employee_id)
                  ->orWhereNull('employee_id');
            })
            ->orderBy('employee_id', 'desc')
            ->first();

        if (!$schedule || $schedule->is_off) {
            Log::info("No schedule or is_off for this day");
            return response()->json([], 200);
        }

        $bookings = Appointments::where('employee_id', $request->employee_id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['active', 'pending'])
            ->get();

        $availableSlots = [];
        $startTime = Carbon::parse($date . ' ' . $schedule->open_at);
        $endTime = Carbon::parse($date . ' ' . $schedule->close_at);

        while ($startTime->copy()->addMinutes($duration) <= $endTime) {
            $slotStart = $startTime->copy();
            $slotEnd = $startTime->copy()->addMinutes($duration);

            $overlapBreak = false;
            if ($schedule->break_start && $schedule->break_end) {
                $breakStart = Carbon::parse($date . ' ' . $schedule->break_start);
                $breakEnd = Carbon::parse($date . ' ' . $schedule->break_end);
                if ($slotStart < $breakEnd && $slotEnd > $breakStart) $overlapBreak = true;
            }

            $overlapBooking = $bookings->contains(function ($booking) use ($slotStart, $slotEnd) {
                return $slotStart < $booking->finish_time && $slotEnd > $booking->start_time;
            });

            if (!$overlapBreak && !$overlapBooking && !$slotStart->isPast()) {
                $availableSlots[] = $slotStart->format('H:i');
            }

            $startTime->addMinutes($duration); 
        }

        Log::info("Available slots found: " . count($availableSlots));
        return response()->json($availableSlots);
    }

    public function createAppointment(Request $request): JsonResponse
    {
        Log::info("=== Create Appointment Request ===");
        Log::info("Request data:", $request->all());

        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'employee_id' => 'required|exists:employees,id',
            'service_id'  => 'required|exists:services,id',
            'start_time'  => 'required|date|after:now',
            'client_name' => 'required|string|max:50',
            'client_phone'=> 'required|string|min:9', 
            'client_email'=> 'required|email',
        ]);

        // CHECK IF BUSINESS OWNER IS ACTIVE
        $businessCheck = $this->checkBusinessActive($request->business_id);
        if ($businessCheck) {
            return $businessCheck;
        }

        try {
            return DB::transaction(function () use ($request) {
                
                $service = Services::findOrFail($request->service_id);
                $startTime = Carbon::parse($request->start_time);
                $finishTime = $startTime->copy()->addMinutes($service->service_duration);

                $dayOfWeek = $startTime->dayOfWeek; 
                $requestedTimeOnly = $startTime->format('H:i:s');
                $requestedFinishOnly = $finishTime->format('H:i:s');

                $schedule = Schedules::where('business_id', $request->business_id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where(function($query) use ($request) {
                        $query->where('employee_id', $request->employee_id)
                              ->orWhereNull('employee_id');
                    })
                    ->orderBy('employee_id', 'desc') 
                    ->first();

                if (!$schedule || $schedule->is_off) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Ky biznes ose punonjës nuk punon në këtë ditë.'
                    ], 422);
                }

                if ($requestedTimeOnly < $schedule->open_at || $requestedFinishOnly > $schedule->close_at) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Termini duhet të jetë brenda orarit të punës.'
                    ], 422);
                }

                if ($schedule->break_start && $schedule->break_end) {
                    $startsInBreak = ($requestedTimeOnly >= $schedule->break_start && $requestedTimeOnly < $schedule->break_end);
                    $endsInBreak = ($requestedFinishOnly > $schedule->break_start && $requestedFinishOnly <= $schedule->break_end);
                    $coversBreak = ($requestedTimeOnly < $schedule->break_start && $requestedFinishOnly > $schedule->break_end);

                    if ($startsInBreak || $endsInBreak || $coversBreak) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Ky orar përfshin pauzën e bukës.'
                        ], 422);
                    }
                }

                $isBusy = Appointments::where('employee_id', $request->employee_id)
                    ->whereIn('status', ['active', 'pending']) 
                    ->where(function ($query) use ($startTime, $finishTime) {
                        $query->where('start_time', '<', $finishTime)
                              ->where('finish_time', '>', $startTime);
                    })
                    ->lockForUpdate() 
                    ->exists();

                if ($isBusy) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Ky termin sapo u zunë nga dikush tjetër.'
                    ], 409);
                }

                $appointment = Appointments::create([
                    'business_id' => $request->business_id,
                    'employee_id' => $request->employee_id,
                    'service_id'  => $request->service_id,
                    'client_name' => $request->client_name,
                    'client_phone'=> $request->client_phone,
                    'client_email'=> $request->client_email,
                    'start_time'  => $startTime,
                    'finish_time' => $finishTime,
                    'status'      => 'pending', 
                ]);

                $confirmationUrl = URL::temporarySignedRoute(
                    'appointment.confirm', 
                    now()->addMinutes(30), 
                    ['id' => $appointment->id]
                );

                Mail::to($appointment->client_email)->send(new AppointmentConfirmationMail($appointment, $confirmationUrl));

                Log::info("✅ Appointment created successfully", ['id' => $appointment->id]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Termini u rezervua me sukses! Kontrolloni email-in tuaj për konfirmim.',
                    'appointment_id' => $appointment->id
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("❌ Appointment creation failed:", ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Diçka shkoi keq gjatë krijimit të terminit.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}