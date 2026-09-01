<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = Admin::orderBy('created_at')
            ->get()
            ->map(fn($a) => [
                'id'          => 'ADM-' . str_pad($a->id, 3, '0', STR_PAD_LEFT),
                'dbId'        => $a->id,
                'name'        => $a->name,
                'email'       => $a->email,
                'role'        => $a->role,
                'createdAt'   => $a->created_at->format('Y-m-d'),
                'lastLoginAt' => $a->last_login_at?->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Accounts', compact('accounts'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:admins,email'],
            'role'     => ['required', 'in:system_admin,facility_admin'],
            'password' => ['required', Password::min(8)],
        ]);

        Admin::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'role'     => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return back()->with('message', 'アカウントを作成しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', "unique:admins,email,{$id}"],
            'role'     => ['required', 'in:system_admin,facility_admin'],
            'password' => ['nullable', Password::min(8)],
        ]);

        $data = $request->only('name', 'email', 'role');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        Admin::findOrFail($id)->update($data);

        return back()->with('message', 'アカウントを更新しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        $currentAdmin = request()->session()->get('admin_user');
        if ($currentAdmin && $currentAdmin['id'] === $id) {
            return back()->withErrors(['submit' => '自分自身のアカウントは削除できません']);
        }

        Admin::findOrFail($id)->delete();

        return back()->with('message', 'アカウントを削除しました');
    }
}
