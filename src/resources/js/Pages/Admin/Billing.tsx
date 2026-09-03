import { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaCreditCard,
    FaSearch,
    FaEye,
    FaTimes,
    FaUser,
    FaBed,
    FaYenSign,
    FaDog,
    FaConciergeBell,
    FaStar,
    FaEdit,
    FaCheckCircle,
    FaBan,
} from "react-icons/fa";

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

interface PriceBreakdown {
    baseAmount: number;
    guestExtra: number;
    petFee: number;
    supportFee: number;
    transferSurcharge: number;
    experiencesTotal: number;
    deposit: number;
    depositRefunded?: boolean;
    depositRefundAmount?: number;
    adjustment?: number;
    adjustmentNote?: string;
    adjustmentRuleId?: string;
}

interface ExperienceItem {
    name: string;
    price: number;
    priceNote: string;
}

interface Billing {
    id: string;
    dbId: number;
    reservationId: string;
    reservationStatus: string;
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
    experiences: ExperienceItem[];
    breakdown: PriceBreakdown;
    amount: number;
    status: string;
    paidAt?: string;
    dueDate: string;
    note?: string;
    createdAt: string;
}

const PET_LABELS: Record<string, string> = {
    none: "なし",
    small1: "小型犬1頭",
    small2: "小型犬2頭",
    large1: "大型犬1頭",
    large2: "大型犬2頭",
};

function petLabel(hasPet: string, breed?: string) {
    const base = PET_LABELS[hasPet] ?? hasPet;
    return hasPet === "none" ? base : `${base}${breed ? `（${breed}）` : ""}`;
}

const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        paid: { label: "支払済", cls: "bg-blue-100 text-blue-800" },
        unpaid: { label: "未払い", cls: "bg-orange-100 text-orange-800" },
        refunded: { label: "返金済", cls: "bg-gray-100 text-gray-600" },
        partial: { label: "一部支払", cls: "bg-yellow-100 text-yellow-800" },
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

const reservationStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        confirmed: { label: "確定", cls: "bg-green-100 text-green-800" },
        cancelled: { label: "キャンセル", cls: "bg-red-100 text-red-800" },
        noshow: { label: "ドタキャン", cls: "bg-purple-100 text-purple-800" },
        pending: { label: "保留中", cls: "bg-yellow-100 text-yellow-800" },
    };
    const value = map[status] || {
        label: status,
        cls: "bg-gray-100 text-gray-600",
    };
    return (
        <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${value.cls}`}
        >
            {value.label}
        </span>
    );
};

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

export default function Billing({
    billings,
    priceAdjustmentRules,
}: {
    billings: Billing[];
    priceAdjustmentRules: PriceRule[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterReservationStatus, setFilterReservationStatus] =
        useState("all");
    const [selected, setSelected] = useState<Billing | null>(null);

    const [editStatus, setEditStatus] = useState<string>("unpaid");
    const [statusSaved, setStatusSaved] = useState(false);
    const [editAdjustment, setEditAdjustment] = useState(0);
    const [editAdjustmentNote, setEditAdjustmentNote] = useState("");
    const [editAdjustmentRuleId, setEditAdjustmentRuleId] = useState("");
    const [adjustmentSaved, setAdjustmentSaved] = useState(false);

    // 保存後にInertiaがbillingsプロップを更新したら、モーダルのデータも同期する
    useEffect(() => {
        if (!selected) return;
        const updated = billings.find((b) => b.dbId === selected.dbId);
        if (updated && updated.amount !== selected.amount) {
            setSelected(updated);
        }
    }, [billings]);

    const filtered = useMemo(
        () =>
            billings.filter((b) => {
                const matchSearch =
                    !searchQuery ||
                    b.memberName.includes(searchQuery) ||
                    b.id.includes(searchQuery) ||
                    b.reservationId.includes(searchQuery);
                const matchStatus =
                    filterStatus === "all" || b.status === filterStatus;
                const matchReservationStatus =
                    filterReservationStatus === "all" ||
                    b.reservationStatus === filterReservationStatus;
                return matchSearch && matchStatus && matchReservationStatus;
            }),
        [billings, searchQuery, filterStatus, filterReservationStatus],
    );

    const totalPaid = billings
        .filter((b) => b.status === "paid")
        .reduce((s, b) => s + b.amount, 0);
    const totalUnpaid = billings
        .filter(
            (b) =>
                b.status === "unpaid" &&
                !["cancelled", "noshow"].includes(b.reservationStatus),
        )
        .reduce((s, b) => s + b.amount, 0);
    const totalRefunded = billings
        .filter((b) => b.status === "refunded")
        .reduce((s, b) => s + b.amount, 0);

    const openDetail = (b: Billing) => {
        setSelected(b);
        setEditStatus(b.status);
        setStatusSaved(false);
        setEditAdjustment(b.breakdown?.adjustment ?? 0);
        setEditAdjustmentNote(b.breakdown?.adjustmentNote ?? "");
        setEditAdjustmentRuleId(b.breakdown?.adjustmentRuleId ?? "");
        setAdjustmentSaved(false);
    };

    const detailApplicableRules = useMemo(() => {
        if (!selected) return [];
        const rules = priceAdjustmentRules.filter((rule) => {
            if (rule.status !== "active") return false;
            if (rule.hasGuestRange) {
                if (rule.guestMin !== null && selected.guests < rule.guestMin)
                    return false;
                if (rule.guestMax !== null && selected.guests > rule.guestMax)
                    return false;
            }
            if (rule.hasPeriod && selected.checkIn) {
                if (
                    selected.checkIn < rule.periodStart ||
                    selected.checkIn > rule.periodEnd
                )
                    return false;
            }
            return true;
        });
        // 保存済みのルールが条件外でも必ずリストに含める
        const savedId = selected.breakdown?.adjustmentRuleId;
        if (savedId && !rules.find((r) => r.id === savedId)) {
            const savedRule = priceAdjustmentRules.find(
                (r) => r.id === savedId,
            );
            if (savedRule) return [...rules, savedRule];
        }
        return rules;
    }, [selected, priceAdjustmentRules]);

    const detailSelectedRule = useMemo(
        () =>
            priceAdjustmentRules.find((r) => r.id === editAdjustmentRuleId) ??
            null,
        [editAdjustmentRuleId, priceAdjustmentRules],
    );

    const handleStatusSave = () => {
        if (!selected) return;
        router.patch(
            `/admin/billing/${selected.dbId}`,
            { status: editStatus },
            {
                onSuccess: () => setStatusSaved(true),
            },
        );
    };

    const handleAdjustmentSave = () => {
        if (!selected) return;
        router.patch(
            `/admin/billing/${selected.dbId}/adjustment`,
            {
                adjustment: editAdjustment,
                adjustment_note: editAdjustmentNote,
                adjustment_rule_id: editAdjustmentRuleId || null,
            },
            {
                onSuccess: () => setAdjustmentSaved(true),
            },
        );
    };

    return (
        <AdminLayout currentPage="billing" title="請求管理">
            <div className="max-w-7xl mx-auto">
                {/* ── サマリーカード ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">支払済合計</p>
                        <p className="text-2xl text-green-600">
                            ¥{totalPaid.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">未払い合計</p>
                        <p className="text-2xl text-orange-600">
                            ¥{totalUnpaid.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">返金済合計</p>
                        <p className="text-2xl text-gray-600">
                            ¥{totalRefunded.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* ── 一覧テーブル ── */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaCreditCard className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    支払一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{billings.length}件 | 検索結果:{" "}
                                    {filtered.length}件
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="会員名、請求ID、予約IDで検索"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                            >
                                <option value="all">支払状況：すべて</option>
                                <option value="paid">支払済</option>
                                <option value="unpaid">未払い</option>
                                <option value="refunded">返金済</option>
                            </select>
                            <select
                                value={filterReservationStatus}
                                onChange={(e) =>
                                    setFilterReservationStatus(e.target.value)
                                }
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                            >
                                <option value="all">予約状況：すべて</option>
                                <option value="confirmed">確定</option>
                                <option value="cancelled">キャンセル</option>
                                <option value="noshow">ドタキャン</option>
                                <option value="pending">保留中</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        請求ID
                                    </th>
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
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        金額
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        割引
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        期限日
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        支払日
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
                                {filtered.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {b.id}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {b.reservationId}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {b.memberName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {b.checkIn}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {b.checkOut}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="text-sm text-gray-900 font-medium">
                                                ¥{b.amount.toLocaleString()}
                                            </div>
                                            {b.breakdown?.depositRefunded && (
                                                <div className="text-[11px] text-green-600 whitespace-nowrap">
                                                    保証金返金後
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {(() => {
                                                const rule = b.breakdown
                                                    ?.adjustmentRuleId
                                                    ? priceAdjustmentRules.find(
                                                          (p) =>
                                                              p.id ===
                                                              b.breakdown
                                                                  ?.adjustmentRuleId,
                                                      )
                                                    : null;
                                                const adj =
                                                    b.breakdown?.adjustment ??
                                                    0;
                                                if (rule) {
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                title={
                                                                    rule.name
                                                                }
                                                                className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full shrink-0"
                                                            >
                                                                {rule.name.slice(
                                                                    0,
                                                                    2,
                                                                )}
                                                            </span>
                                                            <div className="flex flex-col leading-tight">
                                                                <span className="text-xs font-medium text-purple-700 whitespace-nowrap">
                                                                    -
                                                                    {
                                                                        rule.discountPercent
                                                                    }
                                                                    %
                                                                </span>
                                                                <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                                                                    ¥
                                                                    {Math.abs(
                                                                        adj,
                                                                    ).toLocaleString()}
                                                                    引
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                if (adj !== 0) {
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                title="手動調整"
                                                                className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-full shrink-0"
                                                            >
                                                                手動
                                                            </span>
                                                            <span
                                                                className={`text-xs font-medium whitespace-nowrap ${adj < 0 ? "text-red-500" : "text-green-600"}`}
                                                            >
                                                                {adj < 0
                                                                    ? "−"
                                                                    : "+"}
                                                                ¥
                                                                {Math.abs(
                                                                    adj,
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <span className="text-xs text-gray-300">
                                                        —
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {b.dueDate}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {b.paidAt || "−"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {reservationStatusBadge(
                                                b.reservationStatus,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {statusBadge(b.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openDetail(b)}
                                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                                                title="詳細を見る"
                                            >
                                                <FaEye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════
                詳細モーダル
            ════════════════════════════════════════ */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-xl my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ヘッダー */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">
                                    請求ID: {selected.id} ／ 予約ID:{" "}
                                    {selected.reservationId}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base text-gray-900">
                                        {selected.memberName}
                                    </h3>
                                    {statusBadge(selected.status)}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-6">
                            {/* 宿泊者情報 */}
                            <Section
                                icon={<FaUser className="w-3 h-3" />}
                                title="宿泊者情報"
                            >
                                <div className="bg-gray-50 rounded-lg px-4 py-1">
                                    <InfoRow
                                        label="氏名"
                                        value={selected.memberName}
                                    />
                                    <InfoRow
                                        label="メール"
                                        value={
                                            selected.memberEmail || (
                                                <span className="text-gray-400">
                                                    −
                                                </span>
                                            )
                                        }
                                    />
                                    <InfoRow
                                        label="電話番号"
                                        value={selected.memberPhone}
                                    />
                                    <InfoRow
                                        label="請求作成日"
                                        value={selected.createdAt}
                                    />
                                </div>
                            </Section>

                            {/* 宿泊内容 */}
                            <Section
                                icon={<FaBed className="w-3 h-3" />}
                                title="宿泊内容"
                            >
                                <div className="bg-gray-50 rounded-lg px-4 py-1">
                                    <InfoRow
                                        label="チェックイン"
                                        value={selected.checkIn}
                                    />
                                    <InfoRow
                                        label="チェックアウト"
                                        value={selected.checkOut}
                                    />
                                    <InfoRow
                                        label="泊数 / 人数"
                                        value={`${selected.nights}泊 / ${selected.guests}名`}
                                    />
                                    <InfoRow
                                        label="ペット"
                                        value={petLabel(
                                            selected.hasPet,
                                            selected.petBreed,
                                        )}
                                    />
                                    <InfoRow
                                        label="滞在サポート"
                                        value={
                                            detailSelectedRule?.noSupportPlan ? (
                                                <span className="flex items-center gap-2">
                                                    <span>
                                                        {selected.supportFee
                                                            ? "あり"
                                                            : "なし"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                                        <FaBan className="w-2.5 h-2.5" />{" "}
                                                        選択不可
                                                    </span>
                                                </span>
                                            ) : selected.supportFee ? (
                                                "あり"
                                            ) : (
                                                "なし"
                                            )
                                        }
                                    />
                                    {selected.note && (
                                        <InfoRow
                                            label="備考"
                                            value={selected.note}
                                        />
                                    )}
                                </div>
                            </Section>

                            {/* 体験オプション */}
                            {Array.isArray(selected.experiences) &&
                                selected.experiences.length > 0 && (
                                    <Section
                                        icon={<FaStar className="w-3 h-3" />}
                                        title="体験オプション"
                                    >
                                        {detailSelectedRule?.noExperienceOptions && (
                                            <div className="flex items-start gap-2 px-3 py-2.5 mb-2 bg-red-50 border border-red-200 rounded-lg">
                                                <FaBan className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-red-700">
                                                    「{detailSelectedRule.name}
                                                    」はオプション選択不可の割引です。
                                                </p>
                                            </div>
                                        )}
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
                                                    {selected.experiences.map(
                                                        (exp, i) => (
                                                            <tr
                                                                key={i}
                                                                className="border-b border-gray-100 last:border-0"
                                                            >
                                                                <td className="px-4 py-2.5 text-gray-900">
                                                                    {exp.name}
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right text-gray-700">
                                                                    ¥
                                                                    {(
                                                                        exp.price ??
                                                                        0
                                                                    ).toLocaleString()}
                                                                    <span className="text-xs text-gray-400 ml-1">
                                                                        （
                                                                        {
                                                                            exp.priceNote
                                                                        }
                                                                        ）
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Section>
                                )}

                            {/* 料金内訳 */}
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
                                                    selected.breakdown
                                                        ?.baseAmount ?? 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        {selected.breakdown.guestExtra > 0 && (
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <span className="text-gray-600">
                                                    追加人数料金（
                                                    {selected.guests - 5}名 ×
                                                    {selected.nights}
                                                    泊）
                                                </span>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {selected.breakdown.guestExtra.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selected.breakdown.petFee > 0 && (
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <FaDog className="w-3 h-3" />
                                                    <span>ペット料金</span>
                                                </div>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {selected.breakdown.petFee.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selected.breakdown.supportFee > 0 && (
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <FaConciergeBell className="w-3 h-3" />
                                                    <span>滞在サポート料</span>
                                                </div>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {selected.breakdown.supportFee.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selected.breakdown.transferSurcharge >
                                            0 && (
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <span className="text-gray-600 pl-4">
                                                    └ 送迎追加（5名以上）
                                                </span>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {selected.breakdown.transferSurcharge.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selected.breakdown.experiencesTotal >
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
                                                    {selected.breakdown.experiencesTotal.toLocaleString()}
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
                                                    (selected.breakdown
                                                        ?.baseAmount ?? 0) +
                                                    (selected.breakdown
                                                        ?.guestExtra ?? 0) +
                                                    (selected.breakdown
                                                        ?.petFee ?? 0) +
                                                    (selected.breakdown
                                                        ?.supportFee ?? 0) +
                                                    (selected.breakdown
                                                        ?.transferSurcharge ??
                                                        0) +
                                                    (selected.breakdown
                                                        ?.experiencesTotal ?? 0)
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        {(selected.breakdown.adjustment ??
                                            0) !== 0 &&
                                            (() => {
                                                const rule = selected.breakdown
                                                    .adjustmentRuleId
                                                    ? priceAdjustmentRules.find(
                                                          (p) =>
                                                              p.id ===
                                                              selected.breakdown
                                                                  .adjustmentRuleId,
                                                      )
                                                    : null;
                                                const adj =
                                                    selected.breakdown
                                                        .adjustment ?? 0;
                                                return (
                                                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                        <div className="flex items-center gap-2 text-purple-700">
                                                            {rule && (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-purple-50 border border-purple-200 rounded-full">
                                                                    {rule.name.slice(
                                                                        0,
                                                                        2,
                                                                    )}
                                                                </span>
                                                            )}
                                                            <span>
                                                                {rule
                                                                    ? `${rule.name}（-${rule.discountPercent}%）`
                                                                    : selected
                                                                          .breakdown
                                                                          .adjustmentNote ||
                                                                      "手動調整"}
                                                            </span>
                                                        </div>
                                                        <span className="text-red-500 font-medium">
                                                            {adj < 0
                                                                ? "−"
                                                                : "+"}
                                                            ¥
                                                            {Math.abs(
                                                                adj,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
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
                                                    selected.breakdown
                                                        ?.deposit ?? 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        {selected.breakdown
                                            ?.depositRefunded && (
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-green-50">
                                                <span className="text-green-700 font-medium">
                                                    保証金返金済
                                                </span>
                                                <span className="text-green-700 font-medium">
                                                    −¥
                                                    {(
                                                        selected.breakdown
                                                            ?.depositRefundAmount ??
                                                        10000
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3.5 bg-[#0a2105]">
                                        <span className="text-white text-sm font-semibold">
                                            {selected.breakdown?.depositRefunded
                                                ? "決済済金額（税込）"
                                                : "お支払い合計（税込）"}
                                        </span>
                                        <span className="text-white text-xl font-bold tracking-tight">
                                            ¥{selected.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    ※ お支払いはすべて来場時現金払いとなります
                                </p>
                            </Section>

                            {/* 料金調整を変更 */}
                            <Section
                                icon={<FaYenSign className="w-3 h-3" />}
                                title="料金調整を変更"
                            >
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                                    {/* マスタルール選択 */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-amber-700">
                                            マスタから選択
                                        </p>
                                        {detailApplicableRules.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">
                                                現在の条件（人数・日程）に該当する割引なし
                                            </p>
                                        ) : (
                                            <div className="space-y-1">
                                                {detailApplicableRules.map(
                                                    (rule) => {
                                                        const accommodationBase =
                                                            (selected.breakdown
                                                                ?.baseAmount ??
                                                                0) +
                                                            (selected.breakdown
                                                                ?.guestExtra ??
                                                                0);
                                                        const discountAmt =
                                                            Math.round(
                                                                (accommodationBase *
                                                                    rule.discountPercent) /
                                                                    100,
                                                            );
                                                        const isRuleSelected =
                                                            editAdjustmentRuleId ===
                                                            rule.id;
                                                        const hasExperiences =
                                                            Array.isArray(
                                                                selected.experiences,
                                                            ) &&
                                                            selected.experiences
                                                                .length > 0;
                                                        const blockedByOptions =
                                                            (rule.noExperienceOptions &&
                                                                hasExperiences) ||
                                                            (rule.noSupportPlan &&
                                                                selected.supportFee);
                                                        return (
                                                            <button
                                                                key={rule.id}
                                                                type="button"
                                                                // 選択済みの場合は制約違反でも解除できるようにする
                                                                disabled={
                                                                    blockedByOptions &&
                                                                    !isRuleSelected
                                                                }
                                                                onClick={() => {
                                                                    if (
                                                                        isRuleSelected
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
                                                                              hasExperiences
                                                                                  ? "体験オプションが含まれているため要注意"
                                                                                  : "",
                                                                              rule.noSupportPlan &&
                                                                              selected.supportFee
                                                                                  ? "滞在サポートが含まれているため要注意"
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
                                                                    isRuleSelected &&
                                                                    blockedByOptions
                                                                        ? "border-orange-400 bg-orange-50 text-orange-800 font-medium"
                                                                        : blockedByOptions
                                                                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                                                          : isRuleSelected
                                                                            ? "border-amber-500 bg-white text-amber-800 font-medium"
                                                                            : "border-amber-200 bg-white/70 text-gray-700 hover:border-amber-400"
                                                                }`}
                                                            >
                                                                <span className="truncate mr-1 flex items-center gap-1">
                                                                    {blockedByOptions && (
                                                                        <FaBan
                                                                            className={`w-3 h-3 shrink-0 ${
                                                                                isRuleSelected
                                                                                    ? "text-orange-500"
                                                                                    : "text-red-400"
                                                                            }`}
                                                                        />
                                                                    )}
                                                                    {rule.name}
                                                                </span>
                                                                <span
                                                                    className={`shrink-0 font-semibold ${
                                                                        isRuleSelected &&
                                                                        blockedByOptions
                                                                            ? "text-orange-600"
                                                                            : isRuleSelected
                                                                              ? "text-red-500"
                                                                              : blockedByOptions
                                                                                ? "text-gray-400"
                                                                                : "text-amber-600"
                                                                    }`}
                                                                >
                                                                    {
                                                                        rule.discountPercent
                                                                    }
                                                                    % OFF
                                                                    {isRuleSelected
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

                                    {/* 手動調整 */}
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
                                                        e.target.value === ""
                                                            ? 0
                                                            : parseInt(
                                                                  e.target
                                                                      .value,
                                                                  10,
                                                              );
                                                    setEditAdjustment(
                                                        isNaN(v) ? 0 : v,
                                                    );
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

                                    {/* プレビュー */}
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
                                                {editAdjustment < 0 ? "−" : "+"}
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
                                                    selected.amount -
                                                    (selected.breakdown
                                                        .adjustment ?? 0) +
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

                            {/* 支払情報 */}
                            <Section
                                icon={<FaCreditCard className="w-3 h-3" />}
                                title="支払情報"
                            >
                                <div className="bg-gray-50 rounded-lg px-4 py-1">
                                    <InfoRow
                                        label="現在の状態"
                                        value={statusBadge(selected.status)}
                                    />
                                    <InfoRow
                                        label="支払期限"
                                        value={selected.dueDate}
                                    />
                                    <InfoRow
                                        label="支払日"
                                        value={
                                            selected.paidAt ?? (
                                                <span className="text-gray-400">
                                                    未払い
                                                </span>
                                            )
                                        }
                                    />
                                </div>
                            </Section>

                            {/* 支払状況を変更 */}
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
                                            const isActive = editStatus === s;
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => {
                                                        setEditStatus(s);
                                                        setStatusSaved(false);
                                                    }}
                                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                                                        isActive
                                                            ? cfg.cls +
                                                              " ring-2 ring-offset-1 ring-current"
                                                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {cfg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={handleStatusSave}
                                        disabled={
                                            editStatus === selected.status &&
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
                                            "支払状況を保存"
                                        )}
                                    </button>
                                </div>
                            </Section>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
