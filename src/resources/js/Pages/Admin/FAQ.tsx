import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaQuestionCircle,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";

interface FAQItem {
    id: string;
    dbId: number;
    category: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

export default function FAQ({ faqs }: { faqs: FAQItem[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
    const [formData, setFormData] = useState({
        category: "",
        question: "",
        answer: "",
        order: 0,
        isActive: true,
    });
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const openNew = () => {
        setEditingItem(null);
        setFormData({
            category: "",
            question: "",
            answer: "",
            order: faqs.length + 1,
            isActive: true,
        });
        setIsEditOpen(true);
    };

    const openEdit = (item: FAQItem) => {
        setEditingItem(item);
        setFormData({
            category: item.category,
            question: item.question,
            answer: item.answer,
            order: item.order,
            isActive: item.isActive,
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!formData.question.trim()) return;
        if (editingItem) {
            router.patch(`/admin/master/faq/${editingItem.dbId}`, formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        } else {
            router.post("/admin/master/faq", formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        }
    };

    const handleDelete = (dbId: number) => {
        if (confirm("このFAQを無効化しますか？")) {
            router.delete(`/admin/master/faq/${dbId}`);
        }
    };

    const categories = [...new Set(faqs.map((f) => f.category))];

    return (
        <AdminLayout currentPage="master-faq" title="よくある質問管理">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <FaQuestionCircle className="w-4 h-4 text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    よくある質問一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{faqs.length}件 | 有効:{" "}
                                    {faqs.filter((f) => f.isActive).length}件
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

                    <div className="p-6 space-y-6">
                        {categories.map((category) => (
                            <div key={category}>
                                <h3 className="text-sm font-medium text-gray-700 mb-2 px-1">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {faqs
                                        .filter((f) => f.category === category)
                                        .map((faq) => (
                                            <div
                                                key={faq.id}
                                                className={`border rounded-lg ${faq.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}
                                            >
                                                <div className="flex items-center gap-3 px-4 py-3">
                                                    <button
                                                        onClick={() =>
                                                            setExpandedId(
                                                                expandedId ===
                                                                    faq.id
                                                                    ? null
                                                                    : faq.id,
                                                            )
                                                        }
                                                        className="flex-1 text-left flex items-center gap-2"
                                                    >
                                                        <span className="text-sm text-gray-900">
                                                            {faq.question}
                                                        </span>
                                                        {!faq.isActive && (
                                                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                                                                無効
                                                            </span>
                                                        )}
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                openEdit(faq)
                                                            }
                                                            className="p-1 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                        >
                                                            <FaEdit className="w-3 h-3" />
                                                        </button>
                                                        {faq.isActive && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        faq.dbId,
                                                                    )
                                                                }
                                                                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <FaTrashAlt className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                setExpandedId(
                                                                    expandedId ===
                                                                        faq.id
                                                                        ? null
                                                                        : faq.id,
                                                                )
                                                            }
                                                            className="p-1 text-gray-400"
                                                        >
                                                            {expandedId ===
                                                            faq.id ? (
                                                                <FaChevronUp className="w-3 h-3" />
                                                            ) : (
                                                                <FaChevronDown className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                {expandedId === faq.id && (
                                                    <div className="px-4 pb-3 border-t border-gray-100">
                                                        <p className="text-sm text-gray-600 pt-2">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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
                            className="bg-white rounded-xl max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {editingItem ? "FAQを編集" : "新規追加"}
                                </h3>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            カテゴリ
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    category: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                            placeholder="例: 予約について"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            表示順
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    order: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        質問
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.question}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                question: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        回答
                                    </label>
                                    <textarea
                                        value={formData.answer}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                answer: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        rows={4}
                                    />
                                </div>
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
                                    有効にする
                                </label>
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
