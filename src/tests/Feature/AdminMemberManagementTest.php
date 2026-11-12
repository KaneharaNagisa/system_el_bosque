<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminMemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_member_list_returns_nickname_and_profile_fields_without_names(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        User::factory()->create([
            'name' => '会員のフルネーム',
            'last_name' => '会員',
            'first_name' => '氏名',
            'nickname' => 'ニックネーム',
            'prefecture' => '長野県',
            'city' => '飯田市',
        ]);

        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/members')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Admin/Members')
                ->where('members.0.nickname', 'ニックネーム')
                ->where('members.0.prefecture', '長野県')
                ->where('members.0.city', '飯田市')
                ->missing('members.0.name')
                ->missing('members.0.lastName')
                ->missing('members.0.firstName'));
    }

    public function test_admin_can_update_member_profile(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $member = User::factory()->create([
            'nickname' => '更新前',
            'email' => 'member@example.com',
        ]);

        $this->withSession(['admin_user' => $admin->id])
            ->patch("/admin/members/{$member->id}", [
                'nickname' => '更新後',
                'email' => 'member@example.com',
                'phone' => '090-1234-5678',
                'prefecture' => '長野県',
                'city' => '飯田市',
                'line_id' => 'member_line',
                'birth_date' => '1990-01-01',
                'has_pet' => 'small1',
                'pet_breed' => 'トイプードル',
                'pet_breed2' => null,
                'family_type' => 'family',
                'family_birth_years' => ['2018', '2020'],
                'concerns' => '気になること',
                'how_found' => '検索',
                'expectations' => '期待事項',
                'status' => 'active',
            ])
            ->assertSessionHasNoErrors();

        $updated = $member->fresh();
        $this->assertSame('更新後', $updated->nickname);
        $this->assertSame('更新後', $updated->name);
        $this->assertSame('長野県', $updated->prefecture);
        $this->assertSame('飯田市', $updated->city);
        $this->assertSame('member_line', $updated->line_id);
        $this->assertSame(['2018', '2020'], $updated->family_birth_years);
    }

    public function test_admin_reservation_management_displays_member_nickname(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $member = User::factory()->create([
            'name' => '会員のフルネーム',
            'last_name' => '会員',
            'first_name' => '氏名',
            'nickname' => '予約用ニックネーム',
        ]);
        Reservation::create([
            'reservation_code' => 'RSV-NICK001',
            'user_id' => $member->id,
            'check_in' => '2027-01-10',
            'check_out' => '2027-01-11',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => false,
            'experiences' => [],
            'status' => 'pending',
        ]);

        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/reservations')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Admin/Reservations')
                ->where('reservations.0.memberName', '予約用ニックネーム')
                ->where('members.0.nickname', '予約用ニックネーム')
                ->missing('members.0.lastName')
                ->missing('members.0.firstName'));
    }

    public function test_contact_management_is_removed_but_dashboard_has_no_contact_data(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/contacts')
            ->assertNotFound();

        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->missing('recentContacts')
                ->missing('stats.unansweredContacts'));
    }
}
