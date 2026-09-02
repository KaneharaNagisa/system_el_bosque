import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaUsers,
    FaSearch,
    FaUserPlus,
    FaTrashAlt,
    FaFilter,
    FaSortAmountDown,
    FaSortAmountUp,
    FaSort,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaEye,
    FaUser,
    FaPaw,
    FaMapMarkerAlt,
    FaCalendarAlt,
} from "react-icons/fa";

interface Member {
    id: string;
    dbId: number;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    email: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    hasPet: string;
    petBreed?: string;
    petBreed2?: string;
    hasFamily?: string;
    concerns?: string;
    howFound?: string;
    expectations?: string;
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
const howFoundLabels: Record<string, string> = {
    search: "検索エンジン",
    sns: "SNS（Instagram・X等）",
    friend: "知人の紹介",
    media: "雑誌・テレビ",
    other: "その他",
};

const emptyNewForm = {
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    hasPet: "none",
    petBreed: "",
    petBreed2: "",
    hasFamily: "individual",
    concerns: "",
    howFound: "",
    expectations: "",
    password: "",
    passwordConfirmation: "",
    status: "active",
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

    const [isNewOpen, setIsNewOpen] = useState(false);
    const [newForm, setNewForm] = useState(emptyNewForm);
    const [newErrors, setNewErrors] = useState<
        Partial<Record<keyof typeof emptyNewForm, string>>
    >({});
    const [passwordForm, setPasswordForm] = useState({
        password: "",
        passwordConfirmation: "",
    });
    const [passwordError, setPasswordError] = useState("");

    const setNF = <K extends keyof typeof emptyNewForm>(
        key: K,
        val: (typeof emptyNewForm)[K],
    ) => {
        setNewForm((f) => ({ ...f, [key]: val }));
        setNewErrors((e) => ({ ...e, [key]: undefined }));
    };

    const filtered = useMemo(() => {
        return initialMembers.filter((m) => {
            const fullName = `${m.lastName}${m.firstName}`;
            const fullKana = `${m.lastNameKana}${m.firstNameKana}`;
            const matchSearch =
                !searchQuery ||
                fullName.includes(searchQuery) ||
                fullKana.includes(searchQuery) ||
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

    const validateNew = () => {
        const errs: typeof newErrors = {};
        if (!newForm.lastName.trim()) errs.lastName = "姓は必須です";
        if (!newForm.firstName.trim()) errs.firstName = "名は必須です";
        if (!newForm.lastNameKana.trim())
            errs.lastNameKana = "姓（ふりがな）は必須です";
        if (!newForm.firstNameKana.trim())
            errs.firstNameKana = "名（ふりがな）は必須です";
        if (!newForm.email.trim()) errs.email = "メールアドレスは必須です";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newForm.email))
            errs.email = "正しいメールアドレスを入力してください";
        if (!newForm.phone.trim()) errs.phone = "電話番号は必須です";
        if (!newForm.password) errs.password = "パスワードは必須です";
        else if (newForm.password.length < 8)
            errs.password = "パスワードは8文字以上で入力してください";
        else if (newForm.password !== newForm.passwordConfirmation)
            errs.passwordConfirmation = "パスワードが一致しません";
        setNewErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNewSave = () => {
        if (!validateNew()) return;
        router.post(
            "/admin/members",
            {
                last_name: newForm.lastName.trim(),
                first_name: newForm.firstName.trim(),
                last_name_kana: newForm.lastNameKana.trim(),
                first_name_kana: newForm.firstNameKana.trim(),
                email: newForm.email.trim(),
                phone: newForm.phone.trim(),
                address: newForm.address.trim() || null,
                birth_date: newForm.birthDate || null,
                has_pet: newForm.hasPet,
                pet_breed: newForm.petBreed.trim() || null,
                pet_breed2: newForm.petBreed2.trim() || null,
                family_type: newForm.hasFamily,
                concerns: newForm.concerns.trim() || null,
                how_found: newForm.howFound.trim() || null,
                expectations: newForm.expectations.trim() || null,
                status: newForm.status,
                password: newForm.password,
                password_confirmation: newForm.passwordConfirmation,
            },
            {
                onSuccess: () => {
                    setIsNewOpen(false);
                    setNewForm(emptyNewForm);
                    setNewErrors({});
                },
            },
        );
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
                            <button
                                onClick={() => setIsNewOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04] transition-colors"
                            >
                                <FaUserPlus className="w-3.5 h-3.5" />{" "}
                                新規会員追加
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="名前、ふりがな、メール、IDで検索"
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
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">
                                                {m.lastName} {m.firstName}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {m.lastNameKana}{" "}
                                                {m.firstNameKana}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {m.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {familyLabels[m.hasFamily ?? ""] ||
                                                m.hasFamily ||
                                                "−"}
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
                                                        setPasswordForm({
                                                            password: "",
                                                            passwordConfirmation:
                                                                "",
                                                        });
                                                        setPasswordError("");
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
                                        [
                                            "氏名",
                                            `${selectedMember.lastName} ${selectedMember.firstName}`,
                                        ],
                                        [
                                            "ふりがな",
                                            `${selectedMember.lastNameKana} ${selectedMember.firstNameKana}`,
                                        ],
                                        ["メール", selectedMember.email],
                                        ["電話", selectedMember.phone || "−"],
                                        ["住所", selectedMember.address || "−"],
                                        [
                                            "生年月日",
                                            selectedMember.birthDate || "−",
                                        ],
                                        [
                                            "宿泊形態",
                                            familyLabels[
                                                selectedMember.hasFamily ?? ""
                                            ] ||
                                                selectedMember.hasFamily ||
                                                "−",
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
                                            "宿泊の際に気になること",
                                            selectedMember.concerns || "−",
                                        ],
                                        [
                                            "知ったきっかけ",
                                            howFoundLabels[
                                                selectedMember.howFound ?? ""
                                            ] ||
                                                selectedMember.howFound ||
                                                "−",
                                        ],
                                        [
                                            "エルボスケに期待すること",
                                            selectedMember.expectations || "−",
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
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                        パスワード変更
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                新しいパスワード
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.password}
                                                onChange={(e) => {
                                                    setPasswordForm((form) => ({
                                                        ...form,
                                                        password:
                                                            e.target.value,
                                                    }));
                                                    setPasswordError("");
                                                }}
                                                autoComplete="new-password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                新しいパスワード（確認）
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    passwordForm.passwordConfirmation
                                                }
                                                onChange={(e) => {
                                                    setPasswordForm((form) => ({
                                                        ...form,
                                                        passwordConfirmation:
                                                            e.target.value,
                                                    }));
                                                    setPasswordError("");
                                                }}
                                                autoComplete="new-password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            />
                                        </div>
                                        {passwordError && (
                                            <p className="text-xs text-red-500">
                                                {passwordError}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    passwordForm.password
                                                        .length < 8
                                                ) {
                                                    setPasswordError(
                                                        "パスワードは8文字以上で入力してください",
                                                    );
                                                    return;
                                                }
                                                if (
                                                    passwordForm.password !==
                                                    passwordForm.passwordConfirmation
                                                ) {
                                                    setPasswordError(
                                                        "パスワードが一致しません",
                                                    );
                                                    return;
                                                }
                                                router.patch(
                                                    `/admin/members/${selectedMember.dbId}/password`,
                                                    {
                                                        password:
                                                            passwordForm.password,
                                                        password_confirmation:
                                                            passwordForm.passwordConfirmation,
                                                    },
                                                    {
                                                        onSuccess: () => {
                                                            setPasswordForm({
                                                                password: "",
                                                                passwordConfirmation:
                                                                    "",
                                                            });
                                                            setPasswordError(
                                                                "",
                                                            );
                                                        },
                                                    },
                                                );
                                            }}
                                            className="w-full px-4 py-2 text-sm bg-[#0a2105] text-white rounded-lg hover:bg-[#071a04]"
                                        >
                                            パスワードを変更する
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* 新規会員追加モーダル */}
                {isNewOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setIsNewOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl w-full max-w-xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                                        <FaUserPlus className="w-3.5 h-3.5 text-[#0a2105]" />
                                    </div>
                                    <h3 className="text-base text-gray-900">
                                        新規会員追加
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsNewOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-5 space-y-6">
                                {/* 基本情報 */}
                                <section>
                                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        <FaUser className="w-3 h-3" /> 基本情報
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    姓{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newForm.lastName}
                                                    onChange={(e) =>
                                                        setNF(
                                                            "lastName",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="例: 山田"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.lastName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.lastName && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {newErrors.lastName}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    名{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newForm.firstName}
                                                    onChange={(e) =>
                                                        setNF(
                                                            "firstName",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="例: 太郎"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.firstName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.firstName && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {newErrors.firstName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    姓（ふりがな）{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newForm.lastNameKana}
                                                    onChange={(e) =>
                                                        setNF(
                                                            "lastNameKana",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="例: やまだ"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.lastNameKana ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.lastNameKana && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {newErrors.lastNameKana}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    名（ふりがな）{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        newForm.firstNameKana
                                                    }
                                                    onChange={(e) =>
                                                        setNF(
                                                            "firstNameKana",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="例: たろう"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.firstNameKana ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.firstNameKana && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {
                                                            newErrors.firstNameKana
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    メールアドレス{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={newForm.email}
                                                    onChange={(e) =>
                                                        setNF(
                                                            "email",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="例: xxx@example.com"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.email && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {newErrors.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    電話番号{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={newForm.phone}
                                                    onChange={(e) =>
                                                        setNF(
                                                            "phone",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="例: 090-1234-5678"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.phone ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.phone && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {newErrors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    パスワード{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newForm.password}
                                                    onChange={(e) =>
                                                        setNF(
                                                            "password",
                                                            e.target.value,
                                                        )
                                                    }
                                                    autoComplete="new-password"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.password ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.password && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {newErrors.password}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    パスワード（確認）{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={
                                                        newForm.passwordConfirmation
                                                    }
                                                    onChange={(e) =>
                                                        setNF(
                                                            "passwordConfirmation",
                                                            e.target.value,
                                                        )
                                                    }
                                                    autoComplete="new-password"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.passwordConfirmation ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                                />
                                                {newErrors.passwordConfirmation && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {
                                                            newErrors.passwordConfirmation
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* 住所・生年月日 */}
                                <section>
                                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        <FaMapMarkerAlt className="w-3 h-3" />{" "}
                                        住所・生年月日
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-gray-600 mb-1">
                                                住所
                                            </label>
                                            <input
                                                type="text"
                                                value={newForm.address}
                                                onChange={(e) =>
                                                    setNF(
                                                        "address",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="例: 東京都新宿区西新宿1-1-1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                <FaCalendarAlt className="inline w-2.5 h-2.5 mr-1" />
                                                生年月日
                                            </label>
                                            <input
                                                type="date"
                                                value={newForm.birthDate}
                                                onChange={(e) =>
                                                    setNF(
                                                        "birthDate",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                宿泊形態
                                            </label>
                                            <select
                                                value={newForm.hasFamily}
                                                onChange={(e) =>
                                                    setNF(
                                                        "hasFamily",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            >
                                                <option value="individual">
                                                    個人
                                                </option>
                                                <option value="friends">
                                                    友人
                                                </option>
                                                <option value="couple">
                                                    カップル
                                                </option>
                                                <option value="married">
                                                    ご夫婦
                                                </option>
                                                <option value="family">
                                                    ご家族（お子さんあり）
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* ペット */}
                                <section>
                                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        <FaPaw className="w-3 h-3" /> ペット情報
                                    </h4>
                                    <div className="space-y-3">
                                        <select
                                            value={newForm.hasPet}
                                            onChange={(e) => {
                                                setNF("hasPet", e.target.value);
                                                if (e.target.value === "none") {
                                                    setNF("petBreed", "");
                                                    setNF("petBreed2", "");
                                                } else if (
                                                    e.target.value !==
                                                        "small2" &&
                                                    e.target.value !== "large2"
                                                ) {
                                                    setNF("petBreed2", "");
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        >
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
                                            <option value="large2">
                                                大型犬2頭
                                            </option>
                                        </select>
                                        {newForm.hasPet !== "none" && (
                                            <div
                                                className={`grid gap-3 ${newForm.hasPet === "small2" || newForm.hasPet === "large2" ? "grid-cols-2" : "grid-cols-1"}`}
                                            >
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">
                                                        犬種
                                                        {newForm.hasPet ===
                                                            "small2" ||
                                                        newForm.hasPet ===
                                                            "large2"
                                                            ? "①"
                                                            : ""}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newForm.petBreed}
                                                        onChange={(e) =>
                                                            setNF(
                                                                "petBreed",
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="例: トイプードル"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                                    />
                                                </div>
                                                {(newForm.hasPet === "small2" ||
                                                    newForm.hasPet ===
                                                        "large2") && (
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">
                                                            犬種②
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                newForm.petBreed2
                                                            }
                                                            onChange={(e) =>
                                                                setNF(
                                                                    "petBreed2",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="例: チワワ"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* その他 */}
                                <section>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        その他
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                宿泊の際に気になること
                                            </label>
                                            <textarea
                                                value={newForm.concerns}
                                                onChange={(e) =>
                                                    setNF(
                                                        "concerns",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="例: アレルギー、静かに過ごしたい等"
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] resize-y"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                知ったきっかけ
                                            </label>
                                            <select
                                                value={newForm.howFound}
                                                onChange={(e) =>
                                                    setNF(
                                                        "howFound",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            >
                                                <option value="">
                                                    選択してください
                                                </option>
                                                <option value="search">
                                                    検索エンジン
                                                </option>
                                                <option value="sns">
                                                    SNS（Instagram・X等）
                                                </option>
                                                <option value="friend">
                                                    知人の紹介
                                                </option>
                                                <option value="media">
                                                    雑誌・テレビ
                                                </option>
                                                <option value="other">
                                                    その他
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                エルボスケに期待すること
                                            </label>
                                            <textarea
                                                value={newForm.expectations}
                                                onChange={(e) =>
                                                    setNF(
                                                        "expectations",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="例: 自然体験、ペットとの時間等"
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] resize-y"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                ステータス
                                            </label>
                                            <div className="flex gap-2">
                                                {(
                                                    [
                                                        "active",
                                                        "withdrawn",
                                                    ] as const
                                                ).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() =>
                                                            setNF("status", s)
                                                        }
                                                        className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all ${newForm.status === s ? (s === "active" ? "border-green-400 bg-green-50 text-green-800 font-medium" : "border-gray-400 bg-gray-100 text-gray-700 font-medium") : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                                                    >
                                                        {s === "active"
                                                            ? "利用中"
                                                            : "退会"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsNewOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleNewSave}
                                    className="px-5 py-2 text-sm bg-[#0a2105] text-white rounded-lg hover:bg-[#071a04]"
                                >
                                    保存する
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
