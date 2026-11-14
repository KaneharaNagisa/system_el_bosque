<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MyPageController extends Controller
{
    public function show(Request $request): Response
    {
        $reservations = $this->reservationsFor($request);

        $news = News::query()
            ->where('status', 'published')
            ->whereDate('publish_date', '<=', today())
            ->whereIn('target', ['mypage', 'both'])
            ->latest('publish_date')
            ->get();

        return Inertia::render('Public/Page', [
            'page' => 'mypage',
            'news' => $news,
            'reservations' => $reservations->take(3)->values(),
            'reservationCount' => $reservations->count(),
        ]);
    }

    public function history(Request $request): Response
    {
        return Inertia::render('Public/Page', [
            'page' => 'reservation-history',
            'reservations' => $this->reservationsFor($request),
        ]);
    }

    private function reservationsFor(Request $request)
    {
        return $request->user()->reservations()
            ->with('billing')
            ->latest('check_in')
            ->get()
            ->map(fn($reservation) => [
                'dbId' => $reservation->id,
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
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'prefecture' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:50'],
            'birthDate' => ['sometimes', 'nullable', 'date'],
            'hasPet' => ['required', 'in:no,none,small,small1,small2,large,large1,large2'],
            'petBreed' => ['nullable', 'string', 'max:100'],
            'petBreed2' => ['nullable', 'string', 'max:100'],
            'hasFamily' => ['nullable', 'in:individual,friends,couple,married,family'],
            'familyBirthYears' => ['nullable', 'array'],
            'familyBirthYears.*' => ['nullable', 'digits:4'],
            'concerns' => ['nullable', 'string'],
            'howFound' => ['nullable', 'string', 'max:255'],
            'expectations' => ['nullable', 'string'],
        ]);

        $petType = match ($validated['hasPet']) {
            'no' => 'none',
            'small' => 'small1',
            'large' => 'large1',
            default => $validated['hasPet'],
        };

        $familyBirthYears = array_values(array_filter($validated['familyBirthYears'] ?? []));

        $user->update([
            'phone' => $validated['phone'],
            'prefecture' => $validated['prefecture'] ?? null,
            'city' => $validated['city'] ?? null,
            'birth_date' => array_key_exists('birthDate', $validated)
                ? $validated['birthDate']
                : $user->birth_date,
            'has_pet' => $petType,
            'pet_breed' => $validated['petBreed'] ?? null,
            'pet_breed2' => $validated['petBreed2'] ?? null,
            'family_type' => $validated['hasFamily'] ?? null,
            'family_birth_years' => $familyBirthYears,
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
            'newPassword' => [
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
