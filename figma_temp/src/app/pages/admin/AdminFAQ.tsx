import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaQuestionCircle, FaPlus, FaEdit, FaTrashAlt, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const mockFAQs: FAQItem[] = [
  { id: "FAQ-001", category: "予約について", question: "予約はどのくらい前からできますか？", answer: "営業期間（3月〜12月）の予約は、前月1日から受け付けております。人気の時期はお早めにご予約ください。", order: 1, isActive: true },
  { id: "FAQ-002", category: "予約について", question: "最大何泊まで連泊できますか？", answer: "最大3泊までご利用いただけます。連泊の場合は清掃日の関係で一部日程がご利用いただけない場合があります。", order: 2, isActive: true },
  { id: "FAQ-003", category: "施設について", question: "Wi-Fiは使えますか？", answer: "はい、光回線のWi-Fiを完備しております。リモートワークやオンライン会議もご利用いただけます。", order: 3, isActive: true },
  { id: "FAQ-004", category: "ペットについて", question: "ペットの同伴は可能ですか？", answer: "小型犬2頭まで、または大型犬1頭まで同伴可能です。ペット用のアメニティもご用意しております。", order: 4, isActive: true },
  { id: "FAQ-005", category: "アクセス", question: "送迎サービスはありますか？", answer: "はい、最寄り駅からの送迎サービスをご用意しております。ご予約時にお申し付けください。", order: 5, isActive: true },
  { id: "FAQ-006", category: "料金について", question: "滞在サポート料とは何ですか？", answer: "滞在サポート料（¥8,000）は任意の料金で、買い出しサポートや送迎サービスなどが含まれます。", order: 6, isActive: true },
  { id: "FAQ-007", category: "体験について", question: "星空観察は有料ですか？", answer: "ガイドなしの星空観察は無料でお楽しみいただけます。星空ガイド付きの場合は1組¥2,000となります。", order: 7, isActive: true },
];

export function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>(mockFAQs);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({ category: "", question: "", answer: "", order: 0, isActive: true });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openNew = () => {
    setEditingItem(null);
    setFormData({ category: "", question: "", answer: "", order: faqs.length + 1, isActive: true });
    setIsEditOpen(true);
  };

  const openEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormData({ category: item.category, question: item.question, answer: item.answer, order: item.order, isActive: item.isActive });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (!formData.question.trim()) return;
    if (editingItem) {
      setFaqs(prev => prev.map(f => f.id === editingItem.id ? { ...f, ...formData } : f));
    } else {
      setFaqs(prev => [...prev, { id: `FAQ-${String(prev.length + 1).padStart(3, "0")}`, ...formData }]);
    }
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このFAQを論理削除しますか？")) {
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, isActive: false } : f));
    }
  };

  const categories = [...new Set(faqs.map(f => f.category))];

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
                <h2 className="text-base text-gray-900">よくある質問一覧</h2>
                <p className="text-xs text-gray-500">全{faqs.length}件 | 有効: {faqs.filter(f => f.isActive).length}件</p>
              </div>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
              <FaPlus className="w-3 h-3" /> 新規追加
            </button>
          </div>

          <div className="p-6 space-y-3">
            {faqs.sort((a, b) => a.order - b.order).map(faq => (
              <div key={faq.id} className={`border rounded-lg ${!faq.isActive ? "opacity-50 border-dashed" : "border-gray-200"}`}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{faq.category}</span>
                    <span className="text-sm text-gray-900">{faq.question}</span>
                    {!faq.isActive && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">無効</span>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={e => { e.stopPropagation(); openEdit(faq); }} className="p-1.5 text-gray-400 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3 h-3" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(faq.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><FaTrashAlt className="w-3 h-3" /></button>
                    {expandedId === faq.id ? <FaChevronUp className="w-3 h-3 text-gray-400" /> : <FaChevronDown className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
                {expandedId === faq.id && (
                  <div className="px-4 pb-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
            <div className="bg-white rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">{editingItem ? "FAQ編集" : "FAQ新規追加"}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">カテゴリ</label>
                    <input type="text" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" list="faq-categories" />
                    <datalist id="faq-categories">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">表示順</label>
                    <input type="number" value={formData.order} onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">質問</label>
                  <input type="text" value={formData.question} onChange={e => setFormData(f => ({ ...f, question: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">回答</label>
                  <textarea value={formData.answer} onChange={e => setFormData(f => ({ ...f, answer: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" rows={5} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">ステータス</label>
                  <select value={formData.isActive ? "true" : "false"} onChange={e => setFormData(f => ({ ...f, isActive: e.target.value === "true" }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                    <option value="true">有効</option>
                    <option value="false">無効</option>
                  </select>
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