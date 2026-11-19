<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // 'paths' tregon cilat rrugë në Laravel janë të hapura për CORS
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Këtu shtohet linku i React-it (Netlify) dhe Localhost për testim
    'allowed_origins' => array_values(array_filter(array_merge([
    'http://localhost:3000',
    'http://192.168.10.111:3000',
    'https://planorabook.com',
    'https://www.planorabook.com',
], array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')))))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // SHUMË E RËNDËSISHME: Duhet true sepse në React ke 'withCredentials: true'
    'supports_credentials' => true,

];