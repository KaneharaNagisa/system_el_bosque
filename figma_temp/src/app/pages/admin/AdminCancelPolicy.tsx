import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaExclamationCircle, FaEdit, FaPlus, FaTrashAlt, FaTimes } from "react-icons/fa";

interface CancelPolicy {
  id: string;
  daysBefore: number;
  label: string;
  chargeRate: number;
  description: string;
}

const mockPolicies: CancelPolicy[] = [
  { id: "CP-001", daysBefore: 30, label: "30日前まで", chargeRate: 0, description: "キャンセル料無料" },
  { id: "CP-002", daysBefore: 14, label: "14日前まで", chargeRate: 20, description: "宿泊料の20%" },
  { id: "CP-003", daysBefore: 7, label: "7日前まで", chargeRate: 50, description: "宿泊料の50%" },
  { id: "CP-004", daysBefore: 3, label: "3日前まで", chargeRate: 70, description: "宿泊料の70%" },
  { id: "CP-005", daysBefore: 1, label: "前日", chargeRate: 90, description: "宿泊料の90%" },
  { id: "CP-006", daysBefore: 0, label: "当日・無連絡", chargeRate: 100, description: "宿泊料の100%" },
];

export function AdminCancelPolicy() {
  const [policies, setPolicies] = useState<CancelPolicy[]>(mockPolicies);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CancelPolicy | null>(null);
  const [formData, setFormData] = useState({ daysBefore: 0, label: "", chargeRate: 0, description: "" });

  const openEdit = (item: CancelPolicy) => {
    setEditingItem(item);
    setFormData({ daysBefore: item.daysBefore, label: item.label, chargeRate: item.chargeRate, description: item.description });
    setIsEditOpen(true);
  };

  const openNew = () => {
    setEditingItem(null);
    setFormData({ daysBefore: 0, label: "", chargeRate: 0, description: "" });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!formData.label.trim()) return;
    if (editingItem) {
      setPolicies(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...formData } : p));
    } else {
      setPolicies(prev => [...prev, { id: `CP-${String(prev.length + 1).padStart(3, "0")}`, ...formData }].sort((a, b) => b.daysBefore - a.daysBefore));
    }
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このポリシーを削除しますか？")) {
      setPolicies(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <AdminLayout currentPage="master-cancel-policy" title="キャンセルポリシー管理">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FaExclamationCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h2 className="text-base text-gray-900">キャンセルポリシー設定</h2>
                <p className="text-xs text-gray-500">予約キャンセル時のキャンセル料率を設定します</p>
              </div>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
              <FaPlus className="w-3 h-3" /> 追加
            </button>
          </div>

          <div className="p-6">
            {/* Visual timeline */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded" />
                <div className="flex justify-between relative">
                  {policies.map(p => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white z-10 ${p.chargeRate === 0 ? "bg-green-500" : p.chargeRate <= 30 ? "bg-yellow-500" : p.chargeRate <= 70 ? "bg-orange-500" : "bg-red-500"}`}>
                        {p.chargeRate}%
                      </div>
                      <span className="text-xs text-gray-600 mt-1 whitespace-nowrap">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">期間</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">キャンセル料率</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">説明</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{p.label}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded text-sm ${p.chargeRate === 0 ? "bg-green-100 text-green-800" : p.chargeRate <= 30 ? "bg-yellow-100 text-yellow-800" : p.chargeRate <= 70 ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`}>
                        {p.chargeRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.description}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><FaTrashAlt className="w-3.5 h-3.5" /></button>
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
                <h3 className="text-base text-gray-900">{editingItem ? "ポリシー編集" : "ポリシー追加"}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">日数前</label>
                    <input type="number" value={formData.daysBefore} onChange={e => setFormData(f => ({ ...f, daysBefore: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">キャンセル料率（%）</label>
                    <input type="number" value={formData.chargeRate} onChange={e => setFormData(f => ({ ...f, chargeRate: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min={0} max={100} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">表示ラベル</label>
                  <input type="text" value={formData.label} onChange={e => setFormData(f => ({ ...f, label: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">説明</label>
                  <input type="text" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
                  <button onClick={handleSave} className="flex-1 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">{editingItem ? "更新" : "追加"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}