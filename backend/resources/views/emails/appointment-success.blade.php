<body style="font-family: sans-serif; padding: 20px;">
    <h2>Termini u konfirmua! ✅</h2>
    <p>Përshëndetje {{ $appointment->client_name }}, termini juaj është gati.</p>
    
    <div style="background: #f0fdf4; padding: 15px; border-radius: 5px;">
        <p><strong>Detajet:</strong> {{ $appointment->start_time->format('d/m/Y H:i') }}</p>
    </div>

    <p>Nëse dëshironi ta anuloni terminin, klikoni butonin poshtë:</p>
    
    <a href="{{ $cancelUrl }}" style="color: #e11d48; text-decoration: underline; font-weight: bold;">
        Anulo Terminin (Cancel)
    </a>
</body>