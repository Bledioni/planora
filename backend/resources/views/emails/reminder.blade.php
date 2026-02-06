<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h3>Përshëndetje, {{ $appointment->client_name }}!</h3>
    <p>Kjo është një kujtesë nga <strong>PlanoraCo</strong>.</p>
    <p>Ke termin pas 2 orësh në ora: <strong>{{ \Carbon\Carbon::parse($appointment->start_time)->format('H:i') }}</strong>.</p>
    <p>Shihemi shpejt!</p>
</body>
</html>