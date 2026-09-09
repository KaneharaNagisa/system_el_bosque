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
        $pricingSetting = PricingSetting::current();

        $samePendingReservation = $this->samePendingReservation($request, $validated);

        if ($samePendingReservation && !$this->hasConflictingReservation($checkin, $checkout, $samePendingReservation)) {
            return $this->redirectToComplete($samePendingReservation, $pricingSetting, 0);
        }

        $availabilityByDate = Availability::query()
            ->whereDate('date', '>=', $checkin)
            ->whereDate('date', '<', $checkout)
            ->get()
            ->keyBy(fn(Availability $availability) => $availability->date->toDateString());

        if (!$this->hasAvailableNights($checkin, $checkout, $availabilityByDate)) {
            throw ValidationException::withMessages([
                'checkin' => '選択された日程は現在予約できません。空き状況を再確認してください。',
            ]);
        }

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

        if ($this->hasConflictingReservation($checkin, $checkout, $samePendingReservation)) {
            throw ValidationException::withMessages([
                'checkin' => '選択された日程は現在予約できません。空き状況を再確認してください。',
            ]);
        }

        $created = false;
        $reservation = DB::transaction(function () use ($request, $validated, $amount, $breakdown, $pricingSetting, &$created) {
            Availability::query()->lockForUpdate()->get();

            $samePendingReservation = $this->samePendingReservation($request, $validated);
            $checkin = Carbon::parse($validated['checkin']);
            $checkout = Carbon::parse($validated['checkout']);

            if ($samePendingReservation && !$this->hasConflictingReservation($checkin, $checkout, $samePendingReservation)) {
                return $samePendingReservation;
            }

            if ($this->hasConflictingReservation($checkin, $checkout, $samePendingReservation)) {
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

            $created = true;

            return $reservation;
        });

        if ($created) {
            try {
                app(GoogleCalendarSyncService::class)->createReservationEvent($reservation);
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $this->redirectToComplete($reservation, $pricingSetting, $amount);
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

    private function samePendingReservation(Request $request, array $validated): ?Reservation
    {
        return Reservation::with('billing')
            ->where('status', 'pending')
            ->where('user_id', $request->user()->id)
            ->whereDate('check_in', $validated['checkin'])
            ->whereDate('check_out', $validated['checkout'])
            ->first();
    }

    private function hasConflictingReservation(Carbon $checkin, Carbon $checkout, ?Reservation $allowedReservation = null): bool
    {
        return Reservation::query()
            ->whereIn('status', ['pending', 'confirmed'])
            ->when($allowedReservation, fn($query) => $query->whereKeyNot($allowedReservation->id))
            ->whereDate('check_in', '<', $checkout)
            ->whereDate('check_out', '>', $checkin)
            ->exists();
    }

    private function hasAvailableNights(Carbon $checkin, Carbon $checkout, $availabilityByDate): bool
    {
        for ($date = $checkin->copy(); $date->lt($checkout); $date->addDay()) {
            $availability = $availabilityByDate->get($date->toDateString());

            if ($availability) {
                if ($availability->status !== 'available') {
                    return false;
                }

                continue;
            }

            if ($date->isPast() || $date->month < 3 || $date->month > 12 || in_array($date->dayOfWeek, [2, 3, 4], true)) {
                return false;
            }
        }

        return true;
    }

    private function redirectToComplete(Reservation $reservation, PricingSetting $pricingSetting, int $fallbackAmount): RedirectResponse
    {
        $reservation->loadMissing('billing');
        $checkin = $reservation->check_in;
        $checkout = $reservation->check_out;
        $nights = (int) $checkin->diffInDays($checkout);

        return redirect('/reservation/complete')
            ->with('reservationCode', $reservation->reservation_code)
            ->with('reservationComplete', [
                'form' => [
                    'guests' => (string) $reservation->guests,
                    'pets' => $reservation->has_pet,
                    'petDetail' => $reservation->pet_breed ?? '',
                    'petDetail2' => '',
                    'supportPlan' => $reservation->support_fee ? 'yes' : 'no',
                    'experiences' => $reservation->experiences ?? [],
                    'message' => $reservation->note ?? '',
                ],
                'checkin' => $checkin->toDateString(),
                'checkout' => $checkout->toDateString(),
                'nights' => $nights,
                'dayType' => $this->dayTypeLabel($checkin, $pricingSetting),
                'grandTotal' => $reservation->billing?->amount ?? $fallbackAmount,
                'bookingRef' => $reservation->reservation_code,
            ]);
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
