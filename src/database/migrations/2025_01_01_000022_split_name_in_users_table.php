<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->nullable()->after('id');
            $table->string('first_name')->nullable()->after('last_name');
            $table->string('last_name_kana')->nullable()->after('first_name');
            $table->string('first_name_kana')->nullable()->after('last_name_kana');
        });

        // 既存 name データを last_name へ移行
        \DB::table('users')->update([
            'last_name'  => \DB::raw('IFNULL(`name`, "")'),
            'first_name' => '',
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_name', 'first_name', 'last_name_kana', 'first_name_kana']);
        });
    }
};
