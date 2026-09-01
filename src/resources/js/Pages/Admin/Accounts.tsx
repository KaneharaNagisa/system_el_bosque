import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaShieldAlt,
    FaUserPlus,
    FaEdit,
    FaTrashAlt,
    FaTimes,
} from "react-icons/fa";
import type { SharedProps } from "../../types";

interface AdminAccount {
    id: string;
    dbId: number;
    name: string;
    email: string;
    role: "system_admin" | "facility_admin";
    createdAt: string;
    lastLoginAt?: string;
}

const roleLabels: Record<string, { label: string; cls: string }> = {
    system_admin: {
        label: "システム管理者",
        cls: "bg-purple-100 text-purple-800",
    },
    facility_admin: { label: "運営担当", cls: "bg-blue-100 text-blue-800" },
};

export default function Accounts({ accounts }: { accounts: AdminAccount[] }) {
    const { auth } = usePage<SharedProps>().props;
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AdminAccount | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "facility_admin" as "system_admin" | "facility_admin",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const openNew = () => {
        setEditingItem(null);
        setFormData({
            name: "",
            email: "",
            role: "facility_admin",
            password: "",
        });
        setErrors({});
        setIsEditOpen(true);
    };

    const openEdit = (item: AdminAccount) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            email: item.email,
            role: item.role,
            password: "",
        });
        setErrors({});
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim()) return;
        if (editingItem) {
            router.patch(`/admin/accounts/${editingItem.dbId}`, formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        } else {
            router.post("/admin/accounts", formData, {
                onSuccess: () => setIsEditOpen(false),
            });
        }
    };

    const handleDelete = (dbId: number) => {
        if (auth.admin?.id === dbId) {
            alert("自分自身のアカウントは削除できません");
            return;
        }
        if (confirm("このアカウントを削除しますか？")) {
            router.delete(`/admin/accounts/${dbId}`);
        }
    };

    return (
        <AdminLayout currentPage="accounts" title="アカウント管理">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaShieldAlt className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    管理者アカウント一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    登録アカウント: {accounts.length}件
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={openNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]"
                        >
                            <FaUserPlus className="w-3 h-3" /> 新規作成
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
                                        名前
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        メール
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        権限
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        登録日
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        最終ログイン
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {a.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 flex items-center gap-2">
                                            {a.name}
                                            {auth.admin?.id === a.dbId && (
                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                    自分
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {a.email}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${roleLabels[a.role]?.cls || "bg-gray-100 text-gray-800"}`}
                                            >
                                                {roleLabels[a.role]?.label ||
                                                    a.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {a.createdAt}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {a.lastLoginAt || "−"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(a)}
                                                    className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(a.dbId)
                                                    }
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    disabled={
                                                        auth.admin?.id ===
                                                        a.dbId
                                                    }
                                                >
                                                    <FaTrashAlt className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                            className="bg-white rounded-xl w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {editingItem
                                        ? "アカウントを編集"
                                        : "新規作成"}
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
                                        名前
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
                                        メールアドレス
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                email: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        権限
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                role: e.target.value as
                                                    | "system_admin"
                                                    | "facility_admin",
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="facility_admin">
                                            運営担当
                                        </option>
                                        <option value="system_admin">
                                            システム管理者
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        {editingItem
                                            ? "新しいパスワード（変更する場合のみ）"
                                            : "パスワード"}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData((p) => ({
                                                ...p,
                                                password: e.target.value,
                                            }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                                        placeholder="8文字以上"
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
