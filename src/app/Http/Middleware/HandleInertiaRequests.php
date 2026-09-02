<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'admin' => $request->session()->get('admin_user'),
                'user' => fn() => $request->user() ? [
                    'lastName' => $request->user()->last_name ?? '',
                    'firstName' => $request->user()->first_name ?? '',
                    'lastNameKana' => $request->user()->last_name_kana ?? '',
                    'firstNameKana' => $request->user()->first_name_kana ?? '',
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone ?? '',
                    'address' => $request->user()->address ?? '',
                    'birthDate' => $request->user()->birth_date?->format('Y-m-d') ?? '',
                    'hasPet' => $request->user()->has_pet ?? 'none',
                    'petBreed' => $request->user()->pet_breed ?? '',
                    'petBreed2' => $request->user()->pet_breed2 ?? '',
                    'hasFamily' => $request->user()->family_type ?? '',
                    'howFound' => $request->user()->how_found ?? '',
                ] : null,
            ],
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'error'   => fn() => $request->session()->get('error'),
                'reservationCode' => fn() => $request->session()->get('reservationCode'),
            ],
        ]);
    }
}
