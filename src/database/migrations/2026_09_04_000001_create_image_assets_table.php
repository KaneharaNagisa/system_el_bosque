<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('image_assets', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->string('path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('image_assets');
    }
};
