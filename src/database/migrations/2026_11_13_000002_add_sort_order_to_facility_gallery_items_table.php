<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facility_gallery_items', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->index();
        });

        DB::table('facility_gallery_items')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $item, int $index) {
                DB::table('facility_gallery_items')
                    ->where('id', $item->id)
                    ->update(['sort_order' => $index]);
            });
    }

    public function down(): void
    {
        Schema::table('facility_gallery_items', function (Blueprint $table) {
            $table->dropIndex(['sort_order']);
            $table->dropColumn('sort_order');
        });
    }
};
