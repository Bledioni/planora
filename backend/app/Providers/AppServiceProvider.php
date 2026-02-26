<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Import this
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 1. Force HTTPS if in production
        if (config('app.env') === 'production') {
            URL::forceRootUrl(config('app.url'));
            URL::forceScheme('https');
        }

        // 2. Your existing Password Reset logic
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return config('app.frontend_url', 'https://planorabook.com/') 
                . '/reset-password?token=' . $token 
                . '&email=' . urlencode($user->email);
        });
    }
}