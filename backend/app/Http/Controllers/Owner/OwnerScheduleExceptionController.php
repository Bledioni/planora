<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\ScheduleException;
use App\Mail\AppointmentCancelledMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class OwnerScheduleExceptionController extends Controller
{
    public function blockDate(Request $request)
    {
        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date|after_or_equal:today',
            'reason'      => 'nullable|string|max:255',
        ]);

        $alreadyBlocked = ScheduleException::where('employee_id', $validated['employee_id'])
            ->where('date', $validated['date'])
            ->exists();

        if ($alreadyBlocked) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kjo datë është tashmë e bllokuar.'
            ], 422);
        }

        try {
            DB::beginTransaction();

            ScheduleException::create($validated);

            $appointments = Appointments::where('employee_id', $validated['employee_id'])
                ->where('business_id', $validated['business_id'])
                ->whereDate('start_time', $validated['date'])
                ->whereIn('status', ['pending', 'confirmed'])
                ->get();

            $cancelledCount = 0;

            foreach ($appointments as $appointment) {
                $appointment->update(['status' => 'canceled']);

                try {
                    Mail::to($appointment->client_email)
                        ->send(new AppointmentCancelledMail(
                            $appointment,
                            $validated['reason'] ?? null  // ✅ pass reason
                        ));
                } catch (\Exception $mailErr) {
                    Log::error('Failed to send cancellation email: ' . $mailErr->getMessage());
                }

                $cancelledCount++;
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => "Data u bllokua. {$cancelledCount} termin(e) u anuluan dhe klientët u njoftuan me email.",
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error blocking date: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Ndodhi një gabim gjatë bllokimit të datës.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function getBlockedDates($businessId, $employeeId)
    {
        $exceptions = ScheduleException::where('business_id', $businessId)
            ->where('employee_id', $employeeId)
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $exceptions
        ], 200);
    }

    public function unblockDate($id)
    {
        $exception = ScheduleException::find($id);

        if (!$exception) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data e bllokuar nuk u gjet.'
            ], 404);
        }

        $exception->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data u çbllokua me sukses.'
        ], 200);
    }
}