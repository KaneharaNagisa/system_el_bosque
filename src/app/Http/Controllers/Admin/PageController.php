<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        $pages = Page::orderBy('id')
            ->get()
            ->map(fn($p) => [
                'id'        => 'PG-' . str_pad($p->id, 3, '0', STR_PAD_LEFT),
                'dbId'      => $p->id,
                'title'     => $p->title,
                'slug'      => $p->slug,
                'content'   => $p->content,
                'status'    => $p->status,
                'updatedAt' => $p->updated_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Pages', compact('pages'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'status'  => ['required', 'in:published,draft'],
        ]);

        Page::findOrFail($id)->update($request->only('title', 'content', 'status'));

        return back()->with('message', 'ページを更新しました');
    }
}
