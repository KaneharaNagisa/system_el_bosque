<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        $members = User::query()
            ->select([
                'id',
                'nickname',
                'email',
                'phone',
                'prefecture',
                'city',
                'line_id',
                'birth_date',
                'has_pet',
                'pet_breed',
                'pet_breed2',
                'family_type',
                'family_birth_years',
                'concerns',
                'how_found',
                'expectations',
                'created_at',
                'last_login_at',
                'status',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id'            => 'MBR-' . str_pad($u->id, 3, '0', STR_PAD_LEFT),
                'dbId'          => $u->id,
                'nickname'      => $u->nickname ?? '',
                'email'         => $u->email,
                'phone'         => $u->phone,
                'prefecture'    => $u->prefecture ?? '',
                'city'          => $u->city ?? '',
                'lineId'        => $u->line_id ?? '',
                'birthDate'     => $u->birth_date?->format('Y-m-d'),
                'hasPet'        => $u->has_pet ?? 'none',
                'petBreed'      => $u->pet_breed,
                'petBreed2'     => $u->pet_breed2,
                'hasFamily'     => $u->family_type,
                'familyBirthYears' => $u->family_birth_years ?? [],
                'concerns'      => $u->concerns,
                'howFound'      => $u->how_found,
                'expectations'  => $u->expectations,
                'registeredAt'  => $u->created_at->format('Y-m-d'),
                'lastLoginAt'   => $u->last_login_at?->format('Y-m-d'),
                'status'        => $u->status ?? 'active',
            ]);

        return Inertia::render('Admin/Members', compact('members'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nickname'       => ['required', 'string', 'max:100', Rule::unique('users', 'nickname')],
            'email'          => ['required', 'email', Rule::unique('users', 'email')],
            'password'       => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols()->rules([
                    'regex:/[A-Z]/',
                    'regex:/[a-z]/',
                    'regex:/[0-9]/',
                    'regex:/[\p{P}\p{S}]/u',
                ]),
            ],
            'phone'          => ['required', 'string', 'max:20'],
            'address'        => ['nullable', 'string', 'max:255'],
            'prefecture'     => ['nullable', 'string', 'max:20'],
            'city'           => ['nullable', 'string', 'max:50'],
            'line_id'        => ['nullable', 'string', 'max:100'],
            'birth_date'     => ['nullable', 'date'],
            'has_pet'        => ['nullable', 'in:none,small1,small2,large1,large2'],
            'pet_breed'      => ['nullable', 'string', 'max:100'],
            'pet_breed2'     => ['nullable', 'string', 'max:100'],
            'family_type'    => ['nullable', 'in:individual,friends,couple,married,family'],
            'family_birth_years' => ['nullable', 'array'],
            'family_birth_years.*' => ['nullable', 'digits:4'],
            'concerns'       => ['nullable', 'string'],
            'how_found'      => ['nullable', 'string', 'max:255'],
            'expectations'   => ['nullable', 'string'],
            'status'         => ['nullable', 'in:active,withdrawn'],
        ], [
            'nickname.unique' => 'このニックネームは既に登録されています。',
            'email.unique' => 'このメールアドレスは既に登録されています。',
        ]);

        $validated['name']     = $validated['nickname'];
        $validated['password'] = Hash::make($validated['password']);
        $validated['status']   = $validated['status'] ?? 'active';

        User::create($validated);

        return back()->with('message', '会員を登録しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'nickname'       => ['required', 'string', 'max:100', Rule::unique('users', 'nickname')->ignore($id)],
            'email'          => ['required', 'email', Rule::unique('users', 'email')->ignore($id)],
            'phone'          => ['required', 'string', 'max:20'],
            'prefecture'     => ['nullable', 'string', 'max:20'],
            'city'           => ['nullable', 'string', 'max:50'],
            'line_id'        => ['nullable', 'string', 'max:100'],
            'birth_date'     => ['nullable', 'date'],
            'has_pet'        => ['required', 'in:none,small1,small2,large1,large2'],
            'pet_breed'      => ['nullable', 'string', 'max:100'],
            'pet_breed2'     => ['nullable', 'string', 'max:100'],
            'family_type'    => ['nullable', 'in:individual,friends,couple,married,family'],
            'family_birth_years' => ['nullable', 'array'],
            'family_birth_years.*' => ['nullable', 'digits:4'],
            'concerns'       => ['nullable', 'string'],
            'how_found'      => ['nullable', 'string', 'max:255'],
            'expectations'   => ['nullable', 'string'],
            'status'         => ['required', 'in:active,withdrawn'],
        ], [
            'nickname.unique' => 'このニックネームは既に登録されています。',
            'email.unique' => 'このメールアドレスは既に登録されています。',
        ]);

        $validated['name'] = $validated['nickname'];
        User::findOrFail($id)->update($validated);

        return back()->with('message', '会員情報を更新しました');
    }

    public function updatePassword(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
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
        ]);

        User::findOrFail($id)->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('message', 'パスワードを変更しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        User::findOrFail($id)->delete();

        return back()->with('message', '会員を削除しました');
    }
}
