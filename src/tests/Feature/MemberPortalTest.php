<?php

namespace Tests\Feature;

use App\Models\Billing;
use App\Models\Availability;
use App\Models\Experience;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_mypage_to_member_login(): void
    {
        $this->get('/mypage')->assertRedirect('/login');
    }

    public function test_active_member_can_log_in(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'password' => 'password123',
            'status' => 'active',
        ]);

        $this->post('/login', [
            'email' => 'member@example.com',
            'password' => 'password123',
            'redirect' => '/mypage',
        ])->assertRedirect('/mypage');

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_guest_can_register_as_an_active_member(): void
    {
        $this->from('/register')->post('/register', [
            'lastName' => '山田',
            'firstName' => '太郎',
            'lastNameKana' => 'やまだ',
            'firstNameKana' => 'たろう',
            'email' => 'new-member@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '090-1234-5678',
            'address' => '長野県下伊那郡',
            'birthDate' => '1990-01-01',
            'hasPet' => 'no',
            'hasFamily' => 'individual',
            'howFound' => 'search',
            'redirect' => '/reservation',
        ])->assertRedirect('/register')->assertSessionHasNoErrors();

        $user = User::where('email', 'new-member@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('active', $user->status);
        $this->assertSame('none', $user->has_pet);
    }

    public function test_member_can_update_own_profile(): void
    {
        $user = User::factory()->create(['status' => 'active']);

        $this->actingAs($user)->patch('/mypage', [
            'lastName' => '山田',
            'firstName' => '花子',
            'lastNameKana' => 'やまだ',
            'firstNameKana' => 'はなこ',
            'address' => '東京都新宿区1-1',
            'hasPet' => 'none',
            'petBreed' => '',
            'petBreed2' => '',
            'hasFamily' => 'individual',
            'howFound' => '検索',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => '山田 花子',
            'last_name' => '山田',
            'first_name' => '花子',
        ]);
    }

    public function test_member_reservation_creates_pending_reservation_and_server_calculated_billing(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        $checkin = now()->next('Monday')->addWeek()->toDateString();
        $checkout = now()->next('Monday')->addWeek()->addDays(2)->toDateString();
        Availability::create(['date' => $checkin, 'status' => 'available']);
        Availability::create(['date' => now()->parse($checkin)->addDay()->toDateString(), 'status' => 'available']);
        Experience::create([
            'name' => 'DB体験',
            'description' => 'テスト用体験',
            'price' => 4500,
            'price_note' => '¥4,500/人',
            'pricing_type' => 'per_person',
            'requires_reservation' => true,
            'is_active' => true,
        ]);

        $this->actingAs($user)->post('/reservations', [
            'checkin' => $checkin,
            'checkout' => $checkout,
            'guests' => 2,
            'pets' => 'none',
            'petDetail' => '',
            'supportPlan' => 'no',
            'experiences' => ['DB体験'],
            'message' => '',
            'grandTotal' => 1,
            'breakdown' => ['fake' => 1],
        ])->assertSessionHasNoErrors()->assertSessionHas('reservationCode');

        $reservation = Reservation::firstOrFail();
        $billing = Billing::firstOrFail();

        $this->assertSame($user->id, $reservation->user_id);
        $this->assertSame('pending', $reservation->status);
        $this->assertSame($reservation->id, $billing->reservation_id);
        $this->assertSame(59000, $billing->amount);
        $this->assertSame(10000, $billing->breakdown['deposit']);
    }
}
