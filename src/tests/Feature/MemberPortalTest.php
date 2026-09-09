<?php

namespace Tests\Feature;

use App\Models\Billing;
use App\Models\Availability;
use App\Models\Experience;
use App\Models\PendingRegistration;
use App\Models\Reservation;
use App\Models\User;
use App\Services\GoogleCalendarSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
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
        $this->mock(GoogleCalendarSyncService::class, function ($mock) {
            $mock->shouldReceive('createReservationEvent')
                ->once()
                ->andThrow(new RuntimeException('Google Calendar unavailable'));
        });

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
        ])->assertRedirect('/reservation/complete')
            ->assertSessionHasNoErrors()
            ->assertSessionHas('reservationCode')
            ->assertSessionHas('reservationComplete');

        $reservation = Reservation::firstOrFail();
        $billing = Billing::firstOrFail();

        $this->assertSame($user->id, $reservation->user_id);
        $this->assertSame('pending', $reservation->status);
        $this->assertSame($reservation->id, $billing->reservation_id);
        $this->assertSame(71000, $billing->amount);
        $this->assertSame(10000, $billing->breakdown['deposit']);
    }

    public function test_member_reservation_allows_default_available_dates_without_availability_rows(): void
    {
        $user = User::factory()->create(['status' => 'active']);

        $this->mock(GoogleCalendarSyncService::class, function ($mock) {
            $mock->shouldReceive('createReservationEvent')->once();
        });

        $this->actingAs($user)->post('/reservations', [
            'checkin' => '2026-10-23',
            'checkout' => '2026-10-24',
            'guests' => 2,
            'pets' => 'none',
            'petDetail' => '',
            'supportPlan' => 'yes',
            'experiences' => [],
            'message' => '',
            'grandTotal' => 44000,
            'breakdown' => ['fake' => 1],
        ])->assertRedirect('/reservation/complete')
            ->assertSessionHasNoErrors()
            ->assertSessionHas('reservationCode')
            ->assertSessionHas('reservationComplete.grandTotal', 44000);

        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'check_in' => '2026-10-23 00:00:00',
            'check_out' => '2026-10-24 00:00:00',
            'status' => 'pending',
        ]);
    }

    public function test_member_reservation_returns_existing_pending_reservation_for_same_dates(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        Availability::create(['date' => '2026-10-09', 'status' => 'booked']);

        $reservation = Reservation::create([
            'reservation_code' => 'RSV-TEST0001',
            'user_id' => $user->id,
            'check_in' => '2026-10-09',
            'check_out' => '2026-10-10',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => true,
            'experiences' => [],
            'status' => 'pending',
        ]);

        Billing::create([
            'billing_code' => 'BIL-TEST0001',
            'reservation_id' => $reservation->id,
            'amount' => 44000,
            'breakdown' => ['deposit' => 10000],
            'status' => 'unpaid',
            'due_date' => '2026-10-16',
        ]);

        $this->mock(GoogleCalendarSyncService::class, function ($mock) {
            $mock->shouldNotReceive('createReservationEvent');
        });

        $this->actingAs($user)->post('/reservations', [
            'checkin' => '2026-10-09',
            'checkout' => '2026-10-10',
            'guests' => 2,
            'pets' => 'none',
            'petDetail' => '',
            'supportPlan' => 'yes',
            'experiences' => [],
            'message' => '',
            'grandTotal' => 44000,
            'breakdown' => ['fake' => 1],
        ])->assertRedirect('/reservation/complete')
            ->assertSessionHasNoErrors()
            ->assertSessionHas('reservationCode', 'RSV-TEST0001')
            ->assertSessionHas('reservationComplete.bookingRef', 'RSV-TEST0001')
            ->assertSessionHas('reservationComplete.grandTotal', 44000);

        $this->assertSame(1, Reservation::count());
        $this->assertSame(1, Billing::count());
    }

    public function test_expired_pending_reservations_are_deleted_after_one_hour(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        $expired = Reservation::create([
            'reservation_code' => 'RSV-EXPIRED1',
            'user_id' => $user->id,
            'check_in' => '2026-10-09',
            'check_out' => '2026-10-10',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => false,
            'experiences' => [],
            'status' => 'pending',
        ]);
        $expired->forceFill([
            'created_at' => now()->subMinutes(61),
            'updated_at' => now()->subMinutes(61),
        ])->save();
        Billing::create([
            'billing_code' => 'BIL-EXPIRED1',
            'reservation_id' => $expired->id,
            'amount' => 44000,
            'breakdown' => ['deposit' => 10000],
            'status' => 'unpaid',
            'due_date' => '2026-10-16',
        ]);
        $recent = Reservation::create([
            'reservation_code' => 'RSV-RECENT1',
            'user_id' => $user->id,
            'check_in' => '2026-10-10',
            'check_out' => '2026-10-11',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => false,
            'experiences' => [],
            'status' => 'pending',
        ]);
        $recent->forceFill([
            'created_at' => now()->subMinutes(59),
            'updated_at' => now()->subMinutes(59),
        ])->save();
        $confirmed = Reservation::create([
            'reservation_code' => 'RSV-CONFIRMED1',
            'user_id' => $user->id,
            'check_in' => '2026-10-11',
            'check_out' => '2026-10-12',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => false,
            'experiences' => [],
            'status' => 'confirmed',
        ]);
        $confirmed->forceFill([
            'created_at' => now()->subMinutes(61),
            'updated_at' => now()->subMinutes(61),
        ])->save();

        $this->mock(GoogleCalendarSyncService::class, function ($mock) {
            $mock->shouldReceive('deleteReservationEvent')->once();
        });

        Artisan::call('reservations:purge-expired-pending');

        $this->assertDatabaseMissing('reservations', ['id' => $expired->id]);
        $this->assertDatabaseMissing('billings', ['reservation_id' => $expired->id]);
        $this->assertDatabaseHas('reservations', ['id' => $recent->id]);
        $this->assertDatabaseHas('reservations', ['id' => $confirmed->id]);
    }

    public function test_reservation_page_marks_existing_member_reservations_as_booked(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        Availability::create(['date' => '2026-10-09', 'status' => 'available']);
        Reservation::create([
            'reservation_code' => 'RSV-TEST0001',
            'user_id' => $user->id,
            'check_in' => '2026-10-09',
            'check_out' => '2026-10-10',
            'guests' => 2,
            'has_pet' => 'none',
            'support_fee' => false,
            'experiences' => [],
            'status' => 'pending',
        ]);

        $this->get('/reservation')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Public/Page')
                ->where('page', 'reservation')
                ->where('availability.0.date', '2026-10-09')
                ->where('availability.0.status', 'booked'));
    }
}
