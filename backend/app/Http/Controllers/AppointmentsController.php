<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\Services;
use App\Models\Schedules; // Ensure this is imported
use App\Mail\AppointmentConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB; 
use Carbon\Carbon;

class AppointmentsController extends Controller
{
    public function MakeAppointment(Request $request): JsonResponse
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'employee_id' => 'required|exists:employees,id',
            'service_id'  => 'required|exists:services,id',
            'start_time'  => 'required|date|after:now',
            'client_name' => 'required|string|max:50',
            'client_phone'=> 'required|string|min:9', 
            'client_email'=> 'required|email',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                
                $service = Services::findOrFail($request->service_id);
                $startTime = Carbon::parse($request->start_time);
                $finishTime = $startTime->copy()->addMinutes($service->service_duration);

                $dayOfWeek = $startTime->dayOfWeek; 
                $requestedTimeOnly = $startTime->format('H:i:s');
                $requestedFinishOnly = $finishTime->format('H:i:s');

                // --- HIERARCHICAL SCHEDULE LOGIC ---
                // 1. Try to find the specific employee override first
                // 2. Fallback to the business default (where employee_id is null)
                $schedule = Schedules::where('business_id', $request->business_id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where(function($query) use ($request) {
                        $query->where('employee_id', $request->employee_id)
                              ->orWhereNull('employee_id');
                    })
                    // Sorting by employee_id DESC ensures the specific ID (if exists) 
                    // comes before the NULL (the default)
                    ->orderBy('employee_id', 'desc') 
                    ->first();

                // 1. Check if any schedule rule exists and if it's an "Off Day"
                if (!$schedule || $schedule->is_off) {
                    return response()->json(['message' => 'Ky biznes ose punonjës nuk punon në këtë ditë.'], 422);
                }

                // 2. Check if the appointment fits inside the found working hours
                if ($requestedTimeOnly < $schedule->open_at || $requestedFinishOnly > $schedule->close_at) {
                    return response()->json(['message' => 'Termini duhet të jetë brenda orarit të punës.'], 422);
                }

                // 3. Check for Lunch Break (Rest Hours)
                if ($schedule->break_start && $schedule->break_end) {
                    $startsInBreak = ($requestedTimeOnly >= $schedule->break_start && $requestedTimeOnly < $schedule->break_end);
                    $endsInBreak = ($requestedFinishOnly > $schedule->break_start && $requestedFinishOnly <= $schedule->break_end);
                    $coversBreak = ($requestedTimeOnly < $schedule->break_start && $requestedFinishOnly > $schedule->break_end);

                    if ($startsInBreak || $endsInBreak || $coversBreak) {
                        return response()->json(['message' => 'Ky orar përfshin pauzën e bukës.'], 422);
                    }
                }
                // --- END SCHEDULE VALIDATION ---

                $isBusy = Appointments::where('employee_id', $request->employee_id)
                    ->whereIn('status', ['confirmed', 'pending']) 
                    ->where(function ($query) use ($startTime, $finishTime) {
                        $query->where('start_time', '<', $finishTime)
                              ->where('finish_time', '>', $startTime);
                    })
                    ->lockForUpdate() 
                    ->exists();

                if ($isBusy) {
                    return response()->json(['message' => 'Ky termin sapo u zunë nga dikush tjetër.'], 409);
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

                return response()->json([
                    'status' => 'success',
                    'message' => 'Termini u rezervua me sukses!',
                    'appointment_id' => $appointment->id
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Diçka shkoi keq.',
                'debug' => $e->getMessage() 
            ], 500);
        }
    }


    public function getAvailableSlots(Request $request): JsonResponse
{
    // FIX: We don't require business_id from the request anymore
    // we will find it via the service_id
    $request->validate([
        'employee_id' => 'required|exists:employees,id',
        'service_id'  => 'required|exists:services,id',
        'date'        => 'required|date|after_or_equal:today',
    ]);

    $service = Services::findOrFail($request->service_id);
    $businessId = $service->business_id; // Found it!
    $duration = $service->service_duration; 
    $date = $request->date;

    $dayOfWeek = Carbon::parse($date)->dayOfWeek;
    
    // Using the businessId we just found
    $schedule = Schedules::where('business_id', $businessId)
        ->where('day_of_week', $dayOfWeek)
        ->where(function($q) use ($request) {
            $q->where('employee_id', $request->employee_id)
              ->orWhereNull('employee_id');
        })
        ->orderBy('employee_id', 'desc')
        ->first();

    if (!$schedule || $schedule->is_off) {
        return response()->json([], 200); // Return empty array instead of "Mbyllur"
    }

    $bookings = Appointments::where('employee_id', $request->employee_id)
        ->whereDate('start_time', $date)
        ->whereIn('status', ['confirmed', 'pending'])
        ->get();

    $availableSlots = [];
    $startTime = Carbon::parse($date . ' ' . $schedule->open_at);
    $endTime = Carbon::parse($date . ' ' . $schedule->close_at);

    // If booking for today, don't show slots in the past
    while ($startTime->copy()->addMinutes($duration) <= $endTime) {
        $slotStart = $startTime->copy();
        $slotEnd = $startTime->copy()->addMinutes($duration);

        // Check Break
        $overlapBreak = false;
        if ($schedule->break_start && $schedule->break_end) {
            $breakStart = Carbon::parse($date . ' ' . $schedule->break_start);
            $breakEnd = Carbon::parse($date . ' ' . $schedule->break_end);
            if ($slotStart < $breakEnd && $slotEnd > $breakStart) $overlapBreak = true;
        }

        // Check Bookings
        $overlapBooking = $bookings->contains(function ($booking) use ($slotStart, $slotEnd) {
            return $slotStart < $booking->finish_time && $slotEnd > $booking->start_time;
        });

        if (!$overlapBreak && !$overlapBooking && !$slotStart->isPast()) {
            $availableSlots[] = $slotStart->format('H:i');
        }

        $startTime->addMinutes($duration); 
    }

    return response()->json($availableSlots);
}

}