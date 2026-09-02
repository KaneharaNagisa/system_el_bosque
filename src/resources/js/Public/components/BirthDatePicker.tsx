import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface BirthDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const CURRENT_YEAR = new Date().getFullYear();
const FROM_YEAR = 1920;
const TO_YEAR = CURRENT_YEAR;

export function BirthDatePicker({ value, onChange, style }: BirthDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => {
    if (value) {
      const d = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(d)) return d;
    }
    return new Date(1990, 0, 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  // Sync month view when value changes externally
  useEffect(() => {
    if (value) {
      const d = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(d)) setMonth(d);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  const displayValue = selected && isValid(selected) ? format(selected, "yyyy年M月d日") : "";

  // Generate year options
  const yearOptions: number[] = [];
  for (let y = TO_YEAR; y >= FROM_YEAR; y--) yearOptions.push(y);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = parseInt(e.target.value);
    setMonth(new Date(y, month.getMonth(), 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value);
    setMonth(new Date(month.getFullYear(), m, 1));
  };

  const goToPrevMonth = () => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Input trigger */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <FaCalendarAlt size={14} color="#7a4020" style={{ flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            color: displayValue ? "#2c1e10" : "#b0a090",
            fontSize: "0.9rem",
          }}
        >
          {displayValue || "カレンダーから選択"}
        </span>
      </div>

      {/* Dropdown calendar */}
      {open && (
        <div className="bdp-dropdown" style={{ animation: "bdpFadeIn 0.15s ease" }}>
          {/* Custom caption */}
          <div className="bdp-caption">
            <div className="bdp-dropdowns">
              <select
                value={month.getFullYear()}
                onChange={handleYearChange}
                className="bdp-select"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <select
                value={month.getMonth()}
                onChange={handleMonthChange}
                className="bdp-select"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>{m + 1}月</option>
                ))}
              </select>
            </div>
            <div className="bdp-nav">
              <button type="button" onClick={goToPrevMonth} className="bdp-nav-btn" aria-label="前月">
                <FaChevronLeft size={10} />
              </button>
              <button type="button" onClick={goToNextMonth} className="bdp-nav-btn" aria-label="翌月">
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>

          {/* DayPicker (no caption, navigation handled above) */}
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            locale={ja}
            showOutsideDays
            fixedWeeks
            components={{
              Caption: () => null,
            }}
            modifiersStyles={{
              selected: {
                backgroundColor: "#5c2e12",
                color: "#f0e8d0",
                fontWeight: 700,
                borderRadius: "4px",
              },
              today: {
                fontWeight: 700,
                color: "#5c2e12",
              },
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes bdpFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Container ── */
        .bdp-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          z-index: 9999;
          background-color: #faf5e8;
          border-radius: 8px;
          box-shadow:
            0 12px 40px rgba(14, 26, 8, 0.18),
            0 4px 12px rgba(14, 26, 8, 0.08);
          border: 1px solid rgba(212, 176, 112, 0.3);
          padding: 1.25rem;
          min-width: 300px;
        }

        /* ── Custom Caption ── */
        .bdp-caption {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(212, 176, 112, 0.2);
        }

        .bdp-dropdowns {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .bdp-select {
          padding: 0.4rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(27, 47, 14, 0.2);
          background-color: #f2e8d0;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1b2f0e;
          font-family: 'Noto Sans JP', sans-serif;
          cursor: pointer;
          outline: none;
          appearance: auto;
          -webkit-appearance: auto;
          transition: border-color 0.2s;
        }

        .bdp-select:hover {
          border-color: rgba(27, 47, 14, 0.4);
        }

        .bdp-select:focus {
          border-color: #1b2f0e;
          box-shadow: 0 0 0 2px rgba(27, 47, 14, 0.1);
        }

        .bdp-nav {
          display: flex;
          gap: 0.3rem;
        }

        .bdp-nav-btn {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 1px solid rgba(27, 47, 14, 0.15);
          background-color: transparent;
          cursor: pointer;
          color: #1b2f0e;
          transition: all 0.15s;
        }

        .bdp-nav-btn:hover {
          background-color: rgba(27, 47, 14, 0.06);
          border-color: rgba(27, 47, 14, 0.3);
        }

        .bdp-nav-btn:active {
          background-color: rgba(27, 47, 14, 0.12);
        }

        /* ── Hide rdp default caption completely ── */
        .bdp-dropdown .rdp-caption {
          display: none !important;
        }
        .bdp-dropdown .rdp-vhidden {
          display: none !important;
        }

        /* ── Root ── */
        .bdp-dropdown .rdp {
          --rdp-cell-size: 38px;
          margin: 0;
          font-family: 'Noto Sans JP', sans-serif;
        }

        .bdp-dropdown .rdp-months {
          justify-content: center;
        }

        .bdp-dropdown .rdp-month {
          width: 100%;
        }

        /* ── Table ── */
        .bdp-dropdown .rdp-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 2px;
        }

        /* ── Weekday header ── */
        .bdp-dropdown .rdp-head_cell {
          font-size: 0.72rem;
          font-weight: 700;
          color: #8a7868;
          padding: 0 0 0.5rem 0;
          text-align: center;
          font-family: 'Noto Sans JP', sans-serif;
          letter-spacing: 0.05em;
        }

        /* Sunday header */
        .bdp-dropdown .rdp-head_row th:first-child {
          color: #a03020;
        }

        /* Saturday header */
        .bdp-dropdown .rdp-head_row th:last-child {
          color: #2a6ab0;
        }

        /* ── Day cells ── */
        .bdp-dropdown .rdp-cell {
          text-align: center;
          padding: 0;
        }

        .bdp-dropdown .rdp-day {
          width: 36px;
          height: 36px;
          font-size: 0.85rem;
          border-radius: 4px;
          border: none;
          background-color: transparent;
          cursor: pointer;
          color: #2c1e10;
          font-family: 'Noto Sans JP', sans-serif;
          transition: all 0.12s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .bdp-dropdown .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
          background-color: rgba(92, 46, 18, 0.08);
          color: #5c2e12;
        }

        .bdp-dropdown .rdp-day:active:not(.rdp-day_selected) {
          background-color: rgba(92, 46, 18, 0.15);
        }

        /* Sunday column */
        .bdp-dropdown .rdp-row td:first-child .rdp-day:not(.rdp-day_selected):not(.rdp-day_outside) {
          color: #a03020;
        }

        /* Saturday column */
        .bdp-dropdown .rdp-row td:last-child .rdp-day:not(.rdp-day_selected):not(.rdp-day_outside) {
          color: #2a6ab0;
        }

        /* ── Selected day ── */
        .bdp-dropdown .rdp-day_selected,
        .bdp-dropdown .rdp-day_selected:hover,
        .bdp-dropdown .rdp-day_selected:focus {
          background-color: #5c2e12 !important;
          color: #f0e8d0 !important;
          font-weight: 700;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(92, 46, 18, 0.3);
        }

        /* ── Today ── */
        .bdp-dropdown .rdp-day_today:not(.rdp-day_selected) {
          font-weight: 700;
          color: #5c2e12;
          position: relative;
        }

        .bdp-dropdown .rdp-day_today:not(.rdp-day_selected)::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #d4b070;
        }

        /* ── Outside days ── */
        .bdp-dropdown .rdp-day_outside {
          color: #d0c4b0 !important;
          opacity: 0.5;
        }

        .bdp-dropdown .rdp-day_outside:hover {
          background-color: rgba(92, 46, 18, 0.04) !important;
        }

        /* ── Disabled days ── */
        .bdp-dropdown .rdp-day_disabled {
          color: #d0c4b0 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  );
}
