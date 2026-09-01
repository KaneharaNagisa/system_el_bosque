import { useState, useMemo } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaEnvelope, FaSearch, FaTimes, FaReply, FaCheck } from "react-icons/fa";

interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: string;
  date: string;
  status: "unread" | "inprogress" | "replied" | "closed";
  reply?: string;
}

const mockContacts: ContactItem[] = [
  { id: "CNT-001", name: "伊藤 太郎", email: "ito@example.com", phone: "090-1111-2222", subject: "ペット同伴について", message: "大型犬（ゴールデンレトリバー・30kg）の同伴は可能でしょうか？また、ドッグランのようなスペースはありますか？", category: "施設について", date: "2026-03-02", status: "unread" },
  { id: "CNT-002", name: "渡辺 花子", email: "watanabe@example.com", phone: "090-3333-4444", subject: "送迎サービスについて", message: "飯田駅からの送迎は可能でしょうか？到着予定は15時頃です。", category: "アクセス", date: "2026-03-01", status: "unread" },
  { id: "CNT-003", name: "松田 健一", email: "matsuda@example.com", phone: "090-5555-6666", subject: "キャンセルについて", message: "3月25日〜27日の予約をキャンセルしたいのですが、キャンセル料はかかりますか？", category: "予約について", date: "2026-02-28", status: "replied", reply: "お問い合わせありがとうございます。キャンセルポリシーに基づき、7日前までのキャンセルは無料です。ご安心ください。" },
  { id: "CNT-004", name: "小林 美咲", email: "kobayashi@example.com", phone: "090-7777-8888", subject: "Wi-Fi環境について", message: "リモートワークで利用したいのですが、Wi-Fiの速度はどのくらいですか？Zoom会議は可能でしょうか？", category: "施設について", date: "2026-02-27", status: "replied", reply: "Wi-Fiは光回線をご用意しております。Zoom会議も問題なくご利用いただけます。" },
  { id: "CNT-005", name: "藤原 大輔", email: "fujiwara@example.com", phone: "090-9999-0000", subject: "星空観察について", message: "星空ガイド付きの体験を予約したいのですが、どの時期がおすすめですか？", category: "体験について", date: "2026-02-25", status: "closed" },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  unread: { label: "未対応", cls: "bg-red-100 text-red-800" },
  inprogress: { label: "対応中", cls: "bg-yellow-100 text-yellow-800" },
  replied: { label: "返信済", cls: "bg-green-100 text-green-800" },
  closed: { label: "完了", cls: "bg-gray-100 text-gray-600" },
};

export function AdminContacts() {
  const [contacts, setContacts] = useState<ContactItem[]>(mockContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      const matchSearch = !searchQuery || c.name.includes(searchQuery) || c.subject.includes(searchQuery) || c.id.includes(searchQuery);
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [contacts, searchQuery, filterStatus]);

  const handleStatusChange = (id: string, newStatus: ContactItem["status"]) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleReply = () => {
    if (!selectedContact || !replyText.trim()) return;
    setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, status: "replied", reply: replyText } : c));
    setSelectedContact(prev => prev ? { ...prev, status: "replied", reply: replyText } : null);
    setReplyText("");
  };

  return (
    <AdminLayout currentPage="contacts" title="お問合せ管理">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base text-gray-900">お問い合わせ一覧</h2>
                <p className="text-xs text-gray-500">全{contacts.length}件 | 未対応: {contacts.filter(c => c.status === "unread").length}件</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="名前、件名、IDで検索" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                <option value="all">すべて</option>
                <option value="unread">未対応</option>
                <option value="inprogress">対応中</option>
                <option value="replied">返信済</option>
                <option value="closed">完了</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">名前</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">件名</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">カテゴリ</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">日付</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">状態</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${c.status === "unread" ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.date}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusMap[c.status]?.cls}`}>{statusMap[c.status]?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setSelectedContact(c); setIsDetailOpen(true); setReplyText(""); }} className="px-3 py-1 text-xs hover:bg-[#e8f5e9] rounded border" style={{ color: "#0a2105", borderColor: "rgba(10,33,5,0.2)" }}>詳細</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {isDetailOpen && selectedContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDetailOpen(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base text-gray-900">お問い合わせ詳細 - {selectedContact.id}</h3>
                <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-xs text-gray-500">名前</span><p className="text-sm text-gray-900">{selectedContact.name}</p></div>
                  <div><span className="text-xs text-gray-500">メール</span><p className="text-sm text-gray-900">{selectedContact.email}</p></div>
                  <div><span className="text-xs text-gray-500">電話</span><p className="text-sm text-gray-900">{selectedContact.phone}</p></div>
                  <div><span className="text-xs text-gray-500">カテゴリ</span><p className="text-sm text-gray-900">{selectedContact.category}</p></div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">件名</span>
                  <p className="text-sm text-gray-900">{selectedContact.subject}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">内容</span>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedContact.message}</p>
                </div>
                {selectedContact.reply && (
                  <div>
                    <span className="text-xs text-gray-500">返信内容</span>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap p-3 rounded-lg border" style={{ backgroundColor: "#e8f5e9", borderColor: "rgba(10,33,5,0.2)" }}>{selectedContact.reply}</p>
                  </div>
                )}
                {selectedContact.status !== "closed" && (
                  <div className="border-t border-gray-200 pt-4">
                    <label className="text-xs text-gray-500 mb-1 block">返信を入力</label>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={4} placeholder="返信内容を入力..." />
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={handleReply} disabled={!replyText.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04] disabled:opacity-40">
                        <FaReply className="w-3 h-3" /> 返信
                      </button>
                      {selectedContact.status !== "closed" && (
                        <button onClick={() => { handleStatusChange(selectedContact.id, "closed"); setSelectedContact(prev => prev ? { ...prev, status: "closed" } : null); }} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
                          <FaCheck className="w-3 h-3" /> 完了にする
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}