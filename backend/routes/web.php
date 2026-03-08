<?php

use App\Models\Appointments;
use App\Mail\AppointmentConfirmedSuccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

Route::get('/up', function () {
    return response()->json(['status' => 'ok'], 200);
});

/*
|--------------------------------------------------------------------------
| Appointment Confirmation Logic
|--------------------------------------------------------------------------
*/

Route::get('/confirm-appointment/{id}', function (Request $request, $id) {
    if (! $request->hasValidSignature()) {
        return redirect(env('FRONTEND_URL') . '/appointment/invalid');
    }

    $appointment = Appointments::findOrFail($id);
    
    if ($appointment->status === 'pending') {
        Appointments::where('client_email', $appointment->client_email)
            ->where('business_id', $appointment->business_id)
            ->where('employee_id', $appointment->employee_id)
            ->where('status', 'pending')
            ->whereBetween('start_time', [
                Carbon::parse($appointment->start_time)->subMinutes(120),
                Carbon::parse($appointment->start_time)->addMinutes(120),
            ])
            ->update(['status' => 'confirmed']);

        $cancelUrl = URL::signedRoute('appointment.cancel', ['id' => $appointment->id]);
        Mail::to($appointment->client_email)->send(new AppointmentConfirmedSuccess($appointment, $cancelUrl));

        return redirect(env('FRONTEND_URL') . '/appointment/confirmed?id=' . $id);
    }

    if ($appointment->status === 'canceled') {
        return redirect(env('FRONTEND_URL') . '/appointment/invalid?reason=canceled');
    }

    if ($appointment->status === 'confirmed') {
        return redirect(env('FRONTEND_URL') . '/appointment/confirmed?id=' . $id);
    }

    return redirect(env('FRONTEND_URL') . '/appointment/invalid');

})->name('appointment.confirm');


/*
|--------------------------------------------------------------------------
| Appointment Cancellation Logic
|--------------------------------------------------------------------------
*/

Route::get('/cancel-appointment/{id}', function (Request $request, $id) {
    if (! $request->hasValidSignature()) {
        return redirect(env('FRONTEND_URL') . '/appointment/invalid');
    }

    $appointment = Appointments::findOrFail($id);
    
    if ($appointment->status === 'canceled') {
        return redirect(env('FRONTEND_URL') . '/appointment/canceled?id=' . $id);
    }

    Appointments::where('client_email', $appointment->client_email)
        ->where('business_id', $appointment->business_id)
        ->where('employee_id', $appointment->employee_id)
        ->whereIn('status', ['pending', 'confirmed'])
        ->whereBetween('start_time', [
            Carbon::parse($appointment->start_time)->subMinutes(120),
            Carbon::parse($appointment->start_time)->addMinutes(120),
        ])
        ->update(['status' => 'canceled']);

    return redirect(env('FRONTEND_URL') . '/appointment/canceled?id=' . $id);

})->name('appointment.cancel');