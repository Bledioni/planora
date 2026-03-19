<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\Business;
use App\Models\Services;
use App\Models\Schedules;
use App\Models\ScheduleException;
use App\Mail\AppointmentConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\BookingAttempt;
use Illuminate\Support\Str;

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

        // ✅ Check if this date is blocked
        $isBlocked = ScheduleException::where('employee_id', $request->employee_id)
            ->where('business_id', $businessId)
            ->where('date', $date)
            ->exists();

        if ($isBlocked) {
            return response()->json([], 200);
        }

        $bookings = Appointments::where('employee_id', $request->employee_id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['active', 'pending', 'confirmed'])
            ->get()
            ->sortBy('start_time')
            ->values();

        $openTime = Carbon::parse($date . ' ' . $schedule->open_at);
        $endTime  = Carbon::parse($date . ' ' . $schedule->close_at);

        $availableSlots = [];
        $pointer        = $openTime->copy();

        while ($pointer->copy()->addMinutes($totalDuration) <= $endTime) {

            $blockingBooking = $bookings->first(function ($booking) use ($pointer) {
                return $pointer >= Carbon::parse($booking->start_time)
                    && $pointer < Carbon::parse($booking->finish_time);
            });

            if ($blockingBooking) {
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

        $clientIp    = $request->ip();
        $fingerprint = $request->input('fingerprint');

        $attempts = BookingAttempt::where('created_at', '>=', now()->subHours(24))
            ->where(function ($query) use ($clientIp, $request, $fingerprint) {
                $query->where('client_ip', $clientIp)
                    ->orWhere('client_phone', $request->client_phone)
                    ->orWhere('fingerprint', $fingerprint);
            })
            ->count();

        if ($attempts >= 2) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Nuk mund të bëni më shumë se 2 rezervime brenda 24 orëve.'
            ], 429);
        }

        BookingAttempt::create([
            'client_ip'    => $clientIp,
            'client_phone' => $request->client_phone,
            'fingerprint'  => $fingerprint, // ← just add this line
        ]);

        try {
            return DB::transaction(function () use ($request) {

                $services = Services::whereIn('id', $request->service_ids)
                    ->where('business_id', $request->business_id)
                    ->get();

                if ($services->count() !== count($request->service_ids)) {
                    return response()->json(['status' => 'error', 'message' => 'Një ose më shumë shërbime nuk u gjetën.'], 422);
                }

                $totalDuration = $this->sumDurations($services);
                $startTime     = Carbon::parse($request->start_time);
                $finishTime    = $startTime->copy()->addMinutes($totalDuration);
                $dayOfWeek     = $startTime->dayOfWeek;

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

                // ✅ Check if this date is blocked
                $isBlocked = ScheduleException::where('employee_id', $request->employee_id)
                    ->where('business_id', $request->business_id)
                    ->where('date', $startTime->toDateString())
                    ->exists();

                if ($isBlocked) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Ky punonjës nuk është i disponueshëm në këtë datë.'
                    ], 422);
                }

                $isBusy = Appointments::where('employee_id', $request->employee_id)
                    ->whereIn('status', ['active', 'confirmed'])
                    ->where(function ($query) use ($startTime, $finishTime) {
                        $query->where('start_time', '<', $finishTime)
                              ->where('finish_time', '>', $startTime);
                    })
                    ->lockForUpdate()
                    ->exists();

                if ($isBusy) {
                    return response()->json(['status' => 'error', 'message' => 'Ky termin sapo u zu nga dikush tjetër.'], 409);
                }

                $appointments = [];
                $serviceStart = $startTime->copy();
                $bookingId    = (string) Str::uuid();

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
                        'status'       => 'confirmed',
                        'booking_id'   => $bookingId,
                    ]);

                    $serviceStart = $serviceFinish->copy();
                }

                try {
                    Mail::to($request->client_email)
                        ->send(new \App\Mail\AppointmentConfirmedSuccess($appointments[0]));
                } catch (\Exception $e) {
                    Log::warning("Email failed but appointment was saved: " . $e->getMessage());
                }

                return response()->json([
                    'status'          => 'success',
                    'message'         => 'Termini u rezervua dhe u konfirmua me sukses!',
                    'appointment_ids' => array_map(fn($a) => $a->id, $appointments),
                    'start_time'      => $startTime->format('Y-m-d H:i'),
                    'finish_time'     => $finishTime->format('Y-m-d H:i'),
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error("❌ Appointment creation failed:", ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Diçka shkoi keq gjatë krijimit të terminit.'
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
                'id'           => $appointment->id,
                'client_name'  => $appointment->client_name,
                'client_email' => $appointment->client_email,
                'client_phone' => $appointment->client_phone,
                'status'       => $appointment->status,
                'start_time'   => Carbon::parse($appointment->start_time)->format('d/m/Y H:i'),
                'finish_time'  => Carbon::parse($appointment->finish_time)->format('d/m/Y H:i'),
                'service'      => $appointment->service->service_name ?? 'N/A',
                'employee'     => ($appointment->employee->user->name ?? '') . ' ' . ($appointment->employee->user->surname ?? ''),
                'business'     => $appointment->business->shop_name ?? 'N/A',
                'cancel_url'   => URL::signedRoute('appointment.cancel', ['id' => $appointment->id]),
            ]
        ]);
    }

    public function getBlockedDates(Request $request): JsonResponse
{
    $request->validate([
        'employee_id'   => 'required|exists:employees,id',
        'service_ids'   => 'required|array|min:1',
        'service_ids.*' => 'exists:services,id',
        'year'          => 'required|integer',
        'month'         => 'required|integer|min:1|max:12',
    ]);

    $services = Services::whereIn('id', $request->service_ids)->get();
    $businessId = $services->pluck('business_id')->unique()->first();
    $totalDuration = $this->sumDurations($services);

    // Get all days in the given month
    $startOfMonth = Carbon::createFromDate($request->year, $request->month, 1)->startOfMonth();
    $endOfMonth   = $startOfMonth->copy()->endOfMonth();

    $blockedDates = [];
    $current = $startOfMonth->copy();

    while ($current <= $endOfMonth) {
        $date      = $current->toDateString();
        $dayOfWeek = $current->dayOfWeek;

        // Check if business works this day
        $schedule = Schedules::where('business_id', $businessId)
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($q) use ($request) {
                $q->where('employee_id', $request->employee_id)->orWhereNull('employee_id');
            })
            ->orderBy('employee_id', 'desc')
            ->first();

        if (!$schedule || $schedule->is_off) {
            $blockedDates[] = $date;
            $current->addDay();
            continue;
        }

        // Check if date is a schedule exception (day off)
        $isException = ScheduleException::where('employee_id', $request->employee_id)
            ->where('business_id', $businessId)
            ->where('date', $date)
            ->exists();

        if ($isException) {
            $blockedDates[] = $date;
            $current->addDay();
            continue;
        }

        // Check if there are any available slots
        $bookings = Appointments::where('employee_id', $request->employee_id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['active', 'pending', 'confirmed'])
            ->get()
            ->sortBy('start_time')
            ->values();

        $openTime = Carbon::parse($date . ' ' . $schedule->open_at);
        $endTime  = Carbon::parse($date . ' ' . $schedule->close_at);

        $hasSlot = false;
        $pointer = $openTime->copy();

        while ($pointer->copy()->addMinutes($totalDuration) <= $endTime) {
            $blockingBooking = $bookings->first(function ($booking) use ($pointer) {
                return $pointer >= Carbon::parse($booking->start_time)
                    && $pointer < Carbon::parse($booking->finish_time);
            });

            if ($blockingBooking) {
                $pointer = Carbon::parse($blockingBooking->finish_time);
                continue;
            }

            $slotStart = $pointer->copy();
            $slotEnd   = $pointer->copy()->addMinutes($totalDuration);

            if ($schedule->break_start && $schedule->break_end) {
                $breakStart = Carbon::parse($date . ' ' . $schedule->break_start);
                $breakEnd   = Carbon::parse($date . ' ' . $schedule->break_end);
                if ($slotStart < $breakEnd && $slotEnd > $breakStart) {
                    $pointer = $breakEnd->copy();
                    continue;
                }
            }

            $overlapBooking = $bookings->contains(function ($booking) use ($slotStart, $slotEnd) {
                return $slotStart < Carbon::parse($booking->finish_time)
                    && $slotEnd > Carbon::parse($booking->start_time);
            });

            if (!$overlapBooking && !$slotStart->isPast()) {
                $hasSlot = true;
                break;
            }

            $pointer->addMinutes($totalDuration);
        }

        if (!$hasSlot) {
            $blockedDates[] = $date;
        }

        $current->addDay();
    }

    return response()->json($blockedDates);
}
}