import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaBook, FaPlus, FaEdit, FaEye, FaTimes, FaTrashAlt } from "react-icons/fa";

interface Manual {
  id: string;
  title: string;
  target: "front" | "admin";
  content: string;
  status: "published" | "draft";
  updatedAt: string;
}

const mockManuals: Manual[] = [
  {
    id: "MNL-001",
    title: "フロント側 - 会員登録の手順",
    target: "front",
    content: `# 会員登録の手順

## 1. 予約ページへアクセス
トップページの「予約する」ボタンをクリックします。

## 2. 日程を選択
カレンダーから希望の日程を選択します。
- ◎のマークがついた日が予約可能です
- 最大3泊まで連泊できます

## 3. 会員登録
未登録の方は「新規会員登録」から5ステップで登録できます。
1. メールアドレス入力
2. メール認証
3. 基本情報入力
4. 確認
5. 登録完了

## 4. ログイン
登録後、メールアドレスとパスワードでログインしてください。`,
    status: "published",
    updatedAt: "2026-02-01",
  },
  {
    id: "MNL-002",
    title: "フロント側 - 予約の流れ",
    target: "front",
    content: `# 予約の流れ

## ステップ1: 日程選択
空き状況カレンダーからチェックイン・チェックアウト日を選択します。

## ステップ2: 詳細入力
- 宿泊人数（最大6名、推奨1〜4名）
- ペット同伴の有無
- 滞在サポート料（¥8,000・任意）
- 体験オプションの選択

## ステップ3: 確認・予約完了
入力内容を確認し、予約を確定します。`,
    status: "published",
    updatedAt: "2026-02-15",
  },
  {
    id: "MNL-003",
    title: "管理画面 - ダッシュボードの使い方",
    target: "admin",
    content: `# ダッシュボードの使い方

## 概要
ダッシュボードでは、施設の運営状況を一目で確認できます。

## 統計カード
- **総会員数**: 登録済み会員の総数
- **今月の新規登録**: 当月に新規登録した会員数
- **保留中の予約**: 確認が必要な予約数
- **未対応の問合せ**: 返信が必要な問い合わせ数

## 予約一覧
直近の予約情報を予約状況・支払状況と共に表示します。

## 管理メニュー
各管理機能へのショートカットカードです。`,
    status: "published",
    updatedAt: "2026-03-01",
  },
  {
    id: "MNL-004",
    title: "管理画面 - 予約枠管理",
    target: "admin",
    content: `# 予約枠管理の使い方

## カレンダー操作
各日をクリックするとステータスが切り替わります。

## ステータス一覧
- ◎ 空きあり
- × 予約済み
- ▲ 清掃準備中
- 休 予約不可（火・水・木）
- − 休業期間（1〜2月）
- ■ 手動ブロック

## Googleカレンダー連携
「Googleカレンダー同期」ボタンで外部カレンダーと同期できます。`,
    status: "draft",
    updatedAt: "2026-03-02",
  },
];

export function AdminManuals() {
  const [manuals, setManuals] = useState<Manual[]>(mockManuals);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Manual | null>(null);
  const [previewItem, setPreviewItem] = useState<Manual | null>(null);
  const [formData, setFormData] = useState({ title: "", target: "front" as Manual["target"], content: "", status: "draft" as Manual["status"] });
  const [filterTarget, setFilterTarget] = useState("all");

  const filtered = filterTarget === "all" ? manuals : manuals.filter(m => m.target === filterTarget);

  const openNew = () => {
    setEditingItem(null);
    setFormData({ title: "", target: "front", content: "", status: "draft" });
    setIsEditOpen(true);
  };

  const openEdit = (item: Manual) => {
    setEditingItem(item);
    setFormData({ title: item.title, target: item.target, content: item.content, status: item.status });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (editingItem) {
      setManuals(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...formData, updatedAt: new Date().toISOString().split("T")[0] } : m));
    } else {
      setManuals(prev => [...prev, { id: `MNL-${String(prev.length + 1).padStart(3, "0")}`, ...formData, updatedAt: new Date().toISOString().split("T")[0] }]);
    }
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このマニュアルを削除しますか？")) {
      setManuals(prev => prev.filter(m => m.id !== id));
    }
  };

  // Simple markdown-like rendering
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl text-gray-900 mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg text-gray-800 mt-3 mb-1">{line.slice(3)}</h2>;
      if (line.startsWith("- ")) return <li key={i} className="text-sm text-gray-700 ml-4">{line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-gray-700 ml-4 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-sm text-gray-700">{line}</p>;
    });
  };

  return (
    <AdminLayout currentPage="manuals" title="マニュアル管理">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaBook className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base text-gray-900">マニュアル一覧</h2>
                <p className="text-xs text-gray-500">マークダウン形式で作成・編集</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select value={filterTarget} onChange={e => setFilterTarget(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                <option value="all">すべて</option>
                <option value="front">フロント側</option>
                <option value="admin">管理画面側</option>
              </select>
              <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
                <FaPlus className="w-3 h-3" /> 新規作成
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">タイトル</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">対象</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">ステータス</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">最終更新</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{m.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{m.title}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${m.target === "front" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                        {m.target === "front" ? "フロント側" : "管理画面側"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${m.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {m.status === "published" ? "公開" : "下書き"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.updatedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setPreviewItem(m); setIsPreviewOpen(true); }} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"><FaEye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(m)} className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><FaTrashAlt className="w-3.5 h-3.5" /></button>
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
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">{editingItem ? "マニュアル編集" : "マニュアル新規作成"}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600 mb-1 block">タイトル</label>
                    <input type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">対象</label>
                      <select value={formData.target} onChange={e => setFormData(f => ({ ...f, target: e.target.value as Manual["target"] }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                        <option value="front">フロント側</option>
                        <option value="admin">管理画面側</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">ステータス</label>
                      <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as Manual["status"] }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                        <option value="draft">下書き</option>
                        <option value="published">公開</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">内容（マークダウン形式）</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    rows={20}
                    placeholder="# タイトル&#10;## セクション&#10;- リスト項目"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
                  <button onClick={handleSave} className="flex-1 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">{editingItem ? "更新" : "作成"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {isPreviewOpen && previewItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsPreviewOpen(false)}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">プレビュー - {previewItem.title}</h3>
                <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4">
                {renderMarkdown(previewItem.content)}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}