<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Billing;
use App\Models\User;
use App\Services\GoogleCalendarSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class AdminReservationPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_paid_reservation_reflects_deposit_refund_in_reservation_and_billing_lists(): void
    {
        $billing = $this->registerReservation('paid');

        $this->assertSame(26000, $billing->amount);
        $this->assertTrue($billing->breakdown['depositRefunded']);
        $this->assertSame(10000, $billing->breakdown['depositRefundAmount']);

        $admin = Admin::firstOrFail();
        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/reservations')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->where('reservations.0.totalAmount', 26000)
                ->where('reservations.0.breakdown.depositRefunded', true));

        $this->withSession(['admin_user' => $admin->id])
            ->get('/admin/billing')
            ->assertOk()
            ->assertInertia(fn(Assert $page) => $page
                ->where('billings.0.amount', 26000)
                ->where('billings.0.breakdown.depositRefunded', true));
    }

    public function test_new_unpaid_reservation_keeps_full_amount_without_deposit_refund(): void
    {
        $billing = $this->registerReservation('unpaid');

        $this->assertSame(36000, $billing->amount);
        $this->assertFalse($billing->breakdown['depositRefunded'] ?? false);
    }

    private function registerReservation(string $payment): Billing
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        $member = User::factory()->create();

        $this->mock(GoogleCalendarSyncService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('createReservationEvent')->once();
        });

        $this->withSession(['admin_user' => $admin->id])
            ->post('/admin/reservations', [
                'member_db_id' => $member->id,
                'check_in' => '2027-01-10',
                'check_out' => '2027-01-11',
                'guests' => 2,
                'has_pet' => 'none',
                'support_fee' => false,
                'experiences' => [],
                'status' => 'confirmed',
                'payment' => $payment,
                'pet_fee' => 0,
                'support_fee_amount' => 0,
                'transfer_surcharge' => 0,
                'experiences_total' => 0,
                'deposit' => 10000,
            ])
            ->assertSessionHasNoErrors();

        return Billing::firstOrFail();
    }
}
