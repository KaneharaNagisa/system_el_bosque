<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use App\Models\Contact;
use App\Models\Experience;
use App\Models\Faq;
use App\Models\ImageAsset;
use App\Models\News;
use App\Models\Page;
use App\Models\PricingSetting;
use App\Models\Reservation;
use Carbon\CarbonPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function show(string $page, array $props = []): Response
    {
        $fixedPage = $this->fixedPage($page);

        if (in_array($page, ['terms', 'privacy'], true) && $fixedPage === null) {
            abort(404);
        }

        $usesPricing = in_array($page, [
            'home',
            'about',
            'pricing',
            'reservation',
            'reservation-detail',
            'reservation-confirm',
        ], true);

        return Inertia::render('Public/Page', [
            'page' => $page,
            'news' => $this->news($page),
            'experiences' => $this->experiences($page),
            'faqs' => $this->faqs($page),
            'availability' => $this->availability($page),
            'fixedPage' => $fixedPage,
            'pricingSetting' => $usesPricing ? PricingSetting::current()->toFrontend() : null,
            'images' => ImageAsset::query()->get()->mapWithKeys(function (ImageAsset $image) {
                $variants = $image->variants ?? [];
                return [$image->key => [
                    'url' => asset('storage/' . $image->path),
                    'srcSet' => collect($variants)
                        ->map(fn(string $path, string $width) => asset('storage/' . $path) . ' ' . $width . 'w')
                        ->implode(', ') ?: null,
                    'sizes' => '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1440px',
                ]];
            })->all(),
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
        if (!in_array($page, ['home', 'mypage', 'news'], true)) {
            return [];
        }

        $query = News::query()
            ->where('status', 'published')
            ->whereDate('publish_date', '<=', today());

        if ($page !== 'news') {
            $target = $page === 'home' ? 'top' : 'mypage';
            $query->whereIn('target', [$target, 'both']);
        }

        return $query->latest('publish_date')->get()->toArray();
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

    private function fixedPage(string $page): ?array
    {
        if (!in_array($page, ['terms', 'privacy'], true)) {
            return null;
        }

        return Page::query()
            ->where('slug', $page)
            ->where('status', 'published')
            ->first(['title', 'content'])
            ?->only(['title', 'content']);
    }

    private function availability(string $page): array
    {
        if ($page !== 'reservation') {
            return [];
        }

        $availability = Availability::query()
            ->whereDate('date', '>=', today())
            ->orderBy('date')
            ->get()
            ->mapWithKeys(fn(Availability $availability) => [
                $availability->date->toDateString() => $availability->toArray(),
            ]);

        Reservation::query()
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereDate('check_out', '>', today())
            ->get()
            ->each(function (Reservation $reservation) use ($availability) {
                foreach (CarbonPeriod::create($reservation->check_in, $reservation->check_out->copy()->subDay()) as $date) {
                    $dateString = $date->format('Y-m-d');
                    $availability[$dateString] = [
                        'id' => $availability[$dateString]['id'] ?? null,
                        'date' => $dateString,
                        'status' => 'booked',
                        'note' => '予約済み',
                        'source' => 'reservation',
                        'created_at' => $availability[$dateString]['created_at'] ?? null,
                        'updated_at' => $availability[$dateString]['updated_at'] ?? null,
                    ];
                }
            });

        return $availability
            ->sortKeys()
            ->values()
            ->toArray();
    }
}
