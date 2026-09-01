import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";
import {
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
    FaSyncAlt,
    FaLock,
    FaTimes,
    FaExclamationTriangle,
} from "react-icons/fa";

type DayStatus =
    | "available"
    | "booked"
    | "cleaning"
    | "closed"
    | "offseason"
    | "manual_blocked";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const statusConfig: Record<
    DayStatus,
    { label: string; symbol: string; bg: string; text: string }
> = {
    available: {
        label: "空きあり",
        symbol: "◎",
        bg: "bg-green-100",
        text: "text-green-800",
    },
    booked: {
        label: "予約済み",
        symbol: "×",
        bg: "bg-red-100",
        text: "text-red-800",
    },
    cleaning: {
        label: "清掃準備中",
        symbol: "▲",
        bg: "bg-yellow-100",
        text: "text-yellow-800",
    },
    closed: {
        label: "予約不可",
        symbol: "休",
        bg: "bg-gray-200",
        text: "text-gray-600",
    },
    offseason: {
        label: "休業期間",
        symbol: "−",
        bg: "bg-gray-300",
        text: "text-gray-500",
    },
    manual_blocked: {
        label: "手動ブロック",
        symbol: "■",
        bg: "bg-purple-100",
        text: "text-purple-800",
    },
};

interface BookedInfo {
    id: string;
    guestName: string;
    guestCount: number;
    checkIn: string;
    checkOut: string;
    phone?: string;
    status: string;
}

interface Props {
    availabilities: Record<string, DayStatus>;
    bookedReservations: Record<string, BookedInfo>;
}

