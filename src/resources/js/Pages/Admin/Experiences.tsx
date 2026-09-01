import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import { FaStar, FaPlus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";

interface Experience {
    id: string;
    dbId: number;
    name: string;
    description: string;
    price: number;
    priceNote: string;
    duration?: string;
    recommendedPeople?: string;
    season?: string;
    seasonTag?: string;
    requiresReservation: boolean;
    points: string[];
    notes?: string;
    image?: string;
    popularity: number;
    isActive: boolean;
    createdAt: string;
}

const SEASON_TAGS = ["春", "夏", "秋", "冬", "通年"];

const defaultForm = {
    name: "",
    description: "",
    price: 0,
    priceNote: "",
    duration: "",
    recommendedPeople: "",
    season: "",
    seasonTag: "通年",
    requiresReservation: false,
    points: [""],
    notes: "",
    isActive: true,
};

export default function Experiences({
    experiences,
}: {
    experiences: Experience[];
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Experience | null>(null);
    const [formData, setFormData] = useState(defaultForm);

    const openNew = () => {
        setEditingItem(null);
        setFormData(defaultForm);
        setIsEditOpen(true);
    };

    const openEdit = (item: Experience) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            priceNote: item.priceNote,
            duration: item.duration || "",
            recommendedPeople: item.recommendedPeople || "",
            season: item.season || "",
            seasonTag: item.seasonTag || "通年",
            requiresReservation: item.requiresReservation,
            points: item.points.length > 0 ? item.points : [""],
            notes: item.notes || "",
            isActive: item.isActive,
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        const payload = {
            ...formData,
            points: formData.points.filter((p) => p.trim()),
        };
        if (editingItem) {
            router.patch(
                `/admin/master/experiences/${editingItem.dbId}`,
                payload,
                { onSuccess: () => setIsEditOpen(false) },
            );
        } else {
            router.post("/admin/master/experiences", payload, {
                onSuccess: () => setIsEditOpen(false),
            });
        }
    };

    const handleDelete = (dbId: number) => {
        if (confirm("この体験オプションを削除しますか？")) {
            router.delete(`/admin/master/experiences/${dbId}`);
        }
    };

    const updatePoint = (index: number, value: string) => {
        setFormData((p) => ({
            ...p,
            points: p.points.map((pt, i) => (i === index ? value : pt)),
        }));
    };
    const addPoint = () =>
        setFormData((p) => ({ ...p, points: [...p.points, ""] }));
    const removePoint = (index: number) =>
        setFormData((p) => ({
            ...p,
            points: p.points.filter((_, i) => i !== index),
        }));

    return (
        <AdminLayout
            currentPage="master-experiences"
            title="体験オプション管理"
        >
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FaStar className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    体験オプション一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{experiences.length}件 | 有効:{" "}
                                    {
                                        experiences.filter((e) => e.isActive)
                                            .length
                                    }
                                    件
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={openNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]"
                        >
                            <FaPlus className="w-3 h-3" /> 新規追加
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-2 gap-4">
                        {experiences.map((exp) => (
                            <div
                                key={exp.id}
                                className={`border rounded-xl p-4 ${exp.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {exp.name}
                                            </h3>
                                            {!exp.isActive && (
                                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                                                    非表示
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {exp.season || "−"}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => openEdit(exp)}
                                            className="p-1 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                        >
                                            <FaEdit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(exp.dbId)
                                            }
                                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <FaTrashAlt className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    {exp.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: "#0a2105" }}
                                    >
                                        {exp.priceNote}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        人気度: {exp.popularity}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 編集モーダル */}
                {isEditOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsEditOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {editingItem ? "体験を編集" : "新規追加"}
                                </h3>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-3 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            名称
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    name: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            料金表示
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.priceNote}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    priceNote: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            placeholder="例: 1組¥2,000"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            金額（円）
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    price: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            シーズン
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.season}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    season: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            placeholder="例: 通年（晴天時）"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        説明
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-gray-600">
                                            ポイント
                                        </label>
                                        <button
                                            onClick={addPoint}
                                            className="text-xs text-[#0a2105] hover:underline"
                                        >
                                            + 追加
                                        </button>
                                    </div>
                                    {formData.points.map((pt, i) => (
                                        <div
                                            key={i}
                                            className="flex gap-2 mb-1"
                                        >
                                            <input
                                                type="text"
                                                value={pt}
                                                onChange={(e) =>
                                                    updatePoint(
                                                        i,
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            />
                                            {formData.points.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        removePoint(i)
                                                    }
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <FaTimes className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.requiresReservation
                                            }
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    requiresReservation:
                                                        e.target.checked,
                                                }))
                                            }
                                        />
                                        事前予約が必要
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    isActive: e.target.checked,
                                                }))
                                            }
                                        />
                                        表示する
                                    </label>
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
