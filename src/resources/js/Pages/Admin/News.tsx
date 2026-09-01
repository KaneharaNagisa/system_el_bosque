import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import { FaBell, FaPlus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";

interface NewsItem {
    id: string;
    dbId: number;
    title: string;
    content: string;
    target: string;
    status: string;
    publishDate?: string;
    createdAt: string;
}

const targetLabels: Record<string, string> = {
    top: "トップページ",
    mypage: "マイページ",
    both: "両方",
};

export default function News({ news }: { news: NewsItem[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        target: "both",
        status: "draft",
        publishDate: "",
    });

    const openNew = () => {
        setEditingItem(null);
        setFormData({
            title: "",
            content: "",
            target: "both",
            status: "draft",
            publishDate: new Date().toISOString().split("T")[0],
        });
        setIsEditOpen(true);
    };

    const openEdit = (item: NewsItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            target: item.target,
            status: item.status,
            publishDate: item.publishDate || "",
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!formData.title.trim()) return;
        const payload = { ...formData, publish_date: formData.publishDate };
        if (editingItem) {
            router.patch(`/admin/news/${editingItem.dbId}`, payload, {
                onSuccess: () => setIsEditOpen(false),
            });
        } else {
            router.post("/admin/news", payload, {
                onSuccess: () => setIsEditOpen(false),
            });
        }
    };

    const handleDelete = (dbId: number) => {
        if (confirm("このお知らせを削除しますか？")) {
            router.delete(`/admin/news/${dbId}`);
        }
    };

    return (
        <AdminLayout currentPage="news" title="お知らせ管理">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                <FaBell className="w-4 h-4 text-pink-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    お知らせ一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{news.length}件
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
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        表示場所
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        ステータス
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        公開日
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map((n) => (
                                    <tr
                                        key={n.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {n.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {n.title}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {targetLabels[n.target] || n.target}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${n.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                            >
                                                {n.status === "published"
                                                    ? "公開中"
                                                    : "下書き"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {n.publishDate || "−"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(n)}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(n.dbId)
                                                    }
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <FaTrashAlt className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {news.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-sm text-gray-400"
                                        >
                                            お知らせはありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                    {editingItem
                                        ? "お知らせを編集"
                                        : "新規作成"}
                                </h3>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-4">
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        内容
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                content: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#0a2105] outline-none"
                                        rows={6}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            表示場所
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
                                            <option value="both">両方</option>
                                            <option value="top">
                                                トップページ
                                            </option>
                                            <option value="mypage">
                                                マイページ
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
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">
                                            公開日
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.publishDate}
                                            onChange={(e) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    publishDate: e.target.value,
                                                }))
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
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
