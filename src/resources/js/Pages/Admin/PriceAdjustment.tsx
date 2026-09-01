import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaPercent,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaTimes,
    FaToggleOn,
    FaToggleOff,
    FaCalendarAlt,
    FaUsers,
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
    createdAt: string;
}

interface FormState {
    name: string;
    discount_percent: number;
    has_period: boolean;
    period_start: string;
    period_end: string;
    has_guest_range: boolean;
    guest_min: string;
    guest_max: string;
    no_experience_options: boolean;
    no_support_plan: boolean;
    status: "active" | "inactive";
}

const emptyForm: FormState = {
    name: "",
    discount_percent: 10,
    has_period: false,
    period_start: "",
    period_end: "",
    has_guest_range: false,
    guest_min: "",
    guest_max: "",
    no_experience_options: false,
    no_support_plan: false,
    status: "active",
};

export default function PriceAdjustment({ rules }: { rules: PriceRule[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({});
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const deleteTarget = useMemo(
        () => rules.find((r) => r.dbId === deleteConfirmId) ?? null,
        [rules, deleteConfirmId],
    );

    const setF = <K extends keyof FormState>(key: K, val: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const validate = (): boolean => {
        const errs: Partial<Record<keyof FormState, string>> = {};
        if (!form.name.trim()) errs.name = "条件名は必須です";
        if (form.discount_percent <= 0 || form.discount_percent > 100)
            errs.discount_percent = "1〜100の範囲で入力してください";
        if (form.has_period) {
            if (!form.period_start)
                errs.period_start = "開始日を入力してください";
            if (!form.period_end) errs.period_end = "終了日を入力してください";
            if (
                form.period_start &&
                form.period_end &&
                form.period_start > form.period_end
            )
                errs.period_end = "終了日は開始日より後にしてください";
        }
        if (form.has_guest_range) {
            const mn = form.guest_min === "" ? null : Number(form.guest_min);
            const mx = form.guest_max === "" ? null : Number(form.guest_max);
            if (mn !== null && (mn < 1 || mn > 20))
                errs.guest_min = "1〜20の範囲で入力してください";
            if (mx !== null && (mx < 1 || mx > 20))
                errs.guest_max = "1〜20の範囲で入力してください";
            if (mn !== null && mx !== null && mn > mx)
                errs.guest_max = "最大人数は最低人数以上にしてください";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const openNew = () => {
        setForm(emptyForm);
        setErrors({});
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEdit = (rule: PriceRule) => {
        setForm({
            name: rule.name,
            discount_percent: rule.discountPercent,
            has_period: rule.hasPeriod,
            period_start: rule.periodStart,
            period_end: rule.periodEnd,
            has_guest_range: rule.hasGuestRange,
            guest_min: rule.guestMin !== null ? String(rule.guestMin) : "",
            guest_max: rule.guestMax !== null ? String(rule.guestMax) : "",
            no_experience_options: rule.noExperienceOptions,
            no_support_plan: rule.noSupportPlan,
            status: rule.status,
        });
        setErrors({});
        setEditingId(rule.dbId);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!validate()) return;
        const payload = {
            name: form.name.trim(),
            discount_percent: form.discount_percent,
            has_period: form.has_period,
            period_start: form.has_period ? form.period_start : null,
            period_end: form.has_period ? form.period_end : null,
            has_guest_range: form.has_guest_range,
            guest_min:
                form.has_guest_range && form.guest_min !== ""
                    ? Number(form.guest_min)
                    : null,
            guest_max:
                form.has_guest_range && form.guest_max !== ""
                    ? Number(form.guest_max)
                    : null,
            no_experience_options: form.no_experience_options,
            no_support_plan: form.no_support_plan,
            status: form.status,
        };
        if (editingId) {
            router.patch(
                `/admin/master/price-adjustment/${editingId}`,
                payload,
                {
                    onSuccess: () => {
                        setIsModalOpen(false);
                        setEditingId(null);
                    },
                },
            );
        } else {
            router.post("/admin/master/price-adjustment", payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
            });
        }
    };

    const toggleStatus = (rule: PriceRule) => {
        router.patch(`/admin/master/price-adjustment/${rule.dbId}/toggle`, {});
    };

    const handleDelete = (dbId: number) => {
        router.delete(`/admin/master/price-adjustment/${dbId}`, {
            onSuccess: () => setDeleteConfirmId(null),
        });
    };

    const activeCount = useMemo(
        () => rules.filter((r) => r.status === "active").length,
        [rules],
    );
    const inactiveCount = useMemo(
        () => rules.filter((r) => r.status === "inactive").length,
        [rules],
    );

    const fmtDate = (d: string) =>
        d ? d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日") : "−";

    const discountExample =
        form.discount_percent > 0 && form.discount_percent <= 100
            ? (20000 * (1 - form.discount_percent / 100)).toLocaleString()
            : null;

    return (
        <AdminLayout currentPage="master-price-adjustment" title="料金調整管理">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* ヘッダー */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                            <FaPercent className="w-4 h-4 text-[#0a2105]" />
                        </div>
                        <div>
                            <h2 className="text-base text-gray-900">
                                料金調整管理
                            </h2>
                            <p className="text-xs text-gray-500">
                                有効: {activeCount}件　無効: {inactiveCount}
                                件　合計: {rules.length}件
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04] transition-colors"
                    >
                        <FaPlus className="w-3 h-3" /> 新規追加
                    </button>
                </div>

                {/* テーブル */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {rules.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm">
                            料金調整ルールがありません。「新規追加」から登録してください。
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3 text-xs text-gray-500">
                                        条件名
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        割引率
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        割引期間
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        宿泊人数
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        制限
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        ステータス
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        登録日
                                    </th>
                                    <th className="text-right px-5 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map((rule) => (
                                    <tr
                                        key={rule.id}
                                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {rule.name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {rule.id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-200">
                                                <FaPercent className="w-2.5 h-2.5" />
                                                {rule.discountPercent}% OFF
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {rule.hasPeriod ? (
                                                <span className="flex items-center gap-1.5 text-sm text-gray-700">
                                                    <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                                                    {fmtDate(rule.periodStart)}{" "}
                                                    〜 {fmtDate(rule.periodEnd)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    指定なし
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {rule.hasGuestRange ? (
                                                <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                                                    <FaUsers className="w-3 h-3 text-gray-400" />
                                                    {rule.guestMin !== null
                                                        ? `${rule.guestMin}名`
                                                        : ""}
                                                    {rule.guestMin !== null &&
                                                    rule.guestMax !== null
                                                        ? "〜"
                                                        : ""}
                                                    {rule.guestMax !== null
                                                        ? `${rule.guestMax}名`
                                                        : rule.guestMin !== null
                                                          ? "以上"
                                                          : ""}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    指定なし
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {rule.noExperienceOptions ||
                                            rule.noSupportPlan ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    {rule.noExperienceOptions && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-200 whitespace-nowrap">
                                                            <FaBan className="w-2.5 h-2.5" />{" "}
                                                            オプション不可
                                                        </span>
                                                    )}
                                                    {rule.noSupportPlan && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium border border-orange-200 whitespace-nowrap">
                                                            <FaBan className="w-2.5 h-2.5" />{" "}
                                                            サポート不可
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    −
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() =>
                                                    toggleStatus(rule)
                                                }
                                                title="クリックで切替"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                                            >
                                                {rule.status === "active" ? (
                                                    <>
                                                        <FaToggleOn className="w-5 h-5 text-green-500" />
                                                        <span className="text-green-700">
                                                            有効
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaToggleOff className="w-5 h-5 text-gray-400" />
                                                        <span className="text-gray-500">
                                                            無効
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center text-xs text-gray-500">
                                            {rule.createdAt}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() =>
                                                        openEdit(rule)
                                                    }
                                                    className="p-1.5 text-gray-400 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded transition-colors"
                                                    title="編集"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteConfirmId(
                                                            rule.dbId,
                                                        )
                                                    }
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="削除"
                                                >
                                                    <FaTrashAlt className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* 削除確認モーダル */}
                {deleteConfirmId !== null && deleteTarget !== null && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteConfirmId(null)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-sm w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                削除の確認
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                <span className="font-medium text-gray-900">
                                    「{deleteTarget.name}」
                                </span>
                                を削除しますか？この操作は元に戻せません。
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(deleteConfirmId)
                                    }
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                >
                                    削除する
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 新規追加 / 編集モーダル */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl w-full max-w-md my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                                        <FaPercent className="w-3.5 h-3.5 text-[#0a2105]" />
                                    </div>
                                    <h3 className="text-base text-gray-900">
                                        {editingId
                                            ? "料金調整ルールを編集"
                                            : "料金調整ルールを追加"}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-5">
                                {/* 条件名 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        条件名{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setF("name", e.target.value)
                                        }
                                        placeholder="例: 平日限定割引、連泊割引など"
                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* 割引率 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        宿泊料金の割引率{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={form.discount_percent}
                                            onChange={(e) =>
                                                setF(
                                                    "discount_percent",
                                                    Number(e.target.value),
                                                )
                                            }
                                            className={`w-24 px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] text-right ${errors.discount_percent ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                        />
                                        <span className="text-sm text-gray-500">
                                            % OFF
                                        </span>
                                        {discountExample && (
                                            <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                                                ¥20,000 → ¥{discountExample}
                                            </span>
                                        )}
                                    </div>
                                    {errors.discount_percent && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.discount_percent}
                                        </p>
                                    )}
                                </div>

                                {/* 割引期間 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-600">
                                            割引期間{" "}
                                            <span className="text-gray-400 font-normal">
                                                （任意）
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setF(
                                                    "has_period",
                                                    !form.has_period,
                                                )
                                            }
                                            className="flex items-center gap-1.5 text-xs"
                                        >
                                            {form.has_period ? (
                                                <>
                                                    <FaToggleOn className="w-5 h-5 text-green-500" />
                                                    <span className="text-green-700">
                                                        期間あり
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOff className="w-5 h-5 text-gray-400" />
                                                    <span className="text-gray-500">
                                                        期間指定なし
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {form.has_period && (
                                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    開始日
                                                </p>
                                                <input
                                                    type="date"
                                                    value={form.period_start}
                                                    onChange={(e) =>
                                                        setF(
                                                            "period_start",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white ${errors.period_start ? "border-red-400" : "border-gray-300"}`}
                                                />
                                                {errors.period_start && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {errors.period_start}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    終了日
                                                </p>
                                                <input
                                                    type="date"
                                                    value={form.period_end}
                                                    onChange={(e) =>
                                                        setF(
                                                            "period_end",
                                                            e.target.value,
                                                        )
                                                    }
                                                    min={
                                                        form.period_start ||
                                                        undefined
                                                    }
                                                    className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white ${errors.period_end ? "border-red-400" : "border-gray-300"}`}
                                                />
                                                {errors.period_end && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {errors.period_end}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 宿泊人数 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-600">
                                            宿泊人数{" "}
                                            <span className="text-gray-400 font-normal">
                                                （任意）
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setF(
                                                    "has_guest_range",
                                                    !form.has_guest_range,
                                                )
                                            }
                                            className="flex items-center gap-1.5 text-xs"
                                        >
                                            {form.has_guest_range ? (
                                                <>
                                                    <FaToggleOn className="w-5 h-5 text-green-500" />
                                                    <span className="text-green-700">
                                                        人数指定あり
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOff className="w-5 h-5 text-gray-400" />
                                                    <span className="text-gray-500">
                                                        人数指定なし
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {form.has_guest_range && (
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                            <p className="text-xs text-gray-500">
                                                適用する宿泊人数の範囲を設定します。片方のみの指定も可能です。
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        最低人数
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={20}
                                                            value={
                                                                form.guest_min
                                                            }
                                                            onChange={(e) =>
                                                                setF(
                                                                    "guest_min",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="例: 4"
                                                            className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white text-right ${errors.guest_min ? "border-red-400" : "border-gray-300"}`}
                                                        />
                                                        <span className="text-xs text-gray-500 shrink-0">
                                                            名〜
                                                        </span>
                                                    </div>
                                                    {errors.guest_min && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {errors.guest_min}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        最大人数
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={20}
                                                            value={
                                                                form.guest_max
                                                            }
                                                            onChange={(e) =>
                                                                setF(
                                                                    "guest_max",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="例: 6"
                                                            className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white text-right ${errors.guest_max ? "border-red-400" : "border-gray-300"}`}
                                                        />
                                                        <span className="text-xs text-gray-500 shrink-0">
                                                            名以下
                                                        </span>
                                                    </div>
                                                    {errors.guest_max && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {errors.guest_max}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 適用制限 */}
                                <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                        適用制限
                                    </p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form.no_experience_options
                                                }
                                                onChange={(e) =>
                                                    setF(
                                                        "no_experience_options",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-gray-300 text-[#0a2105] focus:ring-[#0a2105]"
                                            />
                                            <span className="text-sm text-gray-700">
                                                体験オプションが含まれる場合は適用不可
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.no_support_plan}
                                                onChange={(e) =>
                                                    setF(
                                                        "no_support_plan",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-gray-300 text-[#0a2105] focus:ring-[#0a2105]"
                                            />
                                            <span className="text-sm text-gray-700">
                                                滞在サポートが含まれる場合は適用不可
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* ステータス */}
                                <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                        ステータス
                                    </p>
                                    <div className="flex gap-2">
                                        {(["active", "inactive"] as const).map(
                                            (s) => (
                                                <button
                                                    key={s}
                                                    onClick={() =>
                                                        setF("status", s)
                                                    }
                                                    className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all ${form.status === s ? (s === "active" ? "border-green-400 bg-green-50 text-green-800 font-medium" : "border-gray-400 bg-gray-100 text-gray-700 font-medium") : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                                                >
                                                    {s === "active"
                                                        ? "有効"
                                                        : "無効"}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
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
