<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Manual;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManualController extends Controller
{
    public function index(): Response
    {
        $manuals = Manual::orderBy('updated_at', 'desc')
            ->get()
            ->map(fn($m) => [
                'id'        => 'MNL-' . str_pad($m->id, 3, '0', STR_PAD_LEFT),
                'dbId'      => $m->id,
                'title'     => $m->title,
                'target'    => $m->target,
                'content'   => $m->content,
                'status'    => $m->status,
                'updatedAt' => $m->updated_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Manuals', compact('manuals'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'target'  => ['required', 'in:front,admin'],
            'content' => ['required', 'string'],
            'status'  => ['required', 'in:published,draft'],
        ]);

        Manual::create($request->only('title', 'target', 'content', 'status'));

        return back()->with('message', 'マニュアルを作成しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'target'  => ['required', 'in:front,admin'],
            'content' => ['required', 'string'],
            'status'  => ['required', 'in:published,draft'],
        ]);

        Manual::findOrFail($id)->update($request->only('title', 'target', 'content', 'status'));

        return back()->with('message', 'マニュアルを更新しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        Manual::findOrFail($id)->delete();

        return back()->with('message', 'マニュアルを削除しました');
    }
}
