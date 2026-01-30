<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Konfirmo Terminin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Figtree', sans-serif; background-color: #f4f4f7; color: #51545e;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f7; padding: 20px;">
        <tr>
            <td align="center">
                <table width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td>
                            <h1 style="color: #333333; font-size: 19px; font-weight: bold; margin-top: 0;">Përshëndetje {{ $appointment->client_name }},</h1>
                            <p style="font-size: 16px; line-height: 1.6; color: #51545e;">
                                Faleminderit që zgjodhët <strong>Planora</strong>. Për të përfunduar rezervimin tuaj, ju lutem konfirmoni terminin duke klikuar butonin e mëposhtëm:
                            </p>
                            
                            <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 30px auto; text-align: center;">
                                <tr>
                                    <td>
                                        <a href="{{ $url }}" style="background-color: #2d3748; border-radius: 5px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 12px 24px; text-decoration: none;">
                                            Konfirmo Terminin
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color: #718096;">
                                <strong>Detajet:</strong><br>
                                Data: {{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y') }}<br>
                                Ora: {{ \Carbon\Carbon::parse($appointment->start_time)->format('H:i') }}
                            </p>

                            <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 30px 0;">
                            
                            <p style="font-size: 12px; color: #b0adc5;">
                                Nëse nuk keni kërkuar këtë termin, thjesht injoroni këtë email. Ky link skadon pas 30 minutash.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>