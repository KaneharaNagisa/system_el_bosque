import { useMemo } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/AdminLayout";
import { FaUsers, FaChartLine, FaUserCheck, FaCalendarAlt, FaCreditCard, FaEnvelope, FaBell, FaFileAlt, FaDatabase, FaShieldAlt, FaBook, FaChartBar } from "react-icons/fa";

// モック統計データ
const stats = {
  totalMembers: 48,
  newMembersThisMonth: 6,
  activeMembers: 32,
  totalReservations: 127,
  pendingReservations: 5,
  unpaidBillings: 3,
  unansweredContacts: 2,
};

// モック予約一覧
const recentReservations = [
  { id: "RSV-001", memberName: "山田 太郎", checkIn: "2026-03-15", checkOut: "2026-03-17", guests: 3, status: "confirmed", payment: "paid" },
  { id: "RSV-002", memberName: "佐藤 花子", checkIn: "2026-03-20", checkOut: "2026-03-22", guests: 2, status: "confirmed", payment: "unpaid" },
  { id: "RSV-003", memberName: "鈴木 一郎", checkIn: "2026-03-25", checkOut: "2026-03-27", guests: 4, status: "pending", payment: "unpaid" },
  { id: "RSV-004", memberName: "田中 美咲", checkIn: "2026-04-01", checkOut: "2026-04-03", guests: 2, status: "confirmed", payment: "paid" },
  { id: "RSV-005", memberName: "高橋 健一", checkIn: "2026-04-05", checkOut: "2026-04-08", guests: 5, status: "cancelled", payment: "refunded" },
];

// モックお問い合わせ一覧
const recentContacts = [
  { id: "CNT-001", name: "伊藤 太郎", subject: "ペット同伴について", date: "2026-03-02", status: "unread" },
  { id: "CNT-002", name: "渡辺 花子", subject: "送迎サービスについて", date: "2026-03-01", status: "unread" },
  { id: "CNT-003", name: "松田 健一", subject: "キャンセルについて", date: "2026-02-28", status: "replied" },
  { id: "CNT-004", name: "小林 美咲", subject: "Wi-Fi環境について", date: "2026-02-27", status: "replied" },
];

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    confirmed: { label: "確定", bg: "bg-green-100", text: "text-green-800" },
    pending: { label: "保留中", bg: "bg-yellow-100", text: "text-yellow-800" },
    cancelled: { label: "キャンセル", bg: "bg-red-100", text: "text-red-800" },
    paid: { label: "支払済", bg: "bg-blue-100", text: "text-blue-800" },
    unpaid: { label: "未払い", bg: "bg-orange-100", text: "text-orange-800" },
    refunded: { label: "返金済", bg: "bg-gray-100", text: "text-gray-800" },
    unread: { label: "未対応", bg: "bg-red-100", text: "text-red-800" },
    replied: { label: "対応済", bg: "bg-green-100", text: "text-green-800" },
  };
  const s = map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-800" };
  return <span className={`px-2 py-0.5 rounded text-xs ${s.bg} ${s.text}`}>{s.label}</span>;
};

