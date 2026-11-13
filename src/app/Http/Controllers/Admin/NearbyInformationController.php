<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NearbyInformationItem;
use App\Services\PublicImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class NearbyInformationController extends Controller
{
    public function __construct(private PublicImageStorage $imageStorage) {}

    public function index(): Response
    {
        return Inertia::render('Admin/NearbyInformation', [
            'onsenFacilities' => $this->items('onsen'),
            'spots' => $this->items('spot'),
        ]);
    }

    public function store(Request $request, string $type): RedirectResponse
    {
        $type = $this->validatedType($type);
        $validated = $request->validate($this->rules($type));
        $item = NearbyInformationItem::create([
            ...$this->mapInput($validated, $type),
            'sort_order' => ((int) NearbyInformationItem::query()->where('type', $type)->max('sort_order')) + 1,
        ]);

        if ($request->hasFile('image')) {
            [$item->image_path, $item->variants] = $this->imageStorage->storeVariants(
                $request->file('image'),
                'nearby.'.$type.'.'.$item->id,
            );
            $item->save();
        }

        return back()->with('message', '周辺情報を登録しました');
    }

    public function update(Request $request, string $type, int $id): RedirectResponse
    {
        $type = $this->validatedType($type);
        $validated = $request->validate($this->rules($type));
        $item = NearbyInformationItem::query()->where('type', $type)->findOrFail($id);
        $oldPath = $item->image_path;
        $oldVariants = $item->variants ?? [];
        $newImage = null;

        if ($request->hasFile('image')) {
            $newImage = $this->imageStorage->storeVariants(
                $request->file('image'),
                'nearby.'.$type.'.'.$item->id,
            );
        }

        $item->update($this->mapInput($validated, $type));
        if ($newImage !== null) {
            [$item->image_path, $item->variants] = $newImage;
            $item->save();
            $this->imageStorage->deleteFiles($oldPath, $oldVariants);
        }

        return back()->with('message', '周辺情報を更新しました');
    }

    public function destroy(string $type, int $id): RedirectResponse
    {
        $type = $this->validatedType($type);
        $item = NearbyInformationItem::query()->where('type', $type)->findOrFail($id);
        $this->imageStorage->deleteFiles($item->image_path, $item->variants ?? []);
        $item->delete();

        return back()->with('message', '周辺情報を削除しました');
    }

    public function reorder(Request $request, string $type): JsonResponse
    {
        $type = $this->validatedType($type);
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:nearby_information_items,id'],
        ]);
        $ids = array_map('intval', $validated['ids']);
        $currentIds = NearbyInformationItem::query()
            ->where('type', $type)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if (count($ids) !== count($currentIds)
            || array_diff($ids, $currentIds)
            || array_diff($currentIds, $ids)) {
            abort(422, '並び順を更新できませんでした。画面を再読み込みしてください。');
        }

        DB::transaction(function () use ($ids) {
            foreach ($ids as $sortOrder => $id) {
                NearbyInformationItem::query()
                    ->whereKey($id)
                    ->update(['sort_order' => $sortOrder]);
            }
        });

        return response()->json(['success' => true]);
    }

    private function items(string $type): array
    {
        return NearbyInformationItem::query()
            ->where('type', $type)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (NearbyInformationItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'subtitle' => $item->subtitle,
                'category' => $item->category,
                'distance' => $item->distance,
                'description' => $item->description,
                'operatingHours' => $item->operating_hours,
                'price' => $item->price,
                'closedDays' => $item->closed_days,
                'websiteUrl' => $item->website_url,
                'icon' => $item->icon,
                'sortOrder' => $item->sort_order,
                'imageUrl' => $item->image_path ? asset('storage/'.$item->image_path) : null,
            ])
            ->all();
    }

    private function validatedType(string $type): string
    {
        abort_unless(in_array($type, ['onsen', 'spot'], true), 404);

        return $type;
    }

    private function rules(string $type): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
        ];

        if ($type === 'onsen') {
            return $rules + [
                'subtitle' => ['nullable', 'string', 'max:255'],
                'operatingHours' => ['nullable', 'string', 'max:255'],
                'price' => ['nullable', 'string', 'max:255'],
                'closedDays' => ['nullable', 'string', 'max:255'],
                'websiteUrl' => ['nullable', 'url', 'max:2048'],
            ];
        }

        return $rules + [
            'icon' => ['nullable', 'string', 'max:32'],
            'category' => ['nullable', 'string', 'max:255'],
            'distance' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function mapInput(array $data, string $type): array
    {
        return [
            'type' => $type,
            'name' => $data['name'],
            'description' => $data['description'],
            'subtitle' => $data['subtitle'] ?? null,
            'category' => $data['category'] ?? null,
            'distance' => $data['distance'] ?? null,
            'operating_hours' => $data['operatingHours'] ?? null,
            'price' => $data['price'] ?? null,
            'closed_days' => $data['closedDays'] ?? null,
            'website_url' => $data['websiteUrl'] ?? null,
            'icon' => $data['icon'] ?? null,
        ];
    }
}
