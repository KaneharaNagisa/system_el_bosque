<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->unsignedInteger('price')->default(0);
            $table->string('price_note');
            $table->string('duration')->nullable();
            $table->string('recommended_people')->nullable();
            $table->string('season')->nullable();
            $table->string('season_tag')->nullable();
            $table->boolean('requires_reservation')->default(false);
            $table->json('points')->nullable();
            $table->text('notes')->nullable();
            $table->string('image')->nullable();
            $table->unsignedTinyInteger('popularity')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
