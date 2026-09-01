<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function index(): Response
    {
        $faqs = Faq::orderBy('sort_order')
            ->get()
            ->map(fn($f) => [
                'id'        => 'FAQ-' . str_pad($f->id, 3, '0', STR_PAD_LEFT),
                'dbId'      => $f->id,
                'category'  => $f->category,
                'question'  => $f->question,
                'answer'    => $f->answer,
                'order'     => $f->sort_order,
                'isActive'  => $f->is_active,
            ]);

        return Inertia::render('Admin/FAQ', compact('faqs'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'question' => ['required', 'string'],
            'answer'   => ['required', 'string'],
            'order'    => ['integer', 'min:0'],
            'isActive' => ['boolean'],
        ]);

        Faq::create([
            'category'   => $request->category,
            'question'   => $request->question,
            'answer'     => $request->answer,
            'sort_order' => $request->order ?? 0,
            'is_active'  => $request->isActive ?? true,
        ]);

        return back()->with('message', 'FAQを追加しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'question' => ['required', 'string'],
            'answer'   => ['required', 'string'],
            'order'    => ['integer', 'min:0'],
            'isActive' => ['boolean'],
        ]);

        Faq::findOrFail($id)->update([
            'category'   => $request->category,
            'question'   => $request->question,
            'answer'     => $request->answer,
            'sort_order' => $request->order ?? 0,
            'is_active'  => $request->isActive ?? true,
        ]);

        return back()->with('message', 'FAQを更新しました');
    }

    public function destroy(int $id): RedirectResponse
    {
        Faq::findOrFail($id)->update(['is_active' => false]);

        return back()->with('message', 'FAQを無効化しました');
    }
}
