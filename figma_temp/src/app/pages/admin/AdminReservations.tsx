import { useState, useMemo, useRef, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import {
  FaCalendarAlt, FaSearch, FaPlus, FaEye, FaTimes, FaFilter,
  FaUser, FaBed, FaStar, FaYenSign, FaDog, FaConciergeBell,
  FaEdit, FaCheckCircle, FaUserCheck, FaTimesCircle, FaExternalLinkAlt,
  FaChevronLeft, FaChevronRight, FaBan,
} from "react-icons/fa";

// ── モック会員データ ──
interface Member {
  id: string; lastName: string; firstName: string;
  lastNameKana: string; firstNameKana: string;
  email: string; phone: string;
  joinedAt: string; totalStays: number;
}
const mockMembers: Member[] = [
  { id: "MBR-001", lastName: "山田",   firstName: "太郎",   lastNameKana: "やまだ",   firstNameKana: "たろう",   email: "yamada@example.com",    phone: "090-1234-5678", joinedAt: "2024-04-01", totalStays: 3 },
  { id: "MBR-002", lastName: "佐藤",   firstName: "花子",   lastNameKana: "さとう",   firstNameKana: "はなこ",   email: "sato@example.com",      phone: "090-2345-6789", joinedAt: "2024-06-15", totalStays: 1 },
  { id: "MBR-003", lastName: "鈴木",   firstName: "一郎",   lastNameKana: "すずき",   firstNameKana: "いちろう", email: "suzuki@example.com",    phone: "090-3456-7890", joinedAt: "2024-08-20", totalStays: 2 },
  { id: "MBR-004", lastName: "田中",   firstName: "美咲",   lastNameKana: "たなか",   firstNameKana: "みさき",   email: "tanaka@example.com",    phone: "090-4567-8901", joinedAt: "2024-09-10", totalStays: 1 },
  { id: "MBR-005", lastName: "高橋",   firstName: "健一",   lastNameKana: "たかはし", firstNameKana: "けんいち", email: "takahashi@example.com", phone: "090-5678-9012", joinedAt: "2024-10-05", totalStays: 4 },
  { id: "MBR-006", lastName: "小林",   firstName: "太郎",   lastNameKana: "こばやし", firstNameKana: "たろう",   email: "kobayashi@example.com", phone: "090-6789-0123", joinedAt: "2024-11-01", totalStays: 0 },
  { id: "MBR-007", lastName: "渡辺",   firstName: "幸子",   lastNameKana: "わたなべ", firstNameKana: "さちこ",   email: "watanabe@example.com",  phone: "080-1111-2222", joinedAt: "2025-01-10", totalStays: 2 },
  { id: "MBR-008", lastName: "伊藤",   firstName: "直樹",   lastNameKana: "いとう",   firstNameKana: "なおき",   email: "ito@example.com",       phone: "080-3333-4444", joinedAt: "2025-02-20", totalStays: 1 },
  { id: "MBR-009", lastName: "中村",   firstName: "さくら", lastNameKana: "なかむら", firstNameKana: "さくら",   email: "nakamura@example.com",  phone: "070-5555-6666", joinedAt: "2025-04-01", totalStays: 0 },
  { id: "MBR-010", lastName: "加藤",   firstName: "雄太",   lastNameKana: "かとう",   firstNameKana: "ゆうた",   email: "kato@example.com",      phone: "070-7777-8888", joinedAt: "2025-06-15", totalStays: 3 },
];

// ── 料金調整マスタ（AdminPriceAdjustment と共有） ──
interface PriceRule {
  id: string;
  name: string;
  discountPercent: number;
  hasPeriod: boolean;
  periodStart: string;
  periodEnd: string;
  hasGuestRange: boolean;
  guestMin: number | null;
  guestMax: number | null;
  noExperienceOptions: boolean;
  noSupportPlan: boolean;
  status: "active" | "inactive";
}
const priceAdjustmentRules: PriceRule[] = [
  { id: "ADJ-001", name: "平日限定割引",         discountPercent: 10, hasPeriod: true,  periodStart: "2026-04-01", periodEnd: "2026-11-30", hasGuestRange: false, guestMin: null, guestMax: null, noExperienceOptions: false, noSupportPlan: false, status: "active" },
  { id: "ADJ-002", name: "連泊割引（2泊目以降）", discountPercent: 10, hasPeriod: false, periodStart: "",           periodEnd: "",           hasGuestRange: true,  guestMin: 1,    guestMax: 3,    noExperienceOptions: false, noSupportPlan: false, status: "active" },
  { id: "ADJ-003", name: "リピーター特典",         discountPercent: 5,  hasPeriod: false, periodStart: "",           periodEnd: "",           hasGuestRange: false, guestMin: null, guestMax: null, noExperienceOptions: false, noSupportPlan: false, status: "inactive" },
  { id: "ADJ-004", name: "移住体験割引",           discountPercent: 50, hasPeriod: false, periodStart: "",           periodEnd: "",           hasGuestRange: false, guestMin: null, guestMax: null, noExperienceOptions: true,  noSupportPlan: true,  status: "active" },
  { id: "ADJ-005", name: "仮住まい割引",           discountPercent: 95, hasPeriod: false, periodStart: "",           periodEnd: "",           hasGuestRange: false, guestMin: null, guestMax: null, noExperienceOptions: true,  noSupportPlan: true,  status: "active" },
];

// ── 料金定数（フロント側と同一） ──
const PET_FEES: Record<string, number> = {
  none: 0, small1: 2500, small2: 4000, large1: 3500, large2: 6000,
};
const PET_LABELS: Record<string, string> = {
  none: "なし", small1: "小型犬1頭", small2: "小型犬2頭",
  large1: "大型犬1頭", large2: "大型犬2頭",
};
const EXP_MAP: Record<string, { perPerson: boolean; amount: number; priceNote: string }> = {
  "田植え体験":        { perPerson: true,  amount: 4500, priceNote: "¥4,500/人" },
  "稲刈り体験":        { perPerson: true,  amount: 4500, priceNote: "¥4,500/人" },
  "薪割り体験":        { perPerson: false, amount: 2000, priceNote: "¥2,000/時間" },
  "夏野菜収穫体験":    { perPerson: false, amount: 1500, priceNote: "¥1,500/カゴ" },
  "BBQグリルレンタル": { perPerson: false, amount: 3500, priceNote: "¥3,500/回" },
  "星空ガイド":        { perPerson: false, amount: 2000, priceNote: "¥2,000/組" },
};
const EXPERIENCE_LIST = [
  { label: "田植え体験",        season: "5月〜6月",     price: "¥4,500/人" },
  { label: "稲刈り体験",        season: "9月〜10月",    price: "¥4,500/人" },
  { label: "薪割り体験",        season: "通年",          price: "¥2,000/時間" },
  { label: "夏野菜収穫体験",    season: "7月〜8月",     price: "¥1,500/カゴ" },
  { label: "BBQグリルレンタル", season: "通年",          price: "¥3,500/回" },
  { label: "星空ガイド",        season: "通年（晴天時）", price: "¥2,000/組", note: "ガイドなしは無料" },
];

// ── ユーティリティ ──
function calcNights(ci: string, co: string): number {
  if (!ci || !co) return 0;
  return Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000);
}
function getBaseRate(dateStr: string): number {
  if (!dateStr) return 20000;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if ((m === 4 && d >= 29) || (m === 5 && d <= 5)) return 33000;
  if (m === 8 && d >= 10 && d <= 16) return 33000;
  if (m === 12 && d >= 28) return 33000;
  if (dow === 5 || dow === 6) return 26000;
  return 20000;
}
function getDayTypeLabel(dateStr: string): string {
  if (!dateStr) return "";
  const r = getBaseRate(dateStr);
  if (r === 33000) return "特別日";
  if (r === 26000) return "休前日（金・土）";
  return "平日（日〜木）";
}

// ── 型定義 ──
interface ExperienceDetail { name: string; price: number; priceNote: string; }
interface PriceBreakdown {
  baseAmount: number; guestExtra: number; petFee: number;
  supportFee: number; transferSurcharge: number; experiencesTotal: number; deposit: number;
  adjustment?: number; adjustmentNote?: string; adjustmentRuleId?: string;
}
interface Reservation {
  id: string; memberName: string; memberEmail: string; memberPhone: string;
  checkIn: string; checkOut: string; nights: number; guests: number;
  hasPet: string; petBreed?: string;
  supportFee: boolean; experiences: string[]; experienceDetails: ExperienceDetail[];
  breakdown: PriceBreakdown;
  status: "confirmed" | "cancelled" | "noshow";
  payment: "paid" | "unpaid" | "refunded";
  totalAmount: number; note?: string; createdAt: string;
}

