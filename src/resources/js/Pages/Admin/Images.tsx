import { useRef, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import {
    GripVertical,
    Image as ImageIcon,
    RotateCcw,
    Upload,
} from "lucide-react";
import AdminLayout from "../../Components/Admin/Layout";
import homeHeroLake from "../../Public/assets/260924-0111.jpg";
import homeHeroCabin from "../../Public/assets/260924-0015.jpg";
import homeInterior from "../../Public/assets/260924-0074-1.jpg";
import homeLake from "../../Public/assets/260924-0103.jpg";
import aboutBbq from "../../Public/assets/260924-0027.jpg";
import aboutExterior from "../../Public/assets/260924-0007-3.jpg";
import aboutLiving from "../../Public/assets/260924-0052.jpg";
import aboutKitchen from "../../Public/assets/260924-0041.jpg";
import aboutLoft from "../../Public/assets/260924-0065.jpg";
import aboutLake from "../../Public/assets/260924-0109.jpg";
import areaLake from "../../Public/assets/22a4426011bdad96a789860b3ad337bbb50cb96f.png";

interface ImageAsset {
    key: string;
    label: string;
    url: string | null;
}

interface GalleryItem {
    id: number;
    title: string;
    sortOrder: number;
    fallbackKey: string | null;
    url: string | null;
    srcSet: string | null;
    sizes: string | null;
}

const galleryKeys = [
    "about.living",
    "about.kitchen",
    "about.loft",
    "about.lake",
    "about.bbq",
    "about.stars",
];

const defaultImages: Record<string, string> = {
    "home.hero": homeHeroLake,
    "home.hero.2": homeHeroCabin,
    "home.lake": homeLake,
    "home.interior": homeInterior,
    "home.stars":
        "https://images.unsplash.com/photo-1570399747403-6f3af992698f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    "home.bbq":
        "https://images.unsplash.com/photo-1763062690254-be377d55dacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    "about.exterior": aboutExterior,
    "about.living": aboutLiving,
    "about.kitchen": aboutKitchen,
    "about.loft": aboutLoft,
    "about.bbq": aboutBbq,
    "about.lake": aboutLake,
    "about.stars":
        "https://images.unsplash.com/photo-1715535478808-8b01355c7c8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
    "area.lake": areaLake,
    "area.autumn":
        "https://images.unsplash.com/photo-1610238115729-2d54b7aa8498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
};

export default function Images({
    images,
    gallery: initialGallery,
}: {
    images: ImageAsset[];
    gallery: GalleryItem[];
}) {
    const [items, setItems] = useState(images);
    const [gallery, setGallery] = useState(initialGallery);
    const [uploading, setUploading] = useState<string | null>(null);
    const [galleryBusy, setGalleryBusy] = useState<string | null>(null);
    const [newGalleryTitle, setNewGalleryTitle] = useState("");
    const [newGalleryImage, setNewGalleryImage] = useState<File | null>(null);
    const inputs = useRef<Record<string, HTMLInputElement | null>>({});
    const galleryInputs = useRef<Record<number, HTMLInputElement | null>>({});
    const newGalleryInput = useRef<HTMLInputElement | null>(null);
    const groups = [
        { key: "home", label: "トップページ" },
        { key: "about", label: "施設紹介" },
        { key: "area", label: "周辺情報" },
    ];

    const upload = async (item: ImageAsset, file: File) => {
        setUploading(item.key);
        try {
            const body = new FormData();
            body.append("image", file);
            const response = await axios.post<{ url: string }>(
                `/admin/images/${item.key}`,
                body,
            );
            setItems((current) =>
                current.map((entry) =>
                    entry.key === item.key
                        ? { ...entry, url: response.data.url }
                        : entry,
                ),
            );
        } catch {
            alert(
                "画像のアップロードに失敗しました。画像形式とサイズを確認してください。",
            );
        } finally {
            setUploading(null);
        }
    };

    const reset = (item: ImageAsset) => {
        if (confirm(`${item.label}を初期状態に戻しますか？`)) {
            router.delete(`/admin/images/${item.key}`, {
                onSuccess: () =>
                    setItems((current) =>
                        current.map((entry) =>
                            entry.key === item.key
                                ? { ...entry, url: null }
                                : entry,
                        ),
                    ),
            });
        }
    };

    const createGalleryItem = async () => {
        if (!newGalleryTitle.trim() || !newGalleryImage) return;
        setGalleryBusy("new");
        try {
            const body = new FormData();
            body.append("title", newGalleryTitle.trim());
            body.append("image", newGalleryImage);
            const response = await axios.post<GalleryItem>(
                "/admin/images/gallery",
                body,
            );
            setGallery((current) => [...current, response.data]);
            setNewGalleryTitle("");
            setNewGalleryImage(null);
            if (newGalleryInput.current) newGalleryInput.current.value = "";
        } catch {
            alert("ギャラリー画像の追加に失敗しました。入力内容を確認してください。");
        } finally {
            setGalleryBusy(null);
        }
    };

    const saveGalleryTitle = async (item: GalleryItem) => {
        setGalleryBusy(`title-${item.id}`);
        try {
            await axios.patch(`/admin/images/gallery/${item.id}`, {
                title: item.title,
            });
        } catch {
            alert("画像タイトルの保存に失敗しました。");
        } finally {
            setGalleryBusy(null);
        }
    };

    const uploadGalleryImage = async (item: GalleryItem, file: File) => {
        setGalleryBusy(`image-${item.id}`);
        try {
            const body = new FormData();
            body.append("image", file);
            const response = await axios.post<GalleryItem>(
                `/admin/images/gallery/${item.id}/image`,
                body,
            );
            setGallery((current) =>
                current.map((entry) =>
                    entry.id === item.id ? response.data : entry,
                ),
            );
        } catch {
            alert(
                "画像のアップロードに失敗しました。画像形式とサイズを確認してください。",
            );
        } finally {
            setGalleryBusy(null);
        }
    };

    const deleteGalleryItem = async (item: GalleryItem) => {
        if (!confirm(`「${item.title}」を削除しますか？`)) return;
        setGalleryBusy(`delete-${item.id}`);
        try {
            await axios.delete(`/admin/images/gallery/${item.id}`);
            setGallery((current) =>
                current.filter((entry) => entry.id !== item.id),
            );
        } catch {
            alert("ギャラリーブロックの削除に失敗しました。");
        } finally {
            setGalleryBusy(null);
        }
    };

    const reorderGallery = async (draggedId: number, targetId: number) => {
        const fromIndex = gallery.findIndex((item) => item.id === draggedId);
        const toIndex = gallery.findIndex((item) => item.id === targetId);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

        const reordered = [...gallery];
        const [draggedItem] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, draggedItem);
        const orderedItems = reordered.map((item, sortOrder) => ({
            ...item,
            sortOrder,
        }));

        setGalleryBusy("order");
        try {
            await axios.patch("/admin/images/gallery/order", {
                ids: orderedItems.map((item) => item.id),
            });
            setGallery(orderedItems);
        } catch {
            alert("ギャラリーの並び替えに失敗しました。再度お試しください。");
        } finally {
            setGalleryBusy(null);
        }
    };

    return (
        <AdminLayout currentPage="images" title="画像管理">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <h2 className="text-base text-gray-900">
                                フロント画像一覧
                            </h2>
                            <p className="text-xs text-gray-500">
                                背景画像を含む各画像を差し替えできます。未設定の場合は現在の画像を使用します。
                            </p>
                        </div>
                    </div>
                    <div className="p-6 space-y-8">
                        {groups.map((group) => {
                            const groupItems = items.filter((item) =>
                                item.key.startsWith(`${group.key}.`) &&
                                !galleryKeys.includes(item.key),
                            );

                            return (
                                <section key={group.key}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {group.label}
                                        </h3>
                                        <span className="text-xs text-gray-400">
                                            {groupItems.length}件
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {groupItems.map((item) => (
                                            <div
                                                key={item.key}
                                                className="border border-gray-200 rounded-lg overflow-hidden"
                                            >
                                                <div className="aspect-[16/9] bg-gray-100">
                                                    {item.url ||
                                                    defaultImages[item.key] ? (
                                                        <img
                                                            src={
                                                                item.url ??
                                                                defaultImages[
                                                                    item.key
                                                                ]
                                                            }
                                                            alt={item.label}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                                            現在の画像を使用中
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {item.key}
                                                    </p>
                                                    <input
                                                        ref={(element) => {
                                                            inputs.current[
                                                                item.key
                                                            ] = element;
                                                        }}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        className="hidden"
                                                        onChange={(event) => {
                                                            const file =
                                                                event.target
                                                                    .files?.[0];
                                                            if (file)
                                                                void upload(
                                                                    item,
                                                                    file,
                                                                );
                                                            event.target.value =
                                                                "";
                                                        }}
                                                    />
                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                uploading ===
                                                                item.key
                                                            }
                                                            onClick={() =>
                                                                inputs.current[
                                                                    item.key
                                                                ]?.click()
                                                            }
                                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0a2105] text-white rounded-md text-xs disabled:opacity-50"
                                                        >
                                                            <Upload className="w-3.5 h-3.5" />
                                                            {uploading ===
                                                            item.key
                                                                ? "アップロード中"
                                                                : "画像を選択"}
                                                        </button>
                                                        {item.url && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    reset(item)
                                                                }
                                                                title="初期画像に戻す"
                                                                className="p-2 border border-gray-200 rounded-md text-gray-500 hover:text-red-600"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {group.key === "about" && (
                                        <section className="mt-8 border-t border-gray-200 pt-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    フォトギャラリー
                                                </h4>
                                                <span className="text-xs text-gray-400">
                                                    {gallery.length}件
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                                {gallery.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                                        onDragOver={(event) => {
                                                            event.preventDefault();
                                                            event.dataTransfer.dropEffect =
                                                                "move";
                                                        }}
                                                        onDrop={(event) => {
                                                            event.preventDefault();
                                                            const draggedId =
                                                                Number(
                                                                    event.dataTransfer.getData(
                                                                        "text/plain",
                                                                    ),
                                                                );
                                                            if (
                                                                Number.isSafeInteger(
                                                                    draggedId,
                                                                )
                                                            ) {
                                                                void reorderGallery(
                                                                    draggedId,
                                                                    item.id,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className="relative aspect-[16/9] bg-gray-100">
                                                            {item.url ||
                                                            (item.fallbackKey
                                                                ? defaultImages[
                                                                      item.fallbackKey
                                                                  ]
                                                                : undefined) ? (
                                                                <img
                                                                    src={
                                                                        item.url ??
                                                                        (item.fallbackKey
                                                                            ? defaultImages[
                                                                                  item.fallbackKey
                                                                              ]
                                                                            : undefined)
                                                                    }
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                                                    現在の画像を使用中
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                draggable={
                                                                    galleryBusy ===
                                                                    null
                                                                }
                                                                onDragStart={(
                                                                    event,
                                                                ) => {
                                                                    event.dataTransfer.effectAllowed =
                                                                        "move";
                                                                    event.dataTransfer.setData(
                                                                        "text/plain",
                                                                        String(
                                                                            item.id,
                                                                        ),
                                                                    );
                                                                }}
                                                                title="ドラッグして並び替え"
                                                                aria-label={`${item.title}をドラッグして並び替え`}
                                                                className="absolute left-2 top-2 rounded bg-white/90 p-1 text-gray-700 shadow cursor-grab active:cursor-grabbing"
                                                            >
                                                                <GripVertical className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                        <div className="p-4">
                                                            <label className="block text-xs text-gray-600">
                                                                画像タイトル
                                                                <input
                                                                    value={item.title}
                                                                    maxLength={255}
                                                                    onChange={(event) =>
                                                                        setGallery((current) =>
                                                                            current.map((entry) =>
                                                                                entry.id === item.id
                                                                                    ? { ...entry, title: event.target.value }
                                                                                    : entry,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                                />
                                                            </label>
                                                            <input
                                                                ref={(element) => {
                                                                    galleryInputs.current[item.id] =
                                                                        element;
                                                                }}
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                                className="hidden"
                                                                onChange={(event) => {
                                                                    const file =
                                                                        event.target.files?.[0];
                                                                    if (file)
                                                                        void uploadGalleryImage(
                                                                            item,
                                                                            file,
                                                                        );
                                                                    event.target.value = "";
                                                                }}
                                                            />
                                                            <div className="mt-3 flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        galleryBusy !== null ||
                                                                        !item.title.trim()
                                                                    }
                                                                    onClick={() =>
                                                                        void saveGalleryTitle(item)
                                                                    }
                                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-xs disabled:opacity-50"
                                                                >
                                                                    タイトルを保存
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={galleryBusy !== null}
                                                                    onClick={() =>
                                                                        galleryInputs.current[
                                                                            item.id
                                                                        ]?.click()
                                                                    }
                                                                    className="flex-1 px-3 py-2 bg-[#0a2105] text-white rounded-md text-xs disabled:opacity-50"
                                                                >
                                                                    画像を変更
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={galleryBusy !== null}
                                                                    onClick={() =>
                                                                        void deleteGalleryItem(item)
                                                                    }
                                                                    className="px-3 py-2 border border-gray-200 rounded-md text-xs text-red-600 disabled:opacity-50"
                                                                >
                                                                    削除
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="border border-dashed border-gray-300 rounded-lg p-4">
                                                    <label className="block text-xs text-gray-600">
                                                        画像タイトル
                                                        <input
                                                            value={newGalleryTitle}
                                                            maxLength={255}
                                                            onChange={(event) =>
                                                                setNewGalleryTitle(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                        />
                                                    </label>
                                                    <input
                                                        ref={newGalleryInput}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        onChange={(event) =>
                                                            setNewGalleryImage(
                                                                event.target.files?.[0] ??
                                                                    null,
                                                            )
                                                        }
                                                        className="mt-3 block w-full text-xs"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            galleryBusy !== null ||
                                                            !newGalleryTitle.trim() ||
                                                            !newGalleryImage
                                                        }
                                                        onClick={() =>
                                                            void createGalleryItem()
                                                        }
                                                        className="mt-3 w-full px-3 py-2 bg-[#0a2105] text-white rounded-md text-xs disabled:opacity-50"
                                                    >
                                                        ギャラリーブロックを追加
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
