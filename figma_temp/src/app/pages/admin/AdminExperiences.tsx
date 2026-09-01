import { useState, useRef } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaStar, FaPlus, FaEdit, FaTrashAlt, FaTimes, FaImage, FaGripLines } from "react-icons/fa";

interface Experience {
  id: string;
  name: string;
  description: string;
  price: number;
  priceNote: string;
  duration: string;
  recommendedPeople: string;
  period: string;
  season: string;
  seasonTag: string;
  requiresReservation: boolean;
  points: string[];
  notes: string;
  image: string;
  popularity: number;
  isActive: boolean;
  createdAt: string;
}

const SEASON_TAGS = ["春", "夏", "秋", "冬", "通年"];

const mockExperiences: Experience[] = [
  {
    id: "EXP-001",
    name: "星空観察（ガイドなし）",
    description: "新野の澄んだ空気の中、満天の星空をお楽しみいただけます。双眼鏡の無料貸出あり。",
    price: 0,
    priceNote: "無料",
    duration: "自由",
    recommendedPeople: "1〜10名",
    period: "通年（晴天時）",
    season: "通年（晴天時）",
    seasonTag: "通年",
    requiresReservation: false,
    points: ["双眼鏡の無料貸出あり", "天気のよい夜は満天の星が楽しめます", "施設敷地内でそのままお楽しみいただけます"],
    notes: "天候により星が見えない場合があります。",
    image: "",
    popularity: 95,
    isActive: true,
    createdAt: "2025-03-01",
  },
  {
    id: "EXP-002",
    name: "星空ガイド付き観察",
    description: "地元ガイドが季節の星座や天体を解説します。望遠鏡もご用意しています。",
    price: 2000,
    priceNote: "1組¥2,000",
    duration: "約1〜2時間",
    recommendedPeople: "2〜8名",
    period: "通年（晴天時）",
    season: "通年（晴天時）",
    seasonTag: "通年",
    requiresReservation: true,
    points: ["専門ガイドによる星座解説", "望遠鏡で惑星・星団を観察", "参加記念の星座マップをプレゼント"],
    notes: "前日までのご予約が必要です。天候により中止となる場合があります。",
    image: "",
    popularity: 82,
    isActive: true,
    createdAt: "2025-03-01",
  },
  {
    id: "EXP-003",
    name: "BBQプラン",
    description: "BBQグリル・炭・網のセットをご用意します。食材はご持参またはお買い出しサポートをご利用ください。",
    price: 3000,
    priceNote: "1組¥3,000",
    duration: "自由",
    recommendedPeople: "2〜10名",
    period: "4〜11月",
    season: "4月〜11月",
    seasonTag: "春",
    requiresReservation: true,
    points: ["BBQグリル・炭・網一式込み", "お買い出しサポートも対応可", "後片付けは施設スタッフが対応"],
    notes: "食材はご持参またはお買い出しサポート（別途）をご利用ください。雨天時はキャンセル可。",
    image: "",
    popularity: 78,
    isActive: true,
    createdAt: "2025-04-01",
  },
  {
    id: "EXP-004",
    name: "川遊び体験",
    description: "近くの清流で川遊びを楽しめます。ライフジャケットの無料貸出あり。",
    price: 0,
    priceNote: "無料",
    duration: "自由",
    recommendedPeople: "1〜10名",
    period: "6〜9月",
    season: "6月〜9月",
    seasonTag: "夏",
    requiresReservation: false,
    points: ["ライフジャケットの無料貸出あり", "小さなお子様でも安心して遊べる浅瀬", "天然の清流で夏を満喫"],
    notes: "増水時は立入禁止となります。必ずスタッフの指示に従ってください。",
    image: "",
    popularity: 65,
    isActive: true,
    createdAt: "2025-06-01",
  },
  {
    id: "EXP-005",
    name: "農業体験",
    description: "地元農家と一緒に季節の野菜の収穫体験ができます。",
    price: 1500,
    priceNote: "1人¥1,500",
    duration: "約1〜2時間",
    recommendedPeople: "2〜6名",
    period: "5〜10月",
    season: "5月〜10月",
    seasonTag: "春",
    requiresReservation: true,
    points: ["地元農家による丁寧な指導", "収穫した野菜はお持ち帰りいただけます", "子どもから大人まで楽しめます"],
    notes: "前日までのご予約が必要です。汚れてもよい服装でお越しください。",
    image: "",
    popularity: 45,
    isActive: false,
    createdAt: "2025-05-01",
  },
];

