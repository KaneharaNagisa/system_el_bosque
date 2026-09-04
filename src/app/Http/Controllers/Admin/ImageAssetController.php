<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImageAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ImageAssetController extends Controller
{
    private const ASSETS = [
        ['key' => 'home.hero', 'label' => 'トップ：ヒーロー背景'],
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
                ...$this->imageResponse($image),
            ];
        })->values();

        return Inertia::render('Admin/Images', ['images' => $images]);
    }

    public function upload(Request $request, string $key): JsonResponse|RedirectResponse
    {
        abort_unless(collect(self::ASSETS)->contains('key', $key), 404);
        $request->validate(['image' => ['required', 'image', 'max:10240']]);

        $asset = ImageAsset::firstOrNew(['key' => $key]);
        [$path, $variants] = $this->storeVariants($request->file('image'), $key);
        $this->deleteFiles($asset);
        $asset->label = collect(self::ASSETS)->firstWhere('key', $key)['label'];
        $asset->path = $path;
        $asset->variants = $variants;
        $asset->save();

        return response()->json($this->imageResponse($asset));
    }

    public function destroy(string $key): RedirectResponse
    {
        $asset = ImageAsset::where('key', $key)->firstOrFail();
        $this->deleteFiles($asset);
        $asset->delete();

        return back()->with('message', '画像を初期状態に戻しました');
    }

    public static function keys(): array
    {
        return collect(self::ASSETS)->pluck('key')->all();
    }

    private function storeVariants($file, string $key): array
    {
        $directory = 'images/' . Str::slug($key) . '/' . Str::uuid();
        $contents = file_get_contents($file->getRealPath());
        $gdInfo = function_exists('gd_info') ? gd_info() : [];
        $source = ($gdInfo['JPEG Support'] ?? false) && ($gdInfo['WebP Support'] ?? false)
            ? @imagecreatefromstring($contents)
            : false;

        if ($source === false) {
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $path = $directory . '/original.' . $extension;
            Storage::disk('public')->put($path, $contents);

            return [$path, []];
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $variants = [];

        foreach ([480, 768, 1440, 1920] as $width) {
            $targetWidth = min($width, $sourceWidth);
            if (isset($variants[$targetWidth])) {
                continue;
            }
            $targetHeight = (int) round($sourceHeight * ($targetWidth / $sourceWidth));
            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $sourceWidth, $sourceHeight);

            $path = $directory . '/' . $targetWidth . '.webp';
            ob_start();
            imagewebp($canvas, null, 82);
            Storage::disk('public')->put($path, ob_get_clean());
            imagedestroy($canvas);
            $variants[$targetWidth] = $path;
        }

        imagedestroy($source);
        ksort($variants);

        $paths = array_values($variants);
        return [end($paths), $variants];
    }

    private function deleteFiles(ImageAsset $asset): void
    {
        $paths = array_values($asset->variants ?? []);
        if ($asset->path) {
            $paths[] = $asset->path;
        }
        if ($paths) {
            Storage::disk('public')->delete(array_unique($paths));
        }
    }

    private function imageResponse(?ImageAsset $asset): array
    {
        if (!$asset) {
            return ['url' => null, 'srcSet' => null, 'sizes' => null];
        }

        $variants = $asset->variants ?? [];
        $srcSet = collect($variants)
            ->map(fn(string $path, string $width) => asset('storage/' . $path) . ' ' . $width . 'w')
            ->implode(', ');

        return [
            'url' => asset('storage/' . $asset->path),
            'srcSet' => $srcSet ?: null,
            'sizes' => '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1440px',
        ];
    }
}
