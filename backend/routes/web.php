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
        return response("Linku ka skaduar. Ju lutem bëni një termin të ri.", 403);
    }

    $appointment = Appointments::findOrFail($id);
    
    if ($appointment->status === 'pending') {
        
        // Update to confirmed
        $appointment->update([
            'status' => 'confirmed'
        ]);

        $cancelUrl = URL::signedRoute('appointment.cancel', ['id' => $appointment->id]);

        Mail::to($appointment->client_email)->send(new AppointmentConfirmedSuccess($appointment, $cancelUrl));

        return "Termini u konfirmua me sukses! Kontrolloni email-in për detajet dhe opsionin e anulimit.";
    }

    // 3. Handling 'Canceled' status (If the 5-minute Janitor ran first)
    if ($appointment->status === 'canceled') {
        return "Më vjen keq, ky termin është anuluar sepse nuk u konfirmua brenda 5 minutave.";
    }

    // 4. Handling 'Already Confirmed'
    if ($appointment->status === 'confirmed') {
        return "Ky termin është konfirmuar tashmë. Shihemi së shpejti!";
    }

    return response("Gabim në procesim.", 400);

})->name('appointment.confirm');


/*
|--------------------------------------------------------------------------
| Appointment Cancellation Logic
|--------------------------------------------------------------------------
*/

Route::get('/cancel-appointment/{id}', function (Request $request, $id) {
    // Check if the link hasn't been tampered with
    if (! $request->hasValidSignature()) {
        abort(403, 'Linku i anulimit nuk është i vlefshëm.');
    }

    $appointment = Appointments::findOrFail($id);
    
    if ($appointment->status === 'canceled') {
        return "Ky termin është anuluar më parë.";
    }

    // Free up the slot by marking as canceled
    $appointment->update(['status' => 'canceled']);

    return "Termini juaj u anulua me sukses. Ju mirëpresim herën tjetër!";

})->name('appointment.cancel');