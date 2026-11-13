<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nearby_information_items', function (Blueprint $table) {
            $table->id();
            $table->string('type', 16)->index();
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->string('category')->nullable();
            $table->string('distance')->nullable();
            $table->text('description');
            $table->string('operating_hours')->nullable();
            $table->string('price')->nullable();
            $table->string('closed_days')->nullable();
            $table->string('website_url', 2048)->nullable();
            $table->string('icon', 32)->nullable();
            $table->string('image_path')->nullable();
            $table->json('variants')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['type', 'sort_order']);
        });

        $now = now();
        DB::table('nearby_information_items')->insert([
            [
                'type' => 'onsen',
                'name' => '南信州阿南温泉 かじかの湯',
                'subtitle' => 'ナトリウム・炭酸水素塩泉',
                'category' => null,
                'distance' => null,
                'description' => '長野最大級の露天風呂、五種浴の露天風呂、スパ、レストラン（十利そば）、物産体験施設、民芸紹介所、キャンプ場も併設した総合型温泉施設。',
                'operating_hours' => '10:00〜21:00（最終入場20:00）',
                'price' => '大人¥600、子供¥300',
                'closed_days' => '定休日：火曜',
                'website_url' => null,
                'icon' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'onsen',
                'name' => '天龍温泉 おきよめの湯',
                'subtitle' => 'pHが高くつるつるの美肌の湯',
                'category' => null,
                'distance' => null,
                'description' => 'ぬるりとした内風呂と露天風呂、コテージも併設。2024年秋に「御魂経」にて日帰りにリニューアルオープン。',
                'operating_hours' => '16:00〜21:00（最終入場20:00）',
                'price' => '大人¥600、子供¥300',
                'closed_days' => '定休日：火曜',
                'website_url' => null,
                'icon' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'onsen',
                'name' => '売木温泉 こまどりの湯',
                'subtitle' => 'ナトリウム・炭酸水素塩泉',
                'category' => null,
                'distance' => null,
                'description' => '内風呂・泡風呂・打たせ湯・露天風呂・ロビー・和室宴会、飲食が楽しめるのんびりくつろげます。',
                'operating_hours' => '10:00〜20:00（最終入場19:30）',
                'price' => '大人¥600、子供¥300',
                'closed_days' => null,
                'website_url' => null,
                'icon' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'spot',
                'name' => '巣山湖',
                'subtitle' => null,
                'icon' => '🏔️',
                'category' => '自然・景観',
                'distance' => '徒歩圏内',
                'description' => 'エルボスケのすぐそばにある静かな湖。早朝の霧がかかる幻想的な景色や、湖面に映る緑が美しい。カヌーや釣りも楽しめます。',
                'operating_hours' => null,
                'price' => null,
                'closed_days' => null,
                'website_url' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'spot',
                'name' => '南アルプス遠望',
                'subtitle' => null,
                'icon' => '⛰️',
                'category' => '自然・景観',
                'distance' => '周辺',
                'description' => '新野は標高の高い高原地帯。晴れた日には南アルプスの山々を望め、雄大な自然のパノラマが広がります。',
                'operating_hours' => null,
                'price' => null,
                'closed_days' => null,
                'website_url' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'spot',
                'name' => '新野の雪まつり',
                'subtitle' => null,
                'icon' => '🎑',
                'category' => '文化・観光',
                'distance' => '新野地区',
                'description' => '毎年1月に行われる伝統的な民俗行事（営業外）。三信遠地区の冬の風物詩で、見ごたえのある雪の祭りです。',
                'operating_hours' => null,
                'price' => null,
                'closed_days' => null,
                'website_url' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'spot',
                'name' => '新野の道の駅',
                'subtitle' => null,
                'icon' => '🛣️',
                'category' => '道の駅',
                'distance' => '車で約5分',
                'description' => '道の駅 信州新野千石平。地元の新鮮野菜や特産品が並ぶ直売所があり、食堂では新野の郷土料理が楽しめます。ドライブの休憩にも最適です。',
                'operating_hours' => null,
                'price' => null,
                'closed_days' => null,
                'website_url' => null,
                'image_path' => null,
                'variants' => null,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('nearby_information_items');
    }
};
