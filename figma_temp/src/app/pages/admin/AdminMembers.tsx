import { useState, useMemo } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaUsers, FaSearch, FaUserPlus, FaTrashAlt, FaFilter, FaSortAmountDown, FaSortAmountUp, FaSort, FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaUser, FaPaw, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaPlus } from "react-icons/fa";
import { PREFECTURES, getCities } from "../../data/japanLocations";
import { FAMILY_BIRTH_YEAR_OPTIONS, getApproximateAge } from "../../data/familyBirthYears";

interface Member {
  id: string;
  nickname: string;
  email: string;
  phone: string;
  prefecture: string;
  city: string;
  lineId: string;
  birthDate: string;
  hasPet: string;
  petBreed: string;
  petBreed2?: string;
  hasFamily: string;
  familyBirthYears?: string[];
  concerns: string;
  howFound: string;
  expectations: string;
  registeredAt: string;
  lastLoginAt?: string;
  status: "active" | "withdrawn";
}

interface MemberEditForm {
  email: string;
  phone: string;
  prefecture: string;
  city: string;
  lineId: string;
  hasFamily: string;
  familyBirthYears: string[];
  concerns: string;
  howFound: string;
  expectations: string;
  hasPet: string;
  petBreed: string;
  petBreed2: string;
  status: Member["status"];
}

const mockMembers: Member[] = [
  { id: "MBR-001", nickname: "たろう", email: "yamada@example.com", phone: "090-1234-5678", prefecture: "東京都", city: "新宿区", lineId: "taro_line", birthDate: "1985-06-15", hasPet: "small", petBreed: "トイプードル", hasFamily: "married", concerns: "特になし", howFound: "インターネット検索", expectations: "自然の中でゆっくり過ごしたい", registeredAt: "2025-05-10", lastLoginAt: "2026-03-01", status: "active" },
  { id: "MBR-002", nickname: "はな", email: "sato@example.com", phone: "090-2345-6789", prefecture: "愛知県", city: "名古屋市", lineId: "", birthDate: "1990-03-22", hasPet: "none", petBreed: "", hasFamily: "couple", concerns: "冬季の道路状況", howFound: "SNS", expectations: "静かな時間を過ごしたい", registeredAt: "2025-06-20", lastLoginAt: "2026-02-28", status: "active" },
  { id: "MBR-003", nickname: "いちろう", email: "suzuki@example.com", phone: "090-3456-7890", prefecture: "大阪府", city: "大阪市", lineId: "", birthDate: "1978-11-05", hasPet: "large", petBreed: "ゴールデンレトリバー", hasFamily: "family", familyBirthYears: ["2017", "2011", "1980"], concerns: "大型犬と泊まる際の設備", howFound: "友人の紹介", expectations: "家族と自然体験を楽しみたい", registeredAt: "2025-07-15", lastLoginAt: "2026-02-20", status: "active" },
  { id: "MBR-004", nickname: "みさき", email: "tanaka@example.com", phone: "090-4567-8901", prefecture: "長野県", city: "飯田市", lineId: "misaki_n", birthDate: "1995-09-10", hasPet: "small2", petBreed: "チワワ", petBreed2: "ミニチュアダックス", hasFamily: "individual", concerns: "ペット用アメニティ", howFound: "旅行サイト", expectations: "犬たちとのんびり過ごしたい", registeredAt: "2025-08-01", lastLoginAt: "2026-03-02", status: "active" },
  { id: "MBR-005", nickname: "ケン", email: "takahashi@example.com", phone: "090-5678-9012", prefecture: "東京都", city: "渋谷区", lineId: "", birthDate: "1982-01-30", hasPet: "none", petBreed: "", hasFamily: "friends", concerns: "特になし", howFound: "雑誌", expectations: "友人とBBQを楽しみたい", registeredAt: "2025-09-10", lastLoginAt: "2026-01-15", status: "active" },
  { id: "MBR-006", nickname: "さち", email: "ito@example.com", phone: "090-6789-0123", prefecture: "静岡県", city: "浜松市", lineId: "", birthDate: "1988-07-25", hasPet: "small", petBreed: "ポメラニアン", hasFamily: "married", concerns: "チェックイン時間", howFound: "インターネット検索", expectations: "夫婦で星空を眺めたい", registeredAt: "2025-10-05", lastLoginAt: "2026-02-10", status: "active" },
  { id: "MBR-007", nickname: "だいすけ", email: "watanabe@example.com", phone: "090-7890-1234", prefecture: "神奈川県", city: "横浜市", lineId: "", birthDate: "1975-04-18", hasPet: "none", petBreed: "", hasFamily: "family", familyBirthYears: ["2021", "1982"], concerns: "", howFound: "TV放送", expectations: "", registeredAt: "2025-11-20", status: "withdrawn" },
  { id: "MBR-008", nickname: "ゆみ", email: "nakamura@example.com", phone: "090-8901-2345", prefecture: "長野県", city: "松本市", lineId: "", birthDate: "1992-12-03", hasPet: "large", petBreed: "ラブラドール", hasFamily: "couple", concerns: "大型犬の受け入れ条件", howFound: "友人の紹介", expectations: "森の中を散歩したい", registeredAt: "2025-12-01", lastLoginAt: "2026-03-03", status: "active" },
];

