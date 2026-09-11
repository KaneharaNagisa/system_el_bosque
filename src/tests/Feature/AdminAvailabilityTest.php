<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Availability;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_inertia_admin_request_redirects_to_login(): void
    {
        $this->withHeaders(['X-Inertia' => 'true'])
            ->get('/admin/accounts')
            ->assertRedirect(route('admin.root'));
    }

    public function test_master_availability_marks_pending_reservations_as_booked(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'system_admin',
        ]);
        $user = User::factory()->create(['status' => 'active']);

        Availability::create(['date' => '2026-10-09', 'status' => 'available']);
        Reservation::create([
            'reservation_code' => 'RSV-ADMIN01',
            'user_id' => $user->id,
            'check_in' => '2026-10-09',
            'check_out' => '2026-10-10',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => false,
            'experiences' => [],
            'status' => 'pending',
        ]);

        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/master/availability')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Admin/Availability')
                ->where('availabilities.2026-10-09', 'available')
                ->where('bookedReservations.2026-10-09.status', 'pending'));
    }

    public function test_admin_reservation_calendar_marks_pending_reservations_as_booked(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'system_admin',
        ]);
        $user = User::factory()->create(['status' => 'active']);

        Availability::create(['date' => '2026-10-09', 'status' => 'available']);
        Reservation::create([
            'reservation_code' => 'RSV-ADMIN02',
            'user_id' => $user->id,
            'check_in' => '2026-10-09',
            'check_out' => '2026-10-10',
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
                ->where('bookedDates.0', '2026-10-09'));
    }
}
