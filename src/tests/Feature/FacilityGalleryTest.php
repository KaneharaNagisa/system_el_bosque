<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\FacilityGalleryItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FacilityGalleryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_gallery_items(): void
    {
        Storage::fake('public');
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response = $this->withSession(['admin_user' => $admin->id])
            ->post('/admin/images/gallery', [
                'title' => '追加した画像',
                'image' => UploadedFile::fake()->image('gallery.jpg', 10, 10),
            ])
            ->assertCreated()
            ->assertJsonPath('title', '追加した画像');

        $item = FacilityGalleryItem::query()->findOrFail($response->json('id'));

        $this->patchJson("/admin/images/gallery/{$item->id}", [
            'title' => '変更後のタイトル',
        ])->assertOk()->assertJsonPath('title', '変更後のタイトル');

        $this->deleteJson("/admin/images/gallery/{$item->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('facility_gallery_items', ['id' => $item->id]);
    }

    public function test_facility_page_displays_configured_gallery_items(): void
    {
        FacilityGalleryItem::query()->firstOrFail()->update([
            'title' => '更新されたギャラリータイトル',
        ]);

        $this->get('/about')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Public/Page')
                ->where('facilityGallery.0.title', '更新されたギャラリータイトル')
                ->where('facilityGallery.0.fallbackKey', 'about.living')
                ->has('facilityGallery', 6));
    }

    public function test_admin_can_reorder_gallery_items_and_public_page_uses_saved_order(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $ids = FacilityGalleryItem::query()
            ->orderBy('sort_order')
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->reverse()
            ->values()
            ->all();

        $this->withSession(['admin_user' => $admin->id])
            ->patchJson('/admin/images/gallery/order', ['ids' => $ids])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(
            $ids,
            FacilityGalleryItem::query()
                ->orderBy('sort_order')
                ->pluck('id')
                ->map(fn($id) => (int) $id)
                ->all(),
        );

        $this->get('/about')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->where('facilityGallery.0.id', $ids[0]));

        $this->patchJson('/admin/images/gallery/order', [
            'ids' => array_slice($ids, 1),
        ])->assertUnprocessable();
    }
}
