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
} from "react-icons/fa";

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
    breakdown?: Record<string, number>;
    amount: number;
    status: string;
    paidAt?: string;
    dueDate: string;
    note?: string;
    createdAt: string;
}

const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        paid: { label: "支払済", cls: "bg-blue-100 text-blue-800" },
        unpaid: { label: "未払い", cls: "bg-orange-100 text-orange-800" },
        refunded: { label: "返金済", cls: "bg-gray-100 text-gray-800" },
        partial: { label: "一部支払", cls: "bg-yellow-100 text-yellow-800" },
    };
    const s = map[status] || {
        label: status,
        cls: "bg-gray-100 text-gray-800",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs ${s.cls}`}>
            {s.label}
        </span>
    );
};

export default function Billing({ billings }: { billings: Billing[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedItem, setSelectedItem] = useState<Billing | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 20;

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
    const unpaidCount = billings.filter((b) => b.status === "unpaid").length;

    const handleStatusChange = (dbId: number, status: string) => {
        router.patch(`/admin/billing/${dbId}`, { status });
    };

    return (
        <AdminLayout currentPage="billing" title="請求管理">
            <div className="max-w-7xl mx-auto">
                {/* サマリ */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">
                            総売上（支払済）
                        </p>
                        <p className="text-2xl text-gray-900">
                            ¥{totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">未払い件数</p>
                        <p className="text-2xl text-orange-600">
                            {unpaidCount}件
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-1">請求総件数</p>
                        <p className="text-2xl text-gray-900">
                            {billings.length}件
                        </p>
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
                                                    onClick={() => {
                                                        setSelectedItem(b);
                                                        setIsDetailOpen(true);
                                                    }}
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsDetailOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    請求詳細
                                </h3>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                {(
                                    [
                                        ["請求ID", selectedItem.id],
                                        ["予約ID", selectedItem.reservationId],
                                        ["会員名", selectedItem.memberName],
                                        ["メール", selectedItem.memberEmail],
                                        ["電話", selectedItem.memberPhone],
                                        ["チェックイン", selectedItem.checkIn],
                                        [
                                            "チェックアウト",
                                            selectedItem.checkOut,
                                        ],
                                        ["宿泊数", `${selectedItem.nights}泊`],
                                        ["人数", `${selectedItem.guests}名`],
                                        [
                                            "請求金額",
                                            `¥${selectedItem.amount.toLocaleString()}`,
                                        ],
                                        ["支払期限", selectedItem.dueDate],
                                        [
                                            "支払日",
                                            selectedItem.paidAt || "未払い",
                                        ],
                                        ["ステータス", selectedItem.status],
                                    ] as [string, string][]
                                ).map(([label, value]) => (
                                    <div key={label} className="flex">
                                        <span className="w-40 shrink-0 text-sm text-gray-500">
                                            {label}
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                                {selectedItem.breakdown && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-600 mb-2">
                                            料金内訳
                                        </p>
                                        {Object.entries(
                                            selectedItem.breakdown,
                                        ).map(([k, v]) => (
                                            <div
                                                key={k}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-gray-500">
                                                    {k}
                                                </span>
                                                <span className="text-gray-900">
                                                    ¥
                                                    {(
                                                        v as number
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
