<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cancel_policies', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('days_before');
            $table->string('label');
            $table->unsignedTinyInteger('charge_rate');
            $table->string('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cancel_policies');
    }
};
