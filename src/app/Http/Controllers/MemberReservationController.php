<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Availability;
use App\Models\Experience;
use App\Models\PricingSetting;
use App\Models\Reservation;
use App\Services\GoogleCalendarSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Throwable;
use Yasumi\Yasumi;

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

        $pricingSetting = PricingSetting::current();
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
            'baseAmount' => $pricingSetting->amountForStay($checkin, $nights),
            'guestExtra' => $pricingSetting->additionalGuestAmount($validated['guests'], $nights),
            'petFee' => $petRates[$validated['pets']] * $nights,
            'supportFee' => $validated['supportPlan'] === 'yes' ? 8000 : 0,
            'transferSurcharge' => $validated['supportPlan'] === 'yes' && $validated['guests'] >= 5 ? 5000 : 0,
            'experiencesTotal' => $experiencesTotal,
            'deposit' => 10000,
        ];
        $amount = array_sum($breakdown);

        $reservation = DB::transaction(function () use ($request, $validated, $amount, $breakdown) {
            Availability::query()->lockForUpdate()->get();

            $hasOverlap = Reservation::query()
                ->whereIn('status', ['pending', 'confirmed'])
                ->whereDate('check_in', '<', $validated['checkout'])
                ->whereDate('check_out', '>', $validated['checkin'])
                ->exists();

            if ($hasOverlap) {
                throw ValidationException::withMessages([
                    'checkin' => '選択された日程は現在予約できません。空き状況を再確認してください。',
                ]);
            }

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

        try {
            app(GoogleCalendarSyncService::class)->createReservationEvent($reservation);
        } catch (Throwable $exception) {
            report($exception);
        }

        return redirect('/reservation/complete')
            ->with('reservationCode', $reservation->reservation_code)
            ->with('reservationComplete', [
                'form' => [
                    'guests' => (string) $validated['guests'],
                    'pets' => $validated['pets'],
                    'petDetail' => $validated['petDetail'] ?? '',
                    'petDetail2' => $request->input('petDetail2', ''),
                    'supportPlan' => $validated['supportPlan'],
                    'experiences' => $validated['experiences'] ?? [],
                    'message' => $validated['message'] ?? '',
                ],
                'checkin' => $validated['checkin'],
                'checkout' => $validated['checkout'],
                'nights' => $nights,
                'dayType' => $this->dayTypeLabel($checkin, $pricingSetting),
                'grandTotal' => $amount,
                'bookingRef' => $reservation->reservation_code,
            ]);
    }

    public function cancel(Request $request, Reservation $reservation): RedirectResponse
    {
        abort_unless($reservation->user_id === $request->user()->id, 403);

        if ($reservation->status === 'cancelled') {
            return back();
        }

        abort_unless(today()->diffInDays($reservation->check_in, false) >= 7, 422, 'キャンセル期限を過ぎています。');

        app(GoogleCalendarSyncService::class)->deleteReservationEvent($reservation);
        $reservation->update(['status' => 'cancelled']);

        return back()->with('message', '予約をキャンセルしました。');
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

    private function dayTypeLabel(Carbon $date, PricingSetting $pricingSetting): string
    {
        $monthDay = $date->format('m-d');

        foreach ($pricingSetting->period_rates ?? [] as $period) {
            $start = $period['start'] ?? '';
            $end = $period['end'] ?? '';
            $isInPeriod = $start <= $end
                ? $monthDay >= $start && $monthDay <= $end
                : $monthDay >= $start || $monthDay <= $end;

            if ($start && $end && $isInPeriod) {
                return $period['name'] ?? '特別料金期間';
            }
        }

        if ($date->isFriday() || $date->isWeekend() || Yasumi::create('Japan', $date->year, 'ja_JP')->isHoliday($date)) {
            return '休日（金〜日、祝日）';
        }

        return '平日（月〜木）';
    }
}
