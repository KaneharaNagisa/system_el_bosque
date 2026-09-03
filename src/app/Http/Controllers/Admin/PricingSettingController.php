<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PricingSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PricingSettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/PricingSetting', [
            'pricingSetting' => PricingSetting::current()->toFrontend(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'base_rate' => ['required', 'integer', 'min:0', 'max:10000000'],
            'additional_guest_rate' => ['required', 'integer', 'min:0', 'max:10000000'],
            'weekday_rate' => ['required', 'integer', 'min:0', 'max:10000000'],
            'holiday_rate' => ['required', 'integer', 'min:0', 'max:10000000'],
            'check_in_time' => ['required', 'date_format:H:i'],
            'check_out_time' => ['required', 'date_format:H:i'],
            'period_rates' => ['array', 'max:50'],
            'period_rates.*.name' => ['required', 'string', 'max:100'],
            'period_rates.*.start' => ['required', 'date_format:m-d'],
            'period_rates.*.end' => ['required', 'date_format:m-d'],
            'period_rates.*.rate' => ['required', 'integer', 'min:0', 'max:10000000'],
        ]);

        PricingSetting::current()->update($validated);

        return back()->with('message', '料金設定を更新しました');
    }
}
