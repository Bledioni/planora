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
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
                    
                    <tr>
                        <td style="background-color: #2d3748; height: 6px;"></td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 40px 40px 20px 40px;">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a;">Konfirmimi i Terminit</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 20px 40px; line-height: 1.6;">
                            <p style="margin: 0; font-size: 16px; color: #475569;">
                                Përshëndetje <strong>{{ $appointment->client_name }}</strong>,
                            </p>
                            <p style="margin: 15px 0; font-size: 16px; color: #475569;">
                                Faleminderit që zgjodhët <strong>Planora</strong>. Jeni vetëm një hap larg finalizimit të rezervimit tuaj. Ju lutem klikoni butonin më poshtë për ta konfirmuar:
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 20px 40px;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" bgcolor="#2d3748" style="border-radius: 8px;">
                                        <a href="{{ $url }}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                            Konfirmo Terminin Tani
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 15px 0 0 0; font-size: 12px; color: #94a3b8;">
                                ⚠️ Ky link është i vlefshëm për <strong>30 minuta</strong>.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px 40px 40px 40px;">
                            <table width="100%" style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px dashed #e2e8f0;">
                                <tr>
                                    <td style="font-size: 14px; color: #64748b; padding-bottom: 5px;">Data:</td>
                                    <td align="right" style="font-size: 14px; font-weight: 700; color: #0f172a; padding-bottom: 5px;">
                                        {{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y') }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #64748b;">Ora:</td>
                                    <td align="right" style="font-size: 14px; font-weight: 700; color: #0f172a;">
                                        {{ \Carbon\Carbon::parse($appointment->start_time)->format('H:i') }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 40px 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                            <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">
                                Nëse nuk keni kërkuar këtë rezervim, mund ta injoroni këtë mesazh me siguri. Asnjë veprim tjetër nuk kërkohet.
                            </p>
                        </td>
                    </tr>

                </table>

                <table border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                        <td align="center" style="padding: 30px; font-size: 12px; color: #94a3b8;">
                            Dërguar nga <strong>Planora Booking System</strong><br>
                            Kjo është një email automatik, ju lutem mos ktheni përgjigje.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>