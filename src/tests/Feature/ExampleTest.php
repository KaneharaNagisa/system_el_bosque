<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_non_production_environment_is_hidden_from_search_engines(): void
    {
        config(['app.env' => 'testing']);

        $this->get('/')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertInertia(fn($page) => $page->where('isTestEnvironment', true));

        $this->get('/robots.txt')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertSeeText("User-agent: *\nDisallow: /\n");
    }

    public function test_production_environment_allows_search_engine_indexing(): void
    {
        config(['app.env' => 'production']);

        $this->get('/')
            ->assertHeaderMissing('X-Robots-Tag')
            ->assertInertia(fn($page) => $page->where('isTestEnvironment', false));

        $this->get('/robots.txt')
            ->assertHeaderMissing('X-Robots-Tag')
            ->assertSeeText("User-agent: *\nDisallow:\n");
    }
}
