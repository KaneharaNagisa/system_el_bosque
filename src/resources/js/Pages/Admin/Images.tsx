import { useRef, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
import AdminLayout from "../../Components/Admin/Layout";

interface ImageAsset {
    key: string;
    label: string;
    url: string | null;
}

export default function Images({ images }: { images: ImageAsset[] }) {
    const [items, setItems] = useState(images);
    const [uploading, setUploading] = useState<string | null>(null);
    const inputs = useRef<Record<string, HTMLInputElement | null>>({});

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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6">
                        {items.map((item) => (
                            <div
                                key={item.key}
                                className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <div className="aspect-[16/9] bg-gray-100">
                                    {item.url ? (
                                        <img
                                            src={item.url}
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
                                            inputs.current[item.key] = element;
                                        }}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0];
                                            if (file) void upload(item, file);
                                            event.target.value = "";
                                        }}
                                    />
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            disabled={uploading === item.key}
                                            onClick={() =>
                                                inputs.current[
                                                    item.key
                                                ]?.click()
                                            }
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0a2105] text-white rounded-md text-xs disabled:opacity-50"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            {uploading === item.key
                                                ? "アップロード中"
                                                : "画像を選択"}
                                        </button>
                                        {item.url && (
                                            <button
                                                type="button"
                                                onClick={() => reset(item)}
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
                </div>
            </div>
        </AdminLayout>
    );
}
