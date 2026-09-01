<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class KpiController extends Controller
{
    public function index(): Response
    {
        $monthlySales = Billing::where('status', 'paid')
            ->selectRaw('YEAR(paid_at) as year, MONTH(paid_at) as month, SUM(amount) as sales, COUNT(*) as reservations')
            ->groupByRaw('YEAR(paid_at), MONTH(paid_at)')
            ->orderByRaw('YEAR(paid_at), MONTH(paid_at)')
            ->get()
            ->map(fn($row) => [
                'month'        => $row->month . '月',
                'sales'        => $row->sales,
                'reservations' => $row->reservations,
            ]);

        $memberStatusData = User::where('status', 'active')
            ->selectRaw('family_type, COUNT(*) as count')
            ->groupBy('family_type')
            ->get()
            ->map(fn($row) => [
                'name'  => match ($row->family_type) {
                    'individual' => '個人',
                    'friends'    => '友人',
                    'couple'     => 'カップル',
                    'married'    => 'ご夫婦',
                    'family'     => 'ご家族',
                    default      => $row->family_type ?? '未設定',
                },
                'value' => $row->count,
            ]);

        return Inertia::render('Admin/KPI', compact('monthlySales', 'memberStatusData'));
    }
}
