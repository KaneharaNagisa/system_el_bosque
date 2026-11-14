<?php

namespace App\Http\Controllers;

use App\Mail\RegistrationConfirmationMail;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Rules\UniqueNickname;
use App\Support\NicknameNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class MemberAuthController extends Controller
{
    public function sendRegistrationEmail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
        ], [
            'email.unique' => 'このメールアドレスは既に登録されています。',
        ]);

        $token = Str::random(64);
        $pendingRegistration = PendingRegistration::updateOrCreate(
            ['email' => $validated['email']],
            [
                'token' => Hash::make($token),
                'expires_at' => now()->addHour(),
                'used_at' => null,
            ],
        );

        Mail::to($validated['email'])->send(new RegistrationConfirmationMail(
            route('register.verify', ['pendingRegistration' => $pendingRegistration->id, 'token' => $token]),
            $validated['email'],
        ));

        return back();
    }

    public function verifyRegistrationEmail(Request $request, PendingRegistration $pendingRegistration, string $token): RedirectResponse
    {
        if ($pendingRegistration->used_at || $pendingRegistration->expires_at->isPast() || !Hash::check($token, $pendingRegistration->token)) {
            $request->session()->forget('pending_registration_id');

            return redirect('/register?expired=1');
        }

        $request->session()->put('pending_registration_id', $pendingRegistration->id);

        return redirect()->route('register');
    }

    public function register(Request $request): RedirectResponse
    {
        $request->merge([
            'nickname' => NicknameNormalizer::normalizeInput($request->input('nickname')),
        ]);

        $validated = $request->validate([
            'nickname' => ['required', 'string', 'max:100', new UniqueNickname],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols()->rules([
                    'regex:/[A-Z]/',
                    'regex:/[a-z]/',
                    'regex:/[0-9]/',
                    'regex:/[\p{P}\p{S}]/u',
                ]),
            ],
            'phone' => ['required', 'string', 'max:20'],
            'prefecture' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:50'],
            'birthDate' => ['nullable', 'date'],
            'hasPet' => ['required', 'in:no,none,small,small1,small2,large,large1,large2'],
            'petBreed' => ['nullable', 'string', 'max:100'],
            'petBreed2' => ['nullable', 'string', 'max:100'],
            'hasFamily' => ['nullable', 'in:individual,friends,couple,married,family'],
            'familyBirthYears' => ['nullable', 'array'],
            'familyBirthYears.*' => ['nullable', 'digits:4'],
            'concerns' => ['nullable', 'string'],
            'howFound' => ['nullable', 'string', 'max:255'],
            'expectations' => ['nullable', 'string'],
            'redirect' => ['nullable', 'string'],
        ]);

        $pendingRegistration = PendingRegistration::query()
            ->whereKey($request->session()->get('pending_registration_id'))
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$pendingRegistration) {
            return back()->withErrors([
                'email' => '確認メールの有効期限が切れています。再度仮登録してください。',
            ]);
        }

        $petType = match ($validated['hasPet']) {
            'no' => 'none',
            'small' => 'small1',
            'large' => 'large1',
            default => $validated['hasPet'],
        };

        $user = DB::transaction(function () use ($validated, $petType, $pendingRegistration) {
            $used = PendingRegistration::query()
                ->whereKey($pendingRegistration->id)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->update(['used_at' => now()]);

            if ($used !== 1) {
                abort(422, '確認メールの有効期限が切れています。再度仮登録してください。');
            }

            $familyBirthYears = array_values(array_filter($validated['familyBirthYears'] ?? []));

            return User::create([
                'name' => $validated['nickname'],
                'nickname' => $validated['nickname'],
                'email' => $pendingRegistration->email,
                'password' => $validated['password'],
                'phone' => $validated['phone'],
                'prefecture' => $validated['prefecture'] ?? null,
                'city' => $validated['city'] ?? null,
                'birth_date' => $validated['birthDate'] ?? null,
                'has_pet' => $petType,
                'pet_breed' => $validated['petBreed'] ?? null,
                'pet_breed2' => $validated['petBreed2'] ?? null,
                'family_type' => $validated['hasFamily'] ?? null,
                'family_birth_years' => $familyBirthYears,
                'concerns' => $validated['concerns'] ?? null,
                'how_found' => $validated['howFound'] ?? null,
                'expectations' => $validated['expectations'] ?? null,
                'status' => 'active',
                'last_login_at' => now(),
            ]);
        });

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->forget('pending_registration_id');

        return back()->with('message', '会員登録が完了しました。');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'redirect' => ['nullable', 'string'],
        ]);

        if (!Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'status' => 'active',
        ])) {
            return back()->withErrors([
                'email' => 'メールアドレスまたはパスワードが正しくありません。',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();
        $request->user()->forceFill(['last_login_at' => now()])->save();

        return redirect()->to($this->safeRedirect($credentials['redirect'] ?? '/mypage'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function safeRedirect(string $redirect): string
    {
        return str_starts_with($redirect, '/') && !str_starts_with($redirect, '//')
            ? $redirect
            : '/mypage';
    }
}
