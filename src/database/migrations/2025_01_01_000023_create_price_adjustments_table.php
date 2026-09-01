<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedTinyInteger('discount_percent');
            $table->boolean('has_period')->default(false);
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->boolean('has_guest_range')->default(false);
            $table->unsignedTinyInteger('guest_min')->nullable();
            $table->unsignedTinyInteger('guest_max')->nullable();
            $table->boolean('no_experience_options')->default(false);
            $table->boolean('no_support_plan')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_adjustments');
    }
};
