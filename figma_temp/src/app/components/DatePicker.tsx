import { useState, useRef, useEffect, useCallback } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  disabled?: boolean;
  disabledDaysOfWeek?: number[];
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(str: string): string {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${y} / ${parseInt(m)} / ${parseInt(d)}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "年 / 月 / 日",
  isFocused = false,
  onFocusChange,
  disabled = false,
  disabledDaysOfWeek = [],
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selectedDate = parseDate(value);
  const minDate = parseDate(min || "");
  const maxDate = parseDate(max || "");

  const initialMonth = selectedDate || minDate || today;
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onFocusChange?.(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onFocusChange]);

  // Sync view to value
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  const canGoPrev = useCallback(() => {
    if (!minDate) return true;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    return new Date(prevYear, prevMonth + 1, 0) >= minDate;
  }, [viewYear, viewMonth, minDate]);

  const canGoNext = useCallback(() => {
    if (!maxDate) return true;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    return new Date(nextYear, nextMonth, 1) <= maxDate;
  }, [viewYear, viewMonth, maxDate]);

  const goPrev = () => {
    if (!canGoPrev()) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (!canGoNext()) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDayDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    if (disabledDaysOfWeek.includes(date.getDay())) return true;
    return false;
  };

  const isDaySelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleDayClick = (date: Date) => {
    if (isDayDisabled(date)) return;
    onChange(formatDate(date));
    setOpen(false);
    onFocusChange?.(false);
  };

  const handleClear = () => {
    onChange("");
  };

  const handleToday = () => {
    const t = new Date();
    if (!isDayDisabled(t)) {
      onChange(formatDate(t));
      setOpen(false);
      onFocusChange?.(false);
    }
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month's trailing days
  const prevMonthDays = getDaysInMonth(
    viewMonth === 0 ? viewYear - 1 : viewYear,
    viewMonth === 0 ? 11 : viewMonth - 1
  );

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({ date: new Date(y, m, d), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ date: new Date(viewYear, viewMonth, d), isCurrentMonth: true });
  }
  const remaining = 7 - (calendarDays.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      calendarDays.push({ date: new Date(y, m, d), isCurrentMonth: false });
    }
  }

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 2.5rem 0.75rem 1rem",
    backgroundColor: disabled ? "#f0e8d8" : "#faf5e8",
    border: `1px solid ${isFocused ? "#1e3c0e" : "rgba(30,60,14,0.2)"}`,
    borderRadius: "3px",
    fontSize: "0.9rem",
    color: disabled ? "#b8a898" : value ? "#2c1e10" : "#a09888",
    outline: "none",
    boxSizing: "border-box",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Noto Sans JP', sans-serif",
    boxShadow: isFocused ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    opacity: disabled ? 0.7 : 1,
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Input trigger */}
      <div
        onClick={() => {
          if (disabled) {
            onFocusChange?.(true);
            return;
          }
          setOpen(!open);
          onFocusChange?.(!open);
        }}
        style={inputBaseStyle}
      >
        {value ? formatDisplay(value) : placeholder}
      </div>
      <FaCalendarAlt
        size={15}
        color="#7a4020"
        style={{
          position: "absolute",
          right: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Calendar dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 1000,
            width: "320px",
            backgroundColor: "#faf5e8",
            borderRadius: "6px",
            boxShadow: "0 8px 32px rgba(14,26,8,0.22), 0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid rgba(180,140,80,0.25)",
            overflow: "hidden",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.875rem 1rem",
              backgroundColor: "#1b2f0e",
              color: "#f0e8d0",
            }}
          >
            <button
              onClick={goPrev}
              disabled={!canGoPrev()}
              style={{
                background: "none",
                border: "none",
                cursor: canGoPrev() ? "pointer" : "not-allowed",
                padding: "0.3rem",
                display: "flex",
                alignItems: "center",
                opacity: canGoPrev() ? 1 : 0.3,
              }}
            >
              <FaChevronLeft size={13} color="#d4b070" />
            </button>
            <span
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#f0e8d0",
                letterSpacing: "0.04em",
              }}
            >
              {viewYear}年 {MONTHS[viewMonth]}
            </span>
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              style={{
                background: "none",
                border: "none",
                cursor: canGoNext() ? "pointer" : "not-allowed",
                padding: "0.3rem",
                display: "flex",
                alignItems: "center",
                opacity: canGoNext() ? 1 : 0.3,
              }}
            >
              <FaChevronRight size={13} color="#d4b070" />
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              padding: "0.6rem 0.5rem 0.25rem",
              borderBottom: "1px solid rgba(180,140,80,0.15)",
            }}
          >
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                style={{
                  textAlign: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: i === 0 ? "#a03020" : i === 6 ? "#1e3c0e" : "#7a4020",
                  padding: "0.2rem 0",
                  letterSpacing: "0.05em",
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              padding: "0.35rem 0.5rem 0.5rem",
              gap: "2px",
            }}
          >
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const disabled = isDayDisabled(date);
              const selected = isDaySelected(date);
              const todayMark = isToday(date);
              const dayOfWeek = date.getDay();

              let textColor = "#2c1e10";
              if (!isCurrentMonth) textColor = "#c8b8a0";
              else if (disabled) textColor = "#c8b8a0";
              else if (selected) textColor = "#f0e8d0";
              else if (dayOfWeek === 0) textColor = "#a03020";
              else if (dayOfWeek === 6) textColor = "#1e3c0e";

              return (
                <button
                  key={idx}
                  onClick={() => isCurrentMonth && handleDayClick(date)}
                  disabled={disabled || !isCurrentMonth}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.82rem",
                    fontWeight: selected ? 700 : 400,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: textColor,
                    backgroundColor: selected
                      ? "#5c2e12"
                      : "transparent",
                    border: todayMark && !selected
                      ? "2px solid #d4b070"
                      : "2px solid transparent",
                    borderRadius: "50%",
                    cursor:
                      disabled || !isCurrentMonth ? "default" : "pointer",
                    transition: "all 0.15s",
                    outline: "none",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && isCurrentMonth && !selected) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(30,60,14,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem 0.75rem 0.65rem",
              borderTop: "1px solid rgba(180,140,80,0.15)",
            }}
          >
            <button
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.75rem",
                color: "#8a7868",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                fontFamily: "'Noto Sans JP', sans-serif",
                borderRadius: "3px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#a03020";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8a7868";
              }}
            >
              クリア
            </button>
            <button
              onClick={handleToday}
              style={{
                background: "none",
                border: "1px solid rgba(122,64,32,0.3)",
                fontSize: "0.75rem",
                color: "#7a4020",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0.3rem 0.75rem",
                fontFamily: "'Noto Sans JP', sans-serif",
                borderRadius: "3px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(122,64,32,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              今日
            </button>
          </div>
        </div>
      )}
    </div>
  );
}