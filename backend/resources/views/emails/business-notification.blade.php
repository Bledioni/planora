<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0">📧 Planora</h1>
            @if($businessName)
                <p style="margin:10px 0 0">Për: {{ $businessName }}</p>
            @endif
        </div>
        <div class="content">
            {!! nl2br(e($messageContent)) !!}
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Planora. Të gjitha të drejtat e rezervuara.</p>
            <p>Ky email u dërgua nga paneli admin i Planora.</p>
        </div>
    </div>
</body>
</html>