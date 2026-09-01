<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\AvailabilityController;
use App\Http\Controllers\Admin\BillingController;
use App\Http\Controllers\Admin\CancelPolicyController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\KpiController;
use App\Http\Controllers\Admin\ManualController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\NewsController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PriceAdjustmentController;
use App\Http\Controllers\Admin\ReservationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// ─────────────────────────────────────────────
//  Admin routes
// ─────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->group(function () {

    // 認証不要
    Route::get('/', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // 認証必要
    Route::middleware('admin.auth')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/kpi', [KpiController::class, 'index'])->name('kpi');

        // 会員管理
        Route::get('/members', [MemberController::class, 'index'])->name('members.index');
        Route::post('/members', [MemberController::class, 'store'])->name('members.store');
        Route::delete('/members/{id}', [MemberController::class, 'destroy'])->name('members.destroy');

        // 予約管理
        Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
        Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');
        Route::patch('/reservations/{id}', [ReservationController::class, 'update'])->name('reservations.update');
        Route::patch('/reservations/{id}/payment', [ReservationController::class, 'updatePayment'])->name('reservations.payment');
        Route::patch('/reservations/{id}/experiences', [ReservationController::class, 'updateExperiences'])->name('reservations.experiences');
        Route::patch('/reservations/{id}/support', [ReservationController::class, 'updateSupport'])->name('reservations.support');
        Route::patch('/reservations/{id}/adjustment', [ReservationController::class, 'updateAdjustment'])->name('reservations.adjustment');

        // 請求管理
        Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
        Route::patch('/billing/{id}', [BillingController::class, 'update'])->name('billing.update');
        Route::patch('/billing/{id}/adjustment', [BillingController::class, 'updateAdjustment'])->name('billing.adjustment');

        // お問合せ管理
        Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
        Route::post('/contacts/{id}/reply', [ContactController::class, 'reply'])->name('contacts.reply');
        Route::patch('/contacts/{id}/status', [ContactController::class, 'updateStatus'])->name('contacts.status');

        // お知らせ管理
        Route::get('/news', [NewsController::class, 'index'])->name('news.index');
        Route::post('/news', [NewsController::class, 'store'])->name('news.store');
        Route::patch('/news/{id}', [NewsController::class, 'update'])->name('news.update');
        Route::delete('/news/{id}', [NewsController::class, 'destroy'])->name('news.destroy');

        // 固定ページ管理
        Route::get('/pages', [PageController::class, 'index'])->name('pages.index');
        Route::patch('/pages/{id}', [PageController::class, 'update'])->name('pages.update');

        // マスタ管理
        Route::get('/master/availability', [AvailabilityController::class, 'index'])->name('master.availability.index');
        Route::post('/master/availability', [AvailabilityController::class, 'update'])->name('master.availability.update');

        Route::get('/master/experiences', [ExperienceController::class, 'index'])->name('master.experiences.index');
        Route::post('/master/experiences', [ExperienceController::class, 'store'])->name('master.experiences.store');
        Route::patch('/master/experiences/{id}', [ExperienceController::class, 'update'])->name('master.experiences.update');
        Route::delete('/master/experiences/{id}', [ExperienceController::class, 'destroy'])->name('master.experiences.destroy');

        Route::get('/master/cancel-policy', [CancelPolicyController::class, 'index'])->name('master.cancel-policy.index');
        Route::post('/master/cancel-policy', [CancelPolicyController::class, 'store'])->name('master.cancel-policy.store');
        Route::patch('/master/cancel-policy/{id}', [CancelPolicyController::class, 'update'])->name('master.cancel-policy.update');
        Route::delete('/master/cancel-policy/{id}', [CancelPolicyController::class, 'destroy'])->name('master.cancel-policy.destroy');

        Route::get('/master/faq', [FaqController::class, 'index'])->name('master.faq.index');
        Route::post('/master/faq', [FaqController::class, 'store'])->name('master.faq.store');
        Route::patch('/master/faq/{id}', [FaqController::class, 'update'])->name('master.faq.update');
        Route::delete('/master/faq/{id}', [FaqController::class, 'destroy'])->name('master.faq.destroy');

        // 料金調整管理
        Route::get('/master/price-adjustment', [PriceAdjustmentController::class, 'index'])->name('master.price-adjustment.index');
        Route::post('/master/price-adjustment', [PriceAdjustmentController::class, 'store'])->name('master.price-adjustment.store');
        Route::patch('/master/price-adjustment/{id}', [PriceAdjustmentController::class, 'update'])->name('master.price-adjustment.update');
        Route::patch('/master/price-adjustment/{id}/toggle', [PriceAdjustmentController::class, 'toggleStatus'])->name('master.price-adjustment.toggle');
        Route::delete('/master/price-adjustment/{id}', [PriceAdjustmentController::class, 'destroy'])->name('master.price-adjustment.destroy');

        // アカウント管理
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
        Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
        Route::patch('/accounts/{id}', [AccountController::class, 'update'])->name('accounts.update');
        Route::delete('/accounts/{id}', [AccountController::class, 'destroy'])->name('accounts.destroy');

        // マニュアル管理
        Route::get('/manuals', [ManualController::class, 'index'])->name('manuals.index');
        Route::post('/manuals', [ManualController::class, 'store'])->name('manuals.store');
        Route::patch('/manuals/{id}', [ManualController::class, 'update'])->name('manuals.update');
        Route::delete('/manuals/{id}', [ManualController::class, 'destroy'])->name('manuals.destroy');
    });
});
