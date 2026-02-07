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
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <div style="background-color: #f0fdf4; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; margin-bottom: 20px;">
                                <span style="font-size: 32px;">✅</span>
                            </div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a;">Termini u konfirmua!</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center; line-height: 1.6;">
                            <p style="margin: 0; font-size: 16px; color: #64748b;">
                                Përshëndetje <strong>{{ $appointment->client_name }}</strong>, rezervimi juaj është procesuar me sukses. Ju mirëpresim!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
                                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Data dhe Ora</p>
                                <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1d7af2;">
                                    {{ $appointment->start_time->format('d/m/Y') }} — {{ $appointment->start_time->format('H:i') }}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0 40px 40px 40px; border-top: 1px solid #f1f5f9; padding-top: 30px;">
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #94a3b8;">Nëse planet tuaja ndryshojnë, mund ta anuloni terminin:</p>
                            <a href="{{ $cancelUrl }}" style="display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #e11d48; border: 2px solid #e11d48; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.2s;">
                                Anulo Terminin
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #f1f5f9; padding: 20px; font-size: 12px; color: #94a3b8;">
                            © {{ date('Y') }} Planora. Të gjitha të drejtat e rezervuara.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>