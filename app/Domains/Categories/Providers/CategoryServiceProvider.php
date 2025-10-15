<?php

declare(strict_types=1);

namespace App\Domains\Categories\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Repositories\CategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;

/**
 * Category Domain Service Provider
 *
 * Registers all category domain services and dependencies.
 * Handles conditional loading of routes, config, and views.
 */
class CategoryServiceProvider extends ServiceProvider
{
  /**
   * Register any application services.
   */
  public function register(): void
  {
    // Register CategoryMapper
    $this->app->bind(CategoryMapper::class);

    // Register CategoryRepository
    $this->app->bind(ICategoryRepository::class, function ($app) {
      return new CategoryRepository(
        $app->make(CategoryMapper::class)
      );
    });
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void
  {
    // Conditionally load domain resources
    $this->loadRoutes();
    $this->loadConfig();
    $this->loadViews();
  }

  /**
   * Load category routes if they exist.
   */
  private function loadRoutes(): void
  {
    $routesPath = __DIR__ . '/../routes/api.php';
    if (file_exists($routesPath)) {
      $this->loadRoutesFrom($routesPath);
    }
  }

  /**
   * Load category config if it exists.
   */
  private function loadConfig(): void
  {
    $configPath = __DIR__ . '/../config/categories.php';
    if (file_exists($configPath)) {
      $this->mergeConfigFrom($configPath, 'categories');
    }
  }

  /**
   * Load category views if they exist.
   */
  private function loadViews(): void
  {
    $viewsPath = __DIR__ . '/../resources/views';
    if (is_dir($viewsPath)) {
      $this->loadViewsFrom($viewsPath, 'categories');
    }
  }
}
