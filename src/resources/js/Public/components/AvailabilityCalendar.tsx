import { useState, useMemo, useCallback, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { FaChevronLeft, FaChevronRight, FaCircle, FaBan } from "react-icons/fa";

type AvailabilityStatus = "available" | "booked" | "unavailable" | "closed";

// Booking blocked due to cleaning after a prior booking in the same weekend block
type DisplayStatus = AvailabilityStatus | "blocked";

interface AvailabilityCalendarProps {
    checkin: string;
    checkout: string;
    onSelectDate?: (date: string) => void;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

// Operating season: March (3) – December (12)
const SEASON_START_MONTH = 2; // 0-indexed
const SEASON_END_MONTH = 11;
const YEAR = 2026;

// Tue=2, Wed=3, Thu=4 are closed days
const CLOSED_DAYS = [2, 3, 4];

// Valid check-in days: Fri(5), Sat(6), Sun(0)
const VALID_CHECKIN_DAYS = [0, 5, 6];

// Deterministic mock availability based on date (base, before weekend-block cascade)
function getBaseAvailability(
    year: number,
    month: number,
    day: number,
): AvailabilityStatus {
    if (month < SEASON_START_MONTH || month > SEASON_END_MONTH) return "closed";
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return "closed";

    const dow = date.getDay();
    if (CLOSED_DAYS.includes(dow)) return "unavailable";

    // Seed-based mock
    const seed = day * 7 + month * 13 + year;
    const hash = ((seed * 2654435761) >>> 0) % 100;

    // GW period (Apr 29 - May 5)
    if ((month === 3 && day >= 29) || (month === 4 && day <= 5))
        return "booked";
    // Obon (Aug 10-16)
    if (month === 7 && day >= 10 && day <= 16) return "booked";
    // Year-end holidays (Dec 28-31)
    if (month === 11 && day >= 28) return "booked";

    // Weekends tend to fill up more
    if (dow === 5 || dow === 6) {
        if (hash < 40) return "booked";
        return "available";
    }
    // Mon, Sun
    if (hash < 20) return "booked";
    return "available";
}

/** Weekend-block-aware availability.
 *  Within a Fri→Mon block, if any earlier day (base) is "booked",
 *  all later days become "blocked" (cleaning can't be done in time). */
function getAvailability(
    year: number,
    month: number,
    day: number,
): DisplayStatus {
    const base = getBaseAvailability(year, month, day);
    // Only cascade for bookable days (Sat, Sun, Mon) within a weekend block
    if (base === "unavailable" || base === "closed") return base;

    const date = new Date(year, month, day);
    const dow = date.getDay();

    // How many earlier days to check in this Fri→Mon block
    // Fri(5)=0, Sat(6)=1, Sun(0)=2, Mon(1)=3
    let lookBack = 0;
    if (dow === 6) lookBack = 1;
    else if (dow === 0) lookBack = 2;
    else if (dow === 1) lookBack = 3;

    for (let i = 1; i <= lookBack; i++) {
        const prev = new Date(year, month, day - i);
        const prevBase = getBaseAvailability(
            prev.getFullYear(),
            prev.getMonth(),
            prev.getDate(),
        );
        if (prevBase === "booked") {
            return "blocked";
        }
    }

    return base;
}

function parseDate(str: string): Date | null {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function fmtDate(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function fmtDateFromDate(d: Date): string {
    return fmtDate(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function daysBetween(a: string, b: string): number {
    const da = parseDate(a);
    const db = parseDate(b);
    if (!da || !db) return 0;
    return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

/** Given a checkin date string, compute the set of valid checkout date strings.
 *  Rule: checkout by the next Monday at latest, max 3 nights,
 *  no closed day (Tue/Wed/Thu) nights in range. */
function computeValidCheckouts(checkinStr: string): Set<string> {
    const dates = new Set<string>();
    const ci = parseDate(checkinStr);
    if (!ci) return dates;

    for (let n = 1; n <= 3; n++) {
        const co = new Date(ci);
        co.setDate(co.getDate() + n);
        const coDow = co.getDay();
        // checkout day must not be a closed day itself
        if (CLOSED_DAYS.includes(coDow)) break;
        // all nights (the days you sleep there) must not be closed
        let valid = true;
        for (let k = 0; k < n; k++) {
            const night = new Date(ci);
            night.setDate(night.getDate() + k);
            if (CLOSED_DAYS.includes(night.getDay())) {
                valid = false;
                break;
            }
        }
        if (!valid) break;
        dates.add(fmtDateFromDate(co));
    }
    return dates;
}

const MONTHS = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
];

const STATUS_COLORS: Record<DisplayStatus, string> = {
    available: "#2d6a1e",
    booked: "#a03020",
    blocked: "#b8860b",
    unavailable: "#8a7a6a",
    closed: "#c8b8a0",
};

const STATUS_BG: Record<DisplayStatus, string> = {
    available: "rgba(45,106,30,0.08)",
    booked: "rgba(160,48,32,0.06)",
    blocked: "rgba(184,134,11,0.06)",
    unavailable: "rgba(138,122,106,0.08)",
    closed: "transparent",
};

const STATUS_LABELS: {
    status: DisplayStatus;
    label: string;
    symbol: string;
}[] = [
    { status: "available", label: "空きあり", symbol: "◎" },
    { status: "booked", label: "予約済み", symbol: "×" },
    { status: "blocked", label: "清掃準備中", symbol: "▲" },
    { status: "unavailable", label: "予約不可（火水木）", symbol: "休" },
    { status: "closed", label: "休業期間", symbol: "−" },
];

export function AvailabilityCalendar({
    checkin,
    checkout,
    onSelectDate,
}: AvailabilityCalendarProps) {
    const { availability = [] } = usePage().props as unknown as {
        availability?: Array<{ date: string; status: string }>;
    };
    const availabilityByDate = useMemo(() => {
        const statusMap: Record<string, DisplayStatus> = {
            available: "available",
            booked: "booked",
            cleaning: "blocked",
            closed: "unavailable",
            manual_blocked: "unavailable",
            offseason: "closed",
        };

        return Object.fromEntries(
            availability.map((item) => [
                item.date.slice(0, 10),
                statusMap[item.status] ?? "unavailable",
            ]),
        ) as Record<string, DisplayStatus>;
    }, [availability]);
    const today = new Date();
    const initialMonth =
        today.getMonth() < SEASON_START_MONTH
            ? SEASON_START_MONTH
            : today.getMonth() > SEASON_END_MONTH
              ? SEASON_START_MONTH
              : today.getMonth();

    const [viewMonth, setViewMonth] = useState(initialMonth);

    // Sync calendar to checkin month
    useEffect(() => {
        const checkinDate = parseDate(checkin);
        if (checkinDate) {
            const m = checkinDate.getMonth();
            if (m >= SEASON_START_MONTH && m <= SEASON_END_MONTH) {
                setViewMonth(m);
            }
        }
    }, [checkin]);

    const canGoPrev = viewMonth > SEASON_START_MONTH;
    const canGoNext = viewMonth < SEASON_END_MONTH;

    const goPrev = () => {
        if (canGoPrev) setViewMonth((m) => m - 1);
    };
    const goNext = () => {
        if (canGoNext) setViewMonth((m) => m + 1);
    };

    // Valid checkout dates when checkin is set
    const validCheckoutDates = useMemo(() => {
        if (!checkin) return new Set<string>();
        return computeValidCheckouts(checkin);
    }, [checkin]);

    const isSelectingCheckout = !!checkin && !checkout;

    // Check if a date is within the selected range
    const isInRange = useCallback(
        (dateStr: string) => {
            if (!checkin || !checkout) return false;
            return dateStr >= checkin && dateStr <= checkout;
        },
        [checkin, checkout],
    );

    const isCheckin = useCallback(
        (dateStr: string) => dateStr === checkin,
        [checkin],
    );
    const isCheckout = useCallback(
        (dateStr: string) => dateStr === checkout,
        [checkout],
    );

    // Build calendar grid
    const calendarData = useMemo(() => {
        const daysInMonth = getDaysInMonth(YEAR, viewMonth);
        const firstDay = getFirstDayOfMonth(YEAR, viewMonth);
        const prevMonthDays = getDaysInMonth(
            viewMonth === 0 ? YEAR - 1 : YEAR,
            viewMonth === 0 ? 11 : viewMonth - 1,
        );

        const cells: {
            day: number;
            month: number;
            year: number;
            isCurrentMonth: boolean;
            status: DisplayStatus;
            dateStr: string;
        }[] = [];

        // Previous month trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const m = viewMonth === 0 ? 11 : viewMonth - 1;
            cells.push({
                day: d,
                month: m,
                year: YEAR,
                isCurrentMonth: false,
                status: "closed",
                dateStr: fmtDate(YEAR, m, d),
            });
        }
        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({
                day: d,
                month: viewMonth,
                year: YEAR,
                isCurrentMonth: true,
                status:
                    availabilityByDate[fmtDate(YEAR, viewMonth, d)] ?? "closed",
                dateStr: fmtDate(YEAR, viewMonth, d),
            });
        }
        // Fill remaining
        const remaining = 7 - (cells.length % 7);
        if (remaining < 7) {
            for (let d = 1; d <= remaining; d++) {
                const m = viewMonth === 11 ? 0 : viewMonth + 1;
                cells.push({
                    day: d,
                    month: m,
                    year: YEAR,
                    isCurrentMonth: false,
                    status: "closed",
                    dateStr: fmtDate(YEAR, m, d),
                });
            }
        }
        return cells;
    }, [availabilityByDate, viewMonth]);

    // Summary counts for current month
    const summary = useMemo(() => {
        const cur = calendarData.filter((c) => c.isCurrentMonth);
        return {
            available: cur.filter((c) => c.status === "available").length,
            booked: cur.filter((c) => c.status === "booked").length,
            blocked: cur.filter((c) => c.status === "blocked").length,
            unavailable: cur.filter((c) => c.status === "unavailable").length,
        };
    }, [calendarData]);

    return (
        <div
            style={{
                marginBottom: "1.75rem",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(180,140,80,0.18)",
                backgroundColor: "#faf5e8",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.25rem",
                    backgroundColor: "#1b2f0e",
                }}
            >
                <button
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    style={{
                        background: "none",
                        border: "1px solid rgba(212,176,112,0.25)",
                        borderRadius: "3px",
                        cursor: canGoPrev ? "pointer" : "not-allowed",
                        padding: "0.4rem 0.6rem",
                        display: "flex",
                        alignItems: "center",
                        opacity: canGoPrev ? 1 : 0.3,
                        transition: "opacity 0.2s",
                    }}
                    aria-label="前月"
                >
                    <FaChevronLeft size={12} color="#d4b070" />
                </button>
                <span
                    style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#f0e8d0",
                        letterSpacing: "0.05em",
                    }}
                >
                    {YEAR}年 {MONTHS[viewMonth]}　空き状況
                </span>
                <button
                    onClick={goNext}
                    disabled={!canGoNext}
                    style={{
                        background: "none",
                        border: "1px solid rgba(212,176,112,0.25)",
                        borderRadius: "3px",
                        cursor: canGoNext ? "pointer" : "not-allowed",
                        padding: "0.4rem 0.6rem",
                        display: "flex",
                        alignItems: "center",
                        opacity: canGoNext ? 1 : 0.3,
                        transition: "opacity 0.2s",
                    }}
                    aria-label="翌月"
                >
                    <FaChevronRight size={12} color="#d4b070" />
                </button>
            </div>

            {/* Legend bar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                    padding: "0.6rem 1rem",
                    backgroundColor: "rgba(27,47,14,0.04)",
                    borderBottom: "1px solid rgba(180,140,80,0.12)",
                }}
            >
                {STATUS_LABELS.map(({ status, label, symbol }) => (
                    <div
                        key={status}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.7rem",
                            color: "#5a4838",
                        }}
                    >
                        <span
                            style={{
                                color: STATUS_COLORS[status],
                                fontWeight: 700,
                                fontSize:
                                    status === "unavailable"
                                        ? "0.65rem"
                                        : "0.8rem",
                                width: "1.2em",
                                textAlign: "center",
                            }}
                        >
                            {symbol}
                        </span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            {/* Stay rule notice */}
            <div
                style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "rgba(92,46,18,0.05)",
                    borderBottom: "1px solid rgba(180,140,80,0.12)",
                    textAlign: "center",
                }}
            >
                <span
                    style={{
                        fontSize: "0.72rem",
                        color: "#5c2e12",
                        fontWeight: 700,
                    }}
                >
                    ※ IN：金・土・日 ｜ OUT：土・日・月 ｜ 最大3泊（金曜〜月曜）
                </span>
            </div>

            {/* Checkout selection guide */}
            {isSelectingCheckout && (
                <div
                    style={{
                        padding: "0.45rem 1rem",
                        backgroundColor: "rgba(45,106,30,0.08)",
                        borderBottom: "1px solid rgba(180,140,80,0.12)",
                        textAlign: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.72rem",
                            color: "#2d6a1e",
                            fontWeight: 700,
                        }}
                    >
                        チェックアウト日を選択してください（緑枠の日付が選択可能）
                    </span>
                </div>
            )}

            {/* Weekday header */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    padding: "0.55rem 0.75rem 0.3rem",
                    borderBottom: "1px solid rgba(180,140,80,0.1)",
                }}
            >
                {WEEKDAYS.map((wd, i) => {
                    const isClosed = CLOSED_DAYS.includes(i);
                    return (
                        <div
                            key={wd}
                            style={{
                                textAlign: "center",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color:
                                    i === 0
                                        ? "#a03020"
                                        : i === 6
                                          ? "#1e3c0e"
                                          : isClosed
                                            ? "#8a7a6a"
                                            : "#7a4020",
                                padding: "0.15rem 0",
                                letterSpacing: "0.05em",
                                opacity: isClosed ? 0.7 : 1,
                            }}
                        >
                            {wd}
                        </div>
                    );
                })}
            </div>

            {/* Calendar grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    padding: "0.25rem 0.75rem 0.5rem",
                    gap: "1px",
                }}
            >
                {calendarData.map((cell, idx) => {
                    const { day, isCurrentMonth, status, dateStr } = cell;
                    const inRange = isInRange(dateStr);
                    const isCI = isCheckin(dateStr);
                    const isCO = isCheckout(dateStr);

                    const dow = new Date(cell.year, cell.month, day).getDay();
                    const isUnavailDay =
                        isCurrentMonth && status === "unavailable";
                    const isBlockedDay = isCurrentMonth && status === "blocked";
                    const isBookable = status === "available";

                    // Determine clickability
                    let clickable = false;
                    if (isCurrentMonth && isBookable && onSelectDate) {
                        if (isSelectingCheckout) {
                            // Only valid checkout dates are clickable
                            clickable = validCheckoutDates.has(dateStr);
                        } else {
                            // Selecting checkin: only valid checkin days of week
                            clickable = VALID_CHECKIN_DAYS.includes(dow);
                        }
                    }

                    // Is this a valid checkout candidate?
                    const isCheckoutCandidate =
                        isSelectingCheckout &&
                        validCheckoutDates.has(dateStr) &&
                        isCurrentMonth;

                    // Day number color
                    let dayColor = "#2c1e10";
                    if (!isCurrentMonth) dayColor = "#d0c8b8";
                    else if (isUnavailDay) dayColor = "#a09888";
                    else if (isBlockedDay) dayColor = "#a09070";
                    else if (status === "closed") dayColor = "#c8b8a0";
                    else if (isCI || isCO) dayColor = "#f0e8d0";
                    else if (dow === 0) dayColor = "#a03020";
                    else if (dow === 6) dayColor = "#1e3c0e";

                    // Status symbol
                    let symbol = "";
                    let symbolColor = "";
                    if (isCurrentMonth) {
                        if (status === "available") {
                            symbol = "◎";
                            symbolColor = STATUS_COLORS.available;
                        } else if (status === "booked") {
                            symbol = "×";
                            symbolColor = STATUS_COLORS.booked;
                        } else if (status === "blocked") {
                            symbol = "▲";
                            symbolColor = STATUS_COLORS.blocked;
                        } else if (status === "unavailable") {
                            symbol = "休";
                            symbolColor = STATUS_COLORS.unavailable;
                        } else {
                            symbol = "−";
                            symbolColor = STATUS_COLORS.closed;
                        }
                    }

                    // Background
                    let bg = "transparent";
                    if (isCI || isCO) {
                        bg = "#5c2e12";
                    } else if (inRange && isCurrentMonth) {
                        bg = "rgba(92,46,18,0.10)";
                    } else if (isUnavailDay) {
                        bg =
                            "repeating-linear-gradient(-45deg, rgba(138,122,106,0.06), rgba(138,122,106,0.06) 3px, rgba(138,122,106,0.02) 3px, rgba(138,122,106,0.02) 6px)";
                    } else if (isBlockedDay) {
                        bg =
                            "repeating-linear-gradient(-45deg, rgba(184,134,11,0.05), rgba(184,134,11,0.05) 3px, rgba(184,134,11,0.015) 3px, rgba(184,134,11,0.015) 6px)";
                    } else if (isCurrentMonth && status !== "closed") {
                        bg = STATUS_BG[status];
                    }

                    const isStripedBg =
                        (isUnavailDay || isBlockedDay) &&
                        !isCI &&
                        !isCO &&
                        !(inRange && isCurrentMonth);

                    // Border for checkout candidates
                    const borderStyle =
                        isCheckoutCandidate && isBookable
                            ? "2px solid #2d6a1e"
                            : "2px solid transparent";

                    return (
                        <button
                            key={idx}
                            onClick={() => clickable && onSelectDate!(dateStr)}
                            disabled={!clickable}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0.25rem 0.15rem",
                                minHeight: "3rem",
                                background: bg,
                                border: borderStyle,
                                borderRadius: isCI
                                    ? "4px 0 0 4px"
                                    : isCO
                                      ? "0 4px 4px 0"
                                      : inRange
                                        ? "0"
                                        : "4px",
                                cursor: clickable ? "pointer" : "default",
                                transition: "background 0.15s",
                                outline: "none",
                                fontFamily: "'Noto Sans JP', sans-serif",
                                opacity: isUnavailDay
                                    ? 0.6
                                    : isBlockedDay
                                      ? 0.7
                                      : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (clickable && !isCI && !isCO) {
                                    e.currentTarget.style.background =
                                        "rgba(30,60,14,0.10)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCI && !isCO) {
                                    e.currentTarget.style.background = bg;
                                }
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.82rem",
                                    fontWeight: isCI || isCO ? 700 : 400,
                                    color: dayColor,
                                    lineHeight: 1.2,
                                    textDecorationLine: isUnavailDay
                                        ? "line-through"
                                        : "none",
                                    textDecorationColor:
                                        "rgba(138,122,106,0.5)",
                                }}
                            >
                                {isCurrentMonth ? (
                                    day
                                ) : (
                                    <span style={{ opacity: 0.35 }}>{day}</span>
                                )}
                            </span>
                            {isCurrentMonth && (
                                <span
                                    style={{
                                        fontSize:
                                            status === "unavailable"
                                                ? "0.55rem"
                                                : "0.62rem",
                                        fontWeight: 700,
                                        color:
                                            isCI || isCO
                                                ? "#f0e8d0"
                                                : symbolColor,
                                        lineHeight: 1,
                                        marginTop: "1px",
                                    }}
                                >
                                    {isCI ? "IN" : isCO ? "OUT" : symbol}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Summary footer */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1.25rem",
                    flexWrap: "wrap",
                    padding: "0.6rem 1rem",
                    borderTop: "1px solid rgba(180,140,80,0.12)",
                    backgroundColor: "rgba(27,47,14,0.03)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                    }}
                >
                    <FaCircle size={7} color={STATUS_COLORS.available} />
                    <span style={{ fontSize: "0.72rem", color: "#5a4838" }}>
                        空き{" "}
                        <strong style={{ color: "#2d6a1e" }}>
                            {summary.available}
                        </strong>{" "}
                        日
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                    }}
                >
                    <FaCircle size={7} color={STATUS_COLORS.booked} />
                    <span style={{ fontSize: "0.72rem", color: "#5a4838" }}>
                        予約済{" "}
                        <strong style={{ color: "#a03020" }}>
                            {summary.booked}
                        </strong>{" "}
                        日
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                    }}
                >
                    <FaCircle size={7} color={STATUS_COLORS.blocked} />
                    <span style={{ fontSize: "0.72rem", color: "#5a4838" }}>
                        清掃{" "}
                        <strong style={{ color: "#b8860b" }}>
                            {summary.blocked}
                        </strong>{" "}
                        日
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                    }}
                >
                    <FaBan size={7} color={STATUS_COLORS.unavailable} />
                    <span style={{ fontSize: "0.72rem", color: "#5a4838" }}>
                        不可{" "}
                        <strong style={{ color: "#8a7a6a" }}>
                            {summary.unavailable}
                        </strong>{" "}
                        日
                    </span>
                </div>
            </div>

            {/* Selected range summary */}
            {checkin && checkout && (
                <div
                    style={{
                        padding: "0.6rem 1rem",
                        borderTop: "1px solid rgba(180,140,80,0.12)",
                        backgroundColor: "rgba(92,46,18,0.04)",
                        textAlign: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.78rem",
                            color: "#5c2e12",
                            fontWeight: 700,
                        }}
                    >
                        {(() => {
                            const nights = daysBetween(checkin, checkout);
                            const ci = parseDate(checkin)!;
                            const co = parseDate(checkout)!;
                            return `${ci.getMonth() + 1}/${ci.getDate()}（${DAY_NAMES[ci.getDay()]}）〜 ${co.getMonth() + 1}/${co.getDate()}（${DAY_NAMES[co.getDay()]}）　${nights}泊`;
                        })()}
                    </span>
                </div>
            )}
        </div>
    );
}
