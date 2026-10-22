<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StagingBasicAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('app.env') !== 'staging') {
            return $next($request);
        }

        $expectedUsername = env('STAGING_BASIC_AUTH_USERNAME', 'staging-admin');
        $expectedPassword = env('STAGING_BASIC_AUTH_PASSWORD', 'Staging-9X7!mQ2w');

        $providedUsername = $request->server->get('PHP_AUTH_USER');
        $providedPassword = $request->server->get('PHP_AUTH_PW');

        if ($providedUsername !== $expectedUsername || $providedPassword !== $expectedPassword) {
            return response('', Response::HTTP_UNAUTHORIZED, [
                'WWW-Authenticate' => 'Basic realm="Staging"',
            ]);
        }

        return $next($request);
    }
}
