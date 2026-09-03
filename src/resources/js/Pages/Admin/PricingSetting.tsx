import { useState } from "react";
import { router } from "@inertiajs/react";
import { CalendarRange, Plus, Save, Trash2, WalletCards } from "lucide-react";
import AdminLayout from "../../Components/Admin/Layout";

interface PeriodRate {
    name: string;
    start: string;
    end: string;
    rate: number;
}

interface PricingSettingProps {
    baseRate: number;
    additionalGuestRate: number;
    weekdayRate: number;
    holidayRate: number;
    periodRates: PeriodRate[];
}

interface FormState {
    base_rate: number;
    additional_guest_rate: number;
    weekday_rate: number;
    holiday_rate: number;
    period_rates: PeriodRate[];
}

function RateInput({
    label,
    note,
    value,
    onChange,
}: {
    label: string;
    note: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-gray-800">
                {label}
            </span>
            <span className="block mt-0.5 text-xs text-gray-500">{note}</span>
            <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ¥
                </span>
                <input
                    type="number"
                    min="0"
                    step="100"
                    value={value}
                    onChange={(event) =>
                        onChange(Math.max(0, Number(event.target.value)))
                    }
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-12 text-right text-sm focus:border-[#2c976c] focus:outline-none focus:ring-2 focus:ring-[#2c976c]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    / 泊
                </span>
            </div>
        </label>
    );
}

export default function PricingSetting({
    pricingSetting,
}: {
    pricingSetting: PricingSettingProps;
}) {
    const [form, setForm] = useState<FormState>({
        base_rate: pricingSetting.baseRate,
        additional_guest_rate: pricingSetting.additionalGuestRate,
        weekday_rate: pricingSetting.weekdayRate,
        holiday_rate: pricingSetting.holidayRate,
        period_rates: pricingSetting.periodRates,
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updatePeriod = <K extends keyof PeriodRate>(
        index: number,
        key: K,
        value: PeriodRate[K],
    ) => {
        setForm((current) => ({
            ...current,
            period_rates: current.period_rates.map((period, periodIndex) =>
                periodIndex === index ? { ...period, [key]: value } : period,
            ),
        }));
    };

    const addPeriod = () => {
        setForm((current) => ({
            ...current,
            period_rates: [
                ...current.period_rates,
                { name: "", start: "", end: "", rate: current.holiday_rate },
            ],
        }));
    };

    const removePeriod = (index: number) => {
        setForm((current) => ({
            ...current,
            period_rates: current.period_rates.filter(
                (_, periodIndex) => periodIndex !== index,
            ),
        }));
    };

    const save = () => {
        setSaving(true);
        setErrors({});
        router.patch(
            "/admin/master/pricing-setting",
            {
                base_rate: form.base_rate,
                additional_guest_rate: form.additional_guest_rate,
                weekday_rate: form.weekday_rate,
                holiday_rate: form.holiday_rate,
                period_rates: form.period_rates.map(
                    ({ name, start, end, rate }) => ({
                        name,
                        start,
                        end,
                        rate,
                    }),
                ),
            },
            {
                preserveScroll: true,
                onError: (validationErrors) => setErrors(validationErrors),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <AdminLayout currentPage="master-pricing-setting" title="料金設定">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f5e9] text-[#0a2105]">
                            <WalletCards className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-medium text-gray-900">
                                宿泊料金
                            </h2>
                            <p className="text-xs text-gray-500">
                                1泊あたりの税込料金を設定します
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-[#0a2105] px-4 py-2.5 text-sm text-white hover:bg-[#122e0e] disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "保存中..." : "設定を保存"}
                    </button>
                </header>

                {Object.keys(errors).length > 0 && (
                    <div
                        role="alert"
                        className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {Object.values(errors)[0]}
                    </div>
                )}

                <section className="border-b border-gray-200 pb-6">
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">
                        通常料金
                    </h3>
                    <div className="grid gap-5 md:grid-cols-2">
                        <RateInput
                            label="基本料金（1組・1〜5名）"
                            note="1〜5名は人数にかかわらず、1組あたり同一料金です"
                            value={form.base_rate}
                            onChange={(value) =>
                                setForm({ ...form, base_rate: value })
                            }
                        />
                        <RateInput
                            label="6名以上の追加料金（1名あたり）"
                            note="6人目から、1名・1泊ごとに加算します"
                            value={form.additional_guest_rate}
                            onChange={(value) =>
                                setForm({
                                    ...form,
                                    additional_guest_rate: value,
                                })
                            }
                        />
                        <RateInput
                            label="平日料金（月〜木）"
                            note="祝日を除く月曜〜木曜に適用します"
                            value={form.weekday_rate}
                            onChange={(value) =>
                                setForm({ ...form, weekday_rate: value })
                            }
                        />
                        <RateInput
                            label="休日料金（金〜日、祝日）"
                            note="金曜〜日曜と日本の祝日に適用します"
                            value={form.holiday_rate}
                            onChange={(value) =>
                                setForm({ ...form, holiday_rate: value })
                            }
                        />
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4 text-gray-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                    期間料金
                                </h3>
                                <p className="text-xs text-gray-500">
                                    毎年繰り返す月日を MM-DD 形式で設定します
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={addPeriod}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Plus className="h-4 w-4" /> 期間を追加
                        </button>
                    </div>

                    {form.period_rates.length === 0 ? (
                        <div className="border-y border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
                            期間料金は設定されていません
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {form.period_rates.map((period, index) => (
                                <div
                                    key={index}
                                    className="grid items-end gap-3 border-b border-gray-200 pb-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
                                >
                                    <label className="text-xs text-gray-600">
                                        名称
                                        <input
                                            required
                                            value={period.name}
                                            onChange={(event) =>
                                                updatePeriod(
                                                    index,
                                                    "name",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="ゴールデンウィーク"
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        開始（月日）
                                        <input
                                            required
                                            pattern="[0-1][0-9]-[0-3][0-9]"
                                            value={period.start}
                                            onChange={(event) =>
                                                updatePeriod(
                                                    index,
                                                    "start",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="04-29"
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        終了（月日）
                                        <input
                                            required
                                            pattern="[0-1][0-9]-[0-3][0-9]"
                                            value={period.end}
                                            onChange={(event) =>
                                                updatePeriod(
                                                    index,
                                                    "end",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="05-05"
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-600">
                                        料金
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={period.rate}
                                            onChange={(event) =>
                                                updatePeriod(
                                                    index,
                                                    "rate",
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    ),
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm text-gray-900"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removePeriod(index)}
                                        title="期間を削除"
                                        aria-label="期間を削除"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
