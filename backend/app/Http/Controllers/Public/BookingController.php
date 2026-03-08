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
    private function checkBusinessActive($businessId): ?JsonResponse
    {
        $business = Business::with('user')->find($businessId);

        if (!$business) {
            return response()->json(['status' => 'error', 'message' => 'Biznesi nuk u gjet.'], 404);
        }

        if (!$business->user) {
            return response()->json(['status' => 'error', 'message' => 'Pronari i biznesit nuk u gjet.'], 404);
        }

        if ($business->user->status !== 'active') {
            return response()->json(['status' => 'error', 'message' => 'Ky biznes është i çaktivizuar momentalisht. Ju lutemi provoni më vonë.'], 403);
        }

        return null;
    }

    private function parseDurationToMinutes(string $duration): int
    {
        if (str_contains($duration, ':')) {
            [$hours, $minutes] = explode(':', $duration);
            return ($hours * 60) + (int)$minutes;
        }
        return (int)$duration;
    }

    private function sumDurations($services): int
    {
        return $services->sum(function ($service) {
            return $this->parseDurationToMinutes($service->service_duration);
        });
    }
public function getAvailableSlots(Request $request): JsonResponse
{
    $request->validate([
        'employee_id'   => 'required|exists:employees,id',
        'service_ids'   => 'required|array|min:1',
        'service_ids.*' => 'exists:services,id',
        'date'          => 'required|date|after_or_equal:today',
    ]);

    $services = Services::whereIn('id', $request->service_ids)->get();

    $businessIds = $services->pluck('business_id')->unique();
    if ($businessIds->count() > 1) {
        return response()->json(['status' => 'error', 'message' => 'Të gjitha shërbimet duhet të jenë nga i njëjti biznes.'], 422);
    }

    $businessId    = $businessIds->first();
    $totalDuration = $this->sumDurations($services);

    if ($totalDuration <= 0) {
        return response()->json(['status' => 'error', 'message' => 'Kohëzgjatja e shërbimit është e pavlefshme.'], 422);
    }

    $businessCheck = $this->checkBusinessActive($businessId);
    if ($businessCheck) return $businessCheck;

    $date      = $request->date;
    $dayOfWeek = Carbon::parse($date)->dayOfWeek;

    $schedule = Schedules::where('business_id', $businessId)
        ->where('day_of_week', $dayOfWeek)
        ->where(function ($q) use ($request) {
            $q->where('employee_id', $request->employee_id)->orWhereNull('employee_id');
        })
        ->orderBy('employee_id', 'desc')
        ->first();

    if (!$schedule || $schedule->is_off) {
        return response()->json([], 200);
    }

    $bookings = Appointments::where('employee_id', $request->employee_id)
        ->whereDate('start_time', $date)
        ->whereIn('status', ['active', 'pending' , 'confirmed'])
        ->get()
        ->sortBy('start_time')
        ->values();

    $openTime = Carbon::parse($date . ' ' . $schedule->open_at);
    $endTime  = Carbon::parse($date . ' ' . $schedule->close_at);

    $availableSlots = [];
    $pointer        = $openTime->copy();

    while ($pointer->copy()->addMinutes($totalDuration) <= $endTime) {

        // check if pointer is inside a booking
        $blockingBooking = $bookings->first(function ($booking) use ($pointer) {
            return $pointer >= Carbon::parse($booking->start_time)
                && $pointer < Carbon::parse($booking->finish_time);
        });

        if ($blockingBooking) {
            // jump to the end of this booking and continue
            $pointer = Carbon::parse($blockingBooking->finish_time);
            continue;
        }

        $slotStart = $pointer->copy();
        $slotEnd   = $pointer->copy()->addMinutes($totalDuration);

        $overlapBreak = false;
        if ($schedule->break_start && $schedule->break_end) {
            $breakStart = Carbon::parse($date . ' ' . $schedule->break_start);
            $breakEnd   = Carbon::parse($date . ' ' . $schedule->break_end);
            if ($slotStart < $breakEnd && $slotEnd > $breakStart) {
                $overlapBreak = true;
                // jump past the break
                $pointer = $breakEnd->copy();
                continue;
            }
        }

        $overlapBooking = $bookings->contains(function ($booking) use ($slotStart, $slotEnd) {
            return $slotStart < Carbon::parse($booking->finish_time)
                && $slotEnd > Carbon::parse($booking->start_time);
        });

        if (!$overlapBooking && !$slotStart->isPast()) {
            $availableSlots[] = $slotStart->format('H:i');
        }

        $pointer->addMinutes($totalDuration);
    }

    return response()->json($availableSlots);
}

    public function createAppointment(Request $request): JsonResponse
    {
        $request->validate([
            'business_id'   => 'required|exists:businesses,id',
            'employee_id'   => 'required|exists:employees,id',
            'service_ids'   => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
            'start_time'    => 'required|date|after:now',
            'client_name'   => 'required|string|max:50',
            'client_phone'  => 'required|string|min:9',
            'client_email'  => 'required|email',
        ]);

        $businessCheck = $this->checkBusinessActive($request->business_id);
        if ($businessCheck) return $businessCheck;

        try {
            return DB::transaction(function () use ($request) {

                $services = Services::whereIn('id', $request->service_ids)
                    ->where('business_id', $request->business_id)
                    ->get();

                if ($services->count() !== count($request->service_ids)) {
                    return response()->json(['status' => 'error', 'message' => 'Një ose më shumë shërbime nuk u gjetën për këtë biznes.'], 422);
                }

                $totalDuration       = $this->sumDurations($services);
                $startTime           = Carbon::parse($request->start_time);
                $finishTime          = $startTime->copy()->addMinutes($totalDuration);
                $dayOfWeek           = $startTime->dayOfWeek;
                $requestedTimeOnly   = $startTime->format('H:i:s');
                $requestedFinishOnly = $finishTime->format('H:i:s');

                $schedule = Schedules::where('business_id', $request->business_id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where(function ($query) use ($request) {
                        $query->where('employee_id', $request->employee_id)->orWhereNull('employee_id');
                    })
                    ->orderBy('employee_id', 'desc')
                    ->first();

                if (!$schedule || $schedule->is_off) {
                    return response()->json(['status' => 'error', 'message' => 'Ky biznes ose punonjës nuk punon në këtë ditë.'], 422);
                }

                if ($requestedTimeOnly < $schedule->open_at || $requestedFinishOnly > $schedule->close_at) {
                    return response()->json(['status' => 'error', 'message' => 'Termini duhet të jetë brenda orarit të punës.'], 422);
                }

                if ($schedule->break_start && $schedule->break_end) {
                    $startsInBreak = ($requestedTimeOnly >= $schedule->break_start && $requestedTimeOnly < $schedule->break_end);
                    $endsInBreak   = ($requestedFinishOnly > $schedule->break_start && $requestedFinishOnly <= $schedule->break_end);
                    $coversBreak   = ($requestedTimeOnly < $schedule->break_start && $requestedFinishOnly > $schedule->break_end);

                    if ($startsInBreak || $endsInBreak || $coversBreak) {
                        return response()->json(['status' => 'error', 'message' => 'Ky orar përfshin pauzën e bukës.'], 422);
                    }
                }

                $isBusy = Appointments::where('employee_id', $request->employee_id)
                    ->whereIn('status', ['active', 'pending' , 'confirmed'])
                    ->where(function ($query) use ($startTime, $finishTime) {
                        $query->where('start_time', '<', $finishTime)->where('finish_time', '>', $startTime);
                    })
                    ->lockForUpdate()
                    ->exists();

                if ($isBusy) {
                    return response()->json(['status' => 'error', 'message' => 'Ky termin sapo u zunë nga dikush tjetër.'], 409);
                }

                $appointments = [];
                $serviceStart = $startTime->copy();

                foreach ($services as $service) {
                    $serviceDuration = $this->parseDurationToMinutes($service->service_duration);
                    $serviceFinish   = $serviceStart->copy()->addMinutes($serviceDuration);

                    $appointments[] = Appointments::create([
                        'business_id'  => $request->business_id,
                        'employee_id'  => $request->employee_id,
                        'service_id'   => $service->id,
                        'client_name'  => $request->client_name,
                        'client_phone' => $request->client_phone,
                        'client_email' => $request->client_email,
                        'start_time'   => $serviceStart,
                        'finish_time'  => $serviceFinish,
                        'status'       => 'pending',
                    ]);

                    $serviceStart = $serviceFinish->copy();
                }

                $confirmationUrl = URL::temporarySignedRoute(
                    'appointment.confirm',
                    now()->addMinutes(30),
                    ['id' => $appointments[0]->id]
                );

                Mail::to($appointments[0]->client_email)
                    ->send(new AppointmentConfirmationMail($appointments[0], $confirmationUrl));

                return response()->json([
                    'status'          => 'success',
                    'message'         => 'Termini u rezervua me sukses! Kontrolloni email-in tuaj për konfirmim.',
                    'appointment_ids' => array_map(fn($a) => $a->id, $appointments),
                    'total_duration'  => $totalDuration,
                    'start_time'      => $startTime->format('Y-m-d H:i'),
                    'finish_time'     => $finishTime->format('Y-m-d H:i'),
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("❌ Appointment creation failed:", ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Diçka shkoi keq gjatë krijimit të terminit.',
                'debug'   => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function getAppointmentDetails(Request $request, $id): JsonResponse
{
    $appointment = Appointments::with(['service', 'employee.user', 'business'])
        ->findOrFail($id);

    return response()->json([
        'status' => 'success',
        'appointment' => [
            'id'            => $appointment->id,
            'client_name'   => $appointment->client_name,
            'client_email'  => $appointment->client_email,
            'client_phone'  => $appointment->client_phone,
            'status'        => $appointment->status,
            'start_time'    => Carbon::parse($appointment->start_time)->format('d/m/Y H:i'),
            'finish_time'   => Carbon::parse($appointment->finish_time)->format('d/m/Y H:i'),
            'service'       => $appointment->service->service_name ?? 'N/A',
            'employee'      => ($appointment->employee->user->name ?? '') . ' ' . ($appointment->employee->user->surname ?? ''),
            'business'      => $appointment->business->shop_name ?? 'N/A',
            'cancel_url' => URL::signedRoute('appointment.cancel', ['id' => $appointment->id]),
        ]
    ]);
}

public function confirmAppointment(Request $request, $id): \Illuminate\Http\RedirectResponse
{
    if (!$request->hasValidSignature()) {
        return redirect(env('FRONTEND_URL') . '/appointment/invalid');
    }

    $appointment = Appointments::findOrFail($id);

    if ($appointment->status === 'pending') {
        $toConfirm = Appointments::where('client_email', $appointment->client_email)
            ->where('business_id', $appointment->business_id)
            ->where('employee_id', $appointment->employee_id)
            ->where('status', 'pending')
            ->whereBetween('start_time', [
                Carbon::parse($appointment->start_time)->subMinutes(120),
                Carbon::parse($appointment->start_time)->addMinutes(120),
            ])
            ->get();

        Log::info('Appointments to confirm:', $toConfirm->pluck('id')->toArray());

        $toConfirm->each->update(['status' => 'confirmed']);

        Mail::to($appointment->client_email)
            ->send(new \App\Mail\AppointmentConfirmedSuccess($appointment, ''));
    }

    return redirect(env('FRONTEND_URL') . '/appointment/confirmed?id=' . $id);
}

}