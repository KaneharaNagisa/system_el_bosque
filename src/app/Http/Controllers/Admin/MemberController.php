<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        $members = User::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id'            => 'MBR-' . str_pad($u->id, 3, '0', STR_PAD_LEFT),
                'dbId'          => $u->id,
                'lastName'      => $u->last_name ?? $u->name ?? '−',
                'firstName'     => $u->first_name ?? '',
                'lastNameKana'  => $u->last_name_kana ?? '',
                'firstNameKana' => $u->first_name_kana ?? '',
                'email'         => $u->email,
                'phone'         => $u->phone,
                'address'       => $u->address,
                'birthDate'     => $u->birth_date?->format('Y-m-d'),
                'hasPet'        => $u->has_pet ?? 'none',
                'petBreed'      => $u->pet_breed,
                'petBreed2'     => $u->pet_breed2,
                'hasFamily'     => $u->family_type,
                'howFound'      => $u->how_found,
                'registeredAt'  => $u->created_at->format('Y-m-d'),
                'lastLoginAt'   => $u->last_login_at?->format('Y-m-d'),
                'status'        => $u->status ?? 'active',
            ]);

        return Inertia::render('Admin/Members', compact('members'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'last_name'      => ['required', 'string', 'max:50'],
            'first_name'     => ['required', 'string', 'max:50'],
            'last_name_kana' => ['required', 'string', 'max:100'],
            'first_name_kana' => ['required', 'string', 'max:100'],
            'email'          => ['required', 'email', 'unique:users,email'],
            'phone'          => ['required', 'string', 'max:20'],
            'address'        => ['nullable', 'string', 'max:255'],
            'birth_date'     => ['nullable', 'date'],
            'has_pet'        => ['nullable', 'in:none,small1,small2,large1,large2'],
            'pet_breed'      => ['nullable', 'string', 'max:100'],
            'pet_breed2'     => ['nullable', 'string', 'max:100'],
            'family_type'    => ['nullable', 'in:individual,friends,couple,married,family'],
            'how_found'      => ['nullable', 'string', 'max:255'],
            'status'         => ['nullable', 'in:active,withdrawn'],
        ]);

        $validated['name']     = trim($validated['last_name'] . ' ' . $validated['first_name']);
        $validated['password'] = Hash::make(substr(str_shuffle('ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'), 0, 12));
        $validated['status']   = $validated['status'] ?? 'active';

        User::create($validated);

        return back()->with('message', '会員を登録しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        User::findOrFail($id)->delete();

        return back()->with('message', '会員を削除しました');
    }
}
