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
    'allowed_origins' => [
        'http://localhost:3000',
        'https://courageous-gecko-076716.netlify.app',
        'https://splendid-bienenstitch-fb7ca4.netlify.app'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // SHUMË E RËNDËSISHME: Duhet true sepse në React ke 'withCredentials: true'
    'supports_credentials' => true,

];