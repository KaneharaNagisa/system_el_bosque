import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaFileAlt, FaEdit, FaEye, FaTimes } from "react-icons/fa";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft";
  updatedAt: string;
}

const mockPages: PageItem[] = [
  { id: "PG-001", title: "施設紹介", slug: "about", content: "長野県下伊那郡阿南町新野に位置する一棟貸しログハウス「貸別荘エルボスケ」は、最大6名（推奨1〜4名）まで宿泊可能な完全プライベート空間です。\n\nWi-Fi完備、送迎・買い出しサポート付きで、ペット（小型犬2頭または大型犬1頭）も一緒にお過ごしいただけます。\n\n営業期間は3月〜12月です。", status: "published", updatedAt: "2026-02-01" },
  { id: "PG-002", title: "周辺情報", slug: "area", content: "新野周辺には豊かな自然が広がっています。星空観察スポット、ハイキングコース、地元の温泉など、四季折々の魅力をお楽しみいただけます。", status: "published", updatedAt: "2026-02-15" },
  { id: "PG-003", title: "利用規約", slug: "terms", content: "貸別荘エルボスケ利用規約\n\n第1条（目的）\n本規約は、貸別荘エルボスケ（以下「当施設」）の利用に関する基本的な事項を定めるものです。\n\n第2条（営業期間）\n当施設の営業期間は、毎年3月〜12月とします。", status: "published", updatedAt: "2026-01-15" },
  { id: "PG-004", title: "個人情報取り扱い", slug: "privacy", content: "個人情報保護方針\n\n当施設は、お客様の個人情報の重要性を認識し、その保護に努めます。\n\n1. 個人情報の収集\nご予約、お問い合わせの際に必要な範囲で個人情報を収集させていただきます。", status: "published", updatedAt: "2026-01-15" },
];

export function AdminPages() {
  const [pages, setPages] = useState<PageItem[]>(mockPages);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", status: "published" as PageItem["status"] });

  const openEdit = (page: PageItem) => {
    setEditingPage(page);
    setFormData({ title: page.title, content: page.content, status: page.status });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!editingPage) return;
    setPages(prev => prev.map(p => p.id === editingPage.id ? { ...p, ...formData, updatedAt: new Date().toISOString().split("T")[0] } : p));
    setIsEditOpen(false);
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
                <h2 className="text-base text-gray-900">固定ページ一覧</h2>
                <p className="text-xs text-gray-500">フロント側に表示される固定ページの管理</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">タイトル</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">スラッグ</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">ステータス</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">最終更新</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{p.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{p.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">/{p.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {p.status === "published" ? "公開中" : "下書き"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.updatedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditOpen && editingPage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">ページ編集 - {editingPage.title}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">タイトル</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">内容</label>
                  <textarea value={formData.content} onChange={e => setFormData(f => ({ ...f, content: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={15} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">ステータス</label>
                  <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as PageItem["status"] }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                    <option value="published">公開</option>
                    <option value="draft">下書き</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
                  <button onClick={handleSave} className="flex-1 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">更新</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}