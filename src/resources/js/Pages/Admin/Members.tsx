import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaUsers,
    FaSearch,
    FaTrashAlt,
    FaFilter,
    FaSortAmountDown,
    FaSortAmountUp,
    FaSort,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaEye,
} from "react-icons/fa";

interface Member {
    id: string;
    dbId: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    hasPet: string;
    petBreed?: string;
    petBreed2?: string;
    hasFamily?: string;
    howFound?: string;
    registeredAt: string;
    lastLoginAt?: string;
    status: string;
}

const petLabels: Record<string, string> = {
    none: "なし",
    small1: "小型犬1頭",
    small2: "小型犬2頭",
    large1: "大型犬1頭",
    large2: "大型犬2頭",
};
const familyLabels: Record<string, string> = {
    individual: "個人",
    friends: "友人",
    couple: "カップル",
    married: "ご夫婦",
    family: "ご家族（お子さんあり）",
};

export default function Members({
    members: initialMembers,
}: {
    members: Member[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPet, setFilterPet] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 20;

    const filtered = useMemo(() => {
        return initialMembers.filter((m) => {
            const matchSearch =
                !searchQuery ||
                m.name.includes(searchQuery) ||
                m.email.includes(searchQuery) ||
                m.id.includes(searchQuery);
            const matchStatus =
                filterStatus === "all" || m.status === filterStatus;
            const matchPet = filterPet === "all" || m.hasPet === filterPet;
            return matchSearch && matchStatus && matchPet;
        });
    }, [initialMembers, searchQuery, filterStatus, filterPet]);

    const sorted = useMemo(() => {
        if (!sortField) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal =
                ((a as Record<string, unknown>)[sortField] as string) ?? "";
            const bVal =
                ((b as Record<string, unknown>)[sortField] as string) ?? "";
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortField, sortDir]);

    const totalPages = Math.ceil(sorted.length / perPage);
    const paginated = sorted.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );

    const handleSort = (field: string) => {
        if (sortField === field) {
            if (sortDir === "asc") setSortDir("desc");
            else {
                setSortField(null);
                setSortDir("asc");
            }
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field)
            return <FaSort className="w-3 h-3 text-gray-400 ml-1" />;
        return sortDir === "asc" ? (
            <FaSortAmountUp className="w-3 h-3 text-gray-800 ml-1" />
        ) : (
            <FaSortAmountDown className="w-3 h-3 text-gray-800 ml-1" />
        );
    };

    const handleDelete = (dbId: number) => {
        if (confirm("この会員を削除しますか？")) {
            router.delete(`/admin/members/${dbId}`);
        }
    };

    return (
        <AdminLayout currentPage="members" title="会員管理">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                                    <FaUsers
                                        className="w-4 h-4"
                                        style={{ color: "#0a2105" }}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-base text-gray-900">
                                        会員一覧
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        登録会員数: {initialMembers.length}名 |
                                        検索結果: {filtered.length}名
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="名前、メール、IDで検索"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] focus:border-[#0a2105] outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <FaFilter className="w-3 h-3" /> 絞り込み
                                </button>
                                {(filterStatus !== "all" ||
                                    filterPet !== "all") && (
                                    <button
                                        onClick={() => {
                                            setFilterStatus("all");
                                            setFilterPet("all");
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <FaTimes className="w-3 h-3" />{" "}
                                        フィルタ解除
                                    </button>
                                )}
                            </div>
                            {showFilters && (
                                <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            ステータス
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => {
                                                setFilterStatus(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                                        >
                                            <option value="all">すべて</option>
                                            <option value="active">
                                                利用中
                                            </option>
                                            <option value="withdrawn">
                                                退会
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            ペット同伴
                                        </label>
                                        <select
                                            value={filterPet}
                                            onChange={(e) => {
                                                setFilterPet(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                                        >
                                            <option value="all">すべて</option>
                                            <option value="none">なし</option>
                                            <option value="small1">
                                                小型犬1頭
                                            </option>
                                            <option value="small2">
                                                小型犬2頭
                                            </option>
                                            <option value="large1">
                                                大型犬1頭
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
                                        ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        名前
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        メール
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        宿泊形態
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        ペット
                                    </th>
                                    <th
                                        className="text-left px-4 py-3 text-xs text-gray-500 cursor-pointer"
                                        onClick={() =>
                                            handleSort("registeredAt")
                                        }
                                    >
                                        <span className="flex items-center">
                                            登録日
                                            <SortIcon field="registeredAt" />
                                        </span>
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        ステータス
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {m.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {m.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {m.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {m.hasFamily
                                                ? familyLabels[m.hasFamily] ||
                                                  m.hasFamily
                                                : "−"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {petLabels[m.hasPet] || m.hasPet}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {m.registeredAt}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${m.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                            >
                                                {m.status === "active"
                                                    ? "利用中"
                                                    : "退会"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedMember(m);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                    title="詳細"
                                                >
                                                    <FaEye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(m.dbId)
                                                    }
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="削除"
                                                >
                                                    <FaTrashAlt className="w-3.5 h-3.5" />
                                                </button>
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
                                            会員データがありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {sorted.length}件中{" "}
                                {(currentPage - 1) * perPage + 1}〜
                                {Math.min(currentPage * perPage, sorted.length)}
                                件を表示
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
                {isDetailOpen && selectedMember && (
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
                                    会員詳細
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
                                        ["ID", selectedMember.id],
                                        ["名前", selectedMember.name],
                                        ["メール", selectedMember.email],
                                        ["電話", selectedMember.phone || "−"],
                                        ["住所", selectedMember.address || "−"],
                                        [
                                            "生年月日",
                                            selectedMember.birthDate || "−",
                                        ],
                                        [
                                            "宿泊形態",
                                            selectedMember.hasFamily
                                                ? familyLabels[
                                                      selectedMember.hasFamily
                                                  ] || selectedMember.hasFamily
                                                : "−",
                                        ],
                                        [
                                            "ペット同伴",
                                            petLabels[selectedMember.hasPet] ||
                                                selectedMember.hasPet,
                                        ],
                                        ...(selectedMember.petBreed
                                            ? [
                                                  [
                                                      "犬種①",
                                                      selectedMember.petBreed,
                                                  ],
                                              ]
                                            : []),
                                        ...(selectedMember.petBreed2
                                            ? [
                                                  [
                                                      "犬種②",
                                                      selectedMember.petBreed2,
                                                  ],
                                              ]
                                            : []),
                                        [
                                            "知ったきっかけ",
                                            selectedMember.howFound || "−",
                                        ],
                                        ["登録日", selectedMember.registeredAt],
                                        [
                                            "最終ログイン",
                                            selectedMember.lastLoginAt || "−",
                                        ],
                                        [
                                            "ステータス",
                                            selectedMember.status === "active"
                                                ? "利用中"
                                                : "退会",
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
