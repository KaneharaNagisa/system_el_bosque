export interface PricingSetting {
    baseRate: number;
    additionalGuestRate: number;
    weekdayRate: number;
    holidayRate: number;
    checkInTime: string;
    checkOutTime: string;
    periodRates: Array<{
        name: string;
        start: string;
        end: string;
        rate: number;
    }>;
    holidayDates: string[];
}

export const defaultPricingSetting: PricingSetting = {
    baseRate: 20000,
    additionalGuestRate: 3000,
    weekdayRate: 20000,
    holidayRate: 26000,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    periodRates: [],
    holidayDates: [],
};

export function rateForDate(
    dateString: string,
    pricing: PricingSetting,
): number {
    if (!dateString) return pricing.baseRate;

    const monthDay = dateString.slice(5);
    const period = pricing.periodRates.find((item) =>
        item.start <= item.end
            ? monthDay >= item.start && monthDay <= item.end
            : monthDay >= item.start || monthDay <= item.end,
    );
    if (period) return period.rate;

    const dayOfWeek = new Date(`${dateString}T00:00:00`).getDay();
    if (
        [5, 6, 0].includes(dayOfWeek) ||
        pricing.holidayDates.includes(dateString)
    ) {
        return pricing.holidayRate;
    }
    if ([1, 2, 3, 4].includes(dayOfWeek)) return pricing.weekdayRate;

    return pricing.baseRate;
}

export function amountForStay(
    checkIn: string,
    nights: number,
    pricing: PricingSetting,
): number {
    if (!checkIn || nights <= 0) return 0;

    return Array.from({ length: nights }, (_, offset) => {
        const date = new Date(`${checkIn}T00:00:00`);
        date.setDate(date.getDate() + offset);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return rateForDate(dateString, pricing);
    }).reduce((total, rate) => total + rate, 0);
}

export function additionalGuestAmount(
    guests: number,
    nights: number,
    pricing: PricingSetting,
): number {
    return (
        Math.max(0, guests - 5) *
        pricing.additionalGuestRate *
        Math.max(0, nights)
    );
}

export function dayTypeLabel(
    dateString: string,
    pricing: PricingSetting,
): string {
    if (!dateString) return "";

    const monthDay = dateString.slice(5);
    const period = pricing.periodRates.find((item) =>
        item.start <= item.end
            ? monthDay >= item.start && monthDay <= item.end
            : monthDay >= item.start || monthDay <= item.end,
    );
    if (period) return period.name;

    const dayOfWeek = new Date(`${dateString}T00:00:00`).getDay();
    if (
        [5, 6, 0].includes(dayOfWeek) ||
        pricing.holidayDates.includes(dateString)
    ) {
        return "休日（金〜日、祝日）";
    }

    return "平日（月〜木）";
}
