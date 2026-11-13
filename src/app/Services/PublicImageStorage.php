<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicImageStorage
{
    public function storeVariants(UploadedFile $file, string $key): array
    {
        $directory = 'images/'.Str::slug($key).'/'.Str::uuid();
        $contents = $file->get();
        $gdInfo = function_exists('gd_info') ? gd_info() : [];
        $source = ($gdInfo['JPEG Support'] ?? false) && ($gdInfo['WebP Support'] ?? false)
            ? @imagecreatefromstring($contents)
            : false;

        if ($source === false) {
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $path = $directory.'/original.'.$extension;
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

            $path = $directory.'/'.$targetWidth.'.webp';
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

    public function deleteFiles(?string $path, array $variants): void
    {
        $paths = array_values($variants);
        if ($path) {
            $paths[] = $path;
        }
        if ($paths) {
            Storage::disk('public')->delete(array_unique($paths));
        }
    }
}