export function AdminDashboard() {
  const navigate = useNavigate();

  const menuCards = [
    { icon: FaUsers, label: "会員管理", desc: "会員情報の確認・検索・管理", path: "/admin/members", color: "blue" },
    { icon: FaCalendarAlt, label: "予約管理", desc: "予約情報の確認・新規予約登録", path: "/admin/reservations", color: "green" },
    { icon: FaCreditCard, label: "請求管理", desc: "支払状況・売上集計", path: "/admin/billing", color: "purple" },
    { icon: FaEnvelope, label: "お問合せ管理", desc: "お問い合わせ内容の確認・対応", path: "/admin/contacts", color: "orange" },
    { icon: FaBell, label: "お知らせ管理", desc: "お知らせの作成・編集", path: "/admin/news", color: "pink" },
    { icon: FaDatabase, label: "予約枠管理", desc: "予約可能日の設定・調整", path: "/admin/master/availability", color: "teal" },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-[#e8f5e9]", text: "text-[#0a2105]", border: "hover:border-[#0a2105]" },
    green: { bg: "bg-green-100", text: "text-green-700", border: "hover:border-green-300" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", border: "hover:border-purple-300" },
    orange: { bg: "bg-orange-100", text: "text-orange-700", border: "hover:border-orange-300" },
    pink: { bg: "bg-pink-100", text: "text-pink-700", border: "hover:border-pink-300" },
    teal: { bg: "bg-teal-100", text: "text-teal-700", border: "hover:border-teal-300" },
  };

  return (
    <AdminLayout currentPage="dashboard" title="管理画面">
      <div className="max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-900 mb-1">ダッシュボード</h2>
          <p className="text-sm text-gray-600">貸別荘エルボスケの運営状況と管理機能</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/members")}>
            <p className="text-xs text-gray-500 mb-1">総会員数</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl" style={{ color: "#0a2105" }}>{stats.totalMembers}</span>
              <FaUsers className="w-6 h-6 opacity-50" style={{ color: "#0a2105" }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">登録会員の総数</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/kpi")}>
            <p className="text-xs text-gray-500 mb-1">今月の新規登録</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl text-green-600">{stats.newMembersThisMonth}</span>
              <FaChartLine className="w-6 h-6 text-green-600 opacity-50" />
            </div>
            <p className="text-xs text-gray-400 mt-2">今月の新規会員</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/reservations")}>
            <p className="text-xs text-gray-500 mb-1">保留中の予約</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl text-amber-600">{stats.pendingReservations}</span>
              <FaCalendarAlt className="w-6 h-6 text-amber-600 opacity-50" />
            </div>
            <p className="text-xs text-gray-400 mt-2">確認が必要な予約</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/admin/contacts")}>
            <p className="text-xs text-gray-500 mb-1">未対応の問合せ</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl text-red-600">{stats.unansweredContacts}</span>
              <FaEnvelope className="w-6 h-6 text-red-600 opacity-50" />
            </div>
            <p className="text-xs text-gray-400 mt-2">返信が必要な問合せ</p>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base text-gray-900">直近の予約一覧</h3>
            <button onClick={() => navigate("/admin/reservations")} className="text-sm hover:opacity-80" style={{ color: "#0a2105" }}>すべて見る →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs text-gray-500">予約ID</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500">会員名</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500">チェックイン</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500">チェックアウト</th>
                  <th className="text-center px-6 py-3 text-xs text-gray-500">人数</th>
                  <th className="text-center px-6 py-3 text-xs text-gray-500">予約状況</th>
                  <th className="text-center px-6 py-3 text-xs text-gray-500">支払状況</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">{r.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{r.memberName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{r.checkIn}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{r.checkOut}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-center">{r.guests}名</td>
                    <td className="px-6 py-3 text-center">{statusBadge(r.status)}</td>
                    <td className="px-6 py-3 text-center">{statusBadge(r.payment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base text-gray-900">お問い合わせ一覧</h3>
            <button onClick={() => navigate("/admin/contacts")} className="text-sm hover:opacity-80" style={{ color: "#0a2105" }}>すべて見る →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500">名前</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500">件名</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500">日付</th>
                  <th className="text-center px-6 py-3 text-xs text-gray-500">対応状況</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">{c.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{c.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{c.subject}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{c.date}</td>
                    <td className="px-6 py-3 text-center">{statusBadge(c.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Management Menu Cards */}
        <h3 className="text-base text-gray-900 mb-4">管理メニュー</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuCards.map(card => {
            const cc = colorClasses[card.color];
            return (
              <div
                key={card.path}
                onClick={() => navigate(card.path)}
                className={`bg-white rounded-xl border-2 border-gray-200 ${cc.border} p-5 cursor-pointer hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 ${cc.bg} rounded-lg flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${cc.text}`} />
                  </div>
                  <div>
                    <h4 className="text-base text-gray-900">{card.label}</h4>
                    <p className="text-xs text-gray-500">{card.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}