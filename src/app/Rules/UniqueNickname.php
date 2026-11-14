<?php

namespace App\Rules;

use App\Models\User;
use App\Support\NicknameNormalizer;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueNickname implements ValidationRule
{
    public function __construct(private readonly ?int $ignoreId = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        $normalizedNickname = NicknameNormalizer::forComparison($value);
        $duplicateExists = User::query()
            ->whereNotNull('nickname')
            ->when($this->ignoreId !== null, fn ($query) => $query->whereKeyNot($this->ignoreId))
            ->get(['nickname'])
            ->contains(fn (User $user) => NicknameNormalizer::forComparison($user->nickname) === $normalizedNickname);

        if ($duplicateExists) {
            $fail('このニックネームは既に登録されています。');
        }
    }
}
