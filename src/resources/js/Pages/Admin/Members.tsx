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
    FaEdit,
    FaUser,
    FaPaw,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaCheckCircle,
    FaPlus,
} from "react-icons/fa";
import { PREFECTURES, getCities } from "../../Public/data/japanLocations";
import {
    FAMILY_BIRTH_YEAR_OPTIONS,
    getApproximateAge,
} from "../../Public/data/familyBirthYears";

interface Member {
    id: string;
    dbId: number;
    nickname: string;
    email: string;
    phone?: string;
    prefecture: string;
    city: string;
    lineId: string;
    birthDate?: string;
    hasPet: string;
    petBreed?: string;
    petBreed2?: string;
    hasFamily?: string;
    familyBirthYears: string[];
    concerns?: string;
    howFound?: string;
    expectations?: string;
    registeredAt: string;
    lastLoginAt?: string;
    status: string;
}

interface MemberEditForm {
    nickname: string;
    email: string;
    phone: string;
    prefecture: string;
    city: string;
    lineId: string;
    birthDate: string;
    hasFamily: string;
    familyBirthYears: string[];
    concerns: string;
    howFound: string;
    expectations: string;
    hasPet: string;
    petBreed: string;
    petBreed2: string;
    status: "active" | "withdrawn";
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
const hasRequiredPasswordFormat = (password: string) =>
    Array.from(password).length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[\p{S}\p{P}]/u.test(password);
const emptyNewForm = {
    nickname: "",
    email: "",
    phone: "",
    prefecture: "",
    city: "",
    lineId: "",
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
    const [editForm, setEditForm] = useState<MemberEditForm>({
        nickname: "",
        email: "",
        phone: "",
        prefecture: "",
        city: "",
        lineId: "",
        birthDate: "",
        hasFamily: "individual",
        familyBirthYears: [],
        concerns: "",
        howFound: "",
        expectations: "",
        hasPet: "none",
        petBreed: "",
        petBreed2: "",
        status: "active",
    });
    const [editSaved, setEditSaved] = useState(false);
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [sortField, setSortField] = useState<keyof Member | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 20;

    const [isNewOpen, setIsNewOpen] = useState(false);
    const [newForm, setNewForm] = useState(emptyNewForm);
    const [newErrors, setNewErrors] = useState<
        Partial<Record<string, string>>
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

    const openMemberEdit = (member: Member) => {
        setSelectedMember(member);
        setEditForm({
            nickname: member.nickname,
            email: member.email,
            phone: member.phone ?? "",
            prefecture: member.prefecture,
            city: member.city,
            lineId: member.lineId,
            birthDate: member.birthDate ?? "",
            hasFamily: member.hasFamily ?? "individual",
            familyBirthYears: member.familyBirthYears ?? [],
            concerns: member.concerns ?? "",
            howFound: member.howFound ?? "",
            expectations: member.expectations ?? "",
            hasPet: member.hasPet,
            petBreed: member.petBreed ?? "",
            petBreed2: member.petBreed2 ?? "",
            status: member.status === "withdrawn" ? "withdrawn" : "active",
        });
        setEditSaved(false);
        setEditErrors({});
        setPasswordForm({ password: "", passwordConfirmation: "" });
        setPasswordError("");
        setIsDetailOpen(true);
    };

    const setEF = <K extends keyof MemberEditForm>(
        key: K,
        value: MemberEditForm[K],
    ) => {
        setEditForm((form) => ({ ...form, [key]: value }));
        setEditSaved(false);
        setEditErrors((errors) => ({ ...errors, [key]: "" }));
    };

    const handleMemberSave = () => {
        if (!selectedMember) return;

        router.patch(
            `/admin/members/${selectedMember.dbId}`,
            {
                nickname: editForm.nickname.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim(),
                prefecture: editForm.prefecture || null,
                city: editForm.city || null,
                line_id: editForm.lineId.trim() || null,
                birth_date: editForm.birthDate || null,
                family_type: editForm.hasFamily || null,
                family_birth_years:
                    editForm.hasFamily === "family"
                        ? editForm.familyBirthYears.filter(Boolean)
                        : [],
                concerns: editForm.concerns.trim() || null,
                how_found: editForm.howFound.trim() || null,
                expectations: editForm.expectations.trim() || null,
                has_pet: editForm.hasPet,
                pet_breed:
                    editForm.hasPet === "none"
                        ? null
                        : editForm.petBreed.trim() || null,
                pet_breed2:
                    editForm.hasPet === "small2" ||
                    editForm.hasPet === "large2"
                        ? editForm.petBreed2.trim() || null
                        : null,
                status: editForm.status,
            },
            {
                onSuccess: () => {
                    setSelectedMember((member) =>
                        member
                            ? {
                                  ...member,
                                  ...editForm,
                                  lineId: editForm.lineId,
                                  familyBirthYears:
                                      editForm.hasFamily === "family"
                                          ? editForm.familyBirthYears.filter(
                                                Boolean,
                                            )
                                          : [],
                              }
                            : member,
                    );
                    setEditSaved(true);
                    setEditErrors({});
                },
                onError: (errors) => setEditErrors(errors),
            },
        );
    };

    const filtered = useMemo(() => {
        return initialMembers.filter((m) => {
            const matchSearch =
                !searchQuery ||
                m.nickname.includes(searchQuery) ||
                m.email.includes(searchQuery) ||
                m.lineId.includes(searchQuery) ||
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
            const aVal = String(a[sortField] ?? "");
            const bVal = String(b[sortField] ?? "");
            const cmp = aVal.localeCompare(bVal);
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortField, sortDir]);

    const totalPages = Math.ceil(sorted.length / perPage);
    const paginated = sorted.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );

    const handleSort = (field: keyof Member) => {
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

    const SortIcon = ({ field }: { field: keyof Member }) => {
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
        if (!newForm.nickname.trim())
            errs.nickname = "ニックネームは必須です";
        if (!newForm.email.trim()) errs.email = "メールアドレスは必須です";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newForm.email))
            errs.email = "正しいメールアドレスを入力してください";
        if (!newForm.phone.trim()) errs.phone = "電話番号は必須です";
        if (!newForm.password) errs.password = "パスワードは必須です";
        else if (!hasRequiredPasswordFormat(newForm.password))
            errs.password =
                "大文字・小文字の英字、数字、記号を含む8文字以上で入力してください";
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
                nickname: newForm.nickname.trim(),
                email: newForm.email.trim(),
                phone: newForm.phone.trim(),
                prefecture: newForm.prefecture || null,
                city: newForm.city || null,
                line_id: newForm.lineId.trim() || null,
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
                onError: (errors) => setNewErrors(errors),
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
                                    placeholder="ニックネーム、メール、LINE ID、会員IDで検索"
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
                                        ニックネーム
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
                                                {m.nickname || "−"}
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
                                                    onClick={() => openMemberEdit(m)}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                    title="編集"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
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

                {/* 会員編集モーダル */}
                {isDetailOpen && selectedMember && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsDetailOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base text-gray-900">
                                        会員情報編集
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedMember.id} ／ {selectedMember.nickname || "−"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-5">
                                {Object.entries(editErrors)
                                    .filter(([, message]) => message)
                                    .map(([field, message]) => (
                                        <p key={field} className="text-xs text-red-600">
                                            {message}
                                        </p>
                                    ))}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="text-xs text-gray-600">
                                        ニックネーム
                                        <input
                                            value={editForm.nickname}
                                            onChange={(e) =>
                                                setEF("nickname", e.target.value)
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        メールアドレス
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) =>
                                                setEF("email", e.target.value)
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        電話番号
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) =>
                                                setEF("phone", e.target.value)
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        LINE ID
                                        <input
                                            value={editForm.lineId}
                                            onChange={(e) =>
                                                setEF("lineId", e.target.value)
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        都道府県
                                        <select
                                            value={editForm.prefecture}
                                            onChange={(e) => {
                                                setEF("prefecture", e.target.value);
                                                setEF("city", "");
                                            }}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                        >
                                            <option value="">選択してください</option>
                                            {PREFECTURES.map((prefecture) => (
                                                <option key={prefecture} value={prefecture}>
                                                    {prefecture}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        市区町村
                                        <select
                                            value={editForm.city}
                                            onChange={(e) => setEF("city", e.target.value)}
                                            disabled={!editForm.prefecture}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100"
                                        >
                                            <option value="">選択してください</option>
                                            {getCities(editForm.prefecture).map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        生年月日
                                        <input
                                            type="date"
                                            value={editForm.birthDate}
                                            onChange={(e) =>
                                                setEF("birthDate", e.target.value)
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        宿泊形態
                                        <select
                                            value={editForm.hasFamily}
                                            onChange={(e) => {
                                                const hasFamily = e.target.value;
                                                setEF("hasFamily", hasFamily);
                                                setEF(
                                                    "familyBirthYears",
                                                    hasFamily === "family"
                                                        ? editForm.familyBirthYears.length
                                                            ? editForm.familyBirthYears
                                                            : [""]
                                                        : [],
                                                );
                                            }}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                        >
                                            <option value="individual">個人</option>
                                            <option value="friends">友人</option>
                                            <option value="couple">カップル</option>
                                            <option value="married">ご夫婦</option>
                                            <option value="family">ご家族（お子さんあり）</option>
                                        </select>
                                    </label>
                                </div>
                                {editForm.hasFamily === "family" && (
                                    <section>
                                        <h4 className="text-xs font-semibold text-gray-500 mb-2">
                                            ご家族の生まれ年
                                        </h4>
                                        {editForm.familyBirthYears.map((year, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <select
                                                    value={year}
                                                    onChange={(e) =>
                                                        setEF(
                                                            "familyBirthYears",
                                                            editForm.familyBirthYears.map(
                                                                (current, yearIndex) =>
                                                                    yearIndex === index
                                                                        ? e.target.value
                                                                        : current,
                                                            ),
                                                        )
                                                    }
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                                >
                                                    <option value="">生まれ年を選択</option>
                                                    {FAMILY_BIRTH_YEAR_OPTIONS.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}年
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="self-center text-xs text-gray-500">
                                                    {getApproximateAge(year)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEF(
                                                            "familyBirthYears",
                                                            editForm.familyBirthYears.filter(
                                                                (_, yearIndex) =>
                                                                    yearIndex !== index,
                                                            ),
                                                        )
                                                    }
                                                    className="px-3 text-red-600"
                                                    aria-label={`家族${index + 1}人目を削除`}
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEF("familyBirthYears", [
                                                    ...editForm.familyBirthYears,
                                                    "",
                                                ])
                                            }
                                            className="flex items-center gap-1 text-sm text-[#0a2105]"
                                        >
                                            <FaPlus /> 家族を追加
                                        </button>
                                    </section>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="text-xs text-gray-600">
                                        ペット同伴
                                        <select
                                            value={editForm.hasPet}
                                            onChange={(e) =>
                                                setEF("hasPet", e.target.value)
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                        >
                                            <option value="none">なし</option>
                                            <option value="small1">小型犬1頭</option>
                                            <option value="small2">小型犬2頭</option>
                                            <option value="large1">大型犬1頭</option>
                                            <option value="large2">大型犬2頭</option>
                                        </select>
                                    </label>
                                    {editForm.hasPet !== "none" && (
                                        <>
                                            <label className="text-xs text-gray-600">
                                                犬種
                                                <input
                                                    value={editForm.petBreed}
                                                    onChange={(e) =>
                                                        setEF("petBreed", e.target.value)
                                                    }
                                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </label>
                                            {(editForm.hasPet === "small2" ||
                                                editForm.hasPet === "large2") && (
                                                <label className="text-xs text-gray-600">
                                                    犬種②
                                                    <input
                                                        value={editForm.petBreed2}
                                                        onChange={(e) =>
                                                            setEF("petBreed2", e.target.value)
                                                        }
                                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    />
                                                </label>
                                            )}
                                        </>
                                    )}
                                    <label className="text-xs text-gray-600">
                                        ステータス
                                        <select
                                            value={editForm.status}
                                            onChange={(e) =>
                                                setEF(
                                                    "status",
                                                    e.target.value as MemberEditForm["status"],
                                                )
                                            }
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                        >
                                            <option value="active">利用中</option>
                                            <option value="withdrawn">退会</option>
                                        </select>
                                    </label>
                                </div>
                                <label className="block text-xs text-gray-600">
                                    宿泊の際に気になること
                                    <textarea
                                        value={editForm.concerns}
                                        onChange={(e) =>
                                            setEF("concerns", e.target.value)
                                        }
                                        rows={2}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </label>
                                <label className="block text-xs text-gray-600">
                                    知ったきっかけ
                                    <input
                                        value={editForm.howFound}
                                        onChange={(e) =>
                                            setEF("howFound", e.target.value)
                                        }
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </label>
                                <label className="block text-xs text-gray-600">
                                    エルボスケに期待すること
                                    <textarea
                                        value={editForm.expectations}
                                        onChange={(e) =>
                                            setEF("expectations", e.target.value)
                                        }
                                        rows={2}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </label>
                                {editSaved && (
                                    <p className="flex items-center gap-2 text-sm text-green-700">
                                        <FaCheckCircle />
                                        会員情報を更新しました
                                    </p>
                                )}
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
                                                    !hasRequiredPasswordFormat(
                                                        passwordForm.password,
                                                    )
                                                ) {
                                                    setPasswordError(
                                                        "大文字・小文字の英字、数字、記号を含む8文字以上で入力してください",
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
                                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsDetailOpen(false)}
                                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleMemberSave}
                                        className="px-5 py-2 text-sm bg-[#0a2105] text-white rounded-lg hover:bg-[#071a04]"
                                    >
                                        会員情報を保存
                                    </button>
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
                                {Object.entries(newErrors)
                                    .filter(([, message]) => message)
                                    .map(([field, message]) => (
                                        <p key={field} className="text-xs text-red-600">
                                            {message}
                                        </p>
                                    ))}
                                {/* 基本情報 */}
                                <section>
                                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        <FaUser className="w-3 h-3" /> 基本情報
                                    </h4>
                                    <div className="space-y-3">
                                        <label className="block text-xs text-gray-600">
                                            ニックネーム{" "}
                                            <span className="text-red-500">*</span>
                                            <input
                                                type="text"
                                                value={newForm.nickname}
                                                onChange={(e) =>
                                                    setNF("nickname", e.target.value)
                                                }
                                                className={`mt-1 w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.nickname ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                            />
                                            {newErrors.nickname && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {newErrors.nickname}
                                                </p>
                                            )}
                                        </label>
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
                                                <p className="text-xs text-gray-500 mt-1">
                                                    大文字・小文字の英字、数字、記号を含む8文字以上
                                                </p>
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

                                {/* 居住地域・生年月日 */}
                                <section>
                                    <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        <FaMapMarkerAlt className="w-3 h-3" />{" "}
                                        居住地域・生年月日
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="block text-xs text-gray-600">
                                            都道府県
                                            <select
                                                value={newForm.prefecture}
                                                onChange={(e) => {
                                                    setNF("prefecture", e.target.value);
                                                    setNF("city", "");
                                                }}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                            >
                                                <option value="">選択してください</option>
                                                {PREFECTURES.map((prefecture) => (
                                                    <option key={prefecture} value={prefecture}>
                                                        {prefecture}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block text-xs text-gray-600">
                                            市区町村
                                            <select
                                                value={newForm.city}
                                                onChange={(e) => setNF("city", e.target.value)}
                                                disabled={!newForm.prefecture}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100"
                                            >
                                                <option value="">選択してください</option>
                                                {getCities(newForm.prefecture).map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block text-xs text-gray-600">
                                            LINE ID
                                            <input
                                                value={newForm.lineId}
                                                onChange={(e) =>
                                                    setNF("lineId", e.target.value)
                                                }
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </label>
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
