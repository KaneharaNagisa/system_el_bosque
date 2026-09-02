<?php

namespace Tests\Feature;

use App\Models\Billing;
use App\Models\Availability;
use App\Models\Experience;
use App\Models\PendingRegistration;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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
        $pendingRegistration = PendingRegistration::create([
            'email' => 'new-member@example.com',
            'token' => Hash::make('test-token'),
            'expires_at' => now()->addHour(),
        ]);

        $this->withSession(['pending_registration_id' => $pendingRegistration->id])->from('/register')->post('/register', [
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
            'concerns' => '虫が苦手です',
            'howFound' => 'search',
            'expectations' => '自然の中で静かに過ごしたいです',
            'redirect' => '/reservation',
        ])->assertRedirect('/register')->assertSessionHasNoErrors();

        $user = User::where('email', 'new-member@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('active', $user->status);
        $this->assertSame('none', $user->has_pet);
        $this->assertSame('虫が苦手です', $user->concerns);
        $this->assertSame('search', $user->how_found);
        $this->assertSame('自然の中で静かに過ごしたいです', $user->expectations);
        $this->assertNotNull($pendingRegistration->fresh()->used_at);
    }

    public function test_guest_can_receive_a_registration_confirmation_email(): void
    {
        Mail::fake();

        $this->from('/register')->post('/register/email', [
            'email' => 'new-member@example.com',
        ])->assertRedirect('/register')->assertSessionHasNoErrors();

        $pendingRegistration = PendingRegistration::where('email', 'new-member@example.com')->firstOrFail();

        Mail::assertSent(\App\Mail\RegistrationConfirmationMail::class, function ($mail) use ($pendingRegistration) {
            return $mail->hasTo('new-member@example.com')
                && $mail->recipientEmail === 'new-member@example.com'
                && str_contains($mail->registrationUrl, "/register/verify/{$pendingRegistration->id}/");
        });
    }

    public function test_valid_registration_link_starts_main_registration(): void
    {
        $pendingRegistration = PendingRegistration::create([
            'email' => 'new-member@example.com',
            'token' => Hash::make('valid-token'),
            'expires_at' => now()->addHour(),
        ]);

        $this->get("/register/verify/{$pendingRegistration->id}/valid-token")
            ->assertRedirect('/register')
            ->assertSessionHas('pending_registration_id', $pendingRegistration->id);
    }

    public function test_expired_registration_link_returns_to_provisional_registration(): void
    {
        $pendingRegistration = PendingRegistration::create([
            'email' => 'new-member@example.com',
            'token' => Hash::make('expired-token'),
            'expires_at' => now()->subSecond(),
        ]);

        $this->get("/register/verify/{$pendingRegistration->id}/expired-token")
            ->assertRedirect('/register?expired=1')
            ->assertSessionMissing('pending_registration_id');
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
            'concerns' => 'アレルギーがあります',
            'howFound' => '検索',
            'expectations' => '犬とゆっくり過ごしたいです',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => '山田 花子',
            'last_name' => '山田',
            'first_name' => '花子',
            'concerns' => 'アレルギーがあります',
            'how_found' => '検索',
            'expectations' => '犬とゆっくり過ごしたいです',
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
