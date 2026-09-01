import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaBook,
    FaPlus,
    FaEdit,
    FaEye,
    FaTimes,
    FaTrashAlt,
} from "react-icons/fa";

interface Manual {
    id: string;
    dbId: number;
    title: string;
    target: string;
    content: string;
    status: string;
    updatedAt: string;
}

const targetLabels: Record<string, string> = {
    front: "フロント側",
    admin: "管理画面",
};

export default function Manuals({ manuals }: { manuals: Manual[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Manual | null>(null);
    const [viewingItem, setViewingItem] = useState<Manual | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        target: "admin",
        content: "",
        status: "draft",
    });

    const openNew = () => {
        setEditingItem(null);
        setFormData({
            title: "",
            target: "admin",
            content: "",
            status: "draft",
        });
        setIsEditOpen(true);
    };

    const openEdit = (item: Manual) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            target: item.target,
            content: item.content,
            status: item.status,
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!formData.title.trim()) return;
        if (editingItem) {
            router.patch(`/admin/manuals/${editingItem.dbId}`, formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        } else {
            router.post("/admin/manuals", formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        }
    };

    const handleDelete = (dbId: number) => {
        if (confirm("このマニュアルを削除しますか？")) {
            router.delete(`/admin/manuals/${dbId}`);
        }
    };

    return (
        <AdminLayout currentPage="manuals" title="マニュアル管理">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <FaBook className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    マニュアル一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{manuals.length}件
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={openNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]"
                        >
                            <FaPlus className="w-3 h-3" /> 新規作成
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        タイトル
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        対象
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        ステータス
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        最終更新
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {manuals.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {m.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {m.title}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${m.target === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                                            >
                                                {targetLabels[m.target] ||
                                                    m.target}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${m.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                            >
                                                {m.status === "published"
                                                    ? "公開中"
                                                    : "下書き"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {m.updatedAt}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setViewingItem(m);
                                                        setIsViewOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                >
                                                    <FaEye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(m)}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(m.dbId)
                                                    }
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <FaTrashAlt className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {manuals.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-sm text-gray-400"
                                        >
                                            マニュアルがありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 閲覧モーダル */}
                {isViewOpen && viewingItem && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsViewOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {viewingItem.title}
                                </h3>
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 overflow-y-auto">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                    {viewingItem.content}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* 編集モーダル */}
                {isEditOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsEditOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {editingItem
                                        ? "マニュアルを編集"
                                        : "新規作成"}
                                </h3>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-3 flex-1 overflow-y-auto">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        タイトル
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                title: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            対象
                                        </label>
                                        <select
                                            value={formData.target}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    target: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="admin">
                                                管理画面
                                            </option>
                                            <option value="front">
                                                フロント側
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            ステータス
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    status: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="draft">
                                                下書き
                                            </option>
                                            <option value="published">
                                                公開
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        内容（Markdown対応）
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                content: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-[#0a2105] font-mono"
                                        rows={16}
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
