<!DOCTYPE html>
<html>
<body>
    <h2>Termini juaj u anulua</h2>
    <p>Pershendetje {{ $appointment->client_name }},</p>
    <p>Termini juaj i planifikuar për <strong>{{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y H:i') }}</strong> u anulua nga biznesi.</p>
    <p>Ju lutemi kontaktoni biznesin për më shumë informacion.</p>
</body>
</html>