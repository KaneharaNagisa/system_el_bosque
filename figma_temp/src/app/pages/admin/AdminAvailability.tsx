import { useState, useMemo } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSyncAlt, FaLock, FaTimes, FaExclamationTriangle } from "react-icons/fa";

type DayStatus = "available" | "booked" | "cleaning" | "closed" | "offseason" | "manual_blocked";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const statusConfig: Record<DayStatus, { label: string; symbol: string; bg: string; text: string }> = {
  available:      { label: "空きあり",   symbol: "◎", bg: "bg-green-100",  text: "text-green-800" },
  booked:         { label: "予約済み",   symbol: "×", bg: "bg-red-100",    text: "text-red-800" },
  cleaning:       { label: "清掃準備中", symbol: "▲", bg: "bg-yellow-100", text: "text-yellow-800" },
  closed:         { label: "予約不可",   symbol: "休", bg: "bg-gray-200",   text: "text-gray-600" },
  offseason:      { label: "休業期間",   symbol: "−", bg: "bg-gray-300",   text: "text-gray-500" },
  manual_blocked: { label: "手動ブロック", symbol: "■", bg: "bg-purple-100", text: "text-purple-800" },
};

interface ReservationInfo {
  id: string;
  guestName: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  phone: string;
  status: "confirmed" | "cancelled";
}

// 予約済み日付に紐づくモック予約データ
const mockBookedReservations: Record<string, ReservationInfo> = {
  "2026-03-15": {
    id: "RES-2026-0301",
    guestName: "田中 健一",
    guestCount: 3,
    checkIn: "2026-03-15",
    checkOut: "2026-03-16",
    phone: "090-1234-5678",
    status: "confirmed",
  },
  "2026-03-20": {
    id: "RES-2026-0302",
    guestName: "佐藤 美咲",
    guestCount: 5,
    checkIn: "2026-03-20",
    checkOut: "2026-03-22",
    phone: "080-9876-5432",
    status: "confirmed",
  },
};

