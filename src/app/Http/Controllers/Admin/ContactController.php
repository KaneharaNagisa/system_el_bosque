<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        $contacts = Contact::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => [
                'id'      => 'CNT-' . str_pad($c->id, 3, '0', STR_PAD_LEFT),
                'dbId'    => $c->id,
                'name'    => $c->name,
                'email'   => $c->email,
                'phone'   => $c->phone,
                'subject' => $c->subject,
                'message' => $c->message,
                'category' => $c->category,
                'date'    => $c->created_at->format('Y-m-d'),
                'status'  => $c->status,
                'reply'   => $c->reply,
            ]);

        return Inertia::render('Admin/Contacts', compact('contacts'));
    }

    public function reply(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'reply' => ['required', 'string'],
        ]);

        Contact::findOrFail($id)->update([
            'reply'      => $request->reply,
            'status'     => 'replied',
            'replied_at' => now(),
        ]);

        return back()->with('message', '返信を送信しました');
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:unread,inprogress,replied,closed'],
        ]);

        Contact::findOrFail($id)->update(['status' => $request->status]);

        return back()->with('message', 'ステータスを更新しました');
    }
}
