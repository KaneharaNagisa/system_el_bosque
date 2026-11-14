<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_account_creation_and_password_change_require_the_new_password_format(): void
    {
        $admin = Admin::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => 'AdminPass1!',
            'role' => 'system_admin',
        ]);

        $this->withSession(['admin_user' => $admin->id])
            ->from('/admin/accounts')
            ->post('/admin/accounts', [
                'name' => '新しい管理者',
                'email' => 'new-admin@example.com',
                'role' => 'facility_admin',
                'password' => 'password123',
            ])
            ->assertSessionHasErrors('password');

        $this->withSession(['admin_user' => $admin->id])
            ->from('/admin/accounts')
            ->post('/admin/accounts', [
                'name' => '新しい管理者',
                'email' => 'new-admin@example.com',
                'role' => 'facility_admin',
                'password' => 'Abcdef1!',
            ])
            ->assertSessionHasNoErrors();

        $createdAdmin = Admin::where('email', 'new-admin@example.com')->firstOrFail();

        $this->withSession(['admin_user' => $admin->id])
            ->from('/admin/accounts')
            ->patch("/admin/accounts/{$createdAdmin->id}", [
                'name' => $createdAdmin->name,
                'email' => $createdAdmin->email,
                'role' => $createdAdmin->role,
                'password' => 'password123',
            ])
            ->assertSessionHasErrors('password');

        $this->withSession(['admin_user' => $admin->id])
            ->from('/admin/accounts')
            ->patch("/admin/accounts/{$createdAdmin->id}", [
                'name' => $createdAdmin->name,
                'email' => $createdAdmin->email,
                'role' => $createdAdmin->role,
                'password' => 'UpdatedPass1!',
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('UpdatedPass1!', $createdAdmin->fresh()->password));
    }
}
