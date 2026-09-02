<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use App\Models\Contact;
use App\Models\Experience;
use App\Models\Faq;
use App\Models\News;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function show(string $page, array $props = []): Response
    {
        return Inertia::render('Public/Page', [
            'page' => $page,
            'news' => $this->news($page),
            'experiences' => $this->experiences($page),
            'faqs' => $this->faqs($page),
            'availability' => $this->availability($page),
            ...$props,
        ]);
    }

    public function contact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        Contact::create([
            ...$validated,
            'subject' => 'Webサイトからのお問い合わせ',
            'status' => 'unread',
        ]);

        return back();
    }

    private function news(string $page): array
    {
        if (!in_array($page, ['home', 'mypage'], true)) {
            return [];
        }

        $target = $page === 'home' ? 'top' : 'mypage';

        return News::query()
            ->where('status', 'published')
            ->whereDate('publish_date', '<=', today())
            ->whereIn('target', [$target, 'both'])
            ->latest('publish_date')
            ->get()
            ->toArray();
    }

    private function experiences(string $page): array
    {
        if (!in_array($page, ['pricing', 'experiences', 'reservation-detail', 'reservation-confirm'], true)) {
            return [];
        }

        return Experience::query()
            ->where('is_active', true)
            ->when(
                in_array($page, ['reservation-detail', 'reservation-confirm'], true),
                fn($query) => $query->where('requires_reservation', true)
            )
            ->orderBy('sort_order')
            ->orderByDesc('popularity')
            ->get()
            ->map(fn(Experience $experience) => [
                'id' => $experience->id,
                'name' => $experience->name,
                'description' => $experience->description,
                'price' => $experience->price,
                'priceNote' => $experience->price_note,
                'pricingType' => $experience->pricing_type ?? 'per_group',
                'duration' => $experience->duration,
                'recommendedPeople' => $experience->recommended_people,
                'season' => $experience->season,
                'seasonTag' => $experience->season_tag,
                'period' => $experience->period,
                'periodStart' => $experience->period_start,
                'periodEnd' => $experience->period_end,
                'requiresReservation' => $experience->requires_reservation,
                'points' => $experience->points ?? [],
                'notes' => $experience->notes,
                'image' => $experience->image,
            ])
            ->all();
    }

    private function faqs(string $page): array
    {
        if ($page !== 'faq') {
            return [];
        }

        return Faq::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->toArray();
    }

    private function availability(string $page): array
    {
        if ($page !== 'reservation') {
            return [];
        }

        return Availability::query()
            ->whereDate('date', '>=', today())
            ->orderBy('date')
            ->get()
            ->toArray();
    }
}
