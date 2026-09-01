import { useState, useMemo, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaCalendarAlt,
    FaSearch,
    FaPlus,
    FaEye,
    FaTimes,
    FaFilter,
    FaUser,
    FaBed,
    FaStar,
    FaYenSign,
    FaDog,
    FaConciergeBell,
    FaEdit,
    FaCheckCircle,
    FaUserCheck,
    FaTimesCircle,
    FaExternalLinkAlt,
    FaChevronLeft,
    FaChevronRight,
    FaBan,
} from "react-icons/fa";

// ── 型定義 ──
interface Member {
    id: string;
    dbId: number;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    email: string;
    phone: string;
    joinedAt: string;
    totalStays: number;
}

interface PriceRule {
    id: string;
    dbId: number;
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

interface ExperienceDetail {
    name: string;
    price: number;
    priceNote: string;
}

interface PriceBreakdown {
    baseAmount: number;
    guestExtra: number;
    petFee: number;
    supportFee: number;
    transferSurcharge: number;
    experiencesTotal: number;
    deposit: number;
    adjustment?: number;
    adjustmentNote?: string;
    adjustmentRuleId?: string;
}

interface Reservation {
    id: string;
    dbId: number;
    memberId: string;
    memberName: string;
    memberEmail: string;
    memberPhone: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    hasPet: string;
    petBreed?: string;
    supportFee: boolean;
    experiences: string[];
    breakdown: PriceBreakdown;
    status: string;
    payment: string;
    totalAmount: number;
    note?: string;
    createdAt: string;
}

// ── 料金定数 ──
const PET_FEES: Record<string, number> = {
    none: 0,
    small1: 2500,
    small2: 4000,
    large1: 3500,
    large2: 6000,
};
const PET_LABELS: Record<string, string> = {
    none: "なし",
    small1: "小型犬1頭",
    small2: "小型犬2頭",
    large1: "大型犬1頭",
    large2: "大型犬2頭",
};
const EXP_MAP: Record<
    string,
    { perPerson: boolean; amount: number; priceNote: string }
> = {
    田植え体験: { perPerson: true, amount: 4500, priceNote: "¥4,500/人" },
    稲刈り体験: { perPerson: true, amount: 4500, priceNote: "¥4,500/人" },
    薪割り体験: { perPerson: false, amount: 2000, priceNote: "¥2,000/時間" },
    夏野菜収穫体験: {
        perPerson: false,
        amount: 1500,
        priceNote: "¥1,500/カゴ",
    },
    BBQグリルレンタル: {
        perPerson: false,
        amount: 3500,
        priceNote: "¥3,500/回",
    },
    星空ガイド: { perPerson: false, amount: 2000, priceNote: "¥2,000/組" },
};
const EXPERIENCE_LIST = [
    { label: "田植え体験", season: "5月〜6月", price: "¥4,500/人" },
    { label: "稲刈り体験", season: "9月〜10月", price: "¥4,500/人" },
    { label: "薪割り体験", season: "通年", price: "¥2,000/時間" },
    { label: "夏野菜収穫体験", season: "7月〜8月", price: "¥1,500/カゴ" },
    { label: "BBQグリルレンタル", season: "通年", price: "¥3,500/回" },
    {
        label: "星空ガイド",
        season: "通年（晴天時）",
        price: "¥2,000/組",
        note: "ガイドなしは無料",
    },
];

// ── ユーティリティ ──
function calcNights(ci: string, co: string): number {
    if (!ci || !co) return 0;
    return Math.round(
        (new Date(co).getTime() - new Date(ci).getTime()) / 86400000,
    );
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
function petDisplayLabel(hasPet: string, breed?: string) {
    const base = PET_LABELS[hasPet] ?? hasPet;
    return hasPet === "none" ? base : `${base}${breed ? `（${breed}）` : ""}`;
}
function getExpDetails(res: Reservation): ExperienceDetail[] {
    return (res.experiences ?? []).map((label) => ({
        name: label,
        price: EXP_MAP[label]?.perPerson
            ? EXP_MAP[label].amount * res.guests
            : (EXP_MAP[label]?.amount ?? 0),
        priceNote: EXP_MAP[label]?.priceNote ?? "",
    }));
}

// ── バッジ ──
const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        confirmed: { label: "確定", cls: "bg-green-100 text-green-800" },
        cancelled: { label: "キャンセル", cls: "bg-red-100 text-red-800" },
        noshow: { label: "ドタキャン", cls: "bg-purple-100 text-purple-800" },
        pending: { label: "保留中", cls: "bg-yellow-100 text-yellow-800" },
        paid: { label: "支払済", cls: "bg-blue-100 text-blue-800" },
        unpaid: { label: "未払い", cls: "bg-orange-100 text-orange-800" },
        refunded: { label: "返金済", cls: "bg-gray-100 text-gray-600" },
    };
    const s = map[status] || {
        label: status,
        cls: "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>
            {s.label}
        </span>
    );
};

