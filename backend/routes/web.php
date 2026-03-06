<?php

use App\Models\Appointments;
use App\Mail\AppointmentConfirmedSuccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Route;

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
        $appointment->update(['status' => 'confirmed']);

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


Route::get('/cancel-appointment/{id}', function (Request $request, $id) {
    if (! $request->hasValidSignature()) {
        return redirect(env('FRONTEND_URL') . '/appointment/invalid');
    }

    $appointment = Appointments::findOrFail($id);
    
    if ($appointment->status === 'canceled') {
        return redirect(env('FRONTEND_URL') . '/appointment/canceled?id=' . $id);
    }

    $appointment->update(['status' => 'canceled']);

    return redirect(env('FRONTEND_URL') . '/appointment/canceled?id=' . $id);

})->name('appointment.cancel');