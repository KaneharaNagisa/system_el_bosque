<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Availability;
use App\Models\Experience;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class MemberReservationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'checkin' => ['required', 'date', 'after_or_equal:today'],
            'checkout' => ['required', 'date', 'after:checkin'],
            'guests' => ['required', 'integer', 'min:1', 'max:10'],
            'pets' => ['required', 'in:none,small1,small2,large1,large2'],
            'petDetail' => ['nullable', 'string', 'max:100'],
            'supportPlan' => ['required', 'in:yes,no'],
            'experiences' => ['array'],
            'experiences.*' => ['string', 'max:255'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $checkin = Carbon::parse($validated['checkin']);
        $checkout = Carbon::parse($validated['checkout']);
        $nights = (int) $checkin->diffInDays($checkout);
        $availableNights = Availability::query()
            ->where('status', 'available')
            ->whereDate('date', '>=', $checkin)
            ->whereDate('date', '<', $checkout)
            ->count();

        $hasOverlap = Reservation::query()
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereDate('check_in', '<', $checkout)
            ->whereDate('check_out', '>', $checkin)
            ->exists();

        if ($availableNights !== $nights || $hasOverlap) {
            throw ValidationException::withMessages([
                'checkin' => '選択された日程は現在予約できません。空き状況を再確認してください。',
            ]);
        }

        $month = $checkin->month;
        $day = $checkin->day;
        $isSpecialDay = ($month === 4 && $day >= 29)
            || ($month === 5 && $day <= 5)
            || ($month === 8 && $day >= 10 && $day <= 16)
            || ($month === 12 && $day >= 28);
        $baseRate = $isSpecialDay ? 33000 : (in_array($checkin->dayOfWeek, [5, 6], true) ? 26000 : 20000);
        $petRates = ['none' => 0, 'small1' => 2500, 'small2' => 4000, 'large1' => 3500, 'large2' => 6000];
        $selectedExperiences = collect($validated['experiences'] ?? [])->unique()->values();
        $experienceRates = Experience::query()
            ->where('is_active', true)
            ->where('requires_reservation', true)
            ->whereIn('name', $selectedExperiences)
            ->get()
            ->keyBy('name');

        if ($experienceRates->count() !== $selectedExperiences->count()) {
            throw ValidationException::withMessages([
                'experiences' => '選択された体験オプションは現在予約できません。',
            ]);
        }

        $unavailableExperience = $experienceRates->first(
            fn(Experience $experience) => !$this->isExperienceAvailableOn($experience, $checkin)
        );

        if ($unavailableExperience) {
            throw ValidationException::withMessages([
                'experiences' => "{$unavailableExperience->name}は選択された日程では実施していません。",
            ]);
        }

        $experiencesTotal = collect($validated['experiences'] ?? [])->sum(function (string $experience) use ($experienceRates, $validated) {
            $option = $experienceRates->get($experience);
            return $option->price * ($option->pricing_type === 'per_person' ? $validated['guests'] : 1);
        });
        $breakdown = [
            'baseAmount' => $baseRate * $nights,
            'guestExtra' => max(0, $validated['guests'] - 5) * 3000 * $nights,
            'petFee' => $petRates[$validated['pets']] * $nights,
            'supportFee' => $validated['supportPlan'] === 'yes' ? 8000 : 0,
            'transferSurcharge' => $validated['supportPlan'] === 'yes' && $validated['guests'] >= 5 ? 5000 : 0,
            'experiencesTotal' => $experiencesTotal,
            'deposit' => 10000,
        ];
        $amount = array_sum($breakdown);

        $reservation = DB::transaction(function () use ($request, $validated, $amount, $breakdown) {
            $reservation = Reservation::create([
                'reservation_code' => 'RSV-' . Str::upper(Str::random(8)),
                'user_id' => $request->user()->id,
                'check_in' => $validated['checkin'],
                'check_out' => $validated['checkout'],
                'guests' => $validated['guests'],
                'has_pet' => $validated['pets'],
                'pet_breed' => collect([$validated['petDetail'] ?? null, $request->input('petDetail2')])->filter()->join(' / ') ?: null,
                'support_fee' => $validated['supportPlan'] === 'yes',
                'experiences' => $validated['experiences'] ?? [],
                'status' => 'pending',
                'note' => $validated['message'] ?? null,
            ]);

            Billing::create([
                'billing_code' => 'BIL-' . Str::upper(Str::random(8)),
                'reservation_id' => $reservation->id,
                'amount' => $amount,
                'breakdown' => $breakdown,
                'status' => 'unpaid',
                'due_date' => now()->addDays(7)->toDateString(),
            ]);

            return $reservation;
        });

        return back()->with('reservationCode', $reservation->reservation_code);
    }

    private function isExperienceAvailableOn(Experience $experience, Carbon $date): bool
    {
        if (!$experience->period_start || !$experience->period_end) {
            return true;
        }

        $monthDay = $date->format('m-d');
        $periodStart = substr((string) $experience->period_start, -5);
        $periodEnd = substr((string) $experience->period_end, -5);

        return $periodStart <= $periodEnd
            ? $monthDay >= $periodStart && $monthDay <= $periodEnd
            : $monthDay >= $periodStart || $monthDay <= $periodEnd;
    }
}
