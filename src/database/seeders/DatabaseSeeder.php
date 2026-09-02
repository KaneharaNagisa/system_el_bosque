<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\CancelPolicy;
use App\Models\Experience;
use App\Models\Faq;
use App\Models\Manual;
use App\Models\News;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 管理者アカウント
        Admin::firstOrCreate(
            ['email' => 'admin@elbosque.jp'],
            ['name' => '管理者', 'password' => Hash::make('admin1234'), 'role' => 'system_admin']
        );
        Admin::firstOrCreate(
            ['email' => 'staff-a@elbosque.jp'],
            ['name' => '運営担当A', 'password' => Hash::make('staff1234'), 'role' => 'facility_admin']
        );

        // キャンセルポリシー
        $policies = [
            ['days_before' => 30, 'label' => '30日前まで',   'charge_rate' => 0,   'description' => 'キャンセル料無料'],
            ['days_before' => 14, 'label' => '14日前まで',   'charge_rate' => 20,  'description' => '宿泊料の20%'],
            ['days_before' => 7,  'label' => '7日前まで',    'charge_rate' => 50,  'description' => '宿泊料の50%'],
            ['days_before' => 3,  'label' => '3日前まで',    'charge_rate' => 70,  'description' => '宿泊料の70%'],
            ['days_before' => 1,  'label' => '前日',         'charge_rate' => 90,  'description' => '宿泊料の90%'],
            ['days_before' => 0,  'label' => '当日・無連絡', 'charge_rate' => 100, 'description' => '宿泊料の100%'],
        ];
        foreach ($policies as $p) {
            CancelPolicy::firstOrCreate(['days_before' => $p['days_before']], $p);
        }

        // FAQ
        $faqs = [
            ['category' => '予約について',   'question' => '予約はどのくらい前からできますか？',   'answer' => '営業期間（3月〜12月）の予約は、前月1日から受け付けております。',           'sort_order' => 1],
            ['category' => '予約について',   'question' => '最大何泊まで連泊できますか？',        'answer' => '最大3泊までご利用いただけます。',                                         'sort_order' => 2],
            ['category' => '施設について',   'question' => 'Wi-Fiは使えますか？',              'answer' => 'はい、光回線のWi-Fiを完備しております。',                                   'sort_order' => 3],
            ['category' => 'ペットについて', 'question' => 'ペットの同伴は可能ですか？',         'answer' => '小型犬2頭まで、または大型犬1頭まで同伴可能です。',                         'sort_order' => 4],
            ['category' => 'アクセス',       'question' => '送迎サービスはありますか？',         'answer' => 'はい、最寄り駅からの送迎サービスをご用意しております。',                   'sort_order' => 5],
            ['category' => '料金について',   'question' => '滞在サポート料とは何ですか？',       'answer' => '滞在サポート料（¥8,000）は任意の料金で、買い出しサポートや送迎サービスなどが含まれます。', 'sort_order' => 6],
            ['category' => '体験について',   'question' => '星空観察は有料ですか？',            'answer' => 'ガイドなしの星空観察は無料でお楽しみいただけます。ガイド付きは1組¥2,000です。', 'sort_order' => 7],
        ];
        foreach ($faqs as $f) {
            Faq::firstOrCreate(['question' => $f['question']], $f + ['is_active' => true]);
        }

        // 体験オプション
        $experiences = [
            ['name' => '星空観察（ガイドなし）', 'description' => '双眼鏡の無料貸出あり。新野の満天の星をお楽しみください。', 'price' => 0,    'price_note' => '無料',      'season' => '通年（晴天時）', 'season_tag' => '通年', 'requires_reservation' => false, 'is_active' => true, 'popularity' => 95, 'sort_order' => 1],
            ['name' => '星空ガイド付き観察',     'description' => '地元ガイドが星座・天体を解説。望遠鏡もご用意。',         'price' => 2000, 'price_note' => '1組¥2,000', 'season' => '通年（晴天時）', 'season_tag' => '通年', 'requires_reservation' => true,  'is_active' => true, 'popularity' => 82, 'sort_order' => 2],
            ['name' => 'BBQプラン',              'description' => 'BBQグリル・炭・網のセットをご用意します。',              'price' => 3000, 'price_note' => '1組¥3,000', 'season' => '4月〜11月',      'season_tag' => '春',   'requires_reservation' => true,  'is_active' => true, 'popularity' => 78, 'sort_order' => 3],
        ];
        foreach ($experiences as $e) {
            Experience::firstOrCreate(['name' => $e['name']], $e);
        }

        // 固定ページ
        $pages = [
            ['title' => '利用規約',         'slug' => 'terms',   'content' => "貸別荘エルボスケ利用規約\n\n第1条（目的）\n本規約は、当施設の利用に関する基本的な事項を定めるものです。\n\n第2条（営業期間）\n当施設の営業期間は、毎年3月〜12月とします。",                                                                                                                  'status' => 'published'],
            ['title' => '個人情報取り扱い', 'slug' => 'privacy', 'content' => "個人情報保護方針\n\n当施設は、お客様の個人情報の重要性を認識し、その保護に努めます。\n\n1. 個人情報の収集\nご予約、お問い合わせの際に必要な範囲で個人情報を収集させていただきます。",                                                                                                                 'status' => 'published'],
        ];
        foreach ($pages as $p) {
            \App\Models\Page::firstOrCreate(['slug' => $p['slug']], $p);
        }

        // お知らせ
        $news = [
            ['title' => '2026年シーズン営業開始のお知らせ', 'content' => '3月1日より2026年シーズンの営業を開始いたします。', 'target' => 'both', 'status' => 'published', 'publish_date' => '2026-02-15'],
            ['title' => '星空観察ガイドサービス開始',        'content' => '新たに星空観察ガイドサービスを開始いたしました。ガイドなしの星空観察は無料、ガイド付きは1組¥2,000です。', 'target' => 'top', 'status' => 'published', 'publish_date' => '2026-03-01'],
        ];
        foreach ($news as $n) {
            \App\Models\News::firstOrCreate(['title' => $n['title']], $n);
        }

        // マニュアル
        Manual::firstOrCreate(
            ['title' => 'ダッシュボードの使い方'],
            ['target' => 'admin', 'content' => "# ダッシュボードの使い方\n\n## 概要\nダッシュボードでは、施設の運営状況を一目で確認できます。", 'status' => 'published']
        );
    }
}
