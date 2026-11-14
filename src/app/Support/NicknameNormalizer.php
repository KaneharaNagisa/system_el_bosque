<?php

namespace App\Support;

class NicknameNormalizer
{
    public static function normalizeInput(mixed $value): mixed
    {
        return is_string($value) ? self::forStorage($value) : $value;
    }

    public static function forStorage(string $nickname): string
    {
        return mb_convert_kana($nickname, 'rKV', 'UTF-8');
    }

    public static function forComparison(string $nickname): string
    {
        $nickname = self::forStorage($nickname);
        $firstCharacter = mb_substr($nickname, 0, 1, 'UTF-8');
        $conversion = mb_strwidth($firstCharacter, 'UTF-8') > 1 ? 'ASKV' : 'askh';

        return mb_convert_kana($nickname, $conversion, 'UTF-8');
    }
}
