<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\NearbyInformationItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NearbyInformationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_nearby_information_with_images(): void
    {
        Storage::fake('public');
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $session = $this->withSession(['admin_user' => $admin->id]);

        $session->post('/admin/nearby-information/onsen', [
            'name' => 'テスト温泉',
            'subtitle' => '泉質',
            'description' => '温泉の説明',
            'operatingHours' => '10:00〜20:00',
            'price' => '大人600円',
            'closedDays' => '火曜',
            'websiteUrl' => 'https://example.com',
            'image' => UploadedFile::fake()->image('onsen.jpg', 10, 10),
        ])->assertRedirect();

        $item = NearbyInformationItem::query()->where('name', 'テスト温泉')->firstOrFail();
        $oldImagePath = $item->image_path;
        $this->assertNotNull($oldImagePath);
        Storage::disk('public')->assertExists($oldImagePath);

        $session->post("/admin/nearby-information/onsen/{$item->id}", [
            '_method' => 'patch',
            'name' => '更新した温泉',
            'subtitle' => '新しい泉質',
            'description' => '更新後の説明',
            'operatingHours' => '11:00〜21:00',
            'price' => '大人700円',
            'closedDays' => '',
            'websiteUrl' => '',
            'image' => UploadedFile::fake()->image('onsen-updated.jpg', 10, 10),
        ])->assertRedirect();

        $item->refresh();
        $this->assertSame('更新した温泉', $item->name);
        $this->assertSame('新しい泉質', $item->subtitle);
        $this->assertNotSame($oldImagePath, $item->image_path);
        Storage::disk('public')->assertMissing($oldImagePath);
        Storage::disk('public')->assertExists($item->image_path);

        $session->delete("/admin/nearby-information/onsen/{$item->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('nearby_information_items', ['id' => $item->id]);
        Storage::disk('public')->assertMissing($item->image_path);
    }

    public function test_admin_can_reorder_items_and_public_area_uses_saved_content(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $ids = NearbyInformationItem::query()
            ->where('type', 'spot')
            ->orderBy('sort_order')
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->reverse()
            ->values()
            ->all();

        $this->withSession(['admin_user' => $admin->id])
            ->patchJson('/admin/nearby-information/spot/order', ['ids' => $ids])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(
            $ids,
            NearbyInformationItem::query()
                ->where('type', 'spot')
                ->orderBy('sort_order')
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all(),
        );

        $this->get('/area')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Page')
                ->where('nearbySpots.0.id', $ids[0])
                ->where('nearbySpots.0.name', '新野の道の駅')
                ->where('onsenFacilities.0.name', '南信州阿南温泉 かじかの湯')
                ->has('onsenFacilities', 3)
                ->has('nearbySpots', 4));
    }

    public function test_nearby_information_rejects_non_image_uploads(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->withSession(['admin_user' => $admin->id])
            ->post('/admin/nearby-information/spot', [
                'name' => 'テストスポット',
                'description' => '説明',
                'image' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf'),
            ])
            ->assertSessionHasErrors('image');
    }
}
