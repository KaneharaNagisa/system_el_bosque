<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nickname')->nullable()->after('first_name_kana');
            $table->string('prefecture', 20)->nullable()->after('address');
            $table->string('city', 50)->nullable()->after('prefecture');
            $table->string('line_id', 100)->nullable()->after('city');
            $table->json('family_birth_years')->nullable()->after('family_type');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nickname',
                'prefecture',
                'city',
                'line_id',
                'family_birth_years',
            ]);
        });
    }
};
