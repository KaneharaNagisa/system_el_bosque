<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MyPageController extends Controller
{
    public function show(Request $request): Response
    {
        $reservations = $request->user()->reservations()
            ->with('billing')
            ->latest('check_in')
            ->get()
            ->map(fn($reservation) => [
                'id' => $reservation->reservation_code,
                'checkin' => $reservation->check_in->format('Y-m-d'),
                'checkout' => $reservation->check_out->format('Y-m-d'),
                'guests' => $reservation->guests,
                'status' => $reservation->status,
                'statusLabel' => match ($reservation->status) {
                    'confirmed' => '予約確定',
                    'cancelled' => 'キャンセル済',
                    'noshow' => '無断キャンセル',
                    default => '確認中',
                },
                'pets' => $reservation->pet_breed ?: ($reservation->has_pet === 'none' ? 'なし' : $reservation->has_pet),
                'experiences' => $reservation->experiences ?? [],
                'supportPlan' => $reservation->support_fee ? 'yes' : 'no',
                'totalAmount' => $reservation->billing?->amount ?? 0,
            ]);

        $news = News::query()
            ->where('status', 'published')
            ->whereDate('publish_date', '<=', today())
            ->whereIn('target', ['mypage', 'both'])
            ->latest('publish_date')
            ->get();

        return Inertia::render('Public/Page', [
            'page' => 'mypage',
            'news' => $news,
            'reservations' => $reservations,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'lastName' => ['required', 'string', 'max:50'],
            'firstName' => ['required', 'string', 'max:50'],
            'lastNameKana' => ['required', 'string', 'max:100'],
            'firstNameKana' => ['required', 'string', 'max:100'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'birthDate' => ['sometimes', 'nullable', 'date'],
            'hasPet' => ['required', 'in:none,small1,small2,large1,large2'],
            'petBreed' => ['nullable', 'string', 'max:100'],
            'petBreed2' => ['nullable', 'string', 'max:100'],
            'hasFamily' => ['nullable', 'in:individual,friends,couple,married,family'],
            'concerns' => ['nullable', 'string'],
            'howFound' => ['nullable', 'string', 'max:255'],
            'expectations' => ['nullable', 'string'],
        ]);

        $user->update([
            'name' => trim($validated['lastName'] . ' ' . $validated['firstName']),
            'last_name' => $validated['lastName'],
            'first_name' => $validated['firstName'],
            'last_name_kana' => $validated['lastNameKana'],
            'first_name_kana' => $validated['firstNameKana'],
            'email' => $validated['email'] ?? $user->email,
            'phone' => $validated['phone'] ?? $user->phone,
            'address' => $validated['address'] ?? null,
            'birth_date' => $validated['birthDate'] ?? $user->birth_date,
            'has_pet' => $validated['hasPet'],
            'pet_breed' => $validated['petBreed'] ?? null,
            'pet_breed2' => $validated['petBreed2'] ?? null,
            'family_type' => $validated['hasFamily'] ?? null,
            'concerns' => $validated['concerns'] ?? null,
            'how_found' => $validated['howFound'] ?? null,
            'expectations' => $validated['expectations'] ?? null,
        ]);

        return back()->with('message', '会員情報を更新しました。');
    }

    public function password(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'currentPassword' => ['required', 'current_password'],
            'newPassword' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update(['password' => Hash::make($validated['newPassword'])]);

        return back()->with('message', 'パスワードを変更しました。');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->user()->update(['status' => 'withdrawn']);
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
