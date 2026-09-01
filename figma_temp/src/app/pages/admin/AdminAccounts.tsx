import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaShieldAlt, FaUserPlus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "system_admin" | "facility_admin";
  createdAt: string;
  lastLoginAt?: string;
}

const mockAccounts: AdminAccount[] = [
  { id: "ADM-001", name: "管理者", email: "admin@elbosque.jp", role: "system_admin", createdAt: "2025-01-01", lastLoginAt: "2026-03-04" },
  { id: "ADM-002", name: "運営担当A", email: "staff-a@elbosque.jp", role: "facility_admin", createdAt: "2025-03-01", lastLoginAt: "2026-03-03" },
  { id: "ADM-003", name: "運営担当B", email: "staff-b@elbosque.jp", role: "facility_admin", createdAt: "2025-06-01", lastLoginAt: "2026-02-28" },
];

const roleLabels: Record<string, { label: string; cls: string }> = {
  system_admin: { label: "システム管理者", cls: "bg-purple-100 text-purple-800" },
  facility_admin: { label: "運営担当", cls: "bg-blue-100 text-blue-800" },
};

export function AdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>(mockAccounts);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminAccount | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "facility_admin" as AdminAccount["role"], password: "" });

  const openNew = () => {
    setEditingItem(null);
    setFormData({ name: "", email: "", role: "facility_admin", password: "" });
    setIsEditOpen(true);
  };

  const openEdit = (item: AdminAccount) => {
    setEditingItem(item);
    setFormData({ name: item.name, email: item.email, role: item.role, password: "" });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (editingItem) {
      setAccounts(prev => prev.map(a => a.id === editingItem.id ? { ...a, name: formData.name, email: formData.email, role: formData.role } : a));
    } else {
      setAccounts(prev => [...prev, { id: `ADM-${String(prev.length + 1).padStart(3, "0")}`, name: formData.name, email: formData.email, role: formData.role, createdAt: new Date().toISOString().split("T")[0] }]);
    }
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このアカウントを削除しますか？")) {
      setAccounts(prev => prev.filter(a => a.id !== id));
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
                <h2 className="text-base text-gray-900">管理者アカウント一覧</h2>
                <p className="text-xs text-gray-500">登録アカウント: {accounts.length}件</p>
              </div>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
              <FaUserPlus className="w-3 h-3" /> 新規作成
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">氏名</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">メールアドレス</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">権限</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">登録日</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">最終ログイン</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${roleLabels[a.role]?.cls}`}>{roleLabels[a.role]?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.createdAt}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.lastLoginAt || "−"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><FaTrashAlt className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
            <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">{editingItem ? "アカウント編集" : "新規アカウント作成"}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">氏名</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">メールアドレス</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">権限</label>
                  <select value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value as AdminAccount["role"] }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                    <option value="system_admin">システム管理者</option>
                    <option value="facility_admin">運営担当</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">パスワード {editingItem && "(変更する場合のみ)"}</label>
                  <input type="password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="パスワード" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
                  <button onClick={handleSave} className="flex-1 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">{editingItem ? "更新" : "作成"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}