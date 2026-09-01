import { createBrowserRouter } from "react-router";
import { AuthRoot } from "./components/AuthRoot";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Pricing } from "./pages/Pricing";
import { Experiences } from "./pages/Experiences";
import { Area } from "./pages/Area";
import { FAQ } from "./pages/FAQ";
import { Reservation } from "./pages/Reservation";
import { ReservationDetail } from "./pages/ReservationDetail";
import { ReservationConfirm } from "./pages/ReservationConfirm";
import { ReservationComplete } from "./pages/ReservationComplete";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Contact } from "./pages/Contact";
import { MyPage } from "./pages/MyPage";
import { PasswordReset } from "./pages/PasswordReset";
import { AdminAuthRoot } from "./components/AdminAuthRoot";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminMembers } from "./pages/admin/AdminMembers";
import { AdminReservations } from "./pages/admin/AdminReservations";
import { AdminBilling } from "./pages/admin/AdminBilling";
import { AdminContacts } from "./pages/admin/AdminContacts";
import { AdminNews } from "./pages/admin/AdminNews";
import { AdminPages } from "./pages/admin/AdminPages";
import { AdminAvailability } from "./pages/admin/AdminAvailability";
import { AdminExperiences } from "./pages/admin/AdminExperiences";
import { AdminCancelPolicy } from "./pages/admin/AdminCancelPolicy";
import { AdminFAQ } from "./pages/admin/AdminFAQ";
import { AdminAccounts } from "./pages/admin/AdminAccounts";
import { AdminManuals } from "./pages/admin/AdminManuals";
import { AdminKPI } from "./pages/admin/AdminKPI";
import { AdminPriceAdjustment } from "./pages/admin/AdminPriceAdjustment";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthRoot,
    children: [
      {
        path: "",
        Component: Layout,
        children: [
          { index: true, Component: Home },
          { path: "about", Component: About },
          { path: "pricing", Component: Pricing },
          { path: "experiences", Component: Experiences },
          { path: "area", Component: Area },
          { path: "faq", Component: FAQ },
          { path: "reservation", Component: Reservation },
          { path: "reservation/detail", Component: ReservationDetail },
          { path: "reservation/confirm", Component: ReservationConfirm },
          { path: "reservation/complete", Component: ReservationComplete },
          { path: "login", Component: Login },
          { path: "register", Component: Register },
          { path: "contact", Component: Contact },
          { path: "mypage", Component: MyPage },
          { path: "password-reset", Component: PasswordReset },
        ],
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminAuthRoot,
    children: [
      { index: true, Component: AdminLogin },
      { path: "dashboard", Component: AdminDashboard },
      { path: "kpi", Component: AdminKPI },
      { path: "members", Component: AdminMembers },
      { path: "reservations", Component: AdminReservations },
      { path: "billing", Component: AdminBilling },
      { path: "contacts", Component: AdminContacts },
      { path: "news", Component: AdminNews },
      { path: "pages", Component: AdminPages },
      { path: "master/availability", Component: AdminAvailability },
      { path: "master/experiences", Component: AdminExperiences },
      { path: "master/price-adjustment", Component: AdminPriceAdjustment },
      { path: "master/cancel-policy", Component: AdminCancelPolicy },
      { path: "master/faq", Component: AdminFAQ },
      { path: "accounts", Component: AdminAccounts },
      { path: "manuals", Component: AdminManuals },
    ],
  },
]);
