import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import { FaEnvelope, FaSearch, FaTimes, FaReply } from "react-icons/fa";

interface Contact {
    id: string;
    dbId: number;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    category?: string;
    date: string;
    status: string;
    reply?: string;
}

const statusMap: Record<string, { label: string; cls: string }> = {
    unread: { label: "未対応", cls: "bg-red-100 text-red-800" },
    inprogress: { label: "対応中", cls: "bg-yellow-100 text-yellow-800" },
    replied: { label: "返信済", cls: "bg-green-100 text-green-800" },
    closed: { label: "完了", cls: "bg-gray-100 text-gray-600" },
};

export default function Contacts({ contacts }: { contacts: Contact[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    const filtered = useMemo(
        () =>
            contacts.filter((c) => {
                const matchSearch =
                    !searchQuery ||
                    c.name.includes(searchQuery) ||
                    c.subject.includes(searchQuery) ||
                    c.id.includes(searchQuery);
                const matchStatus =
                    filterStatus === "all" || c.status === filterStatus;
                return matchSearch && matchStatus;
            }),
        [contacts, searchQuery, filterStatus],
    );

    const handleReply = () => {
        if (!selectedContact || !replyText.trim()) return;
        router.post(
            `/admin/contacts/${selectedContact.dbId}/reply`,
            { reply: replyText },
            {
                onSuccess: () => {
                    setReplyText("");
                    setIsDetailOpen(false);
                },
            },
        );
    };

    const handleStatusChange = (dbId: number, status: string) => {
        router.patch(`/admin/contacts/${dbId}/status`, { status });
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
                                <h2 className="text-base text-gray-900">
                                    お問い合わせ一覧
                                </h2>
                                <p className="text-xs text-gray-500">
                                    全{contacts.length}件 | 未対応:{" "}
                                    {
                                        contacts.filter(
                                            (c) => c.status === "unread",
                                        ).length
                                    }
                                    件
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="名前、件名、IDで検索"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                            >
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
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        名前
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        件名
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        カテゴリ
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs text-gray-500">
                                        日付
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-gray-500">
                                        状況
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs text-gray-500">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {c.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {c.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {c.subject}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {c.category || "−"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {c.date}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${statusMap[c.status]?.cls || "bg-gray-100 text-gray-800"}`}
                                            >
                                                {statusMap[c.status]?.label ||
                                                    c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedContact(c);
                                                        setReplyText(
                                                            c.reply || "",
                                                        );
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                                                    title="詳細・返信"
                                                >
                                                    <FaReply className="w-3.5 h-3.5" />
                                                </button>
                                                {c.status !== "closed" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                c.dbId,
                                                                "closed",
                                                            )
                                                        }
                                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                                    >
                                                        完了
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-sm text-gray-400"
                                        >
                                            お問い合わせはありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 詳細・返信モーダル */}
                {isDetailOpen && selectedContact && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsDetailOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    お問い合わせ詳細
                                </h3>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {(
                                        [
                                            ["名前", selectedContact.name],
                                            ["メール", selectedContact.email],
                                            [
                                                "電話",
                                                selectedContact.phone || "−",
                                            ],
                                            [
                                                "カテゴリ",
                                                selectedContact.category || "−",
                                            ],
                                        ] as [string, string][]
                                    ).map(([l, v]) => (
                                        <div key={l}>
                                            <p className="text-xs text-gray-500">
                                                {l}
                                            </p>
                                            <p className="text-sm text-gray-900">
                                                {v}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                        件名
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {selectedContact.subject}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                        内容
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                                        {selectedContact.message}
                                    </p>
                                </div>
                                {selectedContact.reply && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            返信済み内容
                                        </p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-green-50 p-3 rounded border border-green-200">
                                            {selectedContact.reply}
                                        </p>
                                    </div>
                                )}
                                {selectedContact.status !== "closed" && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            返信
                                        </p>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) =>
                                                setReplyText(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={5}
                                            placeholder="返信内容を入力してください"
                                        />
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyText.trim()}
                                            className="mt-2 px-4 py-2 bg-[#0a2105] text-white text-sm rounded-lg hover:bg-[#071a04] disabled:opacity-50"
                                        >
                                            返信を送信
                                        </button>
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
