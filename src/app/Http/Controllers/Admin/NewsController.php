<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(): Response
    {
        $news = News::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($n) => [
                'id'          => 'NEWS-' . str_pad($n->id, 3, '0', STR_PAD_LEFT),
                'dbId'        => $n->id,
                'title'       => $n->title,
                'content'     => $n->content,
                'target'      => $n->target,
                'status'      => $n->status,
                'publishDate' => $n->publish_date?->format('Y-m-d'),
                'createdAt'   => $n->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/News', compact('news'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'target'       => ['required', 'in:top,mypage,both'],
            'status'       => ['required', 'in:published,draft'],
            'publish_date' => ['nullable', 'date'],
        ]);

        News::create($request->only('title', 'content', 'target', 'status', 'publish_date'));

        return back()->with('message', 'お知らせを作成しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'target'       => ['required', 'in:top,mypage,both'],
            'status'       => ['required', 'in:published,draft'],
            'publish_date' => ['nullable', 'date'],
        ]);

        News::findOrFail($id)->update($request->only('title', 'content', 'target', 'status', 'publish_date'));

        return back()->with('message', 'お知らせを更新しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        News::findOrFail($id)->delete();

        return back()->with('message', 'お知らせを削除しました');
    }
}
