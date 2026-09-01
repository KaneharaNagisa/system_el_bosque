import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaCalendarAlt,
    FaSearch,
    FaEye,
    FaTimes,
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

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
    experiences: unknown[];
    status: string;
    payment: string;
    amount: number;
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

const statusBadge = (status: string, type: "reservation" | "payment") => {
    const rMap: Record<string, { label: string; cls: string }> = {
        confirmed: { label: "確定", cls: "bg-green-100 text-green-800" },
        pending: { label: "保留中", cls: "bg-yellow-100 text-yellow-800" },
        cancelled: { label: "キャンセル", cls: "bg-red-100 text-red-800" },
    };
    const pMap: Record<string, { label: string; cls: string }> = {
        paid: { label: "支払済", cls: "bg-blue-100 text-blue-800" },
        unpaid: { label: "未払い", cls: "bg-orange-100 text-orange-800" },
        refunded: { label: "返金済", cls: "bg-gray-100 text-gray-800" },
        partial: { label: "一部支払", cls: "bg-yellow-100 text-yellow-800" },
    };
    const map = type === "reservation" ? rMap : pMap;
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

export default function Reservations({
    reservations,
}: {
    reservations: Reservation[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedItem, setSelectedItem] = useState<Reservation | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 20;

    const filtered = useMemo(
        () =>
            reservations.filter((r) => {
                const matchSearch =
                    !searchQuery ||
                    r.memberName.includes(searchQuery) ||
                    r.id.includes(searchQuery);
                const matchStatus =
                    filterStatus === "all" || r.status === filterStatus;
                return matchSearch && matchStatus;
            }),
        [reservations, searchQuery, filterStatus],
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );

    const handleStatusChange = (dbId: number, status: string) => {
        router.patch(`/admin/reservations/${dbId}`, { status });
    };

    return (
        <AdminLayout currentPage="reservations" title="予約管理">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    予約一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{reservations.length}件 | 保留中:{" "}
                                    {
                                        reservations.filter(
                                            (r) => r.status === "pending",
                                        ).length
                                    }
                                    件
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="会員名、予約IDで検索"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                            >
                                <option value="all">すべて</option>
                                <option value="pending">保留中</option>
                                <option value="confirmed">確定</option>
                                <option value="cancelled">キャンセル</option>
                            </select>
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
                                        人数
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
                                {paginated.map((r) => (
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
                                            {r.guests}名
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {statusBadge(
                                                r.status,
                                                "reservation",
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {statusBadge(r.payment, "payment")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(r);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                    title="詳細"
                                                >
                                                    <FaEye className="w-3.5 h-3.5" />
                                                </button>
                                                {r.status === "pending" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                r.dbId,
                                                                "confirmed",
                                                            )
                                                        }
                                                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        確定
                                                    </button>
                                                )}
                                                {r.status !== "cancelled" && (
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "キャンセルしますか？",
                                                                )
                                                            )
                                                                handleStatusChange(
                                                                    r.dbId,
                                                                    "cancelled",
                                                                );
                                                        }}
                                                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                    >
                                                        取消
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-8 text-center text-sm text-gray-400"
                                        >
                                            予約データがありません
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
                                    予約詳細
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
                                        ["予約ID", selectedItem.id],
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
                                            "ペット",
                                            PET_LABELS[selectedItem.hasPet] ||
                                                selectedItem.hasPet,
                                        ],
                                        [
                                            "滞在サポート",
                                            selectedItem.supportFee
                                                ? "あり"
                                                : "なし",
                                        ],
                                        ["予約状況", selectedItem.status],
                                        ["支払状況", selectedItem.payment],
                                        [
                                            "請求金額",
                                            `¥${selectedItem.amount.toLocaleString()}`,
                                        ],
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
