import { Head } from "@inertiajs/react";
import { Layout } from "../../Public/components/Layout";
import { AuthProvider } from "../../Public/context/AuthContext";
import { About } from "../../Public/pages/About";
import { Area } from "../../Public/pages/Area";
import { Contact } from "../../Public/pages/Contact";
import { Experiences } from "../../Public/pages/Experiences";
import { FAQ } from "../../Public/pages/FAQ";
import { Home } from "../../Public/pages/Home";
import { Login } from "../../Public/pages/Login";
import { MyPage } from "../../Public/pages/MyPage";
import { PasswordReset } from "../../Public/pages/PasswordReset";
import { Pricing } from "../../Public/pages/Pricing";
import { Register } from "../../Public/pages/Register";
import { Reservation } from "../../Public/pages/Reservation";
import { ReservationComplete } from "../../Public/pages/ReservationComplete";
import { ReservationConfirm } from "../../Public/pages/ReservationConfirm";
import { ReservationDetail } from "../../Public/pages/ReservationDetail";

const pages = {
    home: Home,
    about: About,
    pricing: Pricing,
    experiences: Experiences,
    area: Area,
    faq: FAQ,
    reservation: Reservation,
    "reservation-detail": ReservationDetail,
    "reservation-confirm": ReservationConfirm,
    "reservation-complete": ReservationComplete,
    login: Login,
    register: Register,
    contact: Contact,
    mypage: MyPage,
    "password-reset": PasswordReset,
};

const titles: Record<keyof typeof pages, string> = {
    home: "貸別荘エルボスケ",
    about: "施設紹介 | 貸別荘エルボスケ",
    pricing: "料金案内 | 貸別荘エルボスケ",
    experiences: "体験プログラム | 貸別荘エルボスケ",
    area: "周辺情報 | 貸別荘エルボスケ",
    faq: "よくある質問 | 貸別荘エルボスケ",
    reservation: "ご予約 | 貸別荘エルボスケ",
    "reservation-detail": "予約詳細 | 貸別荘エルボスケ",
    "reservation-confirm": "予約確認 | 貸別荘エルボスケ",
    "reservation-complete": "予約完了 | 貸別荘エルボスケ",
    login: "ログイン | 貸別荘エルボスケ",
    register: "会員登録 | 貸別荘エルボスケ",
    contact: "お問い合わせ | 貸別荘エルボスケ",
    mypage: "マイページ | 貸別荘エルボスケ",
    "password-reset": "パスワード再設定 | 貸別荘エルボスケ",
};

export default function PublicPage({ page }: { page: keyof typeof pages }) {
    const CurrentPage = pages[page] ?? Home;

    return (
        <AuthProvider>
            <Head title={titles[page] ?? titles.home} />
            <Layout>
                <CurrentPage />
            </Layout>
        </AuthProvider>
    );
}
