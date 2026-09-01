<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->date('birth_date')->nullable()->after('address');
            $table->enum('has_pet', ['none', 'small1', 'small2', 'large1', 'large2'])->default('none')->after('birth_date');
            $table->string('pet_breed')->nullable()->after('has_pet');
            $table->string('pet_breed2')->nullable()->after('pet_breed');
            $table->enum('family_type', ['individual', 'friends', 'couple', 'married', 'family'])->nullable()->after('pet_breed2');
            $table->string('how_found')->nullable()->after('family_type');
            $table->enum('status', ['active', 'withdrawn'])->default('active')->after('how_found');
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'address',
                'birth_date',
                'has_pet',
                'pet_breed',
                'pet_breed2',
                'family_type',
                'how_found',
                'status',
                'last_login_at',
            ]);
        });
    }
};