// ── モックデータ ──
const mockReservations: Reservation[] = [
  {
    id: "RSV-001", memberName: "山田 太郎", memberEmail: "yamada@example.com", memberPhone: "090-1234-5678",
    checkIn: "2026-03-15", checkOut: "2026-03-17", nights: 2, guests: 3,
    hasPet: "small1", petBreed: "トイプードル", supportFee: true,
    experiences: ["星空ガイド"],
    experienceDetails: [{ name: "星空ガイド", price: 2000, priceNote: "¥2,000/組" }],
    breakdown: { baseAmount: 40000, guestExtra: 0, petFee: 5000, supportFee: 8000, transferSurcharge: 0, experiencesTotal: 2000, deposit: 10000 },
    status: "confirmed", payment: "paid", totalAmount: 65000, createdAt: "2026-02-20",
  },
  {
    id: "RSV-002", memberName: "佐藤 花子", memberEmail: "sato@example.com", memberPhone: "090-2345-6789",
    checkIn: "2026-03-20", checkOut: "2026-03-22", nights: 2, guests: 2,
    hasPet: "none", supportFee: true, experiences: [], experienceDetails: [],
    breakdown: { baseAmount: 52000, guestExtra: 0, petFee: 0, supportFee: 8000, transferSurcharge: 0, experiencesTotal: 0, deposit: 10000, adjustment: -5200, adjustmentNote: "連泊割引適用", adjustmentRuleId: "ADJ-002" },
    status: "confirmed", payment: "unpaid", totalAmount: 64800, createdAt: "2026-02-25",
  },
  {
    id: "RSV-003", memberName: "鈴木 一郎", memberEmail: "suzuki@example.com", memberPhone: "090-3456-7890",
    checkIn: "2026-03-25", checkOut: "2026-03-27", nights: 2, guests: 4,
    hasPet: "large1", petBreed: "ゴールデンレトリバー", supportFee: false,
    experiences: ["BBQグリルレンタル"],
    experienceDetails: [{ name: "BBQグリルレンタル", price: 3500, priceNote: "¥3,500/回" }],
    breakdown: { baseAmount: 40000, guestExtra: 0, petFee: 7000, supportFee: 0, transferSurcharge: 0, experiencesTotal: 3500, deposit: 10000 },
    status: "confirmed", payment: "unpaid", totalAmount: 60500, createdAt: "2026-03-01",
  },
  {
    id: "RSV-004", memberName: "田中 美咲", memberEmail: "tanaka@example.com", memberPhone: "090-4567-8901",
    checkIn: "2026-04-01", checkOut: "2026-04-03", nights: 2, guests: 2,
    hasPet: "none", supportFee: true,
    experiences: ["星空ガイド", "薪割り体験"],
    experienceDetails: [
      { name: "星空ガイド", price: 2000, priceNote: "¥2,000/組" },
      { name: "薪割り体験", price: 2000, priceNote: "¥2,000/時間" },
    ],
    breakdown: { baseAmount: 40000, guestExtra: 0, petFee: 0, supportFee: 8000, transferSurcharge: 0, experiencesTotal: 4000, deposit: 10000, adjustment: -20000, adjustmentNote: "移住体験割引適用", adjustmentRuleId: "ADJ-004" },
    status: "confirmed", payment: "paid", totalAmount: 42000, createdAt: "2026-03-02",
  },
  {
    id: "RSV-005", memberName: "高橋 健一", memberEmail: "takahashi@example.com", memberPhone: "090-5678-9012",
    checkIn: "2026-04-05", checkOut: "2026-04-08", nights: 3, guests: 5,
    hasPet: "small2", petBreed: "チワワ（2頭）", supportFee: true, experiences: [], experienceDetails: [],
    breakdown: { baseAmount: 60000, guestExtra: 0, petFee: 12000, supportFee: 8000, transferSurcharge: 5000, experiencesTotal: 0, deposit: 10000 },
    status: "cancelled", payment: "refunded", totalAmount: 95000, createdAt: "2026-03-03",
    note: "天候不良のためキャンセル",
  },
];

