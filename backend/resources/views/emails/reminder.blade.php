<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td align="center" style="padding: 40px 40px 10px 40px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">⏰</div>
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Kujtesë për Termin</h2>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 20px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.6;">
                                Përshëndetje <strong>{{ $appointment->client_name }}</strong>,<br>
                                Shpresojmë të jeni mirë! Ky është një rikujtim i shpejtë nga <strong>PlanoraCo</strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; border: 1px solid #dbeafe;">
                                <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">Termini juaj fillon pas 2 orësh në:</p>
                                <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: 800; color: #1d4ed8;">
                                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('H:i') }}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 40px 40px; text-align: center;">
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #64748b;">
                                Ju lutemi të jeni të pranishëm 5 minuta para kohës së caktuar. Shihemi shpejt!
                            </p>
                            <hr style="border: none; border-top: 1px solid #f1f5f9; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                📍 <strong>PlanoraCo</strong><br>
                                Faleminderit që na zgjodhët!
                            </p>
                        </td>
                    </tr>

                </table>

                <table border="0" cellpadding="0" cellspacing="0" width="500">
                    <tr>
                        <td align="center" style="padding: 20px; font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px;">
                            Powered by Planora System
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>