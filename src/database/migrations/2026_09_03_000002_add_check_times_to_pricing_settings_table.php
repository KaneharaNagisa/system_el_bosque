<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pricing_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('pricing_settings', 'check_in_time')) {
                $table->time('check_in_time')->default('15:00')->after('holiday_rate');
            }

            if (! Schema::hasColumn('pricing_settings', 'check_out_time')) {
                $table->time('check_out_time')->default('11:00')->after('check_in_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pricing_settings', function (Blueprint $table) {
            if (Schema::hasColumn('pricing_settings', 'check_out_time')) {
                $table->dropColumn('check_out_time');
            }

            if (Schema::hasColumn('pricing_settings', 'check_in_time')) {
                $table->dropColumn('check_in_time');
            }
        });
    }
};
