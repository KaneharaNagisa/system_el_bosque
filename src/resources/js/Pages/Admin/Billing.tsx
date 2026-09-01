import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaCreditCard,
    FaSearch,
    FaEye,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaUser,
    FaBed,
    FaYenSign,
    FaDog,
    FaConciergeBell,
    FaStar,
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
    adjustment?: number;
    adjustmentNote?: string;
    adjustmentRuleId?: string;
}

interface Billing {
    id: string;
    dbId: number;
    reservationId: string;
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
    experiences: unknown[];
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

const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        paid: { label: "支払済", cls: "bg-blue-100 text-blue-800" },
        unpaid: { label: "未払い", cls: "bg-orange-100 text-orange-800" },
        refunded: { label: "返金済", cls: "bg-gray-100 text-gray-800" },
        partial: { label: "一部支払", cls: "bg-yellow-100 text-yellow-800" },
    };
    const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-0.5 rounded text-xs ${s.cls}`}>{s.label}</span>;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
            <span className="w-32 shrink-0 text-xs text-gray-500">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
        </div>
    );
}

export default function Billing({ billings, priceAdjustmentRules }: { billings: Billing[]; priceAdjustmentRules: PriceRule[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedItem, setSelectedItem] = useState<Billing | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 20;

    // 詳細モーダル内の編集状態
    const [editStatus, setEditStatus] = useState("");
    const [statusSaved, setStatusSaved] = useState(false);
    const [editAdjustment, setEditAdjustment] = useState(0);
    const [editAdjustmentNote, setEditAdjustmentNote] = useState("");
    const [editAdjustmentRuleId, setEditAdjustmentRuleId] = useState("");
    const [adjustmentSaved, setAdjustmentSaved] = useState(false);

    const filtered = useMemo(
        () =>
            billings.filter((b) => {
                const matchSearch =
                    !searchQuery ||
                    b.memberName.includes(searchQuery) ||
                    b.id.includes(searchQuery);
                const matchStatus =
                    filterStatus === "all" || b.status === filterStatus;
                return matchSearch && matchStatus;
            }),
        [billings, searchQuery, filterStatus],
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );

    const totalRevenue = billings
        .filter((b) => b.status === "paid")
        .reduce((sum, b) => sum + b.amount, 0);
    const totalUnpaid = billings
        .filter((b) => b.status === "unpaid")
        .reduce((sum, b) => sum + b.amount, 0);
    const totalRefunded = billings
        .filter((b) => b.status === "refunded")
        .reduce((sum, b) => sum + b.amount, 0);
    const unpaidCount = billings.filter((b) => b.status === "unpaid").length;

    const handleStatusChange = (dbId: number, status: string) => {
        router.patch(`/admin/billing/${dbId}`, { status });
    };

    const openDetail = (b: Billing) => {
        setSelectedItem(b);
        setIsDetailOpen(true);
        setEditStatus(b.status);
        setStatusSaved(false);
        setEditAdjustment(b.breakdown?.adjustment ?? 0);
        setEditAdjustmentNote(b.breakdown?.adjustmentNote ?? "");
        setEditAdjustmentRuleId(b.breakdown?.adjustmentRuleId ?? "");
        setAdjustmentSaved(false);
    };

    const handleStatusSave = () => {
        if (!selectedItem) return;
        router.patch(`/admin/billing/${selectedItem.dbId}`, { status: editStatus }, {
            onSuccess: () => setStatusSaved(true),
        });
    };

    const handleAdjustmentSave = () => {
        if (!selectedItem) return;
        router.patch(`/admin/billing/${selectedItem.dbId}/adjustment`, {
            adjustment: editAdjustment,
            adjustment_note: editAdjustmentNote,
            adjustment_rule_id: editAdjustmentRuleId || null,
        }, {
            onSuccess: () => setAdjustmentSaved(true),
        });
    };

    const detailApplicableRules = useMemo(() => {
        if (!selectedItem) return [];
        return priceAdjustmentRules.filter((rule) => {
            if (rule.hasGuestRange) {
                if (rule.guestMin !== null && selectedItem.guests < rule.guestMin) return false;
                if (rule.guestMax !== null && selectedItem.guests > rule.guestMax) return false;
            }
            if (rule.hasPeriod && selectedItem.checkIn) {
                if (selectedItem.checkIn < rule.periodStart || selectedItem.checkIn > rule.periodEnd) return false;
            }
            return true;
        });
    }, [selectedItem, priceAdjustmentRules]);

    return (
        <AdminLayout currentPage="billing" title="請求管理">
            <div className="max-w-7xl mx-auto">
                {/* サマリ */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">支払済合計</p>
                        <p className="text-2xl text-green-600">¥{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">未払い合計</p>
                        <p className="text-2xl text-orange-600">¥{totalUnpaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs text-gray-500 mb-1">返金済合計</p>
                        <p className="text-2xl text-gray-600">¥{totalRefunded.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaCreditCard className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    請求一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{billings.length}件
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="会員名、請求IDで検索"
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
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                            >
                                <option value="all">すべて</option>
                                <option value="unpaid">未払い</option>
                                <option value="paid">支払済</option>
                                <option value="refunded">返金済</option>
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
                                        会員名
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        チェックイン
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        金額
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        支払期限
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        状況
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((b) => (
                                    <tr
                                        key={b.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {b.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {b.memberName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {b.checkIn}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                            ¥{b.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {b.dueDate}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {statusBadge(b.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openDetail(b)}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                >
                                                    <FaEye className="w-3.5 h-3.5" />
                                                </button>
                                                {b.status === "unpaid" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                b.dbId,
                                                                "paid",
                                                            )
                                                        }
                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                    >
                                                        支払済にする
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-sm text-gray-400"
                                        >
                                            請求データがありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {filtered.length}件中{" "}
                                {(currentPage - 1) * perPage + 1}〜
                                {Math.min(
                                    currentPage * perPage,
                                    filtered.length,
                                )}
                                件
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"
                                >
                                    <FaChevronLeft className="w-3 h-3" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded text-sm ${currentPage === i + 1 ? "bg-[#0a2105] text-white" : "hover:bg-gray-100 text-gray-700"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"
                                >
                                    <FaChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 詳細モーダル */}
                {isDetailOpen && selectedItem && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setIsDetailOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-xl w-full my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">請求ID: {selectedItem.id} ／ 予約ID: {selectedItem.reservationId}</p>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base text-gray-900">{selectedItem.memberName}</h3>
                                        {statusBadge(selectedItem.status)}
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-6">
                                {/* 宿泊者情報 */}
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <FaUser className="w-3 h-3 text-gray-400" />
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">宿泊者情報</h4>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg px-4 py-1">
                                        <InfoRow label="氏名" value={selectedItem.memberName} />
                                        <InfoRow label="メール" value={selectedItem.memberEmail || "−"} />
                                        <InfoRow label="電話番号" value={selectedItem.memberPhone} />
                                        <InfoRow label="請求作成日" value={selectedItem.createdAt} />
                                    </div>
                                </div>

                                {/* 宿泊内容 */}
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <FaBed className="w-3 h-3 text-gray-400" />
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">宿泊内容</h4>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg px-4 py-1">
                                        <InfoRow label="チェックイン" value={selectedItem.checkIn} />
                                        <InfoRow label="チェックアウト" value={selectedItem.checkOut} />
                                        <InfoRow label="泊数 / 人数" value={`${selectedItem.nights}泊 / ${selectedItem.guests}名`} />
                                        <InfoRow label="ペット" value={`${PET_LABELS[selectedItem.hasPet] || selectedItem.hasPet}${selectedItem.petBreed ? `（${selectedItem.petBreed}）` : ""}`} />
                                        <InfoRow label="滞在サポート" value={selectedItem.supportFee ? "あり" : "なし"} />
                                        {selectedItem.note && <InfoRow label="備考" value={selectedItem.note} />}
                                    </div>
                                </div>

                                {/* 料金内訳 */}
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <FaYenSign className="w-3 h-3 text-gray-400" />
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">料金内訳</h4>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="divide-y divide-gray-100">
                                            <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                <span className="text-gray-600">基本宿泊料</span>
                                                <span className="text-gray-900">¥{(selectedItem.breakdown?.baseAmount || 0).toLocaleString()}</span>
                                            </div>
                                            {(selectedItem.breakdown?.petFee || 0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="flex items-center gap-1.5 text-gray-600"><FaDog className="w-3 h-3" />ペット料金</span>
                                                    <span className="text-gray-900">¥{(selectedItem.breakdown?.petFee || 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {(selectedItem.breakdown?.supportFee || 0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="flex items-center gap-1.5 text-gray-600"><FaConciergeBell className="w-3 h-3" />滞在サポート料</span>
                                                    <span className="text-gray-900">¥{(selectedItem.breakdown?.supportFee || 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {(selectedItem.breakdown?.experiencesTotal || 0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="flex items-center gap-1.5 text-gray-600"><FaStar className="w-3 h-3" />体験オプション計</span>
                                                    <span className="text-gray-900">¥{(selectedItem.breakdown?.experiencesTotal || 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {(selectedItem.breakdown?.adjustment ?? 0) !== 0 && (() => {
                                                const rule = selectedItem.breakdown?.adjustmentRuleId
                                                    ? priceAdjustmentRules.find(p => p.id === selectedItem.breakdown?.adjustmentRuleId)
                                                    : null;
                                                const adj = selectedItem.breakdown?.adjustment ?? 0;
                                                return (
                                                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                        <span className="text-purple-700">{rule ? `${rule.name}（-${rule.discountPercent}%）` : (selectedItem.breakdown?.adjustmentNote || "手動調整")}</span>
                                                        <span className="text-red-500 font-medium">{adj < 0 ? "−" : "+"}¥{Math.abs(adj).toLocaleString()}</span>
                                                    </div>
                                                );
                                            })()}
                                            {(selectedItem.breakdown?.deposit || 0) > 0 && (
                                                <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                                                    <span className="text-gray-600">保証料<span className="ml-1.5 text-xs text-green-600 font-medium">返金制</span></span>
                                                    <span className="text-gray-900">¥{(selectedItem.breakdown?.deposit || 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3.5 bg-[#0a2105]">
                                            <span className="text-white text-sm font-semibold">お支払い合計（税込）</span>
                                            <span className="text-white text-xl font-bold">¥{selectedItem.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">※ お支払いはすべて来場時現金払いとなります</p>
                                </div>

                                {/* 支払ステータス変更 */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                    <p className="text-xs font-medium text-gray-700">支払ステータスを変更</p>
                                    <div className="flex gap-2">
                                        {(["unpaid", "paid", "refunded", "partial"] as const).map((s) => (
                                            <button key={s} onClick={() => { setEditStatus(s); setStatusSaved(false); }}
                                                className={`flex-1 py-1.5 text-xs rounded-lg border-2 transition-all ${editStatus === s ? (s === "paid" ? "border-blue-400 bg-blue-50 text-blue-800 font-medium" : s === "unpaid" ? "border-orange-400 bg-orange-50 text-orange-700 font-medium" : s === "refunded" ? "border-gray-400 bg-gray-100 text-gray-700 font-medium" : "border-yellow-400 bg-yellow-50 text-yellow-700 font-medium") : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                                                {s === "paid" ? "支払済" : s === "unpaid" ? "未払い" : s === "refunded" ? "返金済" : "一部支払"}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-end">
                                        {statusSaved ? (
                                            <span className="text-xs text-green-600">✓ 保存しました</span>
                                        ) : (
                                            <button onClick={handleStatusSave} className="px-3 py-1.5 text-xs bg-[#0a2105] text-white rounded-lg hover:bg-[#071a04]">保存する</button>
                                        )}
                                    </div>
                                </div>

                                {/* 料金調整 */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                                    <p className="text-xs font-medium text-amber-700">料金調整</p>

                                    {detailApplicableRules.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs text-gray-600">マスタから選択</p>
                                            {detailApplicableRules.map((rule) => {
                                                const baseAmt = (selectedItem.breakdown?.baseAmount || 0) + (selectedItem.breakdown?.guestExtra || 0);
                                                const discountAmt = Math.round(baseAmt * rule.discountPercent / 100);
                                                const isSelected = editAdjustmentRuleId === rule.id;
                                                const blockedByOptions =
                                                    (rule.noExperienceOptions && (selectedItem.breakdown?.experiencesTotal || 0) > 0) ||
                                                    (rule.noSupportPlan && (selectedItem.breakdown?.supportFee || 0) > 0);
                                                return (
                                                    <button key={rule.id} type="button" disabled={blockedByOptions}
                                                        onClick={() => {
                                                            if (isSelected) { setEditAdjustmentRuleId(""); setEditAdjustment(0); setEditAdjustmentNote(""); }
                                                            else { setEditAdjustmentRuleId(rule.id); setEditAdjustment(-discountAmt); setEditAdjustmentNote(rule.name); }
                                                            setAdjustmentSaved(false);
                                                        }}
                                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${isSelected ? "border-purple-400 bg-purple-50" : blockedByOptions ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed" : "border-gray-200 bg-white hover:border-purple-300"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="font-medium text-gray-900">{rule.name}</span>
                                                                <span className="ml-2 text-amber-700 text-xs">-{rule.discountPercent}%</span>
                                                            </div>
                                                            <span className="text-red-500 text-xs font-medium">¥{discountAmt.toLocaleString()}引</span>
                                                        </div>
                                                        {blockedByOptions && <p className="text-xs text-gray-400 mt-1">（体験/サポートが含まれているため適用不可）</p>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-600">手動調整金額（マイナス値で割引）</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">¥</span>
                                            <input type="number" value={editAdjustment}
                                                onChange={(e) => { setEditAdjustment(Number(e.target.value)); setEditAdjustmentRuleId(""); setAdjustmentSaved(false); }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]" />
                                        </div>
                                        <input type="text" placeholder="調整メモ（例: 特別割引）" value={editAdjustmentNote}
                                            onChange={(e) => { setEditAdjustmentNote(e.target.value); setAdjustmentSaved(false); }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]" />
                                    </div>

                                    <div className="flex justify-end">
                                        {adjustmentSaved ? (
                                            <span className="text-xs text-green-600">✓ 保存しました</span>
                                        ) : (
                                            <button onClick={handleAdjustmentSave} className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700">調整を保存</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
