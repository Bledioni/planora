<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Termini u Anulua</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: #f4f6fb; font-family: 'Segoe UI', sans-serif; padding: 40px 20px; }
        .wrapper { max-width: 520px; margin: 0 auto; }
        .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 36px 32px; text-align: center; }
        .header h1 { color: white; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
        .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 6px; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #111827; font-weight: 600; margin-bottom: 12px; }
        .message { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 24px; }
        .detail-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; }
        .detail-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { font-size: 12px; color: #9ca3af; min-width: 80px; }
        .detail-value { font-size: 13px; color: #111827; font-weight: 600; }
        .footer-msg { font-size: 13px; color: #6b7280; line-height: 1.6; }
        .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; }
        .footer p { font-size: 12px; color: #9ca3af; }
        .footer strong { color: #6366f1; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <h1>❌ Termini u Anulua</h1>
                <p>Ju njoftojmë për anulimin e terminit tuaj</p>
            </div>
            <div class="body">
                <p class="greeting">Përshëndetje, {{ $appointment->client_name }}!</p>
                <p class="message">
                    Na vjen keq t'ju njoftojmë se termini juaj i rezervuar është anuluar nga biznesi.
                </p>

                <div class="detail-box">
                    <div class="detail-row">
                        <span class="detail-label">📅 Data</span>
                        <span class="detail-value">{{ \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y') }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🕐 Ora</span>
                        <span class="detail-value">{{ \Carbon\Carbon::parse($appointment->start_time)->format('H:i') }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">💼 Biznesi</span>
                        <span class="detail-value">{{ $appointment->business->shop_name ?? 'N/A' }}</span>
                    </div>
                </div>

                <p class="footer-msg">
                    Ju lutemi kontaktoni biznesin për të bërë një rezervim të ri ose për më shumë informacion.
                </p>
            </div>
            <div class="footer">
                <p>Powered by <strong>Planora</strong> — Sistemi i rezervimeve</p>
            </div>
        </div>
    </div>
</body>
</html>