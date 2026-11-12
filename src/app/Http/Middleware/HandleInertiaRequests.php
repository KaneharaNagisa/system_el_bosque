<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function handle(Request $request, Closure $next): Response
    {
        $response = parent::handle($request, $next);

        if (config('app.env') !== 'production') {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }

        return $response;
    }

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'isTestEnvironment' => config('app.env') !== 'production',
            'kpiEnabled' => config('app.kpi_enabled'),
            'auth' => [
                'admin' => $request->session()->get('admin_user'),
                'user' => fn() => $request->user() ? [
                    'nickname' => $request->user()->nickname ?? '',
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone ?? '',
                    'prefecture' => $request->user()->prefecture ?? '',
                    'city' => $request->user()->city ?? '',
                    'familyBirthYears' => $request->user()->family_birth_years ?? [],
                    'birthDate' => $request->user()->birth_date?->format('Y-m-d') ?? '',
                    'hasPet' => $request->user()->has_pet ?? 'none',
                    'petBreed' => $request->user()->pet_breed ?? '',
                    'petBreed2' => $request->user()->pet_breed2 ?? '',
                    'hasFamily' => $request->user()->family_type ?? '',
                    'concerns' => $request->user()->concerns ?? '',
                    'howFound' => $request->user()->how_found ?? '',
                    'expectations' => $request->user()->expectations ?? '',
                ] : null,
            ],
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'error'   => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'reservationCode' => fn() => $request->session()->get('reservationCode'),
                'reservationComplete' => fn() => $request->session()->get('reservationComplete'),
            ],
        ]);
    }
}