type FormData = Omit<Experience, "id" | "popularity" | "createdAt">;

const emptyForm: FormData = {
  name: "",
  description: "",
  price: 0,
  priceNote: "",
  duration: "",
  recommendedPeople: "",
  period: "",
  season: "",
  seasonTag: "通年",
  requiresReservation: false,
  points: [""],
  notes: "",
  image: "",
  isActive: true,
};

export function AdminExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>(mockExperiences);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setImagePreview("");
    setIsEditOpen(true);
  };

  const openEdit = (item: Experience) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      priceNote: item.priceNote,
      duration: item.duration,
      recommendedPeople: item.recommendedPeople,
      period: item.period,
      season: item.season,
      seasonTag: item.seasonTag,
      requiresReservation: item.requiresReservation,
      points: item.points.length > 0 ? item.points : [""],
      notes: item.notes,
      image: item.image,
      isActive: item.isActive,
    });
    setImagePreview(item.image);
    setIsEditOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setFormData(f => ({ ...f, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePointChange = (index: number, value: string) => {
    setFormData(f => {
      const pts = [...f.points];
      pts[index] = value;
      return { ...f, points: pts };
    });
  };

  const addPoint = () => setFormData(f => ({ ...f, points: [...f.points, ""] }));

  const removePoint = (index: number) =>
    setFormData(f => ({ ...f, points: f.points.filter((_, i) => i !== index) }));

  const handleSave = () => {
    if (!formData.name.trim()) return;
    const cleanedPoints = formData.points.filter(p => p.trim() !== "");
    const data = { ...formData, points: cleanedPoints };
    if (editingItem) {
      setExperiences(prev => prev.map(e => e.id === editingItem.id ? { ...e, ...data } : e));
    } else {
      setExperiences(prev => [
        ...prev,
        {
          id: `EXP-${String(prev.length + 1).padStart(3, "0")}`,
          ...data,
          popularity: 0,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("この体験オプションを無効化しますか？")) {
      setExperiences(prev => prev.map(e => e.id === id ? { ...e, isActive: false } : e));
    }
  };

  const sorted = [...experiences].sort((a, b) => b.popularity - a.popularity);

  return (
    <AdminLayout currentPage="master-experiences" title="体験オプション管理">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaStar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base text-gray-900">体験オプション一覧</h2>
                <p className="text-xs text-gray-500">人気順に表示 | 全{experiences.length}件</p>
              </div>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
              <FaPlus className="w-3 h-3" /> 新規登録
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-4 py-3 text-xs text-gray-500 w-12">順位</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">プログラム名</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">料金</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">時期</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">予約</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">人気度</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">ステータス</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e, i) => (
                  <tr key={e.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!e.isActive ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-center">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${i === 0 ? "bg-yellow-400 text-yellow-900" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-orange-300 text-orange-900" : "bg-gray-100 text-gray-600"}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {e.image && <img src={e.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-gray-900">{e.name}</span>
                            {e.requiresReservation && <span className="px-1.5 py-0.5 bg-[#1b2f0e] text-[#d4b070] text-[10px] rounded">要予約</span>}
                            {e.seasonTag && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded">{e.seasonTag}</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{e.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.priceNote}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.period}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${e.requiresReservation ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}>
                        {e.requiresReservation ? "要予約" : "不要"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${e.popularity}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{e.popularity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${e.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {e.isActive ? "有効" : "無効"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-gray-500 hover:text-[#0a2105] hover:bg-[#e8f5e9] rounded"><FaEdit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><FaTrashAlt className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit / New Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => setIsEditOpen(false)}>
            <div className="bg-white rounded-xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
                <h3 className="text-base text-gray-900">{editingItem ? "体験オプション編集" : "体験オプション新規登録"}</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
              </div>

              <div className="px-6 py-5 space-y-6">

                {/* ── 基本情報 ── */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">基本情報</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">プログラム名 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        placeholder="例: 田植え体験"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">季節タグ</label>
                        <select
                          value={formData.seasonTag}
                          onChange={e => setFormData(f => ({ ...f, seasonTag: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                        >
                          {SEASON_TAGS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">ステータス</label>
                        <select
                          value={formData.isActive ? "true" : "false"}
                          onChange={e => setFormData(f => ({ ...f, isActive: e.target.value === "true" }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0a2105] outline-none"
                        >
                          <option value="true">有効</option>
                          <option value="false">無効</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="requiresReservation"
                        checked={formData.requiresReservation}
                        onChange={e => setFormData(f => ({ ...f, requiresReservation: e.target.checked }))}
                        className="w-4 h-4 accent-[#0a2105] cursor-pointer"
                      />
                      <label htmlFor="requiresReservation" className="text-sm text-gray-700 cursor-pointer select-none">
                        要予約（フロントに「要予約」バッジを表示）
                      </label>
                    </div>
                  </div>
                </section>

                {/* ── メイン画像 ── */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">メイン画像</h4>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-[#0a2105] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative group">
                        <img src={imagePreview} alt="プレビュー" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm">クリックして変更</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400">
                        <FaImage className="w-8 h-8" />
                        <span className="text-sm">クリックして画像を選択</span>
                        <span className="text-xs">JPG / PNG / WebP 推奨</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(""); setFormData(f => ({ ...f, image: "" })); }}
                      className="mt-1.5 text-xs text-red-500 hover:text-red-700"
                    >
                      画像を削除
                    </button>
                  )}
                </section>

                {/* ── 料金・詳細情報 ── */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">料金・詳細情報</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">料金（円）</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">料金表示テキスト</label>
                      <input
                        type="text"
                        value={formData.priceNote}
                        onChange={e => setFormData(f => ({ ...f, priceNote: e.target.value }))}
                        placeholder="例: ¥4,500/人"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">所要時間</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))}
                        placeholder="例: 約2〜3時間"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">推奨人数</label>
                      <input
                        type="text"
                        value={formData.recommendedPeople}
                        onChange={e => setFormData(f => ({ ...f, recommendedPeople: e.target.value }))}
                        placeholder="例: 2〜6名"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">時期</label>
                      <input
                        type="text"
                        value={formData.period}
                        onChange={e => setFormData(f => ({ ...f, period: e.target.value }))}
                        placeholder="例: 5〜6月"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">シーズン（内部管理用）</label>
                      <input
                        type="text"
                        value={formData.season}
                        onChange={e => setFormData(f => ({ ...f, season: e.target.value }))}
                        placeholder="例: 4月〜11月"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* ── 説明文 ── */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">説明文</h4>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    placeholder="体験の概要・魅力を記入してください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#0a2105] outline-none"
                    rows={4}
                  />
                </section>

                {/* ── ポイント一覧 ── */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ポイント・特徴（チェックマーク付き）</h4>
                    <button
                      type="button"
                      onClick={addPoint}
                      className="flex items-center gap-1 text-xs text-[#0a2105] hover:underline"
                    >
                      <FaPlus className="w-2.5 h-2.5" /> 追加
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.points.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <FaGripLines className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <input
                          type="text"
                          value={pt}
                          onChange={e => handlePointChange(idx, e.target.value)}
                          placeholder={`ポイント ${idx + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a2105] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removePoint(idx)}
                          disabled={formData.points.length <= 1}
                          className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── 注意事項 ── */}
                <section>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">注意事項（※テキスト）</h4>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                    placeholder="例: 前日までのご予約が必要です。当日の天候により内容を変更する場合があります。"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#0a2105] outline-none"
                    rows={2}
                  />
                </section>

                {/* Actions */}
                <div className="flex gap-3 pt-2 pb-1">
                  <button onClick={() => setIsEditOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className="flex-1 py-2.5 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {editingItem ? "更新する" : "登録する"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
