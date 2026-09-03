<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('base_rate')->default(20000);
            $table->unsignedInteger('additional_guest_rate')->default(3000);
            $table->unsignedInteger('weekday_rate')->default(20000);
            $table->unsignedInteger('holiday_rate')->default(26000);
            $table->time('check_in_time')->default('15:00');
            $table->time('check_out_time')->default('11:00');
            $table->json('period_rates')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_settings');
    }
};