export function AdminAvailability() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [overrides, setOverrides] = useState<Record<string, DayStatus>>({});
  const [bookablePeriod, setBookablePeriod] = useState({ start: "2026-03-01", end: "2026-12-31" });
  const [reservations, setReservations] = useState<Record<string, ReservationInfo>>(mockBookedReservations);

  // 予約情報モーダル
  const [modalInfo, setModalInfo] = useState<ReservationInfo | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: Array<{ date: Date; status: DayStatus; key: string } | null> = [];

    for (let i = 0; i < startPad; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = date.getDay();

      let status: DayStatus;
      if (overrides[key]) {
        status = overrides[key];
      } else if (month < 2 || month > 11) {
        status = "offseason";
      } else if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) {
        status = "closed";
      } else {
        if (d === 15 || d === 20) status = "booked";
        else if (d === 17 || d === 22) status = "cleaning";
        else status = "available";
      }

      days.push({ date, status, key });
    }
    return days;
  }, [year, month, overrides]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleDayClick = (key: string, currentStatus: DayStatus) => {
    // 予約済みの場合：予約情報モーダルを開く（編集不可）
    if (currentStatus === "booked" && reservations[key]) {
      setModalInfo(reservations[key]);
      setCancelConfirm(false);
      return;
    }
    // 予約情報のない booked（手動設定など）は通常サイクル
    if (currentStatus === "booked" && !reservations[key]) {
      setOverrides(prev => ({ ...prev, [key]: "available" }));
      return;
    }
    // offseason は変更不可
    if (currentStatus === "offseason") return;

    const cycle: DayStatus[] = ["available", "cleaning", "closed", "manual_blocked"];
    const idx = cycle.indexOf(currentStatus);
    const next = cycle[(idx + 1) % cycle.length];
    setOverrides(prev => ({ ...prev, [key]: next }));
  };

  const handleCancelReservation = (resId: string) => {
    // 予約をキャンセル → 対象日を available に解放
    const key = Object.keys(reservations).find(k => reservations[k].id === resId);
    if (key) {
      setReservations(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setOverrides(prev => ({ ...prev, [key]: "available" }));
    }
    setModalInfo(null);
    setCancelConfirm(false);
  };

  return (
    <AdminLayout currentPage="master-availability" title="予約枠管理">
      <div className="max-w-5xl mx-auto">
        {/* Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm text-gray-900 mb-3">予約可能期間設定</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs text-gray-600 block mb-1">開始日</label>
              <input type="date" value={bookablePeriod.start} onChange={e => setBookablePeriod(p => ({ ...p, start: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <span className="text-gray-400 mt-5">〜</span>
            <div>
              <label className="text-xs text-gray-600 block mb-1">終了日</label>
              <input type="date" value={bookablePeriod.end} onChange={e => setBookablePeriod(p => ({ ...p, end: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
              <FaSyncAlt className="w-3 h-3" /> Googleカレンダー同期
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4 text-teal-600" />
              </div>
              <h2 className="text-base text-gray-900">{year}年{month + 1}月</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded"><FaChevronLeft className="w-3 h-3" /></button>
              <button onClick={() => setCurrentMonth(new Date(2026, 2, 1))} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">今月</button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded"><FaChevronRight className="w-3 h-3" /></button>
            </div>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_NAMES.map((name, i) => (
                <div key={name} className={`text-center text-xs py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{name}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const cfg = statusConfig[day.status];
                const dayOfWeek = day.date.getDay();
                const isBooked = day.status === "booked" && reservations[day.key];
                const isOffseason = day.status === "offseason";

                return (
                  <button
                    key={day.key}
                    onClick={() => handleDayClick(day.key, day.status)}
                    disabled={isOffseason}
                    className={[
                      "relative p-2 rounded-lg text-center border transition-colors",
                      cfg.bg,
                      "border-transparent",
                      isBooked
                        ? "cursor-not-allowed ring-1 ring-red-300"
                        : isOffseason
                          ? "cursor-default opacity-50"
                          : "hover:ring-2 hover:ring-blue-300",
                    ].join(" ")}
                    title={
                      isBooked
                        ? `${day.key}: ${cfg.label}（予約ID: ${reservations[day.key].id}）— クリックで予約情報を確認`
                        : `${day.key}: ${cfg.label}${isOffseason ? "" : " (クリックで変更)"}`
                    }
                  >
                    {/* 予約済みロックアイコン */}
                    {isBooked && (
                      <FaLock className="absolute top-1 right-1 w-2 h-2 text-red-400" />
                    )}
                    <div className={`text-xs ${dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : "text-gray-700"}`}>
                      {day.date.getDate()}
                    </div>
                    <div className={`text-sm ${cfg.text}`}>{cfg.symbol}</div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${cfg.bg} ${cfg.text}`}>{cfg.symbol}</span>
                  <span className="text-xs text-gray-600">{cfg.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ※ 各日をクリックするとステータスを切り替えられます。
              <FaLock className="inline w-2.5 h-2.5 text-red-400 mx-1" />
              付きの予約済み枠は予約情報のキャンセル後のみ変更可能です。
            </p>
          </div>
        </div>
      </div>

      {/* 予約情報モーダル */}
      {modalInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setModalInfo(null); setCancelConfirm(false); }}>
          <div className="bg-white rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaLock className="w-4 h-4 text-red-500" />
                <h3 className="text-base text-gray-900">予約済み枠の情報</h3>
              </div>
              <button onClick={() => { setModalInfo(null); setCancelConfirm(false); }} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700">
                この枠は確定済みの予約に紐づいているため、ステータスを変更できません。<br />
                枠を解放するには下記の予約をキャンセルしてください。
              </div>

              <dl className="space-y-2 text-sm">
                {[
                  ["予約ID", modalInfo.id],
                  ["宿泊者名", modalInfo.guestName],
                  ["人数", `${modalInfo.guestCount}名`],
                  ["チェックイン", modalInfo.checkIn],
                  ["チェックアウト", modalInfo.checkOut],
                  ["連絡先", modalInfo.phone],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <dt className="w-28 flex-shrink-0 text-gray-500">{label}</dt>
                    <dd className="text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>

              {!cancelConfirm ? (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setModalInfo(null); setCancelConfirm(false); }}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    閉じる
                  </button>
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    この予約をキャンセルする
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2 text-amber-800">
                    <FaExclamationTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs">予約をキャンセルすると元に戻せません。この枠は「空きあり」に変更されます。本当にキャンセルしますか？</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCancelConfirm(false)}
                      className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      戻る
                    </button>
                    <button
                      onClick={() => handleCancelReservation(modalInfo.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      キャンセルして解放
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
