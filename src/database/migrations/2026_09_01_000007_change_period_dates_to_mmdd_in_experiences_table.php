<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // date 型のまま VARCHAR に変更し、既存値は "YYYY-MM-DD" 文字列として残る
        DB::statement("ALTER TABLE experiences MODIFY COLUMN period_start VARCHAR(5) NULL");
        DB::statement("ALTER TABLE experiences MODIFY COLUMN period_end   VARCHAR(5) NULL");

        // "YYYY-MM-DD" → "MM-DD" に変換（年部分を除去）
        DB::statement("UPDATE experiences SET period_start = SUBSTRING(period_start, 6) WHERE period_start IS NOT NULL AND period_start LIKE '____-__-__'");
        DB::statement("UPDATE experiences SET period_end   = SUBSTRING(period_end,   6) WHERE period_end   IS NOT NULL AND period_end   LIKE '____-__-__'");
    }

    public function down(): void
    {
        // ロールバック時は MM-DD → date 型に戻す（今年の年を付与）
        DB::statement("UPDATE experiences SET period_start = CONCAT(YEAR(NOW()), '-', period_start) WHERE period_start IS NOT NULL AND period_start LIKE '__-__'");
        DB::statement("UPDATE experiences SET period_end   = CONCAT(YEAR(NOW()), '-', period_end)   WHERE period_end   IS NOT NULL AND period_end   LIKE '__-__'");
        DB::statement("ALTER TABLE experiences MODIFY COLUMN period_start DATE NULL");
        DB::statement("ALTER TABLE experiences MODIFY COLUMN period_end   DATE NULL");
    }
};
