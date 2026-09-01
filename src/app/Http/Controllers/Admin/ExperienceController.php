<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    public function index(): Response
    {
        $experiences = Experience::orderBy('sort_order')
            ->get()
            ->map(fn($e) => [
                'id'                  => 'EXP-' . str_pad($e->id, 3, '0', STR_PAD_LEFT),
                'dbId'                => $e->id,
                'name'                => $e->name,
                'description'         => $e->description,
                'price'               => $e->price,
                'priceNote'           => $e->price_note,
                'duration'            => $e->duration,
                'recommendedPeople'   => $e->recommended_people,
                'season'              => $e->season,
                'seasonTag'           => $e->season_tag,
                'period'              => $e->period,
                'requiresReservation' => $e->requires_reservation,
                'points'              => $e->points ?? [],
                'notes'               => $e->notes,
                'image'               => $e->image,
                'popularity'          => $e->popularity,
                'isActive'            => $e->is_active,
                'createdAt'           => $e->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Experiences', compact('experiences'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        Experience::create($this->mapInput($validated));

        return back()->with('message', '体験オプションを作成しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        Experience::findOrFail($id)->update($this->mapInput($validated));

        return back()->with('message', '体験オプションを更新しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        Experience::findOrFail($id)->delete();

        return back()->with('message', '体験オプションを削除しました');
    }

    private function rules(): array
    {
        return [
            'name'                 => ['required', 'string', 'max:255'],
            'description'          => ['required', 'string'],
            'price'                => ['required', 'integer', 'min:0'],
            'priceNote'            => ['required', 'string', 'max:255'],
            'duration'             => ['nullable', 'string'],
            'recommendedPeople'    => ['nullable', 'string'],
            'season'               => ['nullable', 'string'],
            'seasonTag'            => ['nullable', 'string'],
            'period'               => ['nullable', 'string'],
            'requiresReservation'  => ['boolean'],
            'points'               => ['nullable', 'array'],
            'notes'                => ['nullable', 'string'],
            'image'                => ['nullable', 'string'],
            'isActive'             => ['boolean'],
        ];
    }

    private function mapInput(array $data): array
    {
        return [
            'name'                 => $data['name'],
            'description'          => $data['description'],
            'price'                => $data['price'],
            'price_note'           => $data['priceNote'],
            'duration'             => $data['duration'] ?? null,
            'recommended_people'   => $data['recommendedPeople'] ?? null,
            'season'               => $data['season'] ?? null,
            'season_tag'           => $data['seasonTag'] ?? null,
            'period'               => $data['period'] ?? null,
            'requires_reservation' => $data['requiresReservation'] ?? false,
            'points'               => $data['points'] ?? [],
            'notes'                => $data['notes'] ?? null,
            'image'                => $data['image'] ?? null,
            'is_active'            => $data['isActive'] ?? true,
        ];
    }
}