// ── バッジ ──
const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "確定",       cls: "bg-green-100 text-green-800" },
    cancelled: { label: "キャンセル", cls: "bg-red-100 text-red-800" },
    noshow:    { label: "ドタキャン", cls: "bg-purple-100 text-purple-800" },
    paid:      { label: "支払済",     cls: "bg-blue-100 text-blue-800" },
    unpaid:    { label: "未払い",     cls: "bg-orange-100 text-orange-800" },
    refunded:  { label: "返金済",     cls: "bg-gray-100 text-gray-600" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

// ── 共通UIパーツ ──
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-gray-400">{icon}</span>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="w-32 shrink-0 text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function petDisplayLabel(hasPet: string, breed?: string) {
  const base = PET_LABELS[hasPet] ?? hasPet;
  return hasPet === "none" ? base : `${base}${breed ? `（${breed}）` : ""}`;
}

// ── 新規予約フォーム型 ──
interface NewForm {
  memberId: string;
  checkIn: string; checkOut: string;
  guests: number; pets: string; petBreed: string; petBreed2: string;
  supportPlan: boolean;
  experiences: string[];
  note: string;
  status: "confirmed" | "cancelled" | "noshow";
  payment: "paid" | "unpaid" | "refunded";
  adjustment: number;
  adjustmentNote: string;
  selectedRuleId: string;
}

const emptyNewForm: NewForm = {
  memberId: "",
  checkIn: "", checkOut: "",
  guests: 2, pets: "none", petBreed: "", petBreed2: "",
  supportPlan: true,
  experiences: [],
  note: "",
  status: "confirmed", payment: "unpaid",
  adjustment: 0,
  adjustmentNote: "",
  selectedRuleId: "",
};

// ────────────────────────────────────────────────────
// ── 管理者用カレンダー ──
// ────────────────────────────────────────────────────
const CAL_YEAR = 2026;
const CAL_SEASON_START = 2;  // 3月（0-indexed）
const CAL_SEASON_END   = 11; // 12月
const CAL_CLOSED_DOW   = [2, 3, 4]; // 火水木は定休
const CAL_DOW_NAMES    = ["日","月","火","水","木","金","土"];
const CAL_MONTH_NAMES  = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

type CalStatus = "available" | "booked" | "unavailable" | "off";

function getAdminDayStatus(month: number, day: number): CalStatus {
  if (month < CAL_SEASON_START || month > CAL_SEASON_END) return "off";
  const d = new Date(CAL_YEAR, month, day);
  const dow = d.getDay();
  if (CAL_CLOSED_DOW.includes(dow)) return "unavailable";
  if ((month === 3 && day >= 29) || (month === 4 && day <= 5)) return "booked";
  if (month === 7 && day >= 10 && day <= 16) return "booked";
  if (month === 11 && day >= 28) return "booked";
  const seed = day * 7 + month * 13 + CAL_YEAR;
  const hash = ((seed * 2654435761) >>> 0) % 100;
  if (dow === 5 || dow === 6) return hash < 40 ? "booked" : "available";
  return hash < 20 ? "booked" : "available";
}

function adminFmtDate(month: number, day: number): string {
  return `${CAL_YEAR}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface AdminDateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (ci: string, co: string) => void;
}

function AdminDateRangePicker({ checkIn, checkOut, onChange }: AdminDateRangePickerProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    const m = now.getMonth();
    return m >= CAL_SEASON_START && m <= CAL_SEASON_END ? m : CAL_SEASON_START;
  });

  // Sync view to checkIn date
  useEffect(() => {
    if (!checkIn) return;
    const m = Number(checkIn.split("-")[1]) - 1;
    if (m >= CAL_SEASON_START && m <= CAL_SEASON_END) setViewMonth(m);
  }, [checkIn]);

  const cells = useMemo(() => {
    const daysInMonth = new Date(CAL_YEAR, viewMonth + 1, 0).getDate();
    const firstDow    = new Date(CAL_YEAR, viewMonth, 1).getDay();
    type Cell = { day: number; dateStr: string; status: CalStatus; dow: number };
    const items: Cell[] = [];
    // Leading empties
    for (let i = 0; i < firstDow; i++)
      items.push({ day: 0, dateStr: "", status: "off", dow: i });
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(CAL_YEAR, viewMonth, d).getDay();
      items.push({ day: d, dateStr: adminFmtDate(viewMonth, d), status: getAdminDayStatus(viewMonth, d), dow });
    }
    while (items.length % 7 !== 0) items.push({ day: 0, dateStr: "", status: "off", dow: 0 });
    return items;
  }, [viewMonth]);

  const isSelectingCO = !!checkIn && !checkOut;

  const handleClick = (dateStr: string, status: CalStatus) => {
    if (!dateStr || status !== "available") return;
    if (!checkIn || (checkIn && checkOut)) {
      // Start fresh or restart
      onChange(dateStr, "");
    } else {
      // Selecting check-out
      if (dateStr > checkIn) {
        onChange(checkIn, dateStr);
      } else {
        // Clicked before check-in → restart from this date
        onChange(dateStr, "");
      }
    }
  };

  const symMap: Record<CalStatus, { sym: string; cls: string }> = {
    available:   { sym: "◎", cls: "text-green-600" },
    booked:      { sym: "×", cls: "text-red-500"   },
    unavailable: { sym: "休", cls: "text-gray-300"  },
    off:         { sym: "",  cls: ""               },
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a2105]">
        <button
          onClick={() => setViewMonth(m => Math.max(CAL_SEASON_START, m - 1))}
          disabled={viewMonth <= CAL_SEASON_START}
          className="p-1.5 rounded text-white/60 hover:text-white disabled:opacity-25 transition-opacity"
        >
          <FaChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-white text-sm font-semibold tracking-wide">
          {CAL_YEAR}年 {CAL_MONTH_NAMES[viewMonth]}
        </span>
        <button
          onClick={() => setViewMonth(m => Math.min(CAL_SEASON_END, m + 1))}
          disabled={viewMonth >= CAL_SEASON_END}
          className="p-1.5 rounded text-white/60 hover:text-white disabled:opacity-25 transition-opacity"
        >
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Step indicator */}
      <div className={`px-3 py-1.5 text-center border-b border-gray-100 text-xs ${isSelectingCO ? "bg-green-50" : "bg-gray-50"}`}>
        {!checkIn && (
          <span className="text-gray-500">① チェックイン日をクリックしてください</span>
        )}
        {checkIn && !checkOut && (
          <span className="text-green-700 font-medium">
            ② チェックアウト日を選択（IN: {checkIn}）
            <button onClick={() => onChange("", "")} className="ml-2 text-red-400 hover:text-red-600 font-normal underline">リセット</button>
          </span>
        )}
        {checkIn && checkOut && (
          <span className="text-gray-700 font-medium">
            {checkIn} → {checkOut}　{calcNights(checkIn, checkOut)}泊
            <button onClick={() => onChange("", "")} className="ml-2 text-red-400 hover:text-red-600 font-normal underline text-xs">リセット</button>
          </span>
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {CAL_DOW_NAMES.map((d, i) => (
          <div key={d} className={`py-1.5 text-center text-xs font-semibold ${
            i === 0 ? "text-red-500"
            : i === 6 ? "text-blue-600"
            : CAL_CLOSED_DOW.includes(i) ? "text-gray-300"
            : "text-gray-500"
          }`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 p-1.5 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell.day) return <div key={`e-${i}`} />;

          const isCI  = cell.dateStr === checkIn;
          const isCO  = cell.dateStr === checkOut;
          const inRng = !!(checkIn && checkOut && cell.dateStr > checkIn && cell.dateStr < checkOut);
          const isCOCandidate = isSelectingCO && cell.status === "available" && cell.dateStr > checkIn;
          const clickable = cell.status === "available";

          let wrapCls = "relative flex flex-col items-center justify-center min-h-[2.75rem] rounded text-center transition-all ";
          if (isCI || isCO) {
            wrapCls += "bg-[#0a2105] ";
          } else if (inRng) {
            wrapCls += "bg-[#0a2105]/10 rounded-none ";
          } else if (isCOCandidate) {
            wrapCls += "ring-2 ring-green-500 cursor-pointer hover:bg-green-50 ";
          } else if (clickable) {
            wrapCls += "cursor-pointer hover:bg-gray-100 ";
          }

          const dayCls = isCI || isCO
            ? "text-white font-bold"
            : cell.dow === 0 ? "text-red-500"
            : cell.dow === 6 ? "text-blue-600"
            : cell.status === "unavailable" ? "text-gray-300"
            : cell.status === "off" ? "text-gray-200"
            : "text-gray-800";

          const sym = isCI ? "IN" : isCO ? "OUT" : symMap[cell.status].sym;
          const symCls = isCI || isCO ? "text-white/80" : symMap[cell.status].cls;

          return (
            <button
              key={cell.dateStr}
              disabled={!clickable}
              onClick={() => handleClick(cell.dateStr, cell.status)}
              className={wrapCls}
              title={!clickable && cell.status !== "off" ? `${cell.dateStr}: ${cell.status === "booked" ? "予約済み" : "定休日"}` : undefined}
            >
              <span className={`text-xs leading-tight ${dayCls}`}>{cell.day}</span>
              <span className={`text-[10px] leading-tight font-bold ${symCls}`}>{sym}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap px-3 py-2 border-t border-gray-100 bg-gray-50">
        {[
          { sym: "◎", cls: "text-green-600", label: "空きあり" },
          { sym: "×", cls: "text-red-500",   label: "予約済み" },
          { sym: "休", cls: "text-gray-400",  label: "定休日（火水木）" },
        ].map(({ sym, cls, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`text-xs font-bold ${cls}`}>{sym}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 料金計算（新規フォーム用） ──
function calcFromForm(f: NewForm) {
  const nights  = calcNights(f.checkIn, f.checkOut);
  const baseRate = getBaseRate(f.checkIn);
  const baseAmount = baseRate * nights;
  const guestExtra = f.guests > 5 ? (f.guests - 5) * 3000 * nights : 0;
  const petFee     = (PET_FEES[f.pets] || 0) * nights;
  const supportFee = f.supportPlan ? 8000 : 0;
  const transferSurcharge = f.supportPlan && f.guests >= 5 ? 5000 : 0;
  const experiencesTotal  = f.experiences.reduce((acc, label) => {
    const info = EXP_MAP[label];
    if (!info) return acc;
    return acc + (info.perPerson ? info.amount * f.guests : info.amount);
  }, 0);
  const deposit = 10000;
  const total   = baseAmount + guestExtra + petFee + supportFee + transferSurcharge + experiencesTotal + deposit;
  return { nights, baseRate, baseAmount, guestExtra, petFee, supportFee, transferSurcharge, experiencesTotal, deposit, total };
}

// ────────────────────────────────────────────────────
export function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [showFilters, setShowFilters]   = useState(false);

  // 詳細モーダル
  const [selectedRes, setSelectedRes]   = useState<Reservation | null>(null);
  const [editPayment, setEditPayment]   = useState<Reservation["payment"]>("unpaid");
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [editStatus, setEditStatus]     = useState<Reservation["status"]>("confirmed");
  const [statusSaved, setStatusSaved]   = useState(false);
  const [editAdjustment, setEditAdjustment]         = useState<number>(0);
  const [editAdjustmentNote, setEditAdjustmentNote] = useState<string>("");
  const [editAdjustmentRuleId, setEditAdjustmentRuleId] = useState<string>("");
  const [adjustmentSaved, setAdjustmentSaved]       = useState(false);
  const [editExperiences, setEditExperiences]       = useState<string[]>([]);
  const [experiencesSaved, setExperiencesSaved]     = useState(false);
  const [editSupportPlan, setEditSupportPlan]       = useState(false);
  const [supportPlanSaved, setSupportPlanSaved]     = useState(false);

  // 新規予約モーダル
  const [isNewOpen, setIsNewOpen]       = useState(false);
  const [newForm, setNewForm]           = useState<NewForm>(emptyNewForm);
  const [memberQuery, setMemberQuery]   = useState("");
  const [showMemberDrop, setShowMemberDrop] = useState(false);
  const memberSearchRef = useRef<HTMLDivElement>(null);

  // 会員検索ドロップダウンを外クリックで閉じる
  useEffect(() => {
    if (!showMemberDrop) return;
    const handler = (e: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(e.target as Node)) {
        setShowMemberDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMemberDrop]);

  const filtered = useMemo(() => reservations.filter(r => {
    const matchSearch  = !searchQuery  || r.memberName.includes(searchQuery) || r.id.includes(searchQuery) || r.memberEmail.includes(searchQuery);
    const matchStatus  = filterStatus  === "all" || r.status  === filterStatus;
    const matchPayment = filterPayment === "all" || r.payment === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  }), [reservations, searchQuery, filterStatus, filterPayment]);

  // 詳細モーダルを開く
  const openDetail = (r: Reservation) => {
    setSelectedRes(r);
    setEditPayment(r.payment);
    setPaymentSaved(false);
    setEditStatus(r.status);
    setStatusSaved(false);
    setEditAdjustment(r.breakdown.adjustment ?? 0);
    setEditAdjustmentNote(r.breakdown.adjustmentNote ?? "");
    setEditAdjustmentRuleId(r.breakdown.adjustmentRuleId ?? "");
    setAdjustmentSaved(false);
    setEditExperiences(r.experiences);
    setExperiencesSaved(false);
    setEditSupportPlan(r.supportFee);
    setSupportPlanSaved(false);
  };

  // 支払状況更新
  const handlePaymentSave = () => {
    if (!selectedRes) return;
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? { ...r, payment: editPayment } : r));
    setSelectedRes(prev => prev ? { ...prev, payment: editPayment } : null);
    setPaymentSaved(true);
  };

  // 体験オプション更新
  const handleExperiencesSave = () => {
    if (!selectedRes) return;
    const expDetails: ExperienceDetail[] = editExperiences.map(label => ({
      name: label,
      price: EXP_MAP[label]?.perPerson
        ? EXP_MAP[label].amount * selectedRes.guests
        : (EXP_MAP[label]?.amount ?? 0),
      priceNote: EXP_MAP[label]?.priceNote ?? "",
    }));
    const newExpTotal = expDetails.reduce((sum, e) => sum + e.price, 0);
    const diff = newExpTotal - selectedRes.breakdown.experiencesTotal;
    const updated: Reservation = {
      ...selectedRes,
      experiences: editExperiences,
      experienceDetails: expDetails,
      totalAmount: selectedRes.totalAmount + diff,
      breakdown: { ...selectedRes.breakdown, experiencesTotal: newExpTotal },
    };
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? updated : r));
    setSelectedRes(updated);
    setExperiencesSaved(true);
  };

  // 滞在サポート更新
  const handleSupportPlanSave = () => {
    if (!selectedRes) return;
    const newSupportFee       = editSupportPlan ? 8000 : 0;
    const newTransferSurcharge = editSupportPlan && selectedRes.guests >= 5 ? 5000 : 0;
    const diff = (newSupportFee + newTransferSurcharge)
               - (selectedRes.breakdown.supportFee + selectedRes.breakdown.transferSurcharge);
    const updated: Reservation = {
      ...selectedRes,
      supportFee: editSupportPlan,
      totalAmount: selectedRes.totalAmount + diff,
      breakdown: {
        ...selectedRes.breakdown,
        supportFee: newSupportFee,
        transferSurcharge: newTransferSurcharge,
      },
    };
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? updated : r));
    setSelectedRes(updated);
    setSupportPlanSaved(true);
  };

  // 料金調整更新
  const handleAdjustmentSave = () => {
    if (!selectedRes) return;
    const prevAdj = selectedRes.breakdown.adjustment ?? 0;
    const newTotal = selectedRes.totalAmount - prevAdj + editAdjustment;
    const updated: Reservation = {
      ...selectedRes,
      totalAmount: newTotal,
      breakdown: {
        ...selectedRes.breakdown,
        adjustment: editAdjustment !== 0 ? editAdjustment : undefined,
        adjustmentNote: editAdjustment !== 0 && editAdjustmentNote ? editAdjustmentNote : undefined,
        adjustmentRuleId: editAdjustment !== 0 && editAdjustmentRuleId ? editAdjustmentRuleId : undefined,
      },
    };
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? updated : r));
    setSelectedRes(updated);
    setAdjustmentSaved(true);
  };

  // 予約状況更新
  const handleStatusSave = () => {
    if (!selectedRes) return;
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? { ...r, status: editStatus } : r));
    setSelectedRes(prev => prev ? { ...prev, status: editStatus } : null);
    setStatusSaved(true);
  };

  // 新規予約フォーム変更
  const setF = <K extends keyof NewForm>(key: K, val: NewForm[K]) =>
    setNewForm(f => ({ ...f, [key]: val }));

  const toggleExp = (label: string) =>
    setNewForm(f => ({
      ...f,
      experiences: f.experiences.includes(label)
        ? f.experiences.filter(e => e !== label)
        : [...f.experiences, label],
    }));

  // 選択中の会員
  const selectedMember = useMemo(
    () => mockMembers.find(m => m.id === newForm.memberId) ?? null,
    [newForm.memberId]
  );

  // 会員検索結果
  const memberResults = useMemo(() => {
    if (!memberQuery.trim()) return mockMembers;
    const q = memberQuery.trim().toLowerCase();
    return mockMembers.filter(m => {
      const fullName = `${m.lastName}${m.firstName}`;
      const fullKana = `${m.lastNameKana}${m.firstNameKana}`;
      return fullName.includes(memberQuery) ||
        fullKana.includes(memberQuery) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(memberQuery) ||
        m.id.toLowerCase().includes(q);
    });
  }, [memberQuery]);

  // 新規予約保存
  const handleNewSave = () => {
    if (!newForm.memberId || !newForm.checkIn || !newForm.checkOut) return;
    const member = mockMembers.find(m => m.id === newForm.memberId);
    if (!member) return;
    const calc = calcFromForm(newForm);
    const newId = `RSV-${String(reservations.length + 1).padStart(3, "0")}`;
    const expDetails: ExperienceDetail[] = newForm.experiences.map(label => ({
      name: label,
      price: EXP_MAP[label]?.perPerson ? EXP_MAP[label].amount * newForm.guests : (EXP_MAP[label]?.amount ?? 0),
      priceNote: EXP_MAP[label]?.priceNote ?? "",
    }));
    const newRes: Reservation = {
      id: newId,
      memberName: `${member.lastName} ${member.firstName}`,
      memberEmail: member.email,
      memberPhone: member.phone,
      checkIn: newForm.checkIn,
      checkOut: newForm.checkOut,
      nights: calc.nights,
      guests: newForm.guests,
      hasPet: newForm.pets,
      petBreed: newForm.pets !== "none"
        ? (newForm.pets === "small2" || newForm.pets === "large2")
          ? [newForm.petBreed, newForm.petBreed2].filter(Boolean).join(" / ")
          : newForm.petBreed
        : undefined,
      supportFee: newForm.supportPlan,
      experiences: newForm.experiences,
      experienceDetails: expDetails,
      breakdown: {
        baseAmount: calc.baseAmount, guestExtra: calc.guestExtra,
        petFee: calc.petFee, supportFee: calc.supportFee,
        transferSurcharge: calc.transferSurcharge,
        experiencesTotal: calc.experiencesTotal, deposit: calc.deposit,
        ...(newForm.adjustment !== 0 && {
          adjustment: newForm.adjustment,
          adjustmentNote: newForm.adjustmentNote || undefined,
          adjustmentRuleId: newForm.selectedRuleId || undefined,
        }),
      },
      status: newForm.status,
      payment: newForm.payment,
      totalAmount: calc.total + newForm.adjustment,
      note: newForm.note || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setReservations(prev => [newRes, ...prev]);
    setIsNewOpen(false);
    setNewForm(emptyNewForm);
    setMemberQuery("");
  };

  // 新規フォームのリアルタイム計算
  const calc = useMemo(() => calcFromForm(newForm), [newForm]);

  // 詳細モーダル用：選択中予約に適用可能なルール
  const detailApplicableRules = useMemo(() => {
    if (!selectedRes) return [];
    return priceAdjustmentRules.filter(rule => {
      if (rule.status !== "active") return false;
      if (rule.hasGuestRange) {
        if (rule.guestMin !== null && selectedRes.guests < rule.guestMin) return false;
        if (rule.guestMax !== null && selectedRes.guests > rule.guestMax) return false;
      }
      if (rule.hasPeriod && selectedRes.checkIn) {
        if (selectedRes.checkIn < rule.periodStart || selectedRes.checkIn > rule.periodEnd) return false;
      }
      return true;
    });
  }, [selectedRes]);

  // 新規フォームで選択中のルール
  const selectedAdjustmentRule = useMemo(
    () => priceAdjustmentRules.find(r => r.id === newForm.selectedRuleId) ?? null,
    [newForm.selectedRuleId]
  );
  const optionsDisabledByRule = selectedAdjustmentRule?.noExperienceOptions ?? false;

  // 適用可能な料金調整ルール（人数・期間でフィルタ）
  const applicableRules = useMemo(() => {
    return priceAdjustmentRules.filter(rule => {
      if (rule.status !== "active") return false;
      if (rule.hasGuestRange) {
        if (rule.guestMin !== null && newForm.guests < rule.guestMin) return false;
        if (rule.guestMax !== null && newForm.guests > rule.guestMax) return false;
      }
      if (rule.hasPeriod && newForm.checkIn) {
        if (newForm.checkIn < rule.periodStart || newForm.checkIn > rule.periodEnd) return false;
      }
      return true;
    });
  }, [newForm.guests, newForm.checkIn]);

  // ────────────────────────────────────────────────────
  return (
    <AdminLayout currentPage="reservations" title="予約管理">
      <div className="max-w-7xl mx-auto">

        {/* ── 一覧テーブル ── */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base text-gray-900">予約一覧</h2>
                  <p className="text-xs text-gray-500">総予約数: {reservations.length}件 | 検索結果: {filtered.length}件</p>
                </div>
              </div>
              <button
                onClick={() => { setNewForm(emptyNewForm); setMemberQuery(""); setShowMemberDrop(false); setIsNewOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]"
              >
                <FaPlus className="w-3 h-3" /> 新規予約（電話対応）
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="会員名、予約ID、メールで検索" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaFilter className="w-3 h-3" /> 絞り込み
              </button>
              {showFilters && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">予約状況</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white">
                      <option value="all">すべて</option>
                      <option value="confirmed">確定</option>
                      <option value="cancelled">キャンセル</option>
                      <option value="noshow">ドタキャン</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">支払状況</label>
                    <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white">
                      <option value="all">すべて</option>
                      <option value="paid">支払済</option>
                      <option value="unpaid">未払い</option>
                      <option value="refunded">返金済</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">予約ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">会員名</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">チェックイン</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">チェックアウト</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">泊数</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">人数</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">金額</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">割引</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">サービス</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">予約状況</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">支払状況</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {r.memberName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.checkIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.checkOut}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{r.nights}泊</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{r.guests}名</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">¥{r.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const rule = r.breakdown.adjustmentRuleId
                          ? priceAdjustmentRules.find(p => p.id === r.breakdown.adjustmentRuleId)
                          : null;
                        const adj = r.breakdown.adjustment ?? 0;
                        if (rule) {
                          return (
                            <span title={rule.name}
                              className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full">
                              {rule.name.slice(0, 2)}
                            </span>
                          );
                        }
                        if (adj !== 0) {
                          return (
                            <span title="手動調整"
                              className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
                              手動
                            </span>
                          );
                        }
                        return <span className="text-xs text-gray-300">—</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span title={r.supportFee ? "滞在サポートあり" : "滞在サポートなし"}
                          className={`flex items-center gap-0.5 text-xs ${r.supportFee ? "text-[#0a2105]" : "text-gray-300"}`}>
                          <FaConciergeBell className="w-3.5 h-3.5" />
                        </span>
                        <span title={r.experiences.length > 0 ? `体験オプション ${r.experiences.length}件` : "体験オプションなし"}
                          className={`flex items-center gap-0.5 text-xs ${r.experiences.length > 0 ? "text-amber-500" : "text-gray-300"}`}>
                          <FaStar className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(r.payment)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openDetail(r)}
                        className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded">
                        <FaEye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ════════════════════════════════════════
            詳細モーダル
        ════════════════════════════════════════ */}
        {selectedRes && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedRes(null)}>
            <div className="bg-white rounded-xl w-full max-w-xl my-8" onClick={e => e.stopPropagation()}>

              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">予約ID: {selectedRes.id}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base text-gray-900">{selectedRes.memberName}</h3>
                    {statusBadge(selectedRes.status)}
                    {statusBadge(selectedRes.payment)}
                  </div>
                </div>
                <button onClick={() => setSelectedRes(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">

                {/* 宿泊者情報 */}
                <Section icon={<FaUser className="w-3 h-3" />} title="宿泊者情報">
                  <div className="bg-gray-50 rounded-lg px-4 py-1">
                    <InfoRow label="氏名" value={selectedRes.memberName} />
                    <InfoRow label="メール" value={selectedRes.memberEmail || <span className="text-gray-400">−</span>} />
                    <InfoRow label="電話番号" value={selectedRes.memberPhone} />
                    <InfoRow label="予約日" value={selectedRes.createdAt} />
                  </div>
                </Section>

                {/* 宿泊内容 */}
                <Section icon={<FaBed className="w-3 h-3" />} title="宿泊内容">
                  <div className="bg-gray-50 rounded-lg px-4 py-1">
                    <InfoRow label="チェックイン" value={selectedRes.checkIn} />
                    <InfoRow label="チェックアウト" value={selectedRes.checkOut} />
                    <InfoRow label="泊数 / 人数" value={`${selectedRes.nights}泊 / ${selectedRes.guests}名`} />
                    <InfoRow label="ペット" value={petDisplayLabel(selectedRes.hasPet, selectedRes.petBreed)} />
                    <InfoRow label="滞在サポート" value={selectedRes.supportFee ? "あり" : "なし"} />
                    {selectedRes.note && <InfoRow label="備考" value={selectedRes.note} />}
                  </div>
                </Section>

                {/* 体験オプション */}
                <Section icon={<FaStar className="w-3 h-3" />} title="体験オプション">
                  {selectedRes.experienceDetails.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-4 py-2 text-xs text-gray-500">オプション名</th>
                            <th className="text-right px-4 py-2 text-xs text-gray-500">料金</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRes.experienceDetails.map((exp, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0">
                              <td className="px-4 py-2.5 text-gray-900">{exp.name}</td>
                              <td className="px-4 py-2.5 text-right text-gray-700">
                                {exp.price === 0
                                  ? <span className="text-green-600 font-medium">無料</span>
                                  : `¥${exp.price.toLocaleString()}`}
                                <span className="text-xs text-gray-400 ml-1">（{exp.priceNote}）</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3">体験オプションなし</p>
                  )}
                </Section>

                {/* ── 体験オプションを変更 ── */}
                <Section icon={<FaStar className="w-3 h-3" />} title="体験オプションを変更">
                  <div className="space-y-2">
                    {EXPERIENCE_LIST.map(exp => {
                      const isSelected = editExperiences.includes(exp.label);
                      return (
                        <label key={exp.label}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "border-[#0a2105] bg-[#e8f5e9]" : "border-gray-200 hover:bg-gray-50"}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setEditExperiences(prev =>
                                prev.includes(exp.label) ? prev.filter(e => e !== exp.label) : [...prev, exp.label]
                              );
                              setExperiencesSaved(false);
                            }}
                            className="w-4 h-4 accent-[#0a2105] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm block ${isSelected ? "font-medium text-[#0a2105]" : "text-gray-800"}`}>{exp.label}</span>
                            <span className="text-xs text-gray-400">{exp.season}</span>
                            {"note" in exp && exp.note && <span className="text-xs text-amber-600 block">※ {exp.note}</span>}
                          </div>
                          <span className="text-xs font-semibold text-gray-600 shrink-0">{exp.price}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleExperiencesSave}
                    disabled={experiencesSaved}
                    className="mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                  >
                    {experiencesSaved
                      ? <span className="flex items-center justify-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> 保存しました</span>
                      : "体験オプションを保存"}
                  </button>
                </Section>

                {/* ── 滞在サポートを変更 ── */}
                <Section icon={<FaConciergeBell className="w-3 h-3" />} title="滞在サポートを変更">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-xs text-gray-500">
                      送迎（最寄り駅⇔ログハウス）と食材買い出し代行。
                      料金: {selectedRes.guests >= 5
                        ? <strong className="text-gray-700">¥13,000（¥8,000 + 送迎追加¥5,000）</strong>
                        : <strong className="text-gray-700">¥8,000</strong>}
                    </p>
                    <div className="flex gap-2">
                      {([true, false] as const).map(v => (
                        <button
                          key={String(v)}
                          onClick={() => { setEditSupportPlan(v); setSupportPlanSaved(false); }}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                            editSupportPlan === v
                              ? "border-[#0a2105] bg-[#e8f5e9] text-[#0a2105]"
                              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {v ? "あり" : "なし"}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSupportPlanSave}
                      disabled={supportPlanSaved}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                    >
                      {supportPlanSaved
                        ? <span className="flex items-center justify-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> 保存しました</span>
                        : "滞在サポートを保存"}
                    </button>
                  </div>
                </Section>

                {/* 料金内訳 */}
                <Section icon={<FaYenSign className="w-3 h-3" />} title="料金内訳">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                        <span className="text-gray-600">基本宿泊料</span>
                        <span className="text-gray-900">¥{selectedRes.breakdown.baseAmount.toLocaleString()}</span>
                      </div>
                      {selectedRes.breakdown.guestExtra > 0 && (
                        <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                          <span className="text-gray-600">追加人数料金（6名以上）</span>
                          <span className="text-gray-900">¥{selectedRes.breakdown.guestExtra.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedRes.breakdown.petFee > 0 && (
                        <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><FaDog className="w-3 h-3" /><span>ペット料金</span></div>
                          <span className="text-gray-900">¥{selectedRes.breakdown.petFee.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedRes.breakdown.supportFee > 0 && (
                        <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><FaConciergeBell className="w-3 h-3" /><span>滞在サポート料</span></div>
                          <span className="text-gray-900">¥{selectedRes.breakdown.supportFee.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedRes.breakdown.transferSurcharge > 0 && (
                        <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                          <span className="text-gray-600 pl-4">└ 送迎追加（5名以上）</span>
                          <span className="text-gray-900">¥{selectedRes.breakdown.transferSurcharge.toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedRes.breakdown.adjustment ?? 0) !== 0 && (
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <span className="text-gray-500">
                            料金調整
                            {selectedRes.breakdown.adjustmentNote && (
                              <span className="text-xs text-gray-400 ml-1">（{selectedRes.breakdown.adjustmentNote}）</span>
                            )}
                          </span>
                          <span className={(selectedRes.breakdown.adjustment ?? 0) < 0 ? "text-red-500" : "text-green-600"}>
                            {(selectedRes.breakdown.adjustment ?? 0) < 0 ? "−" : "+"}¥{Math.abs(selectedRes.breakdown.adjustment ?? 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedRes.breakdown.experiencesTotal > 0 && (
                        <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><FaStar className="w-3 h-3" /><span>体験オプション計</span></div>
                          <span className="text-gray-900">¥{selectedRes.breakdown.experiencesTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-gray-50">
                        <span className="text-gray-500">小計</span>
                        <span className="text-gray-700">¥{(
                          selectedRes.breakdown.baseAmount + selectedRes.breakdown.guestExtra +
                          selectedRes.breakdown.petFee + selectedRes.breakdown.supportFee +
                          selectedRes.breakdown.transferSurcharge + selectedRes.breakdown.experiencesTotal
                        ).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                        <span className="text-gray-600">保証料<span className="ml-1.5 text-xs text-green-600 font-medium">返金制</span></span>
                        <span className="text-gray-900">¥{selectedRes.breakdown.deposit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3.5 bg-[#0a2105]">
                      <span className="text-white text-sm font-semibold">お支払い合計（税込）</span>
                      <span className="text-white text-xl font-bold tracking-tight">¥{selectedRes.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">※ お支払いはすべて来場時現金払いとなります</p>
                </Section>

                {/* ── 料金調整 ── */}
                <Section icon={<FaYenSign className="w-3 h-3" />} title="料金調整を変更">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">

                    {/* マスタルール選択 */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-amber-700">マスタから選択</p>
                      {detailApplicableRules.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">現在の条件（人数・日程）に該当する割引なし</p>
                      ) : (
                        <div className="space-y-1">
                          {detailApplicableRules.map(rule => {
                            const accommodationBase = selectedRes.breakdown.baseAmount + selectedRes.breakdown.guestExtra;
                            const discountAmt = Math.round(accommodationBase * rule.discountPercent / 100);
                            const isSelected = editAdjustmentRuleId === rule.id;
                            const blockedByOptions =
                              (rule.noExperienceOptions && (selectedRes.breakdown.experiencesTotal ?? 0) > 0) ||
                              (rule.noSupportPlan && (selectedRes.breakdown.supportFee ?? 0) > 0);
                            return (
                              <button
                                key={rule.id}
                                type="button"
                                disabled={blockedByOptions}
                                onClick={() => {
                                  if (isSelected) {
                                    setEditAdjustmentRuleId("");
                                    setEditAdjustment(0);
                                    setEditAdjustmentNote("");
                                  } else {
                                    setEditAdjustmentRuleId(rule.id);
                                    setEditAdjustment(-discountAmt);
                                    setEditAdjustmentNote(rule.name);
                                  }
                                  setAdjustmentSaved(false);
                                }}
                                title={blockedByOptions
                                  ? [
                                      rule.noExperienceOptions && (selectedRes.breakdown.experiencesTotal ?? 0) > 0 ? "体験オプションが含まれているため適用不可" : "",
                                      rule.noSupportPlan && (selectedRes.breakdown.supportFee ?? 0) > 0 ? "滞在サポートが含まれているため適用不可" : "",
                                    ].filter(Boolean).join(" / ")
                                  : undefined}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded border text-xs transition-all text-left ${
                                  blockedByOptions
                                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                    : isSelected
                                      ? "border-amber-500 bg-white text-amber-800 font-medium"
                                      : "border-amber-200 bg-white/70 text-gray-700 hover:border-amber-400"
                                }`}
                              >
                                <span className="truncate mr-1 flex items-center gap-1">
                                  {blockedByOptions && <FaBan className="w-3 h-3 text-red-400 shrink-0" />}
                                  {rule.name}
                                </span>
                                <span className={`shrink-0 font-semibold ${isSelected ? "text-red-500" : blockedByOptions ? "text-gray-400" : "text-amber-600"}`}>
                                  {rule.discountPercent}% OFF{isSelected ? ` (−¥${discountAmt.toLocaleString()})` : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 手動調整 */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-amber-700">手動調整</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500 shrink-0">¥</span>
                        <input
                          type="number"
                          step="500"
                          value={editAdjustment === 0 ? "" : editAdjustment}
                          onChange={e => {
                            const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                            setEditAdjustment(isNaN(v) ? 0 : v);
                            setEditAdjustmentRuleId("");
                            setAdjustmentSaved(false);
                          }}
                          placeholder="例: -5000 または 3000"
                          className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={editAdjustmentNote}
                        onChange={e => { setEditAdjustmentNote(e.target.value); setAdjustmentSaved(false); }}
                        placeholder="調整理由（任意）"
                        className="w-full px-2 py-1.5 border border-amber-200 rounded text-xs outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                      />
                    </div>

                    {/* プレビュー */}
                    {editAdjustment !== 0 && (
                      <div className="flex justify-between text-xs border-t border-amber-200 pt-2">
                        <span className={editAdjustment < 0 ? "text-red-500" : "text-green-600"}>
                          {editAdjustment < 0 ? "値引き" : "追加料金"}
                        </span>
                        <span className={`font-semibold ${editAdjustment < 0 ? "text-red-500" : "text-green-600"}`}>
                          {editAdjustment < 0 ? "−" : "+"}¥{Math.abs(editAdjustment).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {editAdjustment !== 0 && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>調整後合計</span>
                        <span className="font-semibold text-gray-800">
                          ¥{(selectedRes.totalAmount - (selectedRes.breakdown.adjustment ?? 0) + editAdjustment).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleAdjustmentSave}
                      disabled={adjustmentSaved}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                    >
                      {adjustmentSaved
                        ? <span className="flex items-center justify-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> 保存しました</span>
                        : "料金調整を保存"}
                    </button>
                  </div>
                </Section>

                {/* ── 予約状況の変更 ── */}
                <Section icon={<FaEdit className="w-3 h-3" />} title="予約状況を変更">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      {([
                        { val: "confirmed", label: "確定",       cls: "border-green-400 bg-green-50 text-green-800" },
                        { val: "cancelled", label: "キャンセル", cls: "border-red-400 bg-red-50 text-red-800" },
                        { val: "noshow",    label: "ドタキャン", cls: "border-purple-400 bg-purple-50 text-purple-800" },
                      ] as const).map(({ val, label, cls }) => (
                        <button key={val} onClick={() => { setEditStatus(val); setStatusSaved(false); }}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                            editStatus === val ? cls + " ring-2 ring-offset-1 ring-current" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleStatusSave}
                      disabled={editStatus === selectedRes.status && !statusSaved}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                    >
                      {statusSaved
                        ? <span className="flex items-center justify-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> 保存しました</span>
                        : "予約状況を保存"}
                    </button>
                  </div>
                </Section>

                {/* ── 支払状況の変更 ── */}
                <Section icon={<FaEdit className="w-3 h-3" />} title="支払状況を変更">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      {(["unpaid", "paid", "refunded"] as const).map(s => {
                        const cfg = { unpaid: { label: "未払い", cls: "border-orange-300 bg-orange-50 text-orange-800" }, paid: { label: "支払済", cls: "border-blue-300 bg-blue-50 text-blue-800" }, refunded: { label: "返金済", cls: "border-gray-300 bg-gray-100 text-gray-700" } }[s];
                        const isActive = editPayment === s;
                        return (
                          <button key={s} onClick={() => { setEditPayment(s); setPaymentSaved(false); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${isActive ? cfg.cls + " ring-2 ring-offset-1 ring-current" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={handlePaymentSave}
                      disabled={editPayment === selectedRes.payment && !paymentSaved}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                    >
                      {paymentSaved
                        ? <span className="flex items-center justify-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> 保存しました</span>
                        : "支払状況を保存"}
                    </button>
                  </div>
                </Section>

              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            新規予約モーダル
        ════════════════════════════════════════ */}
        {isNewOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => { setIsNewOpen(false); setMemberQuery(""); setShowMemberDrop(false); }}>
            <div className="bg-white rounded-xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>

              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-4 h-4 text-green-600" />
                  <h3 className="text-base text-gray-900">新規予約登録（電話対応）</h3>
                </div>
                <button onClick={() => { setIsNewOpen(false); setMemberQuery(""); setShowMemberDrop(false); }} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-col lg:flex-row">

                {/* ── 左: フォーム ── */}
                <div className="flex-1 px-6 py-5 space-y-6 min-w-0">

                  {/* 会員選択 */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaUserCheck className="w-3 h-3" /> 会員選択 <span className="text-red-500 normal-case font-normal">*必須</span>
                    </h4>

                    {/* 選択済み会員カード */}
                    {selectedMember ? (
                      <div className="flex items-start gap-3 p-3 bg-[#e8f5e9] border-2 border-[#0a2105] rounded-lg">
                        <div className="w-9 h-9 rounded-full bg-[#0a2105] flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                          {selectedMember.lastName.charAt(0)}
</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0a2105]">{selectedMember.lastName} {selectedMember.firstName}</p>
                          <p className="text-xs text-gray-400">{selectedMember.lastNameKana} {selectedMember.firstNameKana}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{selectedMember.email}</p>
                          <p className="text-xs text-gray-500">{selectedMember.phone} ／ {selectedMember.id}</p>
                          <p className="text-xs text-gray-400 mt-0.5">過去の宿泊: {selectedMember.totalStays}回</p>
                        </div>
                        <button
                          onClick={() => setF("memberId", "")}
                          className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                          title="選択を解除"
                        >
                          <FaTimesCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* 会員検索フィールド */
                      <div ref={memberSearchRef} className="relative">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={memberQuery}
                            onChange={e => { setMemberQuery(e.target.value); setShowMemberDrop(true); }}
                            onFocus={() => setShowMemberDrop(true)}
                            placeholder="氏名・メール・電話番号・会員IDで検索"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                          />
                        </div>

                        {showMemberDrop && (
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                            {memberResults.length === 0 ? (
                              <div className="px-4 py-6 text-center">
                                <p className="text-sm text-gray-500 mb-2">該当する会員が見つかりません</p>
                                <a href="/admin/members" className="inline-flex items-center gap-1 text-xs text-[#0a2105] hover:underline">
                                  <FaExternalLinkAlt className="w-2.5 h-2.5" /> 会員登録ページへ
                                </a>
                              </div>
                            ) : (
                              memberResults.map(m => (
                                <button
                                  key={m.id}
                                  onClick={() => {
                                    setF("memberId", m.id);
                                    setMemberQuery("");
                                    setShowMemberDrop(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#e8f5e9] text-left border-b border-gray-50 last:border-0"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-600 text-xs font-semibold">
                                    {m.lastName.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium">{m.lastName} {m.firstName}</p>
                                    <p className="text-xs text-gray-400">{m.lastNameKana} {m.firstNameKana}</p>
                                    <p className="text-xs text-gray-500 truncate">{m.email} ／ {m.phone}</p>
                                  </div>
                                  <span className="text-xs text-gray-400 shrink-0">{m.id}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}

                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 flex items-start gap-1.5">
                          <span className="shrink-0 mt-0.5">⚠</span>
                          <span>予約には会員登録が必須です。未登録のお客様は先に<a href="/admin/members" className="underline font-medium">会員登録</a>を行ってください。</span>
                        </p>
                      </div>
                    )}
                  </section>

                  {/* 日程 */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaCalendarAlt className="w-3 h-3" /> 日程 <span className="text-red-500 normal-case font-normal">*必須</span>
                    </h4>
                    <AdminDateRangePicker
                      checkIn={newForm.checkIn}
                      checkOut={newForm.checkOut}
                      onChange={(ci, co) => setNewForm(f => ({ ...f, checkIn: ci, checkOut: co }))}
                    />
                    {newForm.checkIn && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        料金区分: <span className="font-medium text-gray-700">{getDayTypeLabel(newForm.checkIn)}</span>
                        {calc.nights > 0 && <span className="ml-2">/ {calc.nights}泊</span>}
                      </p>
                    )}
                  </section>

                  {/* 人数 */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">宿泊人数</h4>
                    <select value={newForm.guests} onChange={e => setF("guests", Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>
                          {n}名{n > 5 ? `（追加料金 +¥${((n-5)*3000).toLocaleString()}）` : "（推奨）"}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">※ 最大10名。6名以上は1名につき¥3,000の追加料金（泊数×人数分）</p>
                  </section>

                  {/* ペット */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaDog className="w-3 h-3" /> ペット同伴
                    </h4>
                    <select value={newForm.pets} onChange={e => setF("pets", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none">
                      <option value="none">なし</option>
                      <option value="small1">小型犬1頭（+¥2,500/泊）</option>
                      <option value="small2">小型犬2頭（+¥4,000/泊）</option>
                      <option value="large1">大型犬1頭（+¥3,500/泊）</option>
                      <option value="large2">大型犬2頭（+¥6,000/泊）</option>
                    </select>
                    {(newForm.pets === "small1" || newForm.pets === "large1") && (
                      <input type="text" value={newForm.petBreed} onChange={e => setF("petBreed", e.target.value)}
                        placeholder="犬種・名前（例: トイプードル、ぽち）"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none" />
                    )}
                    {(newForm.pets === "small2" || newForm.pets === "large2") && (
                      <div className="mt-2 space-y-2">
                        <input type="text" value={newForm.petBreed} onChange={e => setF("petBreed", e.target.value)}
                          placeholder="①1頭目 ─ 犬種・名前"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none" />
                        <input type="text" value={newForm.petBreed2} onChange={e => setF("petBreed2", e.target.value)}
                          placeholder="②2頭目 ─ 犬種・名前"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none" />
                      </div>
                    )}
                  </section>

                  {/* 滞在サポート */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaConciergeBell className="w-3 h-3" /> 滞在サポート（任意）
                    </h4>
                    {selectedAdjustmentRule?.noSupportPlan ? (
                      <div className="flex items-start gap-2 px-3 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <FaBan className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-700">
                          「{selectedAdjustmentRule.name}」は滞在サポート選択不可の割引です。サポートを追加するにはルールの選択を解除してください。
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600 leading-relaxed">
                          送迎（最寄り駅⇔ログハウス）と食材買い出し代行が利用できます。<br />
                          料金: {newForm.guests >= 5 ? <strong>¥13,000（¥8,000 + 送迎追加¥5,000）</strong> : <strong>¥8,000</strong>}
                          {newForm.guests >= 5 && <span className="text-orange-600"> ※5名以上のため送迎追加¥5,000が加算</span>}
                        </div>
                        <div className="flex gap-2">
                          {[true, false].map(v => (
                            <button key={String(v)} onClick={() => setF("supportPlan", v)}
                              className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all ${newForm.supportPlan === v ? "border-[#0a2105] bg-[#e8f5e9] text-[#0a2105] font-medium" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                              {v ? "あり" : "なし"}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </section>

                  {/* 体験オプション */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FaStar className="w-3 h-3" /> 体験オプション（複数選択可）
                    </h4>
                    {optionsDisabledByRule ? (
                      <div className="flex items-start gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-lg">
                        <FaBan className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                          「{selectedAdjustmentRule?.name}」はオプション選択不可の割引です。体験オプションを追加するにはルールの選択を解除してください。
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {EXPERIENCE_LIST.map(exp => {
                          const isSelected = newForm.experiences.includes(exp.label);
                          return (
                            <label key={exp.label}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "border-[#0a2105] bg-[#e8f5e9]" : "border-gray-200 hover:bg-gray-50"}`}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleExp(exp.label)}
                                className="w-4 h-4 accent-[#0a2105] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm block ${isSelected ? "font-medium text-[#0a2105]" : "text-gray-800"}`}>{exp.label}</span>
                                <span className="text-xs text-gray-400">{exp.season}</span>
                                {"note" in exp && exp.note && <span className="text-xs text-amber-600 block">※ {exp.note}</span>}
                              </div>
                              <span className="text-xs font-semibold text-gray-600 shrink-0">{exp.price}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* 備考 */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">備考・ご要望</h4>
                    <textarea value={newForm.note} onChange={e => setF("note", e.target.value)}
                      placeholder="アレルギー、到着時間の目安、特別なご要望など"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#0a2105] outline-none" />
                  </section>

                  {/* 予約・支払状況 */}
                  <section>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">予約・支払状況</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">予約状況</label>
                        <select value={newForm.status} onChange={e => setF("status", e.target.value as NewForm["status"])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none">
                          <option value="confirmed">確定</option>
                          <option value="cancelled">キャンセル</option>
                          <option value="noshow">ドタキャン</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">支払状況</label>
                        <select value={newForm.payment} onChange={e => setF("payment", e.target.value as NewForm["payment"])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none">
                          <option value="unpaid">未払い</option>
                          <option value="paid">支払済</option>
                          <option value="refunded">返金済</option>
                        </select>
                      </div>
                    </div>
                  </section>

                </div>

                {/* ── 右: 料金サマリー（スティッキー） ── */}
                <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200">
                  <div className="px-5 py-5 lg:sticky lg:top-0">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">料金プレビュー</h4>

                    {calc.nights === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">日程を入力すると<br />料金が表示されます</p>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500">基本宿泊料</span>
                          <span className="text-gray-800">¥{calc.baseAmount.toLocaleString()}</span>
                        </div>
                        {calc.guestExtra > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">追加人数</span>
                            <span className="text-gray-800">¥{calc.guestExtra.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.petFee > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">ペット料金</span>
                            <span className="text-gray-800">¥{calc.petFee.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.supportFee > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">滞在サポート</span>
                            <span className="text-gray-800">¥{calc.supportFee.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.transferSurcharge > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500 pl-3">└ 送迎追加</span>
                            <span className="text-gray-800">¥{calc.transferSurcharge.toLocaleString()}</span>
                          </div>
                        )}
                        {calc.experiencesTotal > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">体験オプション</span>
                            <span className="text-gray-800">¥{calc.experiencesTotal.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
                          <span className="text-gray-400">小計</span>
                          <span className="text-gray-600">¥{(calc.total - calc.deposit).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500">保証料 <span className="text-green-600 text-xs">返金制</span></span>
                          <span className="text-gray-800">¥{calc.deposit.toLocaleString()}</span>
                        </div>

                        {/* ── 料金調整 ── */}
                        <div className="pt-2 pb-1 border-b border-dashed border-amber-300 space-y-2">
                          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            <span>✎</span> 料金調整（管理者）
                          </p>

                          {/* マスタルール選択 */}
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">マスタから選択</p>
                            {calc.nights === 0 ? (
                              <p className="text-xs text-gray-400 italic">日程を入力後に選択できます</p>
                            ) : applicableRules.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">現在の条件に該当する割引なし</p>
                            ) : (
                              <div className="space-y-1">
                                {applicableRules.map(rule => {
                                  const accommodationBase = calc.baseAmount + calc.guestExtra;
                                  const discountAmt = Math.round(accommodationBase * rule.discountPercent / 100);
                                  const isSelected = newForm.selectedRuleId === rule.id;
                                  return (
                                    <button
                                      key={rule.id}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          setNewForm(f => ({ ...f, selectedRuleId: "", adjustment: 0, adjustmentNote: "" }));
                                        } else {
                                          setNewForm(f => ({
                                            ...f,
                                            selectedRuleId: rule.id,
                                            adjustment: -discountAmt,
                                            adjustmentNote: rule.name,
                                            experiences: rule.noExperienceOptions ? [] : f.experiences,
                                            supportPlan: rule.noSupportPlan ? false : f.supportPlan,
                                          }));
                                        }
                                      }}
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border text-xs transition-all text-left ${
                                        isSelected
                                          ? "border-amber-400 bg-amber-50 text-amber-800"
                                          : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                                      }`}
                                    >
                                      <span className="font-medium truncate mr-1">{rule.name}</span>
                                      <span className={`shrink-0 font-semibold ${isSelected ? "text-red-500" : "text-gray-500"}`}>
                                        {rule.discountPercent}% OFF {isSelected ? `(−¥${discountAmt.toLocaleString()})` : ""}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* 手動調整 */}
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">手動調整</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500 shrink-0">¥</span>
                              <input
                                type="number"
                                step="500"
                                value={newForm.adjustment === 0 ? "" : newForm.adjustment}
                                onChange={e => {
                                  const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                                  setNewForm(f => ({ ...f, adjustment: isNaN(v) ? 0 : v, selectedRuleId: "" }));
                                }}
                                placeholder="例: -5000 または 3000"
                                className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm outline-none focus:ring-1 focus:ring-amber-400 bg-amber-50"
                              />
                            </div>
                            <input
                              type="text"
                              value={newForm.adjustmentNote}
                              onChange={e => setF("adjustmentNote", e.target.value)}
                              placeholder="調整理由（任意）"
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-amber-400"
                            />
                          </div>

                          {newForm.adjustment !== 0 && (
                            <div className="flex justify-between text-xs">
                              <span className={newForm.adjustment < 0 ? "text-red-500" : "text-green-600"}>
                                {newForm.adjustment < 0 ? "値引き" : "追加料金"}
                              </span>
                              <span className={`font-medium ${newForm.adjustment < 0 ? "text-red-500" : "text-green-600"}`}>
                                {newForm.adjustment < 0 ? "−" : "+"}¥{Math.abs(newForm.adjustment).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 mt-1">
                          <span className="text-sm font-semibold text-gray-700">合計</span>
                          <span className="text-xl font-bold text-[#0a2105]">¥{(calc.total + newForm.adjustment).toLocaleString()}</span>
                        </div>
                        {newForm.adjustment !== 0 && (
                          <p className="text-xs text-gray-400 text-right">（定価: ¥{calc.total.toLocaleString()}）</p>
                        )}
                        <p className="text-xs text-gray-400 pt-1">※ 来場時現金払い</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* フッター */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={() => { setIsNewOpen(false); setMemberQuery(""); setShowMemberDrop(false); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
                  キャンセル
                </button>
                <button
                  onClick={handleNewSave}
                  disabled={!newForm.memberId || !newForm.checkIn || !newForm.checkOut || calc.nights <= 0}
                  className="flex-1 py-2.5 bg-[#0a2105] text-white rounded-lg text-sm font-medium hover:bg-[#071a04] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  予約を登録する
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
