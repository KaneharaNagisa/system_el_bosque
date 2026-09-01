import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaBell, FaPlus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  target: "top" | "mypage" | "both";
  status: "published" | "draft";
  publishDate: string;
  createdAt: string;
}

const mockNews: NewsItem[] = [
  { id: "NEWS-001", title: "2026年シーズン営業開始のお知らせ", content: "3月1日より2026年シーズンの営業を開始いたします。皆様のご予約をお待ちしております。", target: "both", status: "published", publishDate: "2026-02-15", createdAt: "2026-02-10" },
  { id: "NEWS-002", title: "星空観察ガイドサービス開始", content: "新たに星空観察ガイドサービスを開始いたしました。ガイドなしの星空観察は無料、ガイド付きは1組¥2,000です。", target: "top", status: "published", publishDate: "2026-03-01", createdAt: "2026-02-25" },
  { id: "NEWS-003", title: "GW期間の予約受付開始", content: "ゴールデンウィーク期間（4/29〜5/5）の予約受付を開始いたしました。", target: "both", status: "published", publishDate: "2026-03-01", createdAt: "2026-02-28" },
  { id: "NEWS-004", title: "【会員様向け】リピーター特典のご案内", content: "2回目以降のご利用の方には、滞在サポート料を割引させていただきます。", target: "mypage", status: "draft", publishDate: "2026-03-10", createdAt: "2026-03-02" },
];

const targetLabels: Record<string, string> = { top: "トップページ", mypage: "マイページ", both: "両方" };

export function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", target: "both" as NewsItem["target"], status: "draft" as NewsItem["status"], publishDate: "" });

  const openNew = () => {
    setEditingItem(null);
    setFormData({ title: "", content: "", target: "both", status: "draft", publishDate: new Date().toISOString().split("T")[0] });
    setIsEditOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({ title: item.title, content: item.content, target: item.target, status: item.status, publishDate: item.publishDate });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (editingItem) {
      setNews(prev => prev.map(n => n.id === editingItem.id ? { ...n, ...formData } : n));
    } else {
      setNews(prev => [...prev, { id: `NEWS-${String(prev.length + 1).padStart(3, "0")}`, ...formData, createdAt: new Date().toISOString().split("T")[0] }]);
    }
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このお知らせを削除しますか？")) {
      setNews(prev => prev.filter(n => n.id !== id));
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
                <h2 className="text-base text-gray-900">お知らせ一覧</h2>
                <p className="text-xs text-gray-500">全{news.length}件</p>
              </div>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
              <FaPlus className="w-3 h-3" /> 新規作成
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">タイトル</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">表示先</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">ステータス</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">公開日</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {news.map(n => (
                  <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{n.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{n.title}</td>
                    <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{targetLabels[n.target]}</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${n.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {n.status === "published" ? "公開中" : "下書き"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{n.publishDate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(n)} className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(n.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><FaTrashAlt className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">{editingItem ? "お知らせ編集" : "お知らせ新規作成"}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">タイトル</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">内容</label>
                  <textarea value={formData.content} onChange={e => setFormData(f => ({ ...f, content: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">表示先</label>
                    <select value={formData.target} onChange={e => setFormData(f => ({ ...f, target: e.target.value as NewsItem["target"] }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                      <option value="top">トップページ</option>
                      <option value="mypage">マイページ</option>
                      <option value="both">両方</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">ステータス</label>
                    <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as NewsItem["status"] }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                      <option value="draft">下書き</option>
                      <option value="published">公開</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">公開日</label>
                  <input type="date" value={formData.publishDate} onChange={e => setFormData(f => ({ ...f, publishDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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