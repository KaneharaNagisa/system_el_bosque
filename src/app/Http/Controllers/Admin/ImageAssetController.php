<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FacilityGalleryItem;
use App\Models\ImageAsset;
use App\Services\PublicImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ImageAssetController extends Controller
{
    public function __construct(private PublicImageStorage $imageStorage)
    {
    }

    private const ASSETS = [
        ['key' => 'home.hero', 'label' => 'トップ：ヒーロー背景'],
        ['key' => 'home.hero.2', 'label' => 'トップ：ヒーロー背景 2枚目'],
        ['key' => 'home.hero.3', 'label' => 'トップ：ヒーロー背景 3枚目'],
        ['key' => 'home.lake', 'label' => 'トップ：湖の写真'],
        ['key' => 'home.interior', 'label' => 'トップ：室内写真'],
        ['key' => 'home.stars', 'label' => 'トップ：星空写真'],
        ['key' => 'home.bbq', 'label' => 'トップ：BBQ写真'],
        ['key' => 'about.exterior', 'label' => '施設紹介：外観'],
        ['key' => 'about.living', 'label' => '施設紹介：リビング'],
        ['key' => 'about.kitchen', 'label' => '施設紹介：キッチン'],
        ['key' => 'about.loft', 'label' => '施設紹介：ロフト'],
        ['key' => 'about.bbq', 'label' => '施設紹介：BBQ'],
        ['key' => 'about.lake', 'label' => '施設紹介：湖'],
        ['key' => 'about.stars', 'label' => '施設紹介：星空'],
        ['key' => 'area.lake', 'label' => '周辺情報：湖'],
        ['key' => 'area.autumn', 'label' => '周辺情報：秋の風景'],
    ];

    public function index(): Response
    {
        $saved = ImageAsset::query()->get()->keyBy('key');
        $images = collect(self::ASSETS)->map(function (array $asset) use ($saved) {
            $image = $saved->get($asset['key']);
            return [
                ...$asset,
                'path' => $image?->path,
                ...$this->imageResponse($image?->path, $image?->variants),
            ];
        })->values();
        $gallery = FacilityGalleryItem::query()->orderBy('sort_order')->orderBy('id')->get()->map(function (FacilityGalleryItem $item) use ($saved) {
            $fallback = $item->fallback_key ? $saved->get($item->fallback_key) : null;
            $path = $item->image_path ?? $fallback?->path;
            $variants = $item->image_path ? $item->variants : $fallback?->variants;

            return [
                'id' => $item->id,
                'title' => $item->title,
                'sortOrder' => $item->sort_order,
                'fallbackKey' => $item->fallback_key,
                ...$this->imageResponse($path, $variants),
            ];
        })->values();

        return Inertia::render('Admin/Images', ['images' => $images, 'gallery' => $gallery]);
    }

    public function upload(Request $request, string $key): JsonResponse|RedirectResponse
    {
        abort_unless(collect(self::ASSETS)->contains('key', $key), 404);
        $request->validate(['image' => ['required', 'image', 'max:10240']]);

        $asset = ImageAsset::firstOrNew(['key' => $key]);
        [$path, $variants] = $this->imageStorage->storeVariants($request->file('image'), $key);
        $this->imageStorage->deleteFiles($asset->path, $asset->variants ?? []);
        $asset->label = collect(self::ASSETS)->firstWhere('key', $key)['label'];
        $asset->path = $path;
        $asset->variants = $variants;
        $asset->save();

        return response()->json($this->imageResponse($asset->path, $asset->variants));
    }

    public function destroy(string $key): RedirectResponse
    {
        $asset = ImageAsset::where('key', $key)->firstOrFail();
        $this->imageStorage->deleteFiles($asset->path, $asset->variants ?? []);
        $asset->delete();

        return back()->with('message', '画像を初期状態に戻しました');
    }

    public function storeGalleryItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
        ]);

        $item = FacilityGalleryItem::create([
            'title' => $validated['title'],
            'sort_order' => ((int) FacilityGalleryItem::max('sort_order')) + 1,
        ]);
        [$item->image_path, $item->variants] = $this->imageStorage->storeVariants(
            $request->file('image'),
            'about.gallery.' . $item->id,
        );
        $item->save();

        return response()->json($this->galleryResponse($item), 201);
    }

    public function updateGalleryItem(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $item = FacilityGalleryItem::findOrFail($id);
        $item->update(['title' => $validated['title']]);

        return response()->json($this->galleryResponse($item));
    }

    public function uploadGalleryImage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
        ]);

        $item = FacilityGalleryItem::findOrFail($id);
        $this->imageStorage->deleteFiles($item->image_path, $item->variants ?? []);
        [$item->image_path, $item->variants] = $this->imageStorage->storeVariants(
            $request->file('image'),
            'about.gallery.' . $item->id,
        );
        $item->save();

        return response()->json($this->galleryResponse($item));
    }

    public function destroyGalleryItem(int $id): JsonResponse
    {
        $item = FacilityGalleryItem::findOrFail($id);
        $this->imageStorage->deleteFiles($item->image_path, $item->variants ?? []);
        $item->delete();

        return response()->json(['success' => true]);
    }

    public function reorderGallery(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:facility_gallery_items,id'],
        ]);
        $ids = array_map('intval', $validated['ids']);
        $currentIds = FacilityGalleryItem::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        if (count($ids) !== count($currentIds)
            || array_diff($ids, $currentIds)
            || array_diff($currentIds, $ids)) {
            abort(422, 'ギャラリーの並び順を更新できませんでした。画面を再読み込みしてください。');
        }

        DB::transaction(function () use ($ids) {
            foreach ($ids as $sortOrder => $id) {
                FacilityGalleryItem::query()
                    ->whereKey($id)
                    ->update(['sort_order' => $sortOrder]);
            }
        });

        return response()->json(['success' => true]);
    }

    public static function keys(): array
    {
        return collect(self::ASSETS)->pluck('key')->all();
    }

    private function imageResponse(?string $path, ?array $variants): array
    {
        if (!$path) {
            return ['url' => null, 'srcSet' => null, 'sizes' => null];
        }

        $srcSet = collect($variants)
            ->map(fn(string $path, string $width) => asset('storage/' . $path) . ' ' . $width . 'w')
            ->implode(', ');

        return [
            'url' => asset('storage/' . $path),
            'srcSet' => $srcSet ?: null,
            'sizes' => '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1440px',
        ];
    }

    private function galleryResponse(FacilityGalleryItem $item): array
    {
        return [
            'id' => $item->id,
            'title' => $item->title,
            'sortOrder' => $item->sort_order,
            'fallbackKey' => $item->fallback_key,
            ...$this->imageResponse($item->image_path, $item->variants),
        ];
    }
}
