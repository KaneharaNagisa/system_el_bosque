import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaExclamationCircle,
    FaEdit,
    FaPlus,
    FaTrashAlt,
    FaTimes,
} from "react-icons/fa";

interface Policy {
    id: string;
    dbId: number;
    daysBefore: number;
    label: string;
    chargeRate: number;
    description: string;
}

export default function CancelPolicy({ policies }: { policies: Policy[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Policy | null>(null);
    const [formData, setFormData] = useState({
        daysBefore: 0,
        label: "",
        chargeRate: 0,
        description: "",
    });

    const openEdit = (item: Policy) => {
        setEditingItem(item);
        setFormData({
            daysBefore: item.daysBefore,
            label: item.label,
            chargeRate: item.chargeRate,
            description: item.description,
        });
        setIsEditOpen(true);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({
            daysBefore: 0,
            label: "",
            chargeRate: 0,
            description: "",
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!formData.label.trim()) return;
        if (editingItem) {
            router.patch(
                `/admin/master/cancel-policy/${editingItem.dbId}`,
                formData,
                { onSuccess: () => setIsEditOpen(false) },
            );
        } else {
            router.post("/admin/master/cancel-policy", formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        }
    };

    const handleDelete = (dbId: number) => {
        if (confirm("このポリシーを削除しますか？")) {
            router.delete(`/admin/master/cancel-policy/${dbId}`);
        }
    };

    const getColor = (rate: number) => {
        if (rate === 0)
            return {
                bar: "bg-green-500",
                text: "text-green-700",
                bg: "bg-green-50",
            };
        if (rate <= 30)
            return {
                bar: "bg-yellow-400",
                text: "text-yellow-700",
                bg: "bg-yellow-50",
            };
        if (rate <= 60)
            return {
                bar: "bg-orange-500",
                text: "text-orange-700",
                bg: "bg-orange-50",
            };
        return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };
    };

    return (
        <AdminLayout
            currentPage="master-cancel-policy"
            title="キャンセルポリシー管理"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <FaExclamationCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    キャンセルポリシー設定
                                </h2>
                                <p className="text-xs text-gray-500">
                                    予約キャンセル時のキャンセル料率を設定します
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={openNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]"
                        >
                            <FaPlus className="w-3 h-3" /> 追加
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {[...policies]
                            .sort((a, b) => b.daysBefore - a.daysBefore)
                            .map((p) => {
                                const colors = getColor(p.chargeRate);
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border ${colors.bg} border-gray-200`}
                                    >
                                        <div className="w-24 shrink-0 text-center">
                                            <p className="text-sm font-medium text-gray-800">
                                                {p.label}
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${colors.bar} rounded-full`}
                                                        style={{
                                                            width: `${p.chargeRate}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-sm font-bold ${colors.text} w-12 text-right`}
                                                >
                                                    {p.chargeRate}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {p.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-white rounded"
                                            >
                                                <FaEdit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(p.dbId)
                                                }
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <FaTrashAlt className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* 編集モーダル */}
                {isEditOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsEditOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {editingItem
                                        ? "ポリシーを編集"
                                        : "新規追加"}
                                </h3>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        ラベル（例: 7日前まで）
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                label: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        キャンセル前日数
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.daysBefore}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                daysBefore: Number(
                                                    e.target.value,
                                                ),
                                            }))
                                        }
                                        min={0}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        キャンセル料率（%）
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.chargeRate}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                chargeRate: Number(
                                                    e.target.value,
                                                ),
                                            }))
                                        }
                                        min={0}
                                        max={100}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        説明
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm bg-[#0a2105] text-white rounded-lg hover:bg-[#071a04]"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
