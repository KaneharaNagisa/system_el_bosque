<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facility_gallery_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('fallback_key')->nullable();
            $table->string('image_path')->nullable();
            $table->json('variants')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('facility_gallery_items')->insert([
            ['title' => 'リビング・薪ストーブ', 'fallback_key' => 'about.living', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'フルキッチン', 'fallback_key' => 'about.kitchen', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'ロフト寝室', 'fallback_key' => 'about.loft', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'すぐそばの巣山湖', 'fallback_key' => 'about.lake', 'created_at' => $now, 'updated_at' => $now],
            ['title' => 'BBQ', 'fallback_key' => 'about.bbq', 'created_at' => $now, 'updated_at' => $now],
            ['title' => '満天の星空', 'fallback_key' => 'about.stars', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_gallery_items');
    }
};
