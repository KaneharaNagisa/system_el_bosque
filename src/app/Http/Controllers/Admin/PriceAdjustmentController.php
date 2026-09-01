<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PriceAdjustment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PriceAdjustmentController extends Controller
{
    public function index(): Response
    {
        $rules = PriceAdjustment::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'                   => 'ADJ-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                'dbId'                 => $r->id,
                'name'                 => $r->name,
                'discountPercent'      => $r->discount_percent,
                'hasPeriod'            => $r->has_period,
                'periodStart'          => $r->period_start?->format('Y-m-d') ?? '',
                'periodEnd'            => $r->period_end?->format('Y-m-d') ?? '',
                'hasGuestRange'        => $r->has_guest_range,
                'guestMin'             => $r->guest_min,
                'guestMax'             => $r->guest_max,
                'noExperienceOptions'  => $r->no_experience_options,
                'noSupportPlan'        => $r->no_support_plan,
                'status'               => $r->status,
                'createdAt'            => $r->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/PriceAdjustment', compact('rules'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateRule($request);
        PriceAdjustment::create($validated);

        return back()->with('message', '料金調整ルールを追加しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $this->validateRule($request);
        PriceAdjustment::findOrFail($id)->update($validated);

        return back()->with('message', '料金調整ルールを更新しました');
    }

    public function toggleStatus(int $id): RedirectResponse
    {
        $rule = PriceAdjustment::findOrFail($id);
        $rule->update(['status' => $rule->status === 'active' ? 'inactive' : 'active']);

        return back()->with('message', 'ステータスを変更しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        PriceAdjustment::findOrFail($id)->delete();

        return back()->with('message', '料金調整ルールを削除しました');
    }

    private function validateRule(Request $request): array
    {
        return $request->validate([
            'name'                  => ['required', 'string', 'max:100'],
            'discount_percent'      => ['required', 'integer', 'min:1', 'max:100'],
            'has_period'            => ['boolean'],
            'period_start'          => ['nullable', 'date', 'required_if:has_period,true'],
            'period_end'            => ['nullable', 'date', 'required_if:has_period,true', 'after_or_equal:period_start'],
            'has_guest_range'       => ['boolean'],
            'guest_min'             => ['nullable', 'integer', 'min:1', 'max:20'],
            'guest_max'             => ['nullable', 'integer', 'min:1', 'max:20', 'gte:guest_min'],
            'no_experience_options' => ['boolean'],
            'no_support_plan'       => ['boolean'],
            'status'                => ['required', 'in:active,inactive'],
        ]);
    }
}