export default function Availability({
    availabilities,
    bookedReservations,
}: Props) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const [overrides, setOverrides] = useState<Record<string, DayStatus>>({});
    const [bookablePeriod, setBookablePeriod] = useState({
        start: "2026-03-01",
        end: "2026-12-31",
    });
    const [modalInfo, setModalInfo] = useState<BookedInfo | null>(null);
    const [cancelConfirm, setCancelConfirm] = useState(false);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay();
        const days: Array<{
            date: Date;
            status: DayStatus;
            key: string;
        } | null> = [];

        for (let i = 0; i < startPad; i++) days.push(null);

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dayOfWeek = date.getDay();

            let status: DayStatus;
            if (overrides[key]) {
                status = overrides[key];
            } else if (bookedReservations[key]) {
                status = "booked";
            } else if (availabilities[key]) {
                status = availabilities[key];
            } else if (month < 2 || month > 11) {
                status = "offseason";
            } else if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) {
                status = "closed";
            } else {
                status = "available";
            }

            days.push({ date, status, key });
        }
        return days;
    }, [year, month, overrides, availabilities, bookedReservations]);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
    const goToday = () =>
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    const handleDayClick = (key: string, currentStatus: DayStatus) => {
        if (currentStatus === "booked" && bookedReservations[key]) {
            setModalInfo(bookedReservations[key]);
            setCancelConfirm(false);
            return;
        }
        if (currentStatus === "offseason") return;

        const cycle: DayStatus[] = [
            "available",
            "cleaning",
            "closed",
            "manual_blocked",
        ];
        const idx = cycle.indexOf(currentStatus);
        const next = cycle[(idx + 1) % cycle.length];
        setOverrides((prev) => ({ ...prev, [key]: next }));
        router.post(
            "/admin/master/availability",
            { date: key, status: next },
            { preserveScroll: true },
        );
    };

    const handleCancelReservation = (resId: string) => {
        const numId = resId.replace("RSV-", "").replace(/^0+/, "");
        router.patch(
            `/admin/reservations/${numId}`,
            { status: "cancelled" },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setModalInfo(null);
                    setCancelConfirm(false);
                },
            },
        );
    };

    return (
        <AdminLayout currentPage="master-availability" title="予約枠管理">
            <div className="max-w-5xl mx-auto">
                {/* 予約可能期間設定 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h3 className="text-sm text-gray-900 mb-3">
                        予約可能期間設定
                    </h3>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <label className="text-xs text-gray-600 block mb-1">
                                開始日
                            </label>
                            <input
                                type="date"
                                value={bookablePeriod.start}
                                onChange={(e) =>
                                    setBookablePeriod((p) => ({
                                        ...p,
                                        start: e.target.value,
                                    }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <span className="text-gray-400 mt-5">〜</span>
                        <div>
                            <label className="text-xs text-gray-600 block mb-1">
                                終了日
                            </label>
                            <input
                                type="date"
                                value={bookablePeriod.end}
                                onChange={(e) =>
                                    setBookablePeriod((p) => ({
                                        ...p,
                                        end: e.target.value,
                                    }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <button className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-[#0a2105] text-white rounded-lg text-sm hover:bg-[#071a04]">
                            <FaSyncAlt className="w-3 h-3" />{" "}
                            Googleカレンダー同期
                        </button>
                    </div>
                </div>

                {/* カレンダー */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="w-4 h-4 text-teal-600" />
                            </div>
                            <h2 className="text-base text-gray-900">
                                {year}年{month + 1}月
                            </h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={prevMonth}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <FaChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                                onClick={goToday}
                                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                            >
                                今月
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        {/* 曜日ヘッダー */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {DAY_NAMES.map((name, i) => (
                                <div
                                    key={name}
                                    className={`text-center text-xs py-2 ${
                                        i === 0
                                            ? "text-red-500"
                                            : i === 6
                                              ? "text-blue-500"
                                              : "text-gray-500"
                                    }`}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>

                        {/* カレンダーグリッド */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} />;
                                const cfg = statusConfig[day.status];
                                const dow = day.date.getDay();
                                const isBooked =
                                    day.status === "booked" &&
                                    bookedReservations[day.key];
                                const isOffseason = day.status === "offseason";

                                return (
                                    <button
                                        key={day.key}
                                        onClick={() =>
                                            handleDayClick(day.key, day.status)
                                        }
                                        disabled={isOffseason}
                                        className={[
                                            "relative p-2 rounded-lg text-center border transition-colors",
                                            cfg.bg,
                                            "border-transparent",
                                            isBooked
                                                ? "cursor-pointer ring-1 ring-red-300"
                                                : isOffseason
                                                  ? "cursor-default opacity-50"
                                                  : "hover:ring-2 hover:ring-blue-300",
                                        ].join(" ")}
                                        title={
                                            isBooked
                                                ? `${day.key}: ${cfg.label} — クリックで予約情報を確認`
                                                : `${day.key}: ${cfg.label}${isOffseason ? "" : " (クリックで変更)"}`
                                        }
                                    >
                                        {isBooked && (
                                            <FaLock className="absolute top-1 right-1 w-2 h-2 text-red-400" />
                                        )}
                                        <div
                                            className={`text-xs ${
                                                dow === 0
                                                    ? "text-red-500"
                                                    : dow === 6
                                                      ? "text-blue-500"
                                                      : "text-gray-700"
                                            }`}
                                        >
                                            {day.date.getDate()}
                                        </div>
                                        <div className={`text-sm ${cfg.text}`}>
                                            {cfg.symbol}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 凡例 */}
                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                            {Object.entries(statusConfig).map(([key, cfg]) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-1.5"
                                >
                                    <span
                                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${cfg.bg} ${cfg.text}`}
                                    >
                                        {cfg.symbol}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {cfg.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            ※ 各日をクリックするとステータスを切り替えられます。{" "}
                            <FaLock className="inline w-2.5 h-2.5 text-red-400 mx-0.5" />
                            付きの予約済み枠は予約情報のキャンセル後のみ変更可能です。
                        </p>
                    </div>
                </div>
            </div>

            {/* 予約情報モーダル */}
            {modalInfo && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setModalInfo(null);
                        setCancelConfirm(false);
                    }}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaLock className="w-4 h-4 text-red-500" />
                                <h3 className="text-base text-gray-900">
                                    予約済み枠の情報
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setModalInfo(null);
                                    setCancelConfirm(false);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-3">
                            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700">
                                この枠は確定済みの予約に紐づいているため、ステータスを変更できません。
                                <br />
                                枠を解放するには下記の予約をキャンセルしてください。
                            </div>

                            <dl className="space-y-2 text-sm">
                                {(
                                    [
                                        ["予約ID", modalInfo.id],
                                        ["宿泊者名", modalInfo.guestName],
                                        ["人数", `${modalInfo.guestCount}名`],
                                        ["チェックイン", modalInfo.checkIn],
                                        ["チェックアウト", modalInfo.checkOut],
                                        ["連絡先", modalInfo.phone ?? "−"],
                                    ] as [string, string][]
                                ).map(([label, value]) => (
                                    <div key={label} className="flex gap-3">
                                        <dt className="w-28 flex-shrink-0 text-gray-500">
                                            {label}
                                        </dt>
                                        <dd className="text-gray-900">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {!cancelConfirm ? (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setModalInfo(null);
                                            setCancelConfirm(false);
                                        }}
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
                                        <p className="text-xs">
                                            予約をキャンセルすると元に戻せません。この枠は「空きあり」に変更されます。本当にキャンセルしますか？
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setCancelConfirm(false)
                                            }
                                            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            戻る
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleCancelReservation(
                                                    modalInfo.id,
                                                )
                                            }
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

const statusConfig: Record<
    DayStatus,
    { label: string; symbol: string; bg: string; text: string }
> = {
    available: {
        label: "空きあり",
        symbol: "◎",
        bg: "bg-green-100",
        text: "text-green-800",
    },
    booked: {
        label: "予約済み",
        symbol: "×",
        bg: "bg-red-100",
        text: "text-red-800",
    },
    cleaning: {
        label: "清掃準備中",
        symbol: "▲",
        bg: "bg-yellow-100",
        text: "text-yellow-800",
    },
    closed: {
        label: "予約不可",
        symbol: "休",
        bg: "bg-gray-200",
        text: "text-gray-600",
    },
    offseason: {
        label: "休業期間",
        symbol: "−",
        bg: "bg-gray-300",
        text: "text-gray-500",
    },
    manual_blocked: {
        label: "手動ブロック",
        symbol: "■",
        bg: "bg-purple-100",
        text: "text-purple-800",
    },
};

interface BookedInfo {
    id: string;
    guestName: string;
    guestCount: number;
    checkIn: string;
    checkOut: string;
    phone?: string;
    status: string;
}

interface Props {
    availabilities: Record<string, DayStatus>;
    bookedReservations: Record<string, BookedInfo>;
}

export default function Availability({
    availabilities,
    bookedReservations,
}: Props) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] =
        useState<DayStatus>("available");

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear((y) => y - 1);
            setCurrentMonth(11);
        } else setCurrentMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear((y) => y + 1);
            setCurrentMonth(0);
        } else setCurrentMonth((m) => m + 1);
    };

    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) =>
        new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const getDayStatus = (day: number): DayStatus => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return availabilities[dateStr] || "available";
    };

    const openModal = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setSelectedDate(dateStr);
        setSelectedStatus(getDayStatus(day));
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!selectedDate) return;
        router.post(
            "/admin/master/availability",
            { date: selectedDate, status: selectedStatus },
            {
                onSuccess: () => setIsModalOpen(false),
            },
        );
    };

    return (
        <AdminLayout currentPage="master-availability" title="予約枠管理">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-base text-gray-900">
                                    予約枠カレンダー
                                </h2>
                                <p className="text-xs text-gray-500">
                                    日付をクリックして予約状況を変更できます
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={prevMonth}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <FaChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-base font-medium text-gray-900 w-32 text-center">
                                {currentYear}年{currentMonth + 1}月
                            </span>
                            <button
                                onClick={nextMonth}
                                className="p-2 rounded hover:bg-gray-100"
                            >
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 凡例 */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <span
                                key={key}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${cfg.bg} ${cfg.text}`}
                            >
                                {cfg.symbol} {cfg.label}
                            </span>
                        ))}
                    </div>

                    {/* カレンダー */}
                    <div className="grid grid-cols-7 gap-1">
                        {DAY_NAMES.map((d, i) => (
                            <div
                                key={d}
                                className={`text-center text-xs py-2 font-medium ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}
                            >
                                {d}
                            </div>
                        ))}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const status = getDayStatus(day);
                            const cfg = statusConfig[status];
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const booked = bookedReservations[dateStr];
                            const dayOfWeek = (firstDay + i) % 7;
                            return (
                                <button
                                    key={day}
                                    onClick={() => openModal(day)}
                                    className={`relative aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-xs border transition-all hover:opacity-80 ${cfg.bg} ${cfg.text} border-transparent`}
                                >
                                    <span
                                        className={`font-medium ${dayOfWeek === 0 ? "text-red-600" : dayOfWeek === 6 ? "text-blue-600" : ""}`}
                                    >
                                        {day}
                                    </span>
                                    <span className="text-sm leading-none">
                                        {cfg.symbol}
                                    </span>
                                    {booked && (
                                        <span className="text-xs leading-tight truncate w-full text-center px-1">
                                            {booked.guestName.split(" ")[0]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 変更モーダル */}
                {isModalOpen && selectedDate && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-xl w-80"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-base text-gray-900">
                                    {selectedDate} の状態変更
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="px-6 py-4 space-y-2">
                                {(
                                    Object.entries(statusConfig) as [
                                        DayStatus,
                                        (typeof statusConfig)[DayStatus],
                                    ][]
                                ).map(([key, cfg]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedStatus === key ? "ring-2 ring-[#0a2105]" : "hover:bg-gray-50"}`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={key}
                                            checked={selectedStatus === key}
                                            onChange={() =>
                                                setSelectedStatus(key)
                                            }
                                            className="sr-only"
                                        />
                                        <span
                                            className={`w-8 h-8 flex items-center justify-center rounded text-sm ${cfg.bg} ${cfg.text}`}
                                        >
                                            {cfg.symbol}
                                        </span>
                                        <span className="text-sm text-gray-700">
                                            {cfg.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm bg-[#0a2105] text-white rounded-lg hover:bg-[#071a04]"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
