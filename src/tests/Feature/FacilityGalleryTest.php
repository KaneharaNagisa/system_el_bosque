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
}
