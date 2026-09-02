<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class MemberAuthController extends Controller
{
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lastName' => ['required', 'string', 'max:50'],
            'firstName' => ['required', 'string', 'max:50'],
            'lastNameKana' => ['required', 'string', 'max:100'],
            'firstNameKana' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'birthDate' => ['nullable', 'date'],
            'hasPet' => ['required', 'in:no,none,small,small1,small2,large,large1,large2'],
            'petBreed' => ['nullable', 'string', 'max:100'],
            'petBreed2' => ['nullable', 'string', 'max:100'],
            'hasFamily' => ['nullable', 'in:individual,friends,couple,married,family'],
            'howFound' => ['nullable', 'string', 'max:255'],
            'redirect' => ['nullable', 'string'],
        ]);

        $petType = match ($validated['hasPet']) {
            'no' => 'none',
            'small' => 'small1',
            'large' => 'large1',
            default => $validated['hasPet'],
        };

        $user = User::create([
            'name' => trim($validated['lastName'] . ' ' . $validated['firstName']),
            'last_name' => $validated['lastName'],
            'first_name' => $validated['firstName'],
            'last_name_kana' => $validated['lastNameKana'],
            'first_name_kana' => $validated['firstNameKana'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? null,
            'birth_date' => $validated['birthDate'] ?? null,
            'has_pet' => $petType,
            'pet_breed' => $validated['petBreed'] ?? null,
            'pet_breed2' => $validated['petBreed2'] ?? null,
            'family_type' => $validated['hasFamily'] ?? null,
            'how_found' => $validated['howFound'] ?? null,
            'status' => 'active',
            'last_login_at' => now(),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

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