// ── 共通UIパーツ ──
function Section({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-gray-400">{icon}</span>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {title}
                </h4>
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

// ── 管理者用カレンダー ──
const CAL_YEAR = 2026;
const CAL_SEASON_START = 2;
const CAL_SEASON_END = 11;
const CAL_CLOSED_DOW = [2, 3, 4];
const CAL_DOW_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const CAL_MONTH_NAMES = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
];

type CalStatus = "available" | "booked" | "unavailable" | "off";

function getAdminDayStatus(
    month: number,
    day: number,
    availabilities: Record<string, string>,
    bookedDatesSet: Set<string>,
): CalStatus {
    if (month < CAL_SEASON_START || month > CAL_SEASON_END) return "off";
    const dateStr = `${CAL_YEAR}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dow = new Date(CAL_YEAR, month, day).getDay();

    if (bookedDatesSet.has(dateStr)) return "booked";

    const avStatus = availabilities[dateStr];
    if (avStatus) {
        if (avStatus === "available") return "available";
        if (avStatus === "offseason") return "off";
        if (avStatus === "closed") return "unavailable";
        return "booked";
    }

    if (CAL_CLOSED_DOW.includes(dow)) return "unavailable";
    return "available";
}

function adminFmtDate(month: number, day: number): string {
    return `${CAL_YEAR}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface AdminDateRangePickerProps {
    checkIn: string;
    checkOut: string;
    onChange: (ci: string, co: string) => void;
    availabilities: Record<string, string>;
    bookedDates: string[];
}

function AdminDateRangePicker({
    checkIn,
    checkOut,
    onChange,
    availabilities,
    bookedDates,
}: AdminDateRangePickerProps) {
    const [viewMonth, setViewMonth] = useState(() => {
        const now = new Date();
        const m = now.getMonth();
        return m >= CAL_SEASON_START && m <= CAL_SEASON_END
            ? m
            : CAL_SEASON_START;
    });

    useEffect(() => {
        if (!checkIn) return;
        const m = Number(checkIn.split("-")[1]) - 1;
        if (m >= CAL_SEASON_START && m <= CAL_SEASON_END) setViewMonth(m);
    }, [checkIn]);

    const bookedDatesSet = useMemo(() => new Set(bookedDates), [bookedDates]);

    const cells = useMemo(() => {
        const daysInMonth = new Date(CAL_YEAR, viewMonth + 1, 0).getDate();
        const firstDow = new Date(CAL_YEAR, viewMonth, 1).getDay();
        type Cell = {
            day: number;
            dateStr: string;
            status: CalStatus;
            dow: number;
        };
        const items: Cell[] = [];
        for (let i = 0; i < firstDow; i++)
            items.push({ day: 0, dateStr: "", status: "off", dow: i });
        for (let d = 1; d <= daysInMonth; d++) {
            const dow = new Date(CAL_YEAR, viewMonth, d).getDay();
            items.push({
                day: d,
                dateStr: adminFmtDate(viewMonth, d),
                status: getAdminDayStatus(
                    viewMonth,
                    d,
                    availabilities,
                    bookedDatesSet,
                ),
                dow,
            });
        }
        while (items.length % 7 !== 0)
            items.push({ day: 0, dateStr: "", status: "off", dow: 0 });
        return items;
    }, [viewMonth, availabilities, bookedDatesSet]);

    const isSelectingCO = !!checkIn && !checkOut;

    const handleClick = (dateStr: string, status: CalStatus) => {
        if (!dateStr || status !== "available") return;
        if (!checkIn || (checkIn && checkOut)) {
            onChange(dateStr, "");
        } else {
            if (dateStr > checkIn) {
                onChange(checkIn, dateStr);
            } else {
                onChange(dateStr, "");
            }
        }
    };

    const symMap: Record<CalStatus, { sym: string; cls: string }> = {
        available: { sym: "◎", cls: "text-green-600" },
        booked: { sym: "×", cls: "text-red-500" },
        unavailable: { sym: "休", cls: "text-gray-300" },
        off: { sym: "", cls: "" },
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a2105]">
                <button
                    onClick={() =>
                        setViewMonth((m) => Math.max(CAL_SEASON_START, m - 1))
                    }
                    disabled={viewMonth <= CAL_SEASON_START}
                    className="p-1.5 rounded text-white/60 hover:text-white disabled:opacity-25 transition-opacity"
                >
                    <FaChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-white text-sm font-semibold tracking-wide">
                    {CAL_YEAR}年 {CAL_MONTH_NAMES[viewMonth]}
                </span>
                <button
                    onClick={() =>
                        setViewMonth((m) => Math.min(CAL_SEASON_END, m + 1))
                    }
                    disabled={viewMonth >= CAL_SEASON_END}
                    className="p-1.5 rounded text-white/60 hover:text-white disabled:opacity-25 transition-opacity"
                >
                    <FaChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div
                className={`px-3 py-1.5 text-center border-b border-gray-100 text-xs ${isSelectingCO ? "bg-green-50" : "bg-gray-50"}`}
            >
                {!checkIn && (
                    <span className="text-gray-500">
                        ① チェックイン日をクリックしてください
                    </span>
                )}
                {checkIn && !checkOut && (
                    <span className="text-green-700 font-medium">
                        ② チェックアウト日を選択（IN: {checkIn}）
                        <button
                            onClick={() => onChange("", "")}
                            className="ml-2 text-red-400 hover:text-red-600 font-normal underline"
                        >
                            リセット
                        </button>
                    </span>
                )}
                {checkIn && checkOut && (
                    <span className="text-gray-700 font-medium">
                        {checkIn} → {checkOut}　{calcNights(checkIn, checkOut)}
                        泊
                        <button
                            onClick={() => onChange("", "")}
                            className="ml-2 text-red-400 hover:text-red-600 font-normal underline text-xs"
                        >
                            リセット
                        </button>
                    </span>
                )}
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {CAL_DOW_NAMES.map((d, i) => (
                    <div
                        key={d}
                        className={`py-1.5 text-center text-xs font-semibold ${
                            i === 0
                                ? "text-red-500"
                                : i === 6
                                  ? "text-blue-600"
                                  : CAL_CLOSED_DOW.includes(i)
                                    ? "text-gray-300"
                                    : "text-gray-500"
                        }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 p-1.5 gap-0.5">
                {cells.map((cell, i) => {
                    if (!cell.day) return <div key={`e-${i}`} />;

                    const isCI = cell.dateStr === checkIn;
                    const isCO = cell.dateStr === checkOut;
                    const inRng = !!(
                        checkIn &&
                        checkOut &&
                        cell.dateStr > checkIn &&
                        cell.dateStr < checkOut
                    );
                    const isCOCandidate =
                        isSelectingCO &&
                        cell.status === "available" &&
                        cell.dateStr > checkIn;
                    const clickable = cell.status === "available";

                    let wrapCls =
                        "relative flex flex-col items-center justify-center min-h-[2.75rem] rounded text-center transition-all ";
                    if (isCI || isCO) {
                        wrapCls += "bg-[#0a2105] ";
                    } else if (inRng) {
                        wrapCls += "bg-[#0a2105]/10 rounded-none ";
                    } else if (isCOCandidate) {
                        wrapCls +=
                            "ring-2 ring-green-500 cursor-pointer hover:bg-green-50 ";
                    } else if (clickable) {
                        wrapCls += "cursor-pointer hover:bg-gray-100 ";
                    }

                    const dayCls =
                        isCI || isCO
                            ? "text-white font-bold"
                            : cell.dow === 0
                              ? "text-red-500"
                              : cell.dow === 6
                                ? "text-blue-600"
                                : cell.status === "unavailable"
                                  ? "text-gray-300"
                                  : cell.status === "off"
                                    ? "text-gray-200"
                                    : "text-gray-800";

                    const sym = isCI
                        ? "IN"
                        : isCO
                          ? "OUT"
                          : symMap[cell.status].sym;
                    const symCls =
                        isCI || isCO
                            ? "text-white/80"
                            : symMap[cell.status].cls;

                    return (
                        <button
                            key={cell.dateStr}
                            disabled={!clickable}
                            onClick={() =>
                                handleClick(cell.dateStr, cell.status)
                            }
                            className={wrapCls}
                            title={
                                !clickable && cell.status !== "off"
                                    ? `${cell.dateStr}: ${cell.status === "booked" ? "予約済み" : "定休日"}`
                                    : undefined
                            }
                        >
                            <span className={`text-xs leading-tight ${dayCls}`}>
                                {cell.day}
                            </span>
                            <span
                                className={`text-[10px] leading-tight font-bold ${symCls}`}
                            >
                                {sym}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-4 flex-wrap px-3 py-2 border-t border-gray-100 bg-gray-50">
                {[
                    { sym: "◎", cls: "text-green-600", label: "空きあり" },
                    { sym: "×", cls: "text-red-500", label: "予約済み" },
                    {
                        sym: "休",
                        cls: "text-gray-400",
                        label: "定休日（火水木）",
                    },
                ].map(({ sym, cls, label }) => (
                    <div key={label} className="flex items-center gap-1">
                        <span className={`text-xs font-bold ${cls}`}>
                            {sym}
                        </span>
                        <span className="text-xs text-gray-500">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── 新規予約フォーム型 ──
interface NewForm {
    memberId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    pets: string;
    petBreed: string;
    petBreed2: string;
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
    checkIn: "",
    checkOut: "",
    guests: 2,
    pets: "none",
    petBreed: "",
    petBreed2: "",
    supportPlan: true,
    experiences: [],
    note: "",
    status: "confirmed",
    payment: "unpaid",
    adjustment: 0,
    adjustmentNote: "",
    selectedRuleId: "",
};

// ── 料金計算（新規フォーム用） ──
function calcFromForm(f: NewForm) {
    const nights = calcNights(f.checkIn, f.checkOut);
    const baseRate = getBaseRate(f.checkIn);
    const baseAmount = baseRate * nights;
    const guestExtra = f.guests > 5 ? (f.guests - 5) * 3000 * nights : 0;
    const petFee = (PET_FEES[f.pets] || 0) * nights;
    const supportFee = f.supportPlan ? 8000 : 0;
    const transferSurcharge = f.supportPlan && f.guests >= 5 ? 5000 : 0;
    const experiencesTotal = f.experiences.reduce((acc, label) => {
        const info = EXP_MAP[label];
        if (!info) return acc;
        return acc + (info.perPerson ? info.amount * f.guests : info.amount);
    }, 0);
    const deposit = 10000;
    const total =
        baseAmount +
        guestExtra +
        petFee +
        supportFee +
        transferSurcharge +
        experiencesTotal +
        deposit;
    return {
        nights,
        baseRate,
        baseAmount,
        guestExtra,
        petFee,
        supportFee,
        transferSurcharge,
        experiencesTotal,
        deposit,
        total,
    };
}

// ────────────────────────────────────────────────────
export default function Reservations({
    reservations,
    priceAdjustmentRules,
    members,
    availabilities,
    bookedDates,
}: {
    reservations: Reservation[];
    priceAdjustmentRules: PriceRule[];
    members: Member[];
    availabilities: Record<string, string>;
    bookedDates: string[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPayment, setFilterPayment] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // 詳細モーダル
    const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
    const [editPayment, setEditPayment] = useState<
        "paid" | "unpaid" | "refunded"
    >("unpaid");
    const [paymentSaved, setPaymentSaved] = useState(false);
    const [editStatus, setEditStatus] = useState<
        "confirmed" | "cancelled" | "noshow"
    >("confirmed");
    const [statusSaved, setStatusSaved] = useState(false);
    const [editAdjustment, setEditAdjustment] = useState<number>(0);
    const [editAdjustmentNote, setEditAdjustmentNote] = useState<string>("");
    const [editAdjustmentRuleId, setEditAdjustmentRuleId] =
        useState<string>("");
    const [adjustmentSaved, setAdjustmentSaved] = useState(false);
    const [editExperiences, setEditExperiences] = useState<string[]>([]);
    const [experiencesSaved, setExperiencesSaved] = useState(false);
    const [editSupportPlan, setEditSupportPlan] = useState(false);
    const [supportPlanSaved, setSupportPlanSaved] = useState(false);

    // 新規予約モーダル
    const [isNewOpen, setIsNewOpen] = useState(false);
    const [newForm, setNewForm] = useState<NewForm>(emptyNewForm);
    const [memberQuery, setMemberQuery] = useState("");
    const [showMemberDrop, setShowMemberDrop] = useState(false);
    const memberSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showMemberDrop) return;
        const handler = (e: MouseEvent) => {
            if (
                memberSearchRef.current &&
                !memberSearchRef.current.contains(e.target as Node)
            ) {
                setShowMemberDrop(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showMemberDrop]);

    const filtered = useMemo(
        () =>
            reservations.filter((r) => {
                const matchSearch =
                    !searchQuery ||
                    r.memberName.includes(searchQuery) ||
                    r.id.includes(searchQuery) ||
                    r.memberEmail.includes(searchQuery);
                const matchStatus =
                    filterStatus === "all" || r.status === filterStatus;
                const matchPayment =
                    filterPayment === "all" || r.payment === filterPayment;
                return matchSearch && matchStatus && matchPayment;
            }),
        [reservations, searchQuery, filterStatus, filterPayment],
    );

    // 詳細モーダルを開く
    const openDetail = (r: Reservation) => {
        setSelectedRes(r);
        setEditPayment(
            (r.payment as "paid" | "unpaid" | "refunded") || "unpaid",
        );
        setPaymentSaved(false);
        setEditStatus(
            (r.status as "confirmed" | "cancelled" | "noshow") || "confirmed",
        );
        setStatusSaved(false);
        setEditAdjustment(r.breakdown?.adjustment ?? 0);
        setEditAdjustmentNote(r.breakdown?.adjustmentNote ?? "");
        setEditAdjustmentRuleId(r.breakdown?.adjustmentRuleId ?? "");
        setAdjustmentSaved(false);
        setEditExperiences(r.experiences ?? []);
        setExperiencesSaved(false);
        setEditSupportPlan(r.supportFee);
        setSupportPlanSaved(false);
    };

    // 支払状況更新
    const handlePaymentSave = () => {
        if (!selectedRes) return;
        router.patch(
            `/admin/reservations/${selectedRes.dbId}/payment`,
            { payment: editPayment },
            {
                preserveState: true,
                onSuccess: () => setPaymentSaved(true),
            },
        );
    };

    // 体験オプション更新
    const handleExperiencesSave = () => {
        if (!selectedRes) return;
        router.patch(
            `/admin/reservations/${selectedRes.dbId}/experiences`,
            { experiences: editExperiences },
            {
                preserveState: true,
                onSuccess: () => setExperiencesSaved(true),
            },
        );
    };

    // 滞在サポート更新
    const handleSupportPlanSave = () => {
        if (!selectedRes) return;
        router.patch(
            `/admin/reservations/${selectedRes.dbId}/support`,
            { support_fee: editSupportPlan },
            {
                preserveState: true,
                onSuccess: () => setSupportPlanSaved(true),
            },
        );
    };

    // 料金調整更新
    const handleAdjustmentSave = () => {
        if (!selectedRes) return;
        router.patch(
            `/admin/reservations/${selectedRes.dbId}/adjustment`,
            {
                adjustment: editAdjustment,
                adjustment_note: editAdjustmentNote,
                adjustment_rule_id: editAdjustmentRuleId || null,
            },
            {
                preserveState: true,
                onSuccess: () => setAdjustmentSaved(true),
            },
        );
    };

    // 予約状況更新
    const handleStatusSave = () => {
        if (!selectedRes) return;
        router.patch(
            `/admin/reservations/${selectedRes.dbId}`,
            { status: editStatus },
            {
                preserveState: true,
                onSuccess: () => setStatusSaved(true),
            },
        );
    };

    // 新規フォーム変更
    const setF = <K extends keyof NewForm>(key: K, val: NewForm[K]) =>
        setNewForm((f) => ({ ...f, [key]: val }));

    const toggleExp = (label: string) =>
        setNewForm((f) => ({
            ...f,
            experiences: f.experiences.includes(label)
                ? f.experiences.filter((e) => e !== label)
                : [...f.experiences, label],
        }));

    const selectedMember = useMemo(
        () => members.find((m) => m.id === newForm.memberId) ?? null,
        [newForm.memberId, members],
    );

    const memberResults = useMemo(() => {
        if (!memberQuery.trim()) return members;
        const q = memberQuery.trim().toLowerCase();
        return members.filter((m) => {
            const fullName = `${m.lastName}${m.firstName}`;
            const fullKana = `${m.lastNameKana}${m.firstNameKana}`;
            return (
                fullName.includes(memberQuery) ||
                fullKana.includes(memberQuery) ||
                m.email.toLowerCase().includes(q) ||
                m.phone.includes(memberQuery) ||
                m.id.toLowerCase().includes(q)
            );
        });
    }, [memberQuery, members]);

    const calc = useMemo(() => calcFromForm(newForm), [newForm]);

    // 詳細モーダル用 適用可能ルール
    const detailApplicableRules = useMemo(() => {
        if (!selectedRes) return [];
        return priceAdjustmentRules.filter((rule) => {
            if (rule.hasGuestRange) {
                if (
                    rule.guestMin !== null &&
                    selectedRes.guests < rule.guestMin
                )
                    return false;
                if (
                    rule.guestMax !== null &&
                    selectedRes.guests > rule.guestMax
                )
                    return false;
            }
            if (rule.hasPeriod && selectedRes.checkIn) {
                if (
                    selectedRes.checkIn < rule.periodStart ||
                    selectedRes.checkIn > rule.periodEnd
                )
                    return false;
            }
            return true;
        });
    }, [selectedRes, priceAdjustmentRules]);

    const detailSelectedRule = useMemo(
        () =>
            priceAdjustmentRules.find((r) => r.id === editAdjustmentRuleId) ??
            null,
        [editAdjustmentRuleId, priceAdjustmentRules],
    );

    const selectedAdjustmentRule = useMemo(
        () =>
            priceAdjustmentRules.find((r) => r.id === newForm.selectedRuleId) ??
            null,
        [newForm.selectedRuleId, priceAdjustmentRules],
    );
    const optionsDisabledByRule =
        selectedAdjustmentRule?.noExperienceOptions ?? false;

    const applicableRules = useMemo(() => {
        return priceAdjustmentRules.filter((rule) => {
            if (rule.hasGuestRange) {
                if (rule.guestMin !== null && newForm.guests < rule.guestMin)
                    return false;
                if (rule.guestMax !== null && newForm.guests > rule.guestMax)
                    return false;
            }
            if (rule.hasPeriod && newForm.checkIn) {
                if (
                    newForm.checkIn < rule.periodStart ||
                    newForm.checkIn > rule.periodEnd
                )
                    return false;
            }
            return true;
        });
    }, [newForm.guests, newForm.checkIn, priceAdjustmentRules]);

    // 新規予約保存
    const handleNewSave = () => {
        if (
            !newForm.memberId ||
            !newForm.checkIn ||
            !newForm.checkOut ||
            calc.nights <= 0
        )
            return;
        const member = members.find((m) => m.id === newForm.memberId);
        if (!member) return;
        const actualExperiences = optionsDisabledByRule
            ? []
            : newForm.experiences;
        router.post(
            "/admin/reservations",
            {
                member_db_id: member.dbId,
                check_in: newForm.checkIn,
                check_out: newForm.checkOut,
                guests: newForm.guests,
                has_pet: newForm.pets,
                pet_breed:
                    newForm.pets !== "none"
                        ? newForm.pets === "small2" || newForm.pets === "large2"
                            ? [newForm.petBreed, newForm.petBreed2]
                                  .filter(Boolean)
                                  .join(" / ")
                            : newForm.petBreed
                        : null,
                support_fee: selectedAdjustmentRule?.noSupportPlan
                    ? false
                    : newForm.supportPlan,
                experiences: actualExperiences,
                status: newForm.status,
                payment: newForm.payment,
                note: newForm.note || null,
                adjustment:
                    newForm.adjustment !== 0 ? newForm.adjustment : null,
                adjustment_note: newForm.adjustmentNote || null,
                adjustment_rule_id: newForm.selectedRuleId || null,
                base_amount: calc.baseAmount,
                guest_extra: calc.guestExtra,
                pet_fee: calc.petFee,
                support_fee_amount: calc.supportFee,
                transfer_surcharge: calc.transferSurcharge,
                experiences_total: calc.experiencesTotal,
                deposit: calc.deposit,
                total: calc.total + newForm.adjustment,
            },
            {
                onSuccess: () => {
                    setIsNewOpen(false);
                    setNewForm(emptyNewForm);
                    setMemberQuery("");
                },
            },
        );
    };

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
                                    <h2 className="text-base text-gray-900">
                                        予約一覧
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        総予約数: {reservations.length}件 |
                                        検索結果: {filtered.length}件
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setNewForm(emptyNewForm);
                                    setMemberQuery("");
                                    setShowMemberDrop(false);
                                    setIsNewOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]"
                            >
                                <FaPlus className="w-3 h-3" />{" "}
                                新規予約（電話対応）
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="会員名、予約ID、メールで検索"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <FaFilter className="w-3 h-3" /> 絞り込み
                            </button>
                            {showFilters && (
                                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            予約状況
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(e.target.value)
                                            }
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                                        >
                                            <option value="all">すべて</option>
                                            <option value="confirmed">
                                                確定
                                            </option>
                                            <option value="cancelled">
                                                キャンセル
                                            </option>
                                            <option value="noshow">
                                                ドタキャン
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            支払状況
                                        </label>
                                        <select
                                            value={filterPayment}
                                            onChange={(e) =>
                                                setFilterPayment(e.target.value)
                                            }
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                                        >
                                            <option value="all">すべて</option>
                                            <option value="paid">支払済</option>
                                            <option value="unpaid">
                                                未払い
                                            </option>
                                            <option value="refunded">
                                                返金済
                                            </option>
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
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        予約ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        会員名
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        チェックイン
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        チェックアウト
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        泊数
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        人数
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        金額
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        割引
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        サービス
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        予約状況
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        支払状況
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {r.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {r.memberName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {r.checkIn}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {r.checkOut}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {r.nights}泊
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {r.guests}名
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                            ¥{r.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(() => {
                                                const rule = r.breakdown
                                                    ?.adjustmentRuleId
                                                    ? priceAdjustmentRules.find(
                                                          (p) =>
                                                              p.id ===
                                                              r.breakdown
                                                                  .adjustmentRuleId,
                                                      )
                                                    : null;
                                                const adj =
                                                    r.breakdown?.adjustment ??
                                                    0;
                                                if (rule) {
                                                    return (
                                                        <span
                                                            title={rule.name}
                                                            className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full"
                                                        >
                                                            {rule.name.slice(
                                                                0,
                                                                2,
                                                            )}
                                                        </span>
                                                    );
                                                }
                                                if (adj !== 0) {
                                                    return (
                                                        <span
                                                            title="手動調整"
                                                            className="inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-full"
                                                        >
                                                            手動
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="text-xs text-gray-300">
                                                        —
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span
                                                    title={
                                                        r.supportFee
                                                            ? "滞在サポートあり"
                                                            : "滞在サポートなし"
                                                    }
                                                    className={`flex items-center gap-0.5 text-xs ${r.supportFee ? "text-[#0a2105]" : "text-gray-300"}`}
                                                >
                                                    <FaConciergeBell className="w-3.5 h-3.5" />
                                                </span>
                                                <span
                                                    title={
                                                        r.experiences?.length >
                                                        0
                                                            ? `体験オプション ${r.experiences.length}件`
                                                            : "体験オプションなし"
                                                    }
                                                    className={`flex items-center gap-0.5 text-xs ${r.experiences?.length > 0 ? "text-amber-500" : "text-gray-300"}`}
                                                >
                                                    <FaStar className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {statusBadge(r.status)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {statusBadge(r.payment)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openDetail(r)}
                                                className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                            >
                                                <FaEye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={12}
                                            className="px-6 py-8 text-center text-sm text-gray-400"
                                        >
                                            予約データがありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ════════════════════════════════════════
                    詳細モーダル
                ════════════════════════════════════════ */}
                {selectedRes && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setSelectedRes(null)}
                    >
                        <div
                            className="bg-white rounded-xl w-full max-w-xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">
                                        予約ID: {selectedRes.id}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base text-gray-900">
                                            {selectedRes.memberName}
                                        </h3>
                                        {statusBadge(selectedRes.status)}
                                        {statusBadge(selectedRes.payment)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRes(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-6">
                                <Section
                                    icon={<FaUser className="w-3 h-3" />}
                                    title="宿泊者情報"
                                >
                                    <div className="bg-gray-50 rounded-lg px-4 py-1">
                                        <InfoRow
                                            label="氏名"
                                            value={selectedRes.memberName}
                                        />
                                        <InfoRow
                                            label="メール"
                                            value={
                                                selectedRes.memberEmail || (
                                                    <span className="text-gray-400">
                                                        −
                                                    </span>
                                                )
                                            }
                                        />
                                        <InfoRow
                                            label="電話番号"
                                            value={selectedRes.memberPhone}
                                        />
                                        <InfoRow
                                            label="予約日"
                                            value={selectedRes.createdAt}
                                        />
                                    </div>
                                </Section>

                                <Section
                                    icon={<FaBed className="w-3 h-3" />}
                                    title="宿泊内容"
                                >
                                    <div className="bg-gray-50 rounded-lg px-4 py-1">
                                        <InfoRow
                                            label="チェックイン"
                                            value={selectedRes.checkIn}
                                        />
                                        <InfoRow
                                            label="チェックアウト"
                                            value={selectedRes.checkOut}
                                        />
                                        <InfoRow
                                            label="泊数 / 人数"
                                            value={`${selectedRes.nights}泊 / ${selectedRes.guests}名`}
                                        />
                                        <InfoRow
                                            label="ペット"
                                            value={petDisplayLabel(
                                                selectedRes.hasPet,
                                                selectedRes.petBreed,
                                            )}
                                        />
                                        <InfoRow
                                            label="滞在サポート"
                                            value={
                                                selectedRes.supportFee
                                                    ? "あり"
                                                    : "なし"
                                            }
                                        />
                                        {selectedRes.note && (
                                            <InfoRow
                                                label="備考"
                                                value={selectedRes.note}
                                            />
                                        )}
                                    </div>
                                </Section>

                                <Section
                                    icon={<FaStar className="w-3 h-3" />}
                                    title="体験オプション"
                                >
                                    {getExpDetails(selectedRes).length > 0 ? (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left px-4 py-2 text-xs text-gray-500">
                                                            オプション名
                                                        </th>
                                                        <th className="text-right px-4 py-2 text-xs text-gray-500">
                                                            料金
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getExpDetails(
                                                        selectedRes,
                                                    ).map((exp, i) => (
                                                        <tr
                                                            key={i}
                                                            className="border-b border-gray-100 last:border-0"
                                                        >
                                                            <td className="px-4 py-2.5 text-gray-900">
                                                                {exp.name}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right text-gray-700">
                                                                {exp.price ===
                                                                0 ? (
                                                                    <span className="text-green-600 font-medium">
                                                                        無料
                                                                    </span>
                                                                ) : (
                                                                    `¥${exp.price.toLocaleString()}`
                                                                )}
                                                                <span className="text-xs text-gray-400 ml-1">
                                                                    （
                                                                    {
                                                                        exp.priceNote
                                                                    }
                                                                    ）
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
                                            体験オプションなし
                                        </p>
                                    )}
                                </Section>

                                <Section
                                    icon={<FaStar className="w-3 h-3" />}
                                    title="体験オプションを変更"
                                >
                                    {detailSelectedRule?.noExperienceOptions ? (
                                        <div className="flex items-start gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-lg">
                                            <FaBan className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-700">
                                                「{detailSelectedRule.name}
                                                」はオプション選択不可の割引です。体験オプションを変更するにはルールの選択を解除してください。
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                {EXPERIENCE_LIST.map((exp) => {
                                                    const isSelected =
                                                        editExperiences.includes(
                                                            exp.label,
                                                        );
                                                    return (
                                                        <label
                                                            key={exp.label}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "border-[#0a2105] bg-[#e8f5e9]" : "border-gray-200 hover:bg-gray-50"}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() => {
                                                                    setEditExperiences(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.includes(
                                                                                exp.label,
                                                                            )
                                                                                ? prev.filter(
                                                                                      (
                                                                                          e,
                                                                                      ) =>
                                                                                          e !==
                                                                                          exp.label,
                                                                                  )
                                                                                : [
                                                                                      ...prev,
                                                                                      exp.label,
                                                                                  ],
                                                                    );
                                                                    setExperiencesSaved(
                                                                        false,
                                                                    );
                                                                }}
                                                                className="w-4 h-4 accent-[#0a2105] shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <span
                                                                    className={`text-sm block ${isSelected ? "font-medium text-[#0a2105]" : "text-gray-800"}`}
                                                                >
                                                                    {exp.label}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {exp.season}
                                                                </span>
                                                                {"note" in
                                                                    exp &&
                                                                    exp.note && (
                                                                        <span className="text-xs text-amber-600 block">
                                                                            ※{" "}
                                                                            {
                                                                                exp.note
                                                                            }
                                                                        </span>
                                                                    )}
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-600 shrink-0">
                                                                {exp.price}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={handleExperiencesSave}
                                                disabled={experiencesSaved}
                                                className="mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                                            >
                                                {experiencesSaved ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <FaCheckCircle className="w-3.5 h-3.5" />{" "}
                                                        保存しました
                                                    </span>
                                                ) : (
                                                    "体験オプションを保存"
                                                )}
                                            </button>
                                        </>
                                    )}
                                </Section>

                                <Section
                                    icon={
                                        <FaConciergeBell className="w-3 h-3" />
                                    }
                                    title="滞在サポートを変更"
                                >
                                    {detailSelectedRule?.noSupportPlan ? (
                                        <div className="flex items-start gap-2 px-3 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <FaBan className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-orange-700">
                                                「{detailSelectedRule.name}
                                                」は滞在サポート選択不可の割引です。サポートを変更するにはルールの選択を解除してください。
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <p className="text-xs text-gray-500">
                                                送迎（最寄り駅⇔ログハウス）と食材買い出し代行。
                                                料金:{" "}
                                                {selectedRes.guests >= 5 ? (
                                                    <strong className="text-gray-700">
                                                        ¥13,000（¥8,000 +
                                                        送迎追加¥5,000）
                                                    </strong>
                                                ) : (
                                                    <strong className="text-gray-700">
                                                        ¥8,000
                                                    </strong>
                                                )}
                                            </p>
                                            <div className="flex gap-2">
                                                {([true, false] as const).map(
                                                    (v) => (
                                                        <button
                                                            key={String(v)}
                                                            onClick={() => {
                                                                setEditSupportPlan(
                                                                    v,
                                                                );
                                                                setSupportPlanSaved(
                                                                    false,
                                                                );
                                                            }}
                                                            className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                                                                editSupportPlan ===
                                                                v
                                                                    ? "border-[#0a2105] bg-[#e8f5e9] text-[#0a2105]"
                                                                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {v
                                                                ? "あり"
                                                                : "なし"}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                            <button
                                                onClick={handleSupportPlanSave}
                                                disabled={supportPlanSaved}
                                                className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                                            >
                                                {supportPlanSaved ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <FaCheckCircle className="w-3.5 h-3.5" />{" "}
                                                        保存しました
                                                    </span>
                                                ) : (
                                                    "滞在サポートを保存"
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </Section>

                                <Section
                                    icon={<FaYenSign className="w-3 h-3" />}
                                    title="料金内訳"
                                >
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="divide-y divide-gray-100">
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <span className="text-gray-600">
                                                    基本宿泊料
                                                </span>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {(
                                                        selectedRes.breakdown
                                                            ?.baseAmount || 0
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            {(selectedRes.breakdown
                                                ?.guestExtra || 0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="text-gray-600">
                                                        追加人数料金（6名以上）
                                                    </span>
                                                    <span className="text-gray-900">
                                                        ¥
                                                        {selectedRes.breakdown.guestExtra.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {(selectedRes.breakdown?.petFee ||
                                                0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <FaDog className="w-3 h-3" />
                                                        <span>ペット料金</span>
                                                    </div>
                                                    <span className="text-gray-900">
                                                        ¥
                                                        {selectedRes.breakdown.petFee.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {(selectedRes.breakdown
                                                ?.supportFee || 0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <FaConciergeBell className="w-3 h-3" />
                                                        <span>
                                                            滞在サポート料
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-900">
                                                        ¥
                                                        {selectedRes.breakdown.supportFee.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {(selectedRes.breakdown
                                                ?.transferSurcharge || 0) >
                                                0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="text-gray-600 pl-4">
                                                        └ 送迎追加（5名以上）
                                                    </span>
                                                    <span className="text-gray-900">
                                                        ¥
                                                        {selectedRes.breakdown.transferSurcharge.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            {(selectedRes.breakdown
                                                ?.experiencesTotal || 0) >
                                                0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <FaStar className="w-3 h-3" />
                                                        <span>
                                                            体験オプション計
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-900">
                                                        ¥
                                                        {selectedRes.breakdown.experiencesTotal.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-gray-50">
                                                <span className="text-gray-500">
                                                    小計
                                                </span>
                                                <span className="text-gray-700">
                                                    ¥
                                                    {(
                                                        (selectedRes.breakdown
                                                            ?.baseAmount || 0) +
                                                        (selectedRes.breakdown
                                                            ?.guestExtra || 0) +
                                                        (selectedRes.breakdown
                                                            ?.petFee || 0) +
                                                        (selectedRes.breakdown
                                                            ?.supportFee || 0) +
                                                        (selectedRes.breakdown
                                                            ?.transferSurcharge ||
                                                            0) +
                                                        (selectedRes.breakdown
                                                            ?.experiencesTotal ||
                                                            0)
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            {(selectedRes.breakdown
                                                ?.adjustment ?? 0) !== 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="text-gray-500">
                                                        料金調整
                                                        {selectedRes.breakdown
                                                            .adjustmentNote && (
                                                            <span className="text-xs text-gray-400 ml-1">
                                                                （
                                                                {
                                                                    selectedRes
                                                                        .breakdown
                                                                        .adjustmentNote
                                                                }
                                                                ）
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span
                                                        className={
                                                            (selectedRes
                                                                .breakdown
                                                                .adjustment ??
                                                                0) < 0
                                                                ? "text-red-500"
                                                                : "text-green-600"
                                                        }
                                                    >
                                                        {(selectedRes.breakdown
                                                            .adjustment ?? 0) <
                                                        0
                                                            ? "−"
                                                            : "+"}
                                                        ¥
                                                        {Math.abs(
                                                            selectedRes
                                                                .breakdown
                                                                .adjustment ??
                                                                0,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <span className="text-gray-600">
                                                    保証料
                                                    <span className="ml-1.5 text-xs text-green-600 font-medium">
                                                        返金制
                                                    </span>
                                                </span>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {(
                                                        selectedRes.breakdown
                                                            ?.deposit || 0
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3.5 bg-[#0a2105]">
                                            <span className="text-white text-sm font-semibold">
                                                お支払い合計（税込）
                                            </span>
                                            <span className="text-white text-xl font-bold tracking-tight">
                                                ¥
                                                {(
                                                    selectedRes.totalAmount || 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        ※
                                        お支払いはすべて来場時現金払いとなります
                                    </p>
                                </Section>

                                <Section
                                    icon={<FaYenSign className="w-3 h-3" />}
                                    title="料金調整を変更"
                                >
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium text-amber-700">
                                                マスタから選択
                                            </p>
                                            {detailApplicableRules.length ===
                                            0 ? (
                                                <p className="text-xs text-gray-400 italic">
                                                    現在の条件（人数・日程）に該当する割引なし
                                                </p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {detailApplicableRules.map(
                                                        (rule) => {
                                                            const accommodationBase =
                                                                (selectedRes
                                                                    .breakdown
                                                                    ?.baseAmount ||
                                                                    0) +
                                                                (selectedRes
                                                                    .breakdown
                                                                    ?.guestExtra ||
                                                                    0);
                                                            const discountAmt =
                                                                Math.round(
                                                                    (accommodationBase *
                                                                        rule.discountPercent) /
                                                                        100,
                                                                );
                                                            const isSelected =
                                                                editAdjustmentRuleId ===
                                                                rule.id;
                                                            const blockedByOptions =
                                                                (rule.noExperienceOptions &&
                                                                    editExperiences.length >
                                                                        0) ||
                                                                (rule.noSupportPlan &&
                                                                    editSupportPlan);
                                                            return (
                                                                <button
                                                                    key={
                                                                        rule.id
                                                                    }
                                                                    type="button"
                                                                    disabled={
                                                                        blockedByOptions
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            isSelected
                                                                        ) {
                                                                            setEditAdjustmentRuleId(
                                                                                "",
                                                                            );
                                                                            setEditAdjustment(
                                                                                0,
                                                                            );
                                                                            setEditAdjustmentNote(
                                                                                "",
                                                                            );
                                                                        } else {
                                                                            setEditAdjustmentRuleId(
                                                                                rule.id,
                                                                            );
                                                                            setEditAdjustment(
                                                                                -discountAmt,
                                                                            );
                                                                            setEditAdjustmentNote(
                                                                                rule.name,
                                                                            );
                                                                        }
                                                                        setAdjustmentSaved(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    title={
                                                                        blockedByOptions
                                                                            ? [
                                                                                  rule.noExperienceOptions &&
                                                                                  editExperiences.length >
                                                                                      0
                                                                                      ? "体験オプションが含まれているため適用不可"
                                                                                      : "",
                                                                                  rule.noSupportPlan &&
                                                                                  editSupportPlan
                                                                                      ? "滞在サポートが含まれているため適用不可"
                                                                                      : "",
                                                                              ]
                                                                                  .filter(
                                                                                      Boolean,
                                                                                  )
                                                                                  .join(
                                                                                      " / ",
                                                                                  )
                                                                            : undefined
                                                                    }
                                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded border text-xs transition-all text-left ${
                                                                        blockedByOptions
                                                                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                                                            : isSelected
                                                                              ? "border-amber-500 bg-white text-amber-800 font-medium"
                                                                              : "border-amber-200 bg-white/70 text-gray-700 hover:border-amber-400"
                                                                    }`}
                                                                >
                                                                    <span className="truncate mr-1 flex items-center gap-1">
                                                                        {blockedByOptions && (
                                                                            <FaBan className="w-3 h-3 text-red-400 shrink-0" />
                                                                        )}
                                                                        {
                                                                            rule.name
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        className={`shrink-0 font-semibold ${isSelected ? "text-red-500" : blockedByOptions ? "text-gray-400" : "text-amber-600"}`}
                                                                    >
                                                                        {
                                                                            rule.discountPercent
                                                                        }
                                                                        % OFF
                                                                        {isSelected
                                                                            ? ` (−¥${discountAmt.toLocaleString()})`
                                                                            : ""}
                                                                    </span>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium text-amber-700">
                                                手動調整
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-500 shrink-0">
                                                    ¥
                                                </span>
                                                <input
                                                    type="number"
                                                    step="500"
                                                    value={
                                                        editAdjustment === 0
                                                            ? ""
                                                            : editAdjustment
                                                    }
                                                    onChange={(e) => {
                                                        const v =
                                                            e.target.value ===
                                                            ""
                                                                ? 0
                                                                : parseInt(
                                                                      e.target
                                                                          .value,
                                                                      10,
                                                                  );
                                                        setEditAdjustment(
                                                            isNaN(v) ? 0 : v,
                                                        );
                                                        setEditAdjustmentRuleId(
                                                            "",
                                                        );
                                                        setAdjustmentSaved(
                                                            false,
                                                        );
                                                    }}
                                                    placeholder="例: -5000 または 3000"
                                                    className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={editAdjustmentNote}
                                                onChange={(e) => {
                                                    setEditAdjustmentNote(
                                                        e.target.value,
                                                    );
                                                    setAdjustmentSaved(false);
                                                }}
                                                placeholder="調整理由（任意）"
                                                className="w-full px-2 py-1.5 border border-amber-200 rounded text-xs outline-none focus:ring-1 focus:ring-amber-400 bg-white"
                                            />
                                        </div>

                                        {editAdjustment !== 0 && (
                                            <div className="flex justify-between text-xs border-t border-amber-200 pt-2">
                                                <span
                                                    className={
                                                        editAdjustment < 0
                                                            ? "text-red-500"
                                                            : "text-green-600"
                                                    }
                                                >
                                                    {editAdjustment < 0
                                                        ? "値引き"
                                                        : "追加料金"}
                                                </span>
                                                <span
                                                    className={`font-semibold ${editAdjustment < 0 ? "text-red-500" : "text-green-600"}`}
                                                >
                                                    {editAdjustment < 0
                                                        ? "−"
                                                        : "+"}
                                                    ¥
                                                    {Math.abs(
                                                        editAdjustment,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {editAdjustment !== 0 && (
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>調整後合計</span>
                                                <span className="font-semibold text-gray-800">
                                                    ¥
                                                    {(
                                                        selectedRes.totalAmount -
                                                        (selectedRes.breakdown
                                                            ?.adjustment ?? 0) +
                                                        editAdjustment
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAdjustmentSave}
                                            disabled={adjustmentSaved}
                                            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                                        >
                                            {adjustmentSaved ? (
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <FaCheckCircle className="w-3.5 h-3.5" />{" "}
                                                    保存しました
                                                </span>
                                            ) : (
                                                "料金調整を保存"
                                            )}
                                        </button>
                                    </div>
                                </Section>

                                <Section
                                    icon={<FaEdit className="w-3 h-3" />}
                                    title="予約状況を変更"
                                >
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex gap-2">
                                            {(
                                                [
                                                    {
                                                        val: "confirmed",
                                                        label: "確定",
                                                        cls: "border-green-400 bg-green-50 text-green-800",
                                                    },
                                                    {
                                                        val: "cancelled",
                                                        label: "キャンセル",
                                                        cls: "border-red-400 bg-red-50 text-red-800",
                                                    },
                                                    {
                                                        val: "noshow",
                                                        label: "ドタキャン",
                                                        cls: "border-purple-400 bg-purple-50 text-purple-800",
                                                    },
                                                ] as const
                                            ).map(({ val, label, cls }) => (
                                                <button
                                                    key={val}
                                                    onClick={() => {
                                                        setEditStatus(val);
                                                        setStatusSaved(false);
                                                    }}
                                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                                                        editStatus === val
                                                            ? cls +
                                                              " ring-2 ring-offset-1 ring-current"
                                                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleStatusSave}
                                            disabled={
                                                editStatus ===
                                                    selectedRes.status &&
                                                !statusSaved
                                            }
                                            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                                        >
                                            {statusSaved ? (
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <FaCheckCircle className="w-3.5 h-3.5" />{" "}
                                                    保存しました
                                                </span>
                                            ) : (
                                                "予約状況を保存"
                                            )}
                                        </button>
                                    </div>
                                </Section>

                                <Section
                                    icon={<FaEdit className="w-3 h-3" />}
                                    title="支払状況を変更"
                                >
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex gap-2">
                                            {(
                                                [
                                                    "unpaid",
                                                    "paid",
                                                    "refunded",
                                                ] as const
                                            ).map((s) => {
                                                const cfg = {
                                                    unpaid: {
                                                        label: "未払い",
                                                        cls: "border-orange-300 bg-orange-50 text-orange-800",
                                                    },
                                                    paid: {
                                                        label: "支払済",
                                                        cls: "border-blue-300 bg-blue-50 text-blue-800",
                                                    },
                                                    refunded: {
                                                        label: "返金済",
                                                        cls: "border-gray-300 bg-gray-100 text-gray-700",
                                                    },
                                                }[s];
                                                const isActive =
                                                    editPayment === s;
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() => {
                                                            setEditPayment(s);
                                                            setPaymentSaved(
                                                                false,
                                                            );
                                                        }}
                                                        className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${isActive ? cfg.cls + " ring-2 ring-offset-1 ring-current" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                                                    >
                                                        {cfg.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={handlePaymentSave}
                                            disabled={
                                                editPayment ===
                                                    selectedRes.payment &&
                                                !paymentSaved
                                            }
                                            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0a2105] text-white hover:bg-[#071a04]"
                                        >
                                            {paymentSaved ? (
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <FaCheckCircle className="w-3.5 h-3.5" />{" "}
                                                    保存しました
                                                </span>
                                            ) : (
                                                "支払状況を保存"
                                            )}
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
                    <div
                        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => {
                            setIsNewOpen(false);
                            setMemberQuery("");
                            setShowMemberDrop(false);
                        }}
                    >
                        <div
                            className="bg-white rounded-xl w-full max-w-4xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="w-4 h-4 text-green-600" />
                                    <h3 className="text-base text-gray-900">
                                        新規予約登録（電話対応）
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsNewOpen(false);
                                        setMemberQuery("");
                                        setShowMemberDrop(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col lg:flex-row">
                                {/* 左: フォーム */}
                                <div className="flex-1 px-6 py-5 space-y-6 min-w-0">
                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <FaUserCheck className="w-3 h-3" />{" "}
                                            会員選択{" "}
                                            <span className="text-red-500 normal-case font-normal">
                                                *必須
                                            </span>
                                        </h4>
                                        {selectedMember ? (
                                            <div className="flex items-start gap-3 p-3 bg-[#e8f5e9] border-2 border-[#0a2105] rounded-lg">
                                                <div className="w-9 h-9 rounded-full bg-[#0a2105] flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                                                    {selectedMember.lastName.charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#0a2105]">
                                                        {
                                                            selectedMember.lastName
                                                        }{" "}
                                                        {
                                                            selectedMember.firstName
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {
                                                            selectedMember.lastNameKana
                                                        }{" "}
                                                        {
                                                            selectedMember.firstNameKana
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-0.5">
                                                        {selectedMember.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {selectedMember.phone}{" "}
                                                        ／ {selectedMember.id}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        過去の宿泊:{" "}
                                                        {
                                                            selectedMember.totalStays
                                                        }
                                                        回
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setF("memberId", "")
                                                    }
                                                    className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                                                    title="選択を解除"
                                                >
                                                    <FaTimesCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                ref={memberSearchRef}
                                                className="relative"
                                            >
                                                <div className="relative">
                                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={memberQuery}
                                                        onChange={(e) => {
                                                            setMemberQuery(
                                                                e.target.value,
                                                            );
                                                            setShowMemberDrop(
                                                                true,
                                                            );
                                                        }}
                                                        onFocus={() =>
                                                            setShowMemberDrop(
                                                                true,
                                                            )
                                                        }
                                                        placeholder="氏名・メール・電話番号・会員IDで検索"
                                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                                    />
                                                </div>
                                                {showMemberDrop && (
                                                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                                        {memberResults.length ===
                                                        0 ? (
                                                            <div className="px-4 py-6 text-center">
                                                                <p className="text-sm text-gray-500 mb-2">
                                                                    該当する会員が見つかりません
                                                                </p>
                                                                <a
                                                                    href="/admin/members"
                                                                    className="inline-flex items-center gap-1 text-xs text-[#0a2105] hover:underline"
                                                                >
                                                                    <FaExternalLinkAlt className="w-2.5 h-2.5" />{" "}
                                                                    会員登録ページへ
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            memberResults.map(
                                                                (m) => (
                                                                    <button
                                                                        key={
                                                                            m.id
                                                                        }
                                                                        onClick={() => {
                                                                            setF(
                                                                                "memberId",
                                                                                m.id,
                                                                            );
                                                                            setMemberQuery(
                                                                                "",
                                                                            );
                                                                            setShowMemberDrop(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#e8f5e9] text-left border-b border-gray-50 last:border-0"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-600 text-xs font-semibold">
                                                                            {m.lastName.charAt(
                                                                                0,
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm text-gray-900 font-medium">
                                                                                {
                                                                                    m.lastName
                                                                                }{" "}
                                                                                {
                                                                                    m.firstName
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-gray-400">
                                                                                {
                                                                                    m.lastNameKana
                                                                                }{" "}
                                                                                {
                                                                                    m.firstNameKana
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                {
                                                                                    m.email
                                                                                }{" "}
                                                                                ／{" "}
                                                                                {
                                                                                    m.phone
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <span className="text-xs text-gray-400 shrink-0">
                                                                            {
                                                                                m.id
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                ),
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 flex items-start gap-1.5">
                                                    <span className="shrink-0 mt-0.5">
                                                        ⚠
                                                    </span>
                                                    <span>
                                                        予約には会員登録が必須です。未登録のお客様は先に
                                                        <a
                                                            href="/admin/members"
                                                            className="underline font-medium"
                                                        >
                                                            会員登録
                                                        </a>
                                                        を行ってください。
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <FaCalendarAlt className="w-3 h-3" />{" "}
                                            日程{" "}
                                            <span className="text-red-500 normal-case font-normal">
                                                *必須
                                            </span>
                                        </h4>
                                        <AdminDateRangePicker
                                            checkIn={newForm.checkIn}
                                            checkOut={newForm.checkOut}
                                            onChange={(ci, co) =>
                                                setNewForm((f) => ({
                                                    ...f,
                                                    checkIn: ci,
                                                    checkOut: co,
                                                }))
                                            }
                                            availabilities={availabilities}
                                            bookedDates={bookedDates}
                                        />
                                        {newForm.checkIn && (
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                料金区分:{" "}
                                                <span className="font-medium text-gray-700">
                                                    {getDayTypeLabel(
                                                        newForm.checkIn,
                                                    )}
                                                </span>
                                                {calc.nights > 0 && (
                                                    <span className="ml-2">
                                                        / {calc.nights}泊
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            宿泊人数
                                        </h4>
                                        <select
                                            value={newForm.guests}
                                            onChange={(e) =>
                                                setF(
                                                    "guests",
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                                        >
                                            {[
                                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                            ].map((n) => (
                                                <option key={n} value={n}>
                                                    {n}名
                                                    {n > 5
                                                        ? `（追加料金 +¥${((n - 5) * 3000).toLocaleString()}）`
                                                        : "（推奨）"}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">
                                            ※
                                            最大10名。6名以上は1名につき¥3,000の追加料金（泊数×人数分）
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <FaDog className="w-3 h-3" />{" "}
                                            ペット同伴
                                        </h4>
                                        <select
                                            value={newForm.pets}
                                            onChange={(e) =>
                                                setF("pets", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                                        >
                                            <option value="none">なし</option>
                                            <option value="small1">
                                                小型犬1頭（+¥2,500/泊）
                                            </option>
                                            <option value="small2">
                                                小型犬2頭（+¥4,000/泊）
                                            </option>
                                            <option value="large1">
                                                大型犬1頭（+¥3,500/泊）
                                            </option>
                                            <option value="large2">
                                                大型犬2頭（+¥6,000/泊）
                                            </option>
                                        </select>
                                        {(newForm.pets === "small1" ||
                                            newForm.pets === "large1") && (
                                            <input
                                                type="text"
                                                value={newForm.petBreed}
                                                onChange={(e) =>
                                                    setF(
                                                        "petBreed",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="犬種・名前（例: トイプードル、ぽち）"
                                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                            />
                                        )}
                                        {(newForm.pets === "small2" ||
                                            newForm.pets === "large2") && (
                                            <div className="mt-2 space-y-2">
                                                <input
                                                    type="text"
                                                    value={newForm.petBreed}
                                                    onChange={(e) =>
                                                        setF(
                                                            "petBreed",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="①1頭目 ─ 犬種・名前"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={newForm.petBreed2}
                                                    onChange={(e) =>
                                                        setF(
                                                            "petBreed2",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="②2頭目 ─ 犬種・名前"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                                />
                                            </div>
                                        )}
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <FaConciergeBell className="w-3 h-3" />{" "}
                                            滞在サポート（任意）
                                        </h4>
                                        {selectedAdjustmentRule?.noSupportPlan ? (
                                            <div className="flex items-start gap-2 px-3 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <FaBan className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-orange-700">
                                                    「
                                                    {
                                                        selectedAdjustmentRule.name
                                                    }
                                                    」は滞在サポート選択不可の割引です。サポートを追加するにはルールの選択を解除してください。
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600 leading-relaxed">
                                                    送迎（最寄り駅⇔ログハウス）と食材買い出し代行が利用できます。
                                                    <br />
                                                    料金:{" "}
                                                    {newForm.guests >= 5 ? (
                                                        <strong>
                                                            ¥13,000（¥8,000 +
                                                            送迎追加¥5,000）
                                                        </strong>
                                                    ) : (
                                                        <strong>¥8,000</strong>
                                                    )}
                                                    {newForm.guests >= 5 && (
                                                        <span className="text-orange-600">
                                                            {" "}
                                                            ※5名以上のため送迎追加¥5,000が加算
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {[true, false].map((v) => (
                                                        <button
                                                            key={String(v)}
                                                            onClick={() =>
                                                                setF(
                                                                    "supportPlan",
                                                                    v,
                                                                )
                                                            }
                                                            className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all ${newForm.supportPlan === v ? "border-[#0a2105] bg-[#e8f5e9] text-[#0a2105] font-medium" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                                                        >
                                                            {v
                                                                ? "あり"
                                                                : "なし"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <FaStar className="w-3 h-3" />{" "}
                                            体験オプション（複数選択可）
                                        </h4>
                                        {optionsDisabledByRule ? (
                                            <div className="flex items-start gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-lg">
                                                <FaBan className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-red-700">
                                                    「
                                                    {
                                                        selectedAdjustmentRule?.name
                                                    }
                                                    」はオプション選択不可の割引です。体験オプションを追加するにはルールの選択を解除してください。
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {EXPERIENCE_LIST.map((exp) => {
                                                    const isSelected =
                                                        newForm.experiences.includes(
                                                            exp.label,
                                                        );
                                                    return (
                                                        <label
                                                            key={exp.label}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "border-[#0a2105] bg-[#e8f5e9]" : "border-gray-200 hover:bg-gray-50"}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleExp(
                                                                        exp.label,
                                                                    )
                                                                }
                                                                className="w-4 h-4 accent-[#0a2105] shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <span
                                                                    className={`text-sm block ${isSelected ? "font-medium text-[#0a2105]" : "text-gray-800"}`}
                                                                >
                                                                    {exp.label}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {exp.season}
                                                                </span>
                                                                {"note" in
                                                                    exp &&
                                                                    exp.note && (
                                                                        <span className="text-xs text-amber-600 block">
                                                                            ※{" "}
                                                                            {
                                                                                exp.note
                                                                            }
                                                                        </span>
                                                                    )}
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-600 shrink-0">
                                                                {exp.price}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            備考・ご要望
                                        </h4>
                                        <textarea
                                            value={newForm.note}
                                            onChange={(e) =>
                                                setF("note", e.target.value)
                                            }
                                            placeholder="アレルギー、到着時間の目安、特別なご要望など"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#0a2105] outline-none"
                                        />
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            予約・支払状況
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">
                                                    予約状況
                                                </label>
                                                <select
                                                    value={newForm.status}
                                                    onChange={(e) =>
                                                        setF(
                                                            "status",
                                                            e.target
                                                                .value as NewForm["status"],
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                                                >
                                                    <option value="confirmed">
                                                        確定
                                                    </option>
                                                    <option value="cancelled">
                                                        キャンセル
                                                    </option>
                                                    <option value="noshow">
                                                        ドタキャン
                                                    </option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">
                                                    支払状況
                                                </label>
                                                <select
                                                    value={newForm.payment}
                                                    onChange={(e) =>
                                                        setF(
                                                            "payment",
                                                            e.target
                                                                .value as NewForm["payment"],
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                                                >
                                                    <option value="unpaid">
                                                        未払い
                                                    </option>
                                                    <option value="paid">
                                                        支払済
                                                    </option>
                                                    <option value="refunded">
                                                        返金済
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* 右: 料金サマリー */}
                                <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200">
                                    <div className="px-5 py-5 lg:sticky lg:top-0">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                            料金プレビュー
                                        </h4>
                                        {calc.nights === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-6">
                                                日程を入力すると
                                                <br />
                                                料金が表示されます
                                            </p>
                                        ) : (
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                    <span className="text-gray-500">
                                                        基本宿泊料
                                                    </span>
                                                    <span className="text-gray-800">
                                                        ¥
                                                        {calc.baseAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                                {calc.guestExtra > 0 && (
                                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                        <span className="text-gray-500">
                                                            追加人数
                                                        </span>
                                                        <span className="text-gray-800">
                                                            ¥
                                                            {calc.guestExtra.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {calc.petFee > 0 && (
                                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                        <span className="text-gray-500">
                                                            ペット料金
                                                        </span>
                                                        <span className="text-gray-800">
                                                            ¥
                                                            {calc.petFee.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {calc.supportFee > 0 && (
                                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                        <span className="text-gray-500">
                                                            滞在サポート
                                                        </span>
                                                        <span className="text-gray-800">
                                                            ¥
                                                            {calc.supportFee.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {calc.transferSurcharge > 0 && (
                                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                        <span className="text-gray-500 pl-3">
                                                            └ 送迎追加
                                                        </span>
                                                        <span className="text-gray-800">
                                                            ¥
                                                            {calc.transferSurcharge.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {calc.experiencesTotal > 0 && (
                                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                        <span className="text-gray-500">
                                                            体験オプション
                                                        </span>
                                                        <span className="text-gray-800">
                                                            ¥
                                                            {calc.experiencesTotal.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs">
                                                    <span className="text-gray-400">
                                                        小計
                                                    </span>
                                                    <span className="text-gray-600">
                                                        ¥
                                                        {(
                                                            calc.total -
                                                            calc.deposit
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                    <span className="text-gray-500">
                                                        保証料{" "}
                                                        <span className="text-green-600 text-xs">
                                                            返金制
                                                        </span>
                                                    </span>
                                                    <span className="text-gray-800">
                                                        ¥
                                                        {calc.deposit.toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="pt-2 pb-1 border-b border-dashed border-amber-300 space-y-2">
                                                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                                                        <span>✎</span>{" "}
                                                        料金調整（管理者）
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-500">
                                                            マスタから選択
                                                        </p>
                                                        {applicableRules.length ===
                                                        0 ? (
                                                            <p className="text-xs text-gray-400 italic">
                                                                現在の条件に該当する割引なし
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                {applicableRules.map(
                                                                    (rule) => {
                                                                        const accommodationBase =
                                                                            calc.baseAmount +
                                                                            calc.guestExtra;
                                                                        const discountAmt =
                                                                            Math.round(
                                                                                (accommodationBase *
                                                                                    rule.discountPercent) /
                                                                                    100,
                                                                            );
                                                                        const isSelected =
                                                                            newForm.selectedRuleId ===
                                                                            rule.id;
                                                                        const blockedByOptions =
                                                                            (rule.noExperienceOptions &&
                                                                                newForm
                                                                                    .experiences
                                                                                    .length >
                                                                                    0) ||
                                                                            (rule.noSupportPlan &&
                                                                                newForm.supportPlan);
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    rule.id
                                                                                }
                                                                                type="button"
                                                                                disabled={
                                                                                    blockedByOptions
                                                                                }
                                                                                title={
                                                                                    blockedByOptions
                                                                                        ? [
                                                                                              rule.noExperienceOptions &&
                                                                                              newForm
                                                                                                  .experiences
                                                                                                  .length >
                                                                                                  0
                                                                                                  ? "体験オプションが含まれているため適用不可"
                                                                                                  : "",
                                                                                              rule.noSupportPlan &&
                                                                                              newForm.supportPlan
                                                                                                  ? "滞在サポートが含まれているため適用不可"
                                                                                                  : "",
                                                                                          ]
                                                                                              .filter(
                                                                                                  Boolean,
                                                                                              )
                                                                                              .join(
                                                                                                  " / ",
                                                                                              )
                                                                                        : undefined
                                                                                }
                                                                                onClick={() => {
                                                                                    if (
                                                                                        isSelected
                                                                                    ) {
                                                                                        setNewForm(
                                                                                            (
                                                                                                f,
                                                                                            ) => ({
                                                                                                ...f,
                                                                                                selectedRuleId:
                                                                                                    "",
                                                                                                adjustment: 0,
                                                                                                adjustmentNote:
                                                                                                    "",
                                                                                            }),
                                                                                        );
                                                                                    } else {
                                                                                        setNewForm(
                                                                                            (
                                                                                                f,
                                                                                            ) => ({
                                                                                                ...f,
                                                                                                selectedRuleId:
                                                                                                    rule.id,
                                                                                                adjustment:
                                                                                                    -discountAmt,
                                                                                                adjustmentNote:
                                                                                                    rule.name,
                                                                                                experiences:
                                                                                                    rule.noExperienceOptions
                                                                                                        ? []
                                                                                                        : f.experiences,
                                                                                                supportPlan:
                                                                                                    rule.noSupportPlan
                                                                                                        ? false
                                                                                                        : f.supportPlan,
                                                                                            }),
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border text-xs transition-all text-left ${
                                                                                    blockedByOptions
                                                                                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                                                                        : isSelected
                                                                                          ? "border-amber-400 bg-amber-50 text-amber-800"
                                                                                          : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                                                                                }`}
                                                                            >
                                                                                <span className="font-medium truncate mr-1">
                                                                                    {
                                                                                        rule.name
                                                                                    }
                                                                                </span>
                                                                                <span
                                                                                    className={`shrink-0 font-semibold ${isSelected ? "text-red-500" : blockedByOptions ? "text-gray-400" : "text-gray-500"}`}
                                                                                >
                                                                                    {
                                                                                        rule.discountPercent
                                                                                    }

                                                                                    %
                                                                                    OFF{" "}
                                                                                    {isSelected
                                                                                        ? `(−¥${discountAmt.toLocaleString()})`
                                                                                        : ""}
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-500">
                                                            手動調整
                                                        </p>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-gray-500 shrink-0">
                                                                ¥
                                                            </span>
                                                            <input
                                                                type="number"
                                                                step="500"
                                                                value={
                                                                    newForm.adjustment ===
                                                                    0
                                                                        ? ""
                                                                        : newForm.adjustment
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const v =
                                                                        e.target
                                                                            .value ===
                                                                        ""
                                                                            ? 0
                                                                            : parseInt(
                                                                                  e
                                                                                      .target
                                                                                      .value,
                                                                                  10,
                                                                              );
                                                                    setNewForm(
                                                                        (
                                                                            f,
                                                                        ) => ({
                                                                            ...f,
                                                                            adjustment:
                                                                                isNaN(
                                                                                    v,
                                                                                )
                                                                                    ? 0
                                                                                    : v,
                                                                            selectedRuleId:
                                                                                "",
                                                                        }),
                                                                    );
                                                                }}
                                                                placeholder="例: -5000 または 3000"
                                                                className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm outline-none focus:ring-1 focus:ring-amber-400 bg-amber-50"
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={
                                                                newForm.adjustmentNote
                                                            }
                                                            onChange={(e) =>
                                                                setF(
                                                                    "adjustmentNote",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="調整理由（任意）"
                                                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-amber-400"
                                                        />
                                                    </div>
                                                    {newForm.adjustment !==
                                                        0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span
                                                                className={
                                                                    newForm.adjustment <
                                                                    0
                                                                        ? "text-red-500"
                                                                        : "text-green-600"
                                                                }
                                                            >
                                                                {newForm.adjustment <
                                                                0
                                                                    ? "値引き"
                                                                    : "追加料金"}
                                                            </span>
                                                            <span
                                                                className={`font-medium ${newForm.adjustment < 0 ? "text-red-500" : "text-green-600"}`}
                                                            >
                                                                {newForm.adjustment <
                                                                0
                                                                    ? "−"
                                                                    : "+"}
                                                                ¥
                                                                {Math.abs(
                                                                    newForm.adjustment,
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center pt-3 mt-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        合計
                                                    </span>
                                                    <span className="text-xl font-bold text-[#0a2105]">
                                                        ¥
                                                        {(
                                                            calc.total +
                                                            newForm.adjustment
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                                {newForm.adjustment !== 0 && (
                                                    <p className="text-xs text-gray-400 text-right">
                                                        （定価: ¥
                                                        {calc.total.toLocaleString()}
                                                        ）
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 pt-1">
                                                    ※ 来場時現金払い
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={() => {
                                        setIsNewOpen(false);
                                        setMemberQuery("");
                                        setShowMemberDrop(false);
                                    }}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleNewSave}
                                    disabled={
                                        !newForm.memberId ||
                                        !newForm.checkIn ||
                                        !newForm.checkOut ||
                                        calc.nights <= 0
                                    }
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