const petLabels: Record<string, string> = { none: "なし", small: "小型犬1頭", small2: "小型犬2頭", large: "大型犬1頭" };
const familyLabels: Record<string, string> = { individual: "個人", friends: "友人", couple: "カップル", married: "ご夫婦", family: "ご家族（お子さんあり）" };

export function AdminMembers() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPet, setFilterPet] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState<MemberEditForm>({
    email: "",
    phone: "",
    prefecture: "",
    city: "",
    lineId: "",
    hasFamily: "individual",
    familyBirthYears: [],
    concerns: "",
    howFound: "",
    expectations: "",
    hasPet: "none",
    petBreed: "",
    petBreed2: "",
    status: "active",
  });
  const [editSaved, setEditSaved] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !searchQuery || m.nickname.includes(searchQuery) || m.email.includes(searchQuery) || m.id.includes(searchQuery) || m.lineId.includes(searchQuery);
      const matchStatus = filterStatus === "all" || m.status === filterStatus;
      const matchPet = filterPet === "all" || m.hasPet === filterPet;
      return matchSearch && matchStatus && matchPet;
    });
  }, [members, searchQuery, filterStatus, filterPet]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[sortField] || "";
      const bVal = (b as any)[sortField] || "";
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortField(null); setSortDir("asc"); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 text-gray-400 ml-1" />;
    return sortDir === "asc" ? <FaSortAmountUp className="w-3 h-3 text-gray-800 ml-1" /> : <FaSortAmountDown className="w-3 h-3 text-gray-800 ml-1" />;
  };

  const handleDelete = (id: string) => {
    if (confirm("この会員を削除しますか？")) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const openMemberEdit = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      email: member.email,
      phone: member.phone,
      prefecture: member.prefecture,
      city: member.city,
      lineId: member.lineId,
      hasFamily: member.hasFamily,
      familyBirthYears: member.familyBirthYears || [],
      concerns: member.concerns,
      howFound: member.howFound,
      expectations: member.expectations,
      hasPet: member.hasPet,
      petBreed: member.petBreed,
      petBreed2: member.petBreed2 || "",
      status: member.status,
    });
    setEditSaved(false);
    setIsDetailOpen(true);
  };

  const setEF = <K extends keyof MemberEditForm>(key: K, value: MemberEditForm[K]) => {
    setEditForm((form) => ({ ...form, [key]: value }));
    setEditSaved(false);
  };

  const handleMemberSave = () => {
    if (!selectedMember || !editForm.email.trim() || !editForm.phone.trim()) return;

    const updated: Member = {
      ...selectedMember,
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      prefecture: editForm.prefecture,
      city: editForm.city,
      lineId: editForm.lineId.trim(),
      hasFamily: editForm.hasFamily,
      familyBirthYears: editForm.hasFamily === "family" ? editForm.familyBirthYears.filter(Boolean) : [],
      concerns: editForm.concerns.trim(),
      howFound: editForm.howFound.trim(),
      expectations: editForm.expectations.trim(),
      hasPet: editForm.hasPet,
      petBreed: editForm.hasPet === "none" ? "" : editForm.petBreed.trim(),
      petBreed2:
        editForm.hasPet === "small2" || editForm.hasPet === "large2"
          ? editForm.petBreed2.trim() || undefined
          : undefined,
      status: editForm.status,
    };

    setMembers((prev) => prev.map((member) => member.id === updated.id ? updated : member));
    setSelectedMember(updated);
    setEditSaved(true);
  };

  // ── 新規会員追加 ──
  const emptyNewForm = {
    nickname: "", email: "", phone: "", prefecture: "", city: "", lineId: "",
    birthDate: "", hasPet: "none", petBreed: "", petBreed2: "",
    hasFamily: "individual", familyBirthYears: [] as string[], concerns: "", howFound: "", expectations: "", status: "active" as Member["status"],
  };
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newForm, setNewForm]     = useState(emptyNewForm);
  const [newSaved, setNewSaved]   = useState(false);
  const [newErrors, setNewErrors] = useState<Partial<Record<keyof typeof emptyNewForm, string>>>({});

  const setNF = <K extends keyof typeof emptyNewForm>(key: K, val: typeof emptyNewForm[K]) => {
    setNewForm(f => ({ ...f, [key]: val }));
    setNewErrors(e => ({ ...e, [key]: undefined }));
  };

  const validateNew = () => {
    const errs: typeof newErrors = {};
    if (!newForm.nickname.trim()) errs.nickname = "ニックネームは必須です";
    if (!newForm.email.trim()) errs.email = "メールアドレスは必須です";
    if (!newForm.phone.trim()) errs.phone = "電話番号は必須です";
    if (newForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newForm.email))
      errs.email = "正しいメールアドレスを入力してください";
    setNewErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNewSave = () => {
    if (!validateNew()) return;
    const newId = `MBR-${String(members.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const newMember: Member = {
      id: newId,
      nickname: newForm.nickname.trim(),
      email: newForm.email.trim(),
      phone: newForm.phone.trim(),
      prefecture: newForm.prefecture,
      city: newForm.city,
      lineId: newForm.lineId.trim(),
      birthDate: newForm.birthDate,
      hasPet: newForm.hasPet,
      petBreed: newForm.petBreed.trim(),
      petBreed2: newForm.petBreed2.trim() || undefined,
      hasFamily: newForm.hasFamily,
      familyBirthYears: newForm.hasFamily === "family" ? newForm.familyBirthYears.filter(Boolean) : [],
      concerns: newForm.concerns.trim(),
      howFound: newForm.howFound.trim(),
      expectations: newForm.expectations.trim(),
      registeredAt: today,
      status: newForm.status,
    };
    setMembers(prev => [newMember, ...prev]);
    setNewSaved(true);
    setTimeout(() => {
      setIsNewOpen(false);
      setNewForm(emptyNewForm);
      setNewErrors({});
      setNewSaved(false);
    }, 1200);
  };

  const openNewModal = () => {
    setNewForm(emptyNewForm);
    setNewErrors({});
    setNewSaved(false);
    setIsNewOpen(true);
  };

  return (
    <AdminLayout currentPage="members" title="会員管理">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                  <FaUsers className="w-4 h-4" style={{ color: "#0a2105" }} />
                </div>
                <div>
                  <h2 className="text-base text-gray-900">会員一覧</h2>
                  <p className="text-xs text-gray-500">登録会員数: {members.length}名 | 検索結果: {filtered.length}名</p>
                </div>
              </div>
              <button
                onClick={openNewModal}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04] transition-colors"
              >
                <FaUserPlus className="w-3.5 h-3.5" /> 新規会員追加
              </button>
            </div>

            {/* Search & Filters */}
            <div className="space-y-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ニックネーム、メール、LINE ID、会員IDで検索"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] focus:border-[#0a2105] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaFilter className="w-3 h-3" /> 絞り込み
                </button>
                {(filterStatus !== "all" || filterPet !== "all") && (
                  <button onClick={() => { setFilterStatus("all"); setFilterPet("all"); }} className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">
                    <FaTimes className="w-3 h-3" /> フィルタ解除
                  </button>
                )}
              </div>
              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">ステータス</label>
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white">
                      <option value="all">すべて</option>
                      <option value="active">利用中</option>
                      <option value="withdrawn">退会</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">ペット同伴</label>
                    <select value={filterPet} onChange={e => { setFilterPet(e.target.value); setCurrentPage(1); }} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white">
                      <option value="all">すべて</option>
                      <option value="none">なし</option>
                      <option value="small">小型犬1頭</option>
                      <option value="small2">小型犬2頭</option>
                      <option value="large">大型犬1頭</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ニックネーム</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">メール</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">宿泊形態</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">ペット</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 cursor-pointer" onClick={() => handleSort("registeredAt")}>
                    <span className="flex items-center">登録日<SortIcon field="registeredAt" /></span>
                  </th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">ステータス</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(m => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{m.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{m.nickname}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{familyLabels[m.hasFamily] || m.hasFamily}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{petLabels[m.hasPet] || m.hasPet}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.registeredAt}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${m.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {m.status === "active" ? "利用中" : "退会"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openMemberEdit(m)}
                          className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"
                          title="編集"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="削除">
                          <FaTrashAlt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500">{sorted.length}件中 {(currentPage - 1) * perPage + 1}〜{Math.min(currentPage * perPage, sorted.length)}件を表示</p>
              <div className="flex items-center gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"><FaChevronLeft className="w-3 h-3" /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded text-sm ${currentPage === i + 1 ? "bg-[#0a2105] text-white" : "hover:bg-gray-100 text-gray-700"}`}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"><FaChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Member Edit Modal */}
        {isDetailOpen && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDetailOpen(false)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div>
                  <h3 className="text-base text-gray-900">会員情報編集</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedMember.id} ／ {selectedMember.nickname}</p>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="px-6 py-5 space-y-6">
                {editSaved && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    <FaCheckCircle className="w-3.5 h-3.5" />
                    会員情報を更新しました
                  </div>
                )}

                <section>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <FaUser className="w-3 h-3" /> 連絡先情報
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEF("email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">電話番号 <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEF("phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">LINE ID</label>
                      <input
                        type="text"
                        value={editForm.lineId}
                        onChange={(e) => setEF("lineId", e.target.value)}
                        placeholder="LINE IDを入力"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                      />
                      <p className="text-xs text-gray-400 mt-1">会員登録後でも追加・変更できます。</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <FaMapMarkerAlt className="w-3 h-3" /> お住まいの地域・宿泊形態
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">都道府県</label>
                      <select
                        value={editForm.prefecture}
                        onChange={(e) => {
                          setEditForm((form) => ({ ...form, prefecture: e.target.value, city: "" }));
                          setEditSaved(false);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                      >
                        <option value="">選択してください</option>
                        {PREFECTURES.map((prefecture) => <option key={prefecture} value={prefecture}>{prefecture}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">市区町村</label>
                      <select
                        value={editForm.city}
                        onChange={(e) => setEF("city", e.target.value)}
                        disabled={!editForm.prefecture}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105] disabled:bg-gray-100"
                      >
                        <option value="">選択してください</option>
                        {getCities(editForm.prefecture).map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">利用頻度の高い宿泊形態</label>
                      <select
                        value={editForm.hasFamily}
                        onChange={(e) => {
                          const hasFamily = e.target.value;
                          setEditForm((form) => ({
                            ...form,
                            hasFamily,
                            familyBirthYears: hasFamily === "family"
                              ? (form.familyBirthYears.length > 0 ? form.familyBirthYears : [""])
                              : [],
                          }));
                          setEditSaved(false);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                      >
                        <option value="individual">個人</option>
                        <option value="friends">友人</option>
                        <option value="couple">カップル</option>
                        <option value="married">ご夫婦</option>
                        <option value="family">ご家族（お子さんあり）</option>
                      </select>
                    </div>
                    {editForm.hasFamily === "family" && (
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">ご家族の方の生まれ年</label>
                        <p className="text-xs text-gray-400 mb-2">氏名や生年月日は不要です。生まれ年だけ登録します。</p>
                        <div className="space-y-2">
                          {editForm.familyBirthYears.map((birthYear, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                              <select
                                value={birthYear}
                                onChange={(e) => setEF(
                                  "familyBirthYears",
                                  editForm.familyBirthYears.map((year, yearIndex) => yearIndex === index ? e.target.value : year),
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                                aria-label={`ご家族${index + 1}人目の生まれ年`}
                              >
                                <option value="">生まれ年を選択</option>
                                {FAMILY_BIRTH_YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}年</option>)}
                              </select>
                              <span className="min-w-16 text-xs text-gray-500">{getApproximateAge(birthYear)}</span>
                              <button
                                type="button"
                                onClick={() => setEF(
                                  "familyBirthYears",
                                  editForm.familyBirthYears.filter((_, yearIndex) => yearIndex !== index),
                                )}
                                className="w-9 h-9 inline-flex items-center justify-center border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
                                aria-label={`ご家族${index + 1}人目を削除`}
                              >
                                <FaTrashAlt className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEF("familyBirthYears", [...editForm.familyBirthYears, ""])}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 border border-[#0a2105]/20 rounded-lg text-xs font-medium text-[#0a2105] bg-[#e8f5e9] hover:bg-green-100"
                        >
                          <FaPlus className="w-3 h-3" /> ご家族を追加
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ご希望・アンケート</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">宿泊の際に気になること</label>
                      <textarea
                        value={editForm.concerns}
                        onChange={(e) => setEF("concerns", e.target.value)}
                        placeholder="気になることがあれば入力してください"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">何でこのログハウスを知りましたか？</label>
                      <input
                        type="text"
                        value={editForm.howFound}
                        onChange={(e) => setEF("howFound", e.target.value)}
                        placeholder="例：インターネット検索"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">エルボスケに期待すること</label>
                      <textarea
                        value={editForm.expectations}
                        onChange={(e) => setEF("expectations", e.target.value)}
                        placeholder="期待することを入力してください"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] resize-y"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <FaPaw className="w-3 h-3" /> ペット情報
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={editForm.hasPet}
                      onChange={(e) => {
                        const hasPet = e.target.value;
                        setEditForm((form) => ({
                          ...form,
                          hasPet,
                          petBreed: hasPet === "none" ? "" : form.petBreed,
                          petBreed2: hasPet === "small2" || hasPet === "large2" ? form.petBreed2 : "",
                        }));
                        setEditSaved(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                    >
                      <option value="none">なし</option>
                      <option value="small">小型犬1頭</option>
                      <option value="small2">小型犬2頭</option>
                      <option value="large">大型犬1頭</option>
                      <option value="large2">大型犬2頭</option>
                    </select>

                    {editForm.hasPet !== "none" && (
                      <div className={`grid gap-3 ${editForm.hasPet === "small2" || editForm.hasPet === "large2" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">犬種{editForm.hasPet === "small2" || editForm.hasPet === "large2" ? "①" : ""}</label>
                          <input
                            type="text"
                            value={editForm.petBreed}
                            onChange={(e) => setEF("petBreed", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                          />
                        </div>
                        {(editForm.hasPet === "small2" || editForm.hasPet === "large2") && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">犬種②</label>
                            <input
                              type="text"
                              value={editForm.petBreed2}
                              onChange={(e) => setEF("petBreed2", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">利用ステータス</h4>
                  <div className="flex gap-2">
                    {(["active", "withdrawn"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setEF("status", status)}
                        className={`flex-1 py-2.5 text-sm rounded-lg border-2 transition-all ${
                          editForm.status === status
                            ? status === "active"
                              ? "border-green-400 bg-green-50 text-green-800 font-medium"
                              : "border-gray-400 bg-gray-100 text-gray-700 font-medium"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {status === "active" ? "利用中" : "退会"}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">変更対象外の情報</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      ["生年月日", selectedMember.birthDate || "−"],
                      ["登録日", selectedMember.registeredAt],
                      ["最終ログイン", selectedMember.lastLoginAt || "−"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3 text-xs">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-xl sticky bottom-0">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleMemberSave}
                  disabled={!editForm.email.trim() || !editForm.phone.trim()}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#0a2105] text-white hover:bg-[#071a04] disabled:opacity-40"
                >
                  変更を保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            新規会員追加モーダル
        ════════════════════════════════════════ */}
        {isNewOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setIsNewOpen(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-xl my-8"
              onClick={e => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                    <FaUserPlus className="w-3.5 h-3.5 text-[#0a2105]" />
                  </div>
                  <h3 className="text-base text-gray-900">新規会員追加</h3>
                </div>
                <button onClick={() => setIsNewOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">

                {/* 基本情報 */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <FaUser className="w-3 h-3" /> 基本情報
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">ニックネーム <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={newForm.nickname}
                        onChange={e => setNF("nickname", e.target.value)}
                        placeholder="例：たろう"
                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.nickname ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                      />
                      {newErrors.nickname && <p className="text-xs text-red-500 mt-1">{newErrors.nickname}</p>}
                    </div>

                    {/* メール・電話 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          メールアドレス <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={newForm.email}
                          onChange={e => setNF("email", e.target.value)}
                          placeholder="例: xxx@example.com"
                          className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.email ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {newErrors.email && <p className="text-xs text-red-500 mt-1">{newErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          電話番号 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={newForm.phone}
                          onChange={e => setNF("phone", e.target.value)}
                          placeholder="例: 090-1234-5678"
                          className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${newErrors.phone ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {newErrors.phone && <p className="text-xs text-red-500 mt-1">{newErrors.phone}</p>}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 地域・生年月日 */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <FaMapMarkerAlt className="w-3 h-3" /> 地域・生年月日
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">都道府県</label>
                      <select
                        value={newForm.prefecture}
                        onChange={e => { setNF("prefecture", e.target.value); setNF("city", ""); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                      >
                        <option value="">選択してください</option>
                        {PREFECTURES.map((prefecture) => <option key={prefecture} value={prefecture}>{prefecture}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">市区町村</label>
                      <select
                        value={newForm.city}
                        onChange={e => setNF("city", e.target.value)}
                        disabled={!newForm.prefecture}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105] disabled:bg-gray-100"
                      >
                        <option value="">選択してください</option>
                        {getCities(newForm.prefecture).map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <FaCalendarAlt className="w-2.5 h-2.5" /> 生年月日
                      </label>
                      <input
                        type="date"
                        value={newForm.birthDate}
                        onChange={e => setNF("birthDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">利用頻度の高い宿泊形態</label>
                      <select
                        value={newForm.hasFamily}
                        onChange={e => {
                          const hasFamily = e.target.value;
                          setNewForm((form) => ({
                            ...form,
                            hasFamily,
                            familyBirthYears: hasFamily === "family"
                              ? (form.familyBirthYears.length > 0 ? form.familyBirthYears : [""])
                              : [],
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                      >
                        <option value="individual">個人</option>
                        <option value="friends">友人</option>
                        <option value="couple">カップル</option>
                        <option value="married">ご夫婦</option>
                        <option value="family">ご家族（お子さんあり）</option>
                      </select>
                    </div>
                    {newForm.hasFamily === "family" && (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">ご家族の方の生まれ年</label>
                        <p className="text-xs text-gray-400 mb-2">氏名や生年月日は不要です。生まれ年だけ登録します。</p>
                        <div className="space-y-2">
                          {newForm.familyBirthYears.map((birthYear, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                              <select
                                value={birthYear}
                                onChange={(e) => setNF(
                                  "familyBirthYears",
                                  newForm.familyBirthYears.map((year, yearIndex) => yearIndex === index ? e.target.value : year),
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                                aria-label={`ご家族${index + 1}人目の生まれ年`}
                              >
                                <option value="">生まれ年を選択</option>
                                {FAMILY_BIRTH_YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}年</option>)}
                              </select>
                              <span className="min-w-16 text-xs text-gray-500">{getApproximateAge(birthYear)}</span>
                              <button
                                type="button"
                                onClick={() => setNF(
                                  "familyBirthYears",
                                  newForm.familyBirthYears.filter((_, yearIndex) => yearIndex !== index),
                                )}
                                className="w-9 h-9 inline-flex items-center justify-center border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
                                aria-label={`ご家族${index + 1}人目を削除`}
                              >
                                <FaTrashAlt className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setNF("familyBirthYears", [...newForm.familyBirthYears, ""])}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 border border-[#0a2105]/20 rounded-lg text-xs font-medium text-[#0a2105] bg-[#e8f5e9] hover:bg-green-100"
                        >
                          <FaPlus className="w-3 h-3" /> ご家族を追加
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* ペット */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <FaPaw className="w-3 h-3" /> ペット情報
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={newForm.hasPet}
                      onChange={e => {
                        setNF("hasPet", e.target.value);
                        if (e.target.value === "none") {
                          setNF("petBreed", "");
                          setNF("petBreed2", "");
                        } else if (e.target.value !== "small2" && e.target.value !== "large2") {
                          setNF("petBreed2", "");
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#0a2105]"
                    >
                      <option value="none">なし</option>
                      <option value="small">小型犬1頭</option>
                      <option value="small2">小型犬2頭</option>
                      <option value="large">大型犬1頭</option>
                      <option value="large2">大型犬2頭</option>
                    </select>

                    {newForm.hasPet !== "none" && (
                      <div className={`grid gap-3 ${(newForm.hasPet === "small2" || newForm.hasPet === "large2") ? "grid-cols-2" : "grid-cols-1"}`}>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            犬種{(newForm.hasPet === "small2" || newForm.hasPet === "large2") ? "①（1頭目）" : ""}
                          </label>
                          <input
                            type="text"
                            value={newForm.petBreed}
                            onChange={e => setNF("petBreed", e.target.value)}
                            placeholder="例: トイプードル"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                          />
                        </div>
                        {(newForm.hasPet === "small2" || newForm.hasPet === "large2") && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">犬種②（2頭目）</label>
                            <input
                              type="text"
                              value={newForm.petBreed2}
                              onChange={e => setNF("petBreed2", e.target.value)}
                              placeholder="例: チワワ"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* その他 */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">その他</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">知ったきっかけ</label>
                      <input
                        type="text"
                        value={newForm.howFound}
                        onChange={e => setNF("howFound", e.target.value)}
                        placeholder="例: インターネット検索、友人の紹介"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">宿泊の際に気になること</label>
                      <textarea
                        value={newForm.concerns}
                        onChange={e => setNF("concerns", e.target.value)}
                        placeholder="気になることがあれば入力してください"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">エルボスケに期待すること</label>
                      <textarea
                        value={newForm.expectations}
                        onChange={e => setNF("expectations", e.target.value)}
                        placeholder="期待することを入力してください"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">ステータス</label>
                      <div className="flex gap-2">
                        {(["active", "withdrawn"] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => setNF("status", s)}
                            className={`flex-1 py-2 text-sm rounded-lg border-2 transition-all ${
                              newForm.status === s
                                ? s === "active"
                                  ? "border-green-400 bg-green-50 text-green-800 font-medium"
                                  : "border-gray-400 bg-gray-100 text-gray-700 font-medium"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {s === "active" ? "利用中" : "退会"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

              </div>

              {/* フッター */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setIsNewOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleNewSave}
                  disabled={newSaved}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors bg-[#0a2105] text-white hover:bg-[#071a04] disabled:opacity-60"
                >
                  {newSaved
                    ? <span className="flex items-center justify-center gap-1.5"><FaCheckCircle className="w-3.5 h-3.5" /> 登録しました</span>
                    : "会員を登録する"
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
