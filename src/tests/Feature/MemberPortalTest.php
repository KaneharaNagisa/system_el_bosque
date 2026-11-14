<?php

namespace Tests\Feature;

use App\Models\Billing;
use App\Models\Availability;
use App\Models\Experience;
use App\Models\News;
use App\Models\PendingRegistration;
use App\Models\Reservation;
use App\Models\User;
use App\Services\GoogleCalendarSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'nickname' => 'たろう',
            'email' => 'new-member@example.com',
            'password' => 'Abcdef1!',
            'password_confirmation' => 'Abcdef1!',
            'phone' => '090-1234-5678',
            'prefecture' => '長野県',
            'city' => '阿南町',
            'birthDate' => '1990-01-01',
            'hasPet' => 'none',
            'hasFamily' => 'family',
            'familyBirthYears' => ['2010', '2013'],
            'concerns' => '虫が苦手です',
            'howFound' => 'search',
            'expectations' => '自然の中で静かに過ごしたいです',
            'redirect' => '/reservation',
        ])->assertRedirect('/register')->assertSessionHasNoErrors();

        $user = User::where('email', 'new-member@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('active', $user->status);
        $this->assertSame('たろう', $user->nickname);
        $this->assertSame('たろう', $user->name);
        $this->assertNull($user->last_name);
        $this->assertNull($user->first_name);
        $this->assertSame('none', $user->has_pet);
        $this->assertSame('虫が苦手です', $user->concerns);
        $this->assertSame('search', $user->how_found);
        $this->assertSame('自然の中で静かに過ごしたいです', $user->expectations);
        $this->assertSame('長野県', $user->prefecture);
        $this->assertSame('阿南町', $user->city);
        $this->assertSame(['2010', '2013'], $user->family_birth_years);
        $this->assertNull($user->line_id);
        $this->assertNotNull($pendingRegistration->fresh()->used_at);
    }

    public function test_nickname_must_be_unique_during_member_registration(): void
    {
        User::factory()->create(['nickname' => 'たろう']);
        $pendingRegistration = PendingRegistration::create([
            'email' => 'new-member@example.com',
            'token' => Hash::make('test-token'),
            'expires_at' => now()->addHour(),
        ]);

        $this->withSession(['pending_registration_id' => $pendingRegistration->id])
            ->from('/register')
            ->post('/register', [
                'nickname' => 'たろう',
                'password' => 'ValidPass1!',
                'password_confirmation' => 'ValidPass1!',
                'phone' => '090-1234-5678',
                'hasPet' => 'none',
            ])
            ->assertSessionHasErrors('nickname');

        $this->assertDatabaseMissing('users', ['email' => 'new-member@example.com']);
    }

    public function test_member_registration_requires_password_with_mixed_case_number_symbol_and_minimum_length(): void
    {
        $pendingRegistration = PendingRegistration::create([
            'email' => 'new-member@example.com',
            'token' => Hash::make('test-token'),
            'expires_at' => now()->addHour(),
        ]);

        foreach (['password1!', 'PASSWORD1!', 'Password!', 'Password1', 'Pass1!'] as $weakPassword) {
            $this->withSession(['pending_registration_id' => $pendingRegistration->id])
                ->from('/register')
                ->post('/register', [
                    'nickname' => 'たろう',
                    'password' => $weakPassword,
                    'password_confirmation' => $weakPassword,
                    'phone' => '090-1234-5678',
                    'hasPet' => 'none',
                ])
                ->assertSessionHasErrors('password');
        }

        $this->assertDatabaseMissing('users', ['email' => 'new-member@example.com']);
    }

    public function test_member_password_change_requires_the_new_password_format(): void
    {
        $user = User::factory()->create(['password' => 'CurrentPass1!']);

        $this->actingAs($user)->patch('/mypage/password', [
            'currentPassword' => 'CurrentPass1!',
            'newPassword' => 'password123',
            'newPassword_confirmation' => 'password123',
        ])->assertSessionHasErrors('newPassword');

        $this->actingAs($user)->patch('/mypage/password', [
            'currentPassword' => 'CurrentPass1!',
            'newPassword' => 'Abcdef1!',
            'newPassword_confirmation' => 'Abcdef1!',
        ])->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('Abcdef1!', $user->fresh()->password));
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

    public function test_existing_email_cannot_receive_a_registration_confirmation_email(): void
    {
        Mail::fake();
        User::factory()->create(['email' => 'member@example.com']);

        $this->from('/register')->post('/register/email', [
            'email' => 'member@example.com',
        ])->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('pending_registrations', [
            'email' => 'member@example.com',
        ]);
        Mail::assertNothingSent();
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
        $user = User::factory()->create([
            'status' => 'active',
            'nickname' => '既存ニックネーム',
        ]);

        $this->actingAs($user)->patch('/mypage', [
            'nickname' => '変更不可ニックネーム',
            'email' => 'changed@example.com',
            'phone' => '090-9876-5432',
            'prefecture' => '東京都',
            'city' => '新宿区',
            'birthDate' => '1992-03-04',
            'hasPet' => 'none',
            'petBreed' => '',
            'petBreed2' => '',
            'hasFamily' => 'family',
            'familyBirthYears' => ['2010', '2013'],
            'concerns' => 'アレルギーがあります',
            'howFound' => '検索',
            'expectations' => '犬とゆっくり過ごしたいです',
        ])->assertSessionHasNoErrors();

        $updatedUser = $user->fresh();
        $this->assertSame('既存ニックネーム', $updatedUser->nickname);
        $this->assertSame($user->email, $updatedUser->email);
        $this->assertSame('090-9876-5432', $updatedUser->phone);
        $this->assertSame('東京都', $updatedUser->prefecture);
        $this->assertSame('新宿区', $updatedUser->city);
        $this->assertSame('1992-03-04', $updatedUser->birth_date->format('Y-m-d'));
        $this->assertSame(['2010', '2013'], $updatedUser->family_birth_years);
        $this->assertSame('アレルギーがあります', $updatedUser->concerns);
        $this->assertSame('検索', $updatedUser->how_found);
        $this->assertSame('犬とゆっくり過ごしたいです', $updatedUser->expectations);

        $this->actingAs($user)->patch('/mypage', [
            'phone' => $updatedUser->phone,
            'hasPet' => 'none',
            'birthDate' => null,
        ])->assertSessionHasNoErrors();

        $this->assertNull($user->fresh()->birth_date);
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

    public function test_guest_news_list_hides_member_only_announcements(): void
    {
        $topNews = News::create([
            'title' => '公開のお知らせ',
            'content' => '公開内容',
            'target' => 'top',
            'status' => 'published',
            'publish_date' => today()->subDay(),
        ]);
        $bothNews = News::create([
            'title' => '共通のお知らせ',
            'content' => '共通内容',
            'target' => 'both',
            'status' => 'published',
            'publish_date' => today(),
        ]);
        News::create([
            'title' => '会員向けのお知らせ',
            'content' => '会員向け内容',
            'target' => 'mypage',
            'status' => 'published',
            'publish_date' => today(),
        ]);

        $this->get('/news')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Public/Page')
                ->has('news', 2)
                ->where('news.0.id', $bothNews->id)
                ->where('news.1.id', $topNews->id));
    }

    public function test_authenticated_news_list_includes_member_only_announcements(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        $memberNews = News::create([
            'title' => '会員向けのお知らせ',
            'content' => '会員向け内容',
            'target' => 'mypage',
            'status' => 'published',
            'publish_date' => today(),
        ]);

        $this->actingAs($user)->get('/news')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->component('Public/Page')
                ->has('news', 1)
                ->where('news.0.id', $memberNews->id));
    }
}
