import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import { FaFileAlt, FaEdit, FaTimes } from "react-icons/fa";

interface PageItem {
    id: string;
    dbId: number;
    title: string;
    slug: string;
    content: string;
    status: string;
    updatedAt: string;
}

export default function Pages({ pages }: { pages: PageItem[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<PageItem | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        status: "published",
    });

    const openEdit = (page: PageItem) => {
        setEditingPage(page);
        setFormData({
            title: page.title,
            content: page.content,
            status: page.status,
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!editingPage) return;
        router.patch(`/admin/pages/${editingPage.dbId}`, formData, {
            onSuccess: () => setIsEditOpen(false),
        });
    };

    return (
        <AdminLayout currentPage="pages" title="固定ページ管理">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FaFileAlt className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    固定ページ一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    フロント側に表示される固定ページの管理
                                </p>
                            </div>
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
                                        タイトル
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        スラッグ
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
                                {pages.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {p.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {p.title}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            /{p.slug}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${p.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                            >
                                                {p.status === "published"
                                                    ? "公開中"
                                                    : "下書き"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {p.updatedAt}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                            >
                                                <FaEdit className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 編集モーダル */}
                {isEditOpen && editingPage && (
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
                                    {editingPage.title} を編集
                                </h3>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
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
                                        rows={12}
                                    />
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
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="published">公開</option>
                                        <option value="draft">下書き</option>
                                    </select>
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
