<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        // Use Sanctum for API auth in tests
        \Laravel\Sanctum\Sanctum::actingAs(
            new \App\Models\User(), []
        );
    }
}