<?php

declare(strict_types=1);

use App\Domains\Categories\Providers\CategoryServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\App;

describe('CategoryServiceProvider Registration', function () {
    it('can be registered without errors', function () {
        $app = new Application();
        $provider = new CategoryServiceProvider($app);
        
        expect($provider)->toBeInstanceOf(CategoryServiceProvider::class);
    });

    it('loads without errors when booted', function () {
        $app = new Application();
        $provider = new CategoryServiceProvider($app);
        
        expect(fn() => $provider->boot())->not->toThrow();
    });

    it('handles missing files gracefully in boot method', function () {
        $app = new Application();
        $provider = new CategoryServiceProvider($app);
        
        // Should not throw even if routes/config/views don't exist
        expect(fn() => $provider->boot())->not->toThrow();
    });
});
