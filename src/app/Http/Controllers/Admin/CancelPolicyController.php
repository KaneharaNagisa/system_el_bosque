<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CancelPolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CancelPolicyController extends Controller
{
    public function index(): Response
    {
        $policies = CancelPolicy::orderByDesc('days_before')
            ->get()
            ->map(fn($p) => [
                'id'          => 'CP-' . str_pad($p->id, 3, '0', STR_PAD_LEFT),
                'dbId'        => $p->id,
                'daysBefore'  => $p->days_before,
                'label'       => $p->label,
                'chargeRate'  => $p->charge_rate,
                'description' => $p->description,
            ]);

        return Inertia::render('Admin/CancelPolicy', compact('policies'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'daysBefore'  => ['required', 'integer', 'min:0'],
            'label'       => ['required', 'string', 'max:255'],
            'chargeRate'  => ['required', 'integer', 'min:0', 'max:100'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        CancelPolicy::create([
            'days_before'  => $request->daysBefore,
            'label'        => $request->label,
            'charge_rate'  => $request->chargeRate,
            'description'  => $request->description,
        ]);

        return back()->with('message', 'ポリシーを追加しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'daysBefore'  => ['required', 'integer', 'min:0'],
            'label'       => ['required', 'string', 'max:255'],
            'chargeRate'  => ['required', 'integer', 'min:0', 'max:100'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        CancelPolicy::findOrFail($id)->update([
            'days_before'  => $request->daysBefore,
            'label'        => $request->label,
            'charge_rate'  => $request->chargeRate,
            'description'  => $request->description,
        ]);

        return back()->with('message', 'ポリシーを更新しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        CancelPolicy::findOrFail($id)->delete();

        return back()->with('message', 'ポリシーを削除しました');
    }
}
