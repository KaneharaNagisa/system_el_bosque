<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        $members = User::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id'           => 'MBR-' . str_pad($u->id, 3, '0', STR_PAD_LEFT),
                'dbId'         => $u->id,
                'name'         => $u->name,
                'email'        => $u->email,
                'phone'        => $u->phone,
                'address'      => $u->address,
                'birthDate'    => $u->birth_date?->format('Y-m-d'),
                'hasPet'       => $u->has_pet ?? 'none',
                'petBreed'     => $u->pet_breed,
                'petBreed2'    => $u->pet_breed2,
                'hasFamily'    => $u->family_type,
                'howFound'     => $u->how_found,
                'registeredAt' => $u->created_at->format('Y-m-d'),
                'lastLoginAt'  => $u->last_login_at?->format('Y-m-d'),
                'status'       => $u->status ?? 'active',
            ]);

        return Inertia::render('Admin/Members', compact('members'));
    }

    public function destroy(int $id): RedirectResponse
    {
        User::findOrFail($id)->delete();

        return back()->with('message', '会員を削除しました');
    }
}
