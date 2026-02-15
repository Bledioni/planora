<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('MIDDLEWARE HIT');
        
        if (!$request->bearerToken()) {
            $token = urldecode($request->cookies->get('auth_token'));
            
            \Log::info('TOKEN:', ['token' => $token]);
            
            if ($token) {
                $request->headers->set('Authorization', 'Bearer ' . $token);
                $request->server->set('HTTP_AUTHORIZATION', 'Bearer ' . $token);
            }
        }

        return $next($request);
    }
}