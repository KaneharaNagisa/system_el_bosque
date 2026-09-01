import { useState, useMemo } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaPercent, FaPlus, FaEdit, FaTrashAlt, FaTimes, FaCheckCircle, FaToggleOn, FaToggleOff, FaCalendarAlt, FaUsers, FaBan } from "react-icons/fa";

interface PriceRule {
  id: string;
  name: string;
  discountPercent: number;
  periodStart: string;
  periodEnd: string;
  hasPeriod: boolean;
  hasGuestRange: boolean;
  guestMin: number | null;
  guestMax: number | null;
  noExperienceOptions: boolean;
  noSupportPlan: boolean;
  status: "active" | "inactive";
  createdAt: string;
}

const mockRules: PriceRule[] = [
  {
    id: "ADJ-001",
    name: "平日限定割引",
    discountPercent: 10,
    periodStart: "2026-04-01",
    periodEnd: "2026-11-30",
    hasPeriod: true,
    hasGuestRange: false,
    guestMin: null,
    guestMax: null,
    noExperienceOptions: false,
    noSupportPlan: false,
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "ADJ-002",
    name: "連泊割引（2泊目以降）",
    discountPercent: 10,
    periodStart: "",
    periodEnd: "",
    hasPeriod: false,
    hasGuestRange: true,
    guestMin: 1,
    guestMax: 3,
    noExperienceOptions: false,
    noSupportPlan: false,
    status: "active",
    createdAt: "2026-01-20",
  },
  {
    id: "ADJ-003",
    name: "リピーター特典",
    discountPercent: 5,
    periodStart: "",
    periodEnd: "",
    hasPeriod: false,
    hasGuestRange: false,
    guestMin: null,
    guestMax: null,
    noExperienceOptions: false,
    noSupportPlan: false,
    status: "inactive",
    createdAt: "2026-02-01",
  },
  {
    id: "ADJ-004",
    name: "移住体験割引",
    discountPercent: 50,
    periodStart: "",
    periodEnd: "",
    hasPeriod: false,
    hasGuestRange: false,
    guestMin: null,
    guestMax: null,
    noExperienceOptions: true,
    noSupportPlan: true,
    status: "active",
    createdAt: "2026-08-28",
  },
  {
    id: "ADJ-005",
    name: "仮住まい割引",
    discountPercent: 95,
    periodStart: "",
    periodEnd: "",
    hasPeriod: false,
    hasGuestRange: false,
    guestMin: null,
    guestMax: null,
    noExperienceOptions: true,
    noSupportPlan: true,
    status: "active",
    createdAt: "2026-08-28",
  },
];

interface FormState {
  name: string;
  discountPercent: number;
  hasPeriod: boolean;
  periodStart: string;
  periodEnd: string;
  hasGuestRange: boolean;
  guestMin: string;
  guestMax: string;
  noExperienceOptions: boolean;
  noSupportPlan: boolean;
  status: "active" | "inactive";
}

const emptyForm: FormState = {
  name: "",
  discountPercent: 10,
  hasPeriod: false,
  periodStart: "",
  periodEnd: "",
  hasGuestRange: false,
  guestMin: "",
  guestMax: "",
  noExperienceOptions: false,
  noSupportPlan: false,
  status: "active",
};

export function AdminPriceAdjustment() {
  const [rules, setRules] = useState<PriceRule[]>(mockRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saved, setSaved] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteTarget = useMemo(
    () => rules.find(r => r.id === deleteConfirmId) ?? null,
    [rules, deleteConfirmId]
  );

  const setF = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = "条件名は必須です";
    if (form.discountPercent <= 0 || form.discountPercent > 100)
      errs.discountPercent = "1〜100の範囲で入力してください";
    if (form.hasPeriod) {
      if (!form.periodStart) errs.periodStart = "開始日を入力してください";
      if (!form.periodEnd)   errs.periodEnd   = "終了日を入力してください";
      if (form.periodStart && form.periodEnd && form.periodStart > form.periodEnd)
        errs.periodEnd = "終了日は開始日より後にしてください";
    }
    if (form.hasGuestRange) {
      const mn = form.guestMin === "" ? null : Number(form.guestMin);
      const mx = form.guestMax === "" ? null : Number(form.guestMax);
      if (mn !== null && (mn < 1 || mn > 20)) errs.guestMin = "1〜20の範囲で入力してください";
      if (mx !== null && (mx < 1 || mx > 20)) errs.guestMax = "1〜20の範囲で入力してください";
      if (mn !== null && mx !== null && mn > mx) errs.guestMax = "最大人数は最低人数以上にしてください";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openNew = () => {
    setForm(emptyForm);
    setErrors({});
    setSaved(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (rule: PriceRule) => {
    setForm({
      name: rule.name,
      discountPercent: rule.discountPercent,
      hasPeriod: rule.hasPeriod,
      periodStart: rule.periodStart,
      periodEnd: rule.periodEnd,
      hasGuestRange: rule.hasGuestRange,
      guestMin: rule.guestMin !== null ? String(rule.guestMin) : "",
      guestMax: rule.guestMax !== null ? String(rule.guestMax) : "",
      noExperienceOptions: rule.noExperienceOptions,
      noSupportPlan: rule.noSupportPlan,
      status: rule.status,
    });
    setErrors({});
    setSaved(false);
    setEditingId(rule.id);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    const periodStart = form.hasPeriod ? form.periodStart : "";
    const periodEnd   = form.hasPeriod ? form.periodEnd   : "";
    const guestMin    = form.hasGuestRange && form.guestMin !== "" ? Number(form.guestMin) : null;
    const guestMax    = form.hasGuestRange && form.guestMax !== "" ? Number(form.guestMax) : null;
    if (editingId) {
      setRules(prev =>
        prev.map(r =>
          r.id === editingId
            ? { ...r, ...form, periodStart, periodEnd, guestMin, guestMax }
            : r
        )
      );
    } else {
      const newId = `ADJ-${String(rules.length + 1).padStart(3, "0")}`;
      const today = new Date().toISOString().split("T")[0];
      const newRule: PriceRule = {
        id: newId,
        name: form.name.trim(),
        discountPercent: form.discountPercent,
        hasPeriod: form.hasPeriod,
        periodStart,
        periodEnd,
        hasGuestRange: form.hasGuestRange,
        guestMin,
        guestMax,
        noExperienceOptions: form.noExperienceOptions,
        noSupportPlan: form.noSupportPlan,
        status: form.status,
        createdAt: today,
      };
      setRules(prev => [newRule, ...prev]);
    }
    setSaved(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSaved(false);
      setEditingId(null);
    }, 900);
  };

  const toggleStatus = (id: string) => {
    setRules(prev =>
      prev.map(r => r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r)
    );
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setDeleteConfirmId(null);
  };

  const activeCount   = useMemo(() => rules.filter(r => r.status === "active").length,   [rules]);
  const inactiveCount = useMemo(() => rules.filter(r => r.status === "inactive").length, [rules]);

  const fmtDate = (d: string) =>
    d ? d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1年$2月$3日") : "−";

  const discountExample = form.discountPercent > 0 && form.discountPercent <= 100
    ? (20000 * (1 - form.discountPercent / 100)).toLocaleString()
    : null;

  return (
    <AdminLayout currentPage="master-price-adjustment" title="料金調整管理">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── ヘッダー ── */}
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
              <FaPercent className="w-4 h-4 text-[#0a2105]" />
            </div>
            <div>
              <h2 className="text-base text-gray-900">料金調整管理</h2>
              <p className="text-xs text-gray-500">
                有効: {activeCount}件　無効: {inactiveCount}件　合計: {rules.length}件
              </p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04] transition-colors"
          >
            <FaPlus className="w-3 h-3" /> 新規追加
          </button>
        </div>

        {/* ── テーブル ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {rules.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              料金調整ルールがありません。「新規追加」から登録してください。
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-gray-500">条件名</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">割引率</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">割引期間</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">宿泊人数</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">制限</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">ステータス</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">登録日</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{rule.id}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-200">
                        <FaPercent className="w-2.5 h-2.5" />
                        {rule.discountPercent}% OFF
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {rule.hasPeriod ? (
                        <span className="flex items-center gap-1.5 text-sm text-gray-700">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          {fmtDate(rule.periodStart)} 〜 {fmtDate(rule.periodEnd)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">指定なし</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {rule.hasGuestRange ? (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                          <FaUsers className="w-3 h-3 text-gray-400" />
                          {rule.guestMin !== null ? `${rule.guestMin}名` : ""}
                          {rule.guestMin !== null && rule.guestMax !== null ? "〜" : ""}
                          {rule.guestMax !== null ? `${rule.guestMax}名` : rule.guestMin !== null ? "以上" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">指定なし</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {rule.noExperienceOptions || rule.noSupportPlan ? (
                        <div className="flex flex-col items-center gap-1">
                          {rule.noExperienceOptions && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-200 whitespace-nowrap">
                              <FaBan className="w-2.5 h-2.5" /> オプション不可
                            </span>
                          )}
                          {rule.noSupportPlan && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium border border-orange-200 whitespace-nowrap">
                              <FaBan className="w-2.5 h-2.5" /> サポート不可
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">−</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(rule.id)}
                        title="クリックで切替"
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                      >
                        {rule.status === "active" ? (
                          <>
                            <FaToggleOn className="w-5 h-5 text-green-500" />
                            <span className="text-green-700">有効</span>
                          </>
                        ) : (
                          <>
                            <FaToggleOff className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-500">無効</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-gray-500">{rule.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(rule)}
                          className="p-1.5 text-gray-400 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded transition-colors"
                          title="編集"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(rule.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="削除"
                        >
                          <FaTrashAlt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── 削除確認モーダル ── */}
        {deleteConfirmId !== null && deleteTarget !== null && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <div className="bg-white rounded-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-gray-900 mb-2">削除の確認</h3>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium text-gray-900">「{deleteTarget.name}」</span>{" "}
                を削除しますか？この操作は元に戻せません。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 新規追加 / 編集モーダル ── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="bg-white rounded-xl w-full max-w-md my-8" onClick={e => e.stopPropagation()}>

              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                    <FaPercent className="w-3.5 h-3.5 text-[#0a2105]" />
                  </div>
                  <h3 className="text-base text-gray-900">
                    {editingId ? "料金調整ルールを編集" : "料金調整ルールを追加"}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* フォーム */}
              <div className="px-6 py-5 space-y-5">

                {/* 条件名 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    条件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setF("name", e.target.value)}
                    placeholder="例: 平日限定割引、連泊割引など"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* 割引率 */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    宿泊料金の割引率 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.discountPercent}
                      onChange={e => setF("discountPercent", Number(e.target.value))}
                      className={`w-24 px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] text-right ${errors.discountPercent ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    />
                    <span className="text-sm text-gray-500">% OFF</span>
                    {discountExample && (
                      <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                        ¥20,000 → ¥{discountExample}
                      </span>
                    )}
                  </div>
                  {errors.discountPercent && <p className="text-xs text-red-500 mt-1">{errors.discountPercent}</p>}
                </div>

                {/* 割引期間 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      割引期間 <span className="text-gray-400 font-normal">（任意）</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setF("hasPeriod", !form.hasPeriod)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {form.hasPeriod ? (
                        <>
                          <FaToggleOn className="w-5 h-5 text-green-500" />
                          <span className="text-green-700">期間あり</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">期間指定なし</span>
                        </>
                      )}
                    </button>
                  </div>

                  {form.hasPeriod && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">開始日</p>
                        <input
                          type="date"
                          value={form.periodStart}
                          onChange={e => setF("periodStart", e.target.value)}
                          className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white ${errors.periodStart ? "border-red-400" : "border-gray-300"}`}
                        />
                        {errors.periodStart && <p className="text-xs text-red-500 mt-1">{errors.periodStart}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">終了日</p>
                        <input
                          type="date"
                          value={form.periodEnd}
                          onChange={e => setF("periodEnd", e.target.value)}
                          min={form.periodStart || undefined}
                          className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white ${errors.periodEnd ? "border-red-400" : "border-gray-300"}`}
                        />
                        {errors.periodEnd && <p className="text-xs text-red-500 mt-1">{errors.periodEnd}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 宿泊人数 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      宿泊人数 <span className="text-gray-400 font-normal">（任意）</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setF("hasGuestRange", !form.hasGuestRange)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {form.hasGuestRange ? (
                        <>
                          <FaToggleOn className="w-5 h-5 text-green-500" />
                          <span className="text-green-700">人数指定あり</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">人数指定なし</span>
                        </>
                      )}
                    </button>
                  </div>

                  {form.hasGuestRange && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <p className="text-xs text-gray-500">適用する宿泊人数の範囲を設定します。片方のみの指定も可能です。</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <FaUsers className="w-2.5 h-2.5" /> 最低人数
                          </p>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={form.guestMin}
                              onChange={e => setF("guestMin", e.target.value)}
                              placeholder="例: 4"
                              className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white text-right ${errors.guestMin ? "border-red-400" : "border-gray-300"}`}
                            />
                            <span className="text-xs text-gray-500 shrink-0">名〜</span>
                          </div>
                          {errors.guestMin && <p className="text-xs text-red-500 mt-1">{errors.guestMin}</p>}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">最大人数</p>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={form.guestMax}
                              onChange={e => setF("guestMax", e.target.value)}
                              placeholder="例: 8"
                              className={`w-full px-2 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0a2105] bg-white text-right ${errors.guestMax ? "border-red-400" : "border-gray-300"}`}
                            />
                            <span className="text-xs text-gray-500 shrink-0">名</span>
                          </div>
                          {errors.guestMax && <p className="text-xs text-red-500 mt-1">{errors.guestMax}</p>}
                        </div>
                      </div>
                      {(form.guestMin !== "" || form.guestMax !== "") && (
                        <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1.5">
                          適用条件：
                          {form.guestMin !== "" && `${form.guestMin}名`}
                          {form.guestMin !== "" && form.guestMax !== "" && "〜"}
                          {form.guestMax !== "" ? `${form.guestMax}名` : form.guestMin !== "" ? "以上" : ""}
                          の宿泊
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* オプション選択不可 */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FaBan className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">オプション選択不可</p>
                      <p className="text-xs text-gray-400 mt-0.5">有効にすると体験オプションを追加できません</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setF("noExperienceOptions", !form.noExperienceOptions)}
                    className="flex items-center gap-1.5 text-xs shrink-0"
                  >
                    {form.noExperienceOptions ? (
                      <>
                        <FaToggleOn className="w-6 h-6 text-red-500" />
                        <span className="text-red-600 font-medium">選択不可</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-500">選択可</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 滞在サポート選択不可 */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FaBan className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">滞在サポート選択不可</p>
                      <p className="text-xs text-gray-400 mt-0.5">有効にすると滞在サポートを追加できません</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setF("noSupportPlan", !form.noSupportPlan)}
                    className="flex items-center gap-1.5 text-xs shrink-0"
                  >
                    {form.noSupportPlan ? (
                      <>
                        <FaToggleOn className="w-6 h-6 text-orange-500" />
                        <span className="text-orange-600 font-medium">選択不可</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-500">選択可</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ステータス */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">ステータス</p>
                  <div className="flex gap-2">
                    {(["active", "inactive"] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setF("status", s)}
                        className={`flex-1 py-2.5 text-sm rounded-lg border-2 transition-all ${
                          form.status === s
                            ? s === "active"
                              ? "border-green-400 bg-green-50 text-green-800 font-medium"
                              : "border-gray-400 bg-gray-100 text-gray-700 font-medium"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {s === "active" ? "✓ 有効" : "✕ 無効"}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* フッター */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors bg-[#0a2105] text-white hover:bg-[#071a04] disabled:opacity-70"
                >
                  {saved ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <FaCheckCircle className="w-3.5 h-3.5" /> 保存しました
                    </span>
                  ) : (
                    editingId ? "変更を保存" : "追加する"
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
