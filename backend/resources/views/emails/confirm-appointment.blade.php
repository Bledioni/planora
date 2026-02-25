<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmimi i Terminit - Planora</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); padding: 40px 15px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08); border: 1px solid rgba(226, 232, 240, 0.8);">
                    
                    <tr>
                        <td style="background-color: #1d4ed8; height: 6px;"></td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <div style="display: inline-block; background: #ffffff; color: #2563eb; padding: 8px 16px; border-radius: 30px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #dbeafe; margin-bottom: 20px; letter-spacing: 0.5px;">
                                Rezervim i Ri
                            </div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px;">Konfirmimi i Terminit</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; color: #64748b;">Planora Booking System</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 30px 40px; line-height: 1.6; text-align: center;">
                            <p style="margin: 0; font-size: 18px; color: #1e293b;">
                                Përshëndetje <strong>{{ $appointment->client_name }}</strong>,
                            </p>
                            <p style="margin: 15px 0; font-size: 16px; color: #64748b;">
                                Faleminderit që zgjodhët <strong>Planora</strong>. Jeni vetëm një hap larg finalizimit të rezervimit tuaj. Ju lutem klikoni butonin më poshtë për ta konfirmuar:
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="border-radius: 14px; background: #2563eb;">
                                        <a href="{{ $url }}" target="_blank" style="display: inline-block; padding: 18px 40px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                                            Konfirmo Terminin Tani
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 600;">
                                ⚠️ Ky link skadon pas 30 minutave.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Detajet e Rezervimit</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <table width="100%">
                                            <tr>
                                                <td style="font-size: 15px; color: #64748b;">Data:</td>
                                                <td align="right" style="font-size: 15px; font-weight: 800; color: #2563eb;">
                                                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y') }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="100%">
                                            <tr>
                                                <td style="font-size: 15px; color: #64748b;">Ora:</td>
                                                <td align="right" style="font-size: 15px; font-weight: 800; color: #2563eb;">
                                                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('H:i') }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                                Nëse nuk keni kërkuar këtë rezervim, mund ta injoroni këtë mesazh me siguri.
                            </p>
                        </td>
                    </tr>
                </table>

                <table border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                        <td align="center" style="padding: 30px; font-size: 12px; color: #94a3b8; line-height: 1.8;">
                            © 2026 <strong>Planora Booking System</strong><br>
                            Zgjidhja juaj për menaxhimin e terminëve.<br>
                            <span style="color: #cbd5e1;">Kjo është një email automatik, ju lutem mos ktheni përgjigje.</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>