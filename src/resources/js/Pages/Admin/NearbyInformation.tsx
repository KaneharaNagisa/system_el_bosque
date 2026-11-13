import { useState, type FormEvent } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import AdminLayout from "../../Components/Admin/Layout";

type NearbyType = "onsen" | "spot";

interface NearbyItem {
    id: number;
    name: string;
    subtitle: string | null;
    category: string | null;
    distance: string | null;
    description: string;
    operatingHours: string | null;
    price: string | null;
    closedDays: string | null;
    websiteUrl: string | null;
    icon: string | null;
    sortOrder: number;
    imageUrl: string | null;
}

interface NearbyForm {
    name: string;
    subtitle: string;
    category: string;
    distance: string;
    description: string;
    operatingHours: string;
    price: string;
    closedDays: string;
    websiteUrl: string;
    icon: string;
}

interface Props {
    onsenFacilities: NearbyItem[];
    spots: NearbyItem[];
}

const emptyForm: NearbyForm = {
    name: "",
    subtitle: "",
    category: "",
    distance: "",
    description: "",
    operatingHours: "",
    price: "",
    closedDays: "",
    websiteUrl: "",
    icon: "",
};

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none";

export default function NearbyInformation({ onsenFacilities, spots }: Props) {
    const [editing, setEditing] = useState<{
        type: NearbyType;
        id: number | null;
    } | null>(null);
    const [form, setForm] = useState<NearbyForm>(emptyForm);
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [isReordering, setIsReordering] = useState(false);

    const itemsFor = (type: NearbyType) =>
        type === "onsen" ? onsenFacilities : spots;

    const openForm = (type: NearbyType, item?: NearbyItem) => {
        setEditing({ type, id: item?.id ?? null });
        setForm(
            item
                ? {
                      name: item.name,
                      subtitle: item.subtitle ?? "",
                      category: item.category ?? "",
                      distance: item.distance ?? "",
                      description: item.description,
                      operatingHours: item.operatingHours ?? "",
                      price: item.price ?? "",
                      closedDays: item.closedDays ?? "",
                      websiteUrl: item.websiteUrl ?? "",
                      icon: item.icon ?? "",
                  }
                : emptyForm,
        );
        setImage(null);
        setError("");
    };

    const save = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing) return;

        const payload: Record<string, string | File> = { ...form };
        if (image) payload.image = image;
        if (editing.id !== null) payload._method = "patch";

        const url =
            editing.id === null
                ? `/admin/nearby-information/${editing.type}`
                : `/admin/nearby-information/${editing.type}/${editing.id}`;

        router.post(url, payload, {
            forceFormData: true,
            onSuccess: () => {
                setEditing(null);
                setImage(null);
                setError("");
            },
            onError: (errors) => {
                setError(
                    Object.values(errors)[0] ??
                        "入力内容を確認して、もう一度お試しください。",
                );
            },
        });
    };

    const remove = (type: NearbyType, item: NearbyItem) => {
        if (!window.confirm(`「${item.name}」を削除しますか？`)) return;
        router.delete(`/admin/nearby-information/${type}/${item.id}`);
    };

    const move = async (
        type: NearbyType,
        index: number,
        direction: -1 | 1,
    ) => {
        const items = itemsFor(type);
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const ids = items.map((item) => item.id);
        [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
        setIsReordering(true);
        try {
            await axios.patch(`/admin/nearby-information/${type}/order`, {
                ids,
            });
            router.reload({ only: ["onsenFacilities", "spots"] });
        } catch {
            window.alert(
                "並び順を更新できませんでした。画面を再読み込みしてください。",
            );
        } finally {
            setIsReordering(false);
        }
    };

    const field = (
        key: keyof NearbyForm,
        label: string,
        type: NearbyType,
        multiline = false,
    ) => {
        if (
            (type === "onsen" && ["category", "distance", "icon"].includes(key)) ||
            (type === "spot" &&
                [
                    "subtitle",
                    "operatingHours",
                    "price",
                    "closedDays",
                    "websiteUrl",
                ].includes(key))
        ) {
            return null;
        }

        const control = multiline ? (
            <textarea
                className={inputClass}
                rows={4}
                value={form[key]}
                onChange={(event) =>
                    setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                    }))
                }
            />
        ) : (
            <input
                className={inputClass}
                type={key === "websiteUrl" ? "url" : "text"}
                value={form[key]}
                onChange={(event) =>
                    setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                    }))
                }
            />
        );

        return (
            <label key={key} className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
                {control}
            </label>
        );
    };

    const renderForm = (type: NearbyType) => {
        if (!editing || editing.type !== type) return null;
        const currentItem =
            editing.id === null
                ? null
                : itemsFor(type).find((item) => item.id === editing.id) ?? null;

        return (
            <form
                onSubmit={save}
                className="mt-5 space-y-4 rounded-lg border border-green-200 bg-green-50 p-5"
            >
                <h3 className="font-semibold text-gray-900">
                    {editing.id === null ? "新規登録" : "情報を編集"}
                </h3>
                {type === "onsen" ? (
                    <div className="grid grid-cols-2 gap-4">
                        {field("name", "施設名", type)}
                        {field("subtitle", "泉質・特徴", type)}
                        {field("description", "説明", type, true)}
                        {field("operatingHours", "営業時間", type)}
                        {field("price", "料金", type)}
                        {field("closedDays", "定休日", type)}
                        {field("websiteUrl", "公式サイトURL", type)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {field("name", "名称", type)}
                        {field("icon", "アイコン（絵文字）", type)}
                        {field("category", "カテゴリ", type)}
                        {field("distance", "距離・所要時間", type)}
                        {field("description", "説明", type, true)}
                    </div>
                )}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        画像
                    </label>
                    {currentItem?.imageUrl && (
                        <img
                            src={currentItem.imageUrl}
                            alt=""
                            className="h-20 w-32 rounded object-cover"
                        />
                    )}
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        onChange={(event) =>
                            setImage(event.target.files?.[0] ?? null)
                        }
                        className="block text-sm text-gray-700"
                    />
                    <p className="text-xs text-gray-500">
                        JPG、PNG、WebP、GIF（10MBまで）
                    </p>
                </div>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="rounded bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900"
                    >
                        保存
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700"
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        );
    };

    const renderSection = (
        type: NearbyType,
        title: string,
        items: NearbyItem[],
    ) => (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button
                    type="button"
                    onClick={() => openForm(type)}
                    className="rounded bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900"
                >
                    追加
                </button>
            </div>
            <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt=""
                                className="h-16 w-24 rounded object-cover"
                            />
                        )}
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900">
                                {type === "spot" && item.icon
                                    ? `${item.icon} `
                                    : ""}
                                {item.name}
                            </h3>
                            <p className="truncate text-sm text-gray-600">
                                {type === "onsen"
                                    ? item.subtitle
                                    : `${item.category ?? ""} ${item.distance ?? ""}`}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                disabled={isReordering || index === 0}
                                onClick={() => void move(type, index, -1)}
                                className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                                aria-label={`${item.name}を上へ移動`}
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                disabled={
                                    isReordering || index === items.length - 1
                                }
                                onClick={() => void move(type, index, 1)}
                                className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                                aria-label={`${item.name}を下へ移動`}
                            >
                                ↓
                            </button>
                            <button
                                type="button"
                                onClick={() => openForm(type, item)}
                                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                編集
                            </button>
                            <button
                                type="button"
                                onClick={() => remove(type, item)}
                                className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="py-5 text-sm text-gray-500">
                        登録された情報はありません。
                    </p>
                )}
            </div>
            {renderForm(type)}
        </section>
    );

    return (
        <AdminLayout
            currentPage="nearby-information"
            title="周辺情報管理"
        >
            <div className="space-y-6">
                {renderSection("onsen", "近隣温泉施設", onsenFacilities)}
                {renderSection("spot", "周辺観光スポット", spots)}
            </div>
        </AdminLayout>
    );
}
