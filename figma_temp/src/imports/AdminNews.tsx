import React, { useState } from "react";
import { useNavigate } from "react-router";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Bell,
  Search,
  Edit2,
  Trash2,
  Plus,
  Eye,
  UsersRound,
  Filter,
  X,
  Languages,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";
import { toast } from "sonner@2.0.3";
import { initialGroups } from "../data/groupData";
import {
  mockMembers,
  filterMembersByFlexibleCondition,
} from "../data/memberData";

interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
  isMemberOnly: boolean;
  createdAt: string;
  // グループとの紐づけ（任意）
  groupIds?: string[];
  // 英語文（任意）
  titleEn?: string;
  contentEn?: string;
}

// モックお知らせデータ
const initialNews: News[] = [
  {
    id: "news-001",
    title: "新野の盆踊りアプリをリリースしました",
    content:
      "新野の盆踊りの唄を楽しく学べるアプリをリリースしました。ゲームで楽しみながら唄を覚えましょう！",
    date: "2026-01-20",
    isImportant: true,
    isMemberOnly: false,
    createdAt: "2026-01-20",
  },
  {
    id: "news-002",
    title: "2026年の盆踊り開催日程について",
    content:
      "2026年8月14日（木）〜16日（土）の3日間、新野の盆踊りを開催します。今年も皆様のご参加をお待ちしております。",
    date: "2026-01-15",
    isImportant: true,
    isMemberOnly: false,
    createdAt: "2026-01-15",
  },
  {
    id: "news-003",
    title: "メンバー限定コンテンツを追加しました",
    content:
      "メンバー登録いただいた方限定で、盆踊りの歴史や詳しい解説をご覧いただけるようになりました。",
    date: "2026-01-10",
    isImportant: false,
    isMemberOnly: true,
    createdAt: "2026-01-10",
  },
  {
    id: "news-004",
    title: "子ども向け盆踊り教室を催します",
    content:
      "15歳以下のお子様を対象に、盆踊りの基礎から楽しくべる教室を開催します。初心者大歓迎！お気軽にご参加ください。",
    date: "2026-01-08",
    isImportant: false,
    isMemberOnly: true,
    createdAt: "2026-01-08",
    groupIds: ["group-001"], // 子ども向け
  },
  {
    id: "news-005",
    title: "県外の方へ：宿泊施設のご案内",
    content:
      "県外からお越しの皆様へ、盆踊り期間中の宿泊施設をご案内いたします。早めのご予約をお勧めします。",
    date: "2026-01-05",
    isImportant: false,
    isMemberOnly: true,
    createdAt: "2026-01-05",
    groupIds: ["group-002"], // 県外の方へ
  },
  {
    id: "news-006",
    title: "海外の方へ：英語ガイド付きツアーのご案内",
    content:
      "海外からお越しの皆様へ、英語ガイド付きの特別ツアーをご用意しました。新野の盆踊りの歴史や文化を詳しくご紹介します。",
    date: "2026-01-03",
    isImportant: false,
    isMemberOnly: true,
    createdAt: "2026-01-03",
    groupIds: ["group-003"], // 海外の方へ
  },
  {
    id: "news-007",
    title: "上級者向け：音頭取り体験ワークショップ",
    content:
      "盆踊りに10回以上参加された上級者の皆様へ、音頭取り体験ワークショップを開催します。伝統の技を学びましょう。",
    date: "2026-01-01",
    isImportant: false,
    isMemberOnly: true,
    createdAt: "2026-01-01",
    groupIds: ["group-005"], // 上級者向け
  },
];

// React Quillのツールバー設定
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }], // 見出し選択
    [{ size: ["small", false, "large", "huge"] }], // 文字サイズ調整
    ["bold", "italic", "underline"], // 太字、斜体、下線
    [{ list: "ordered" }, { list: "bullet" }], // リスト
    [{ color: [] }, { background: [] }], // 文字色・背景色
    ["link", "image"], // リンク・画像挿入
    ["clean"], // 書式をクリア
  ],
};

const quillFormats = [
  "header",
  "size",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "color",
  "background",
  "link",
  "image",
];

export default function AdminNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>(initialNews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<News | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  // 管理画面モードの設定（Portal対応）
  React.useEffect(() => {
    document.body.setAttribute("data-admin", "true");
    return () => {
      document.body.removeAttribute("data-admin");
    };
  }, []);

  // フィルター用ステート
  const [filterCategory, setFilterCategory] = useState<
    "all" | "public" | "member"
  >("all");
  const [filterGroupId, setFilterGroupId] =
    useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [formData, setFormData] = useState<
    Omit<News, "id" | "createdAt">
  >({
    title: "",
    content: "",
    date: "",
    isImportant: false,
    isMemberOnly: false,
    groupIds: [],
    titleEn: "",
    contentEn: "",
  });

  const filteredNews = news.filter((item) => {
    // テキスト検索
    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // 区分フィルター
    const matchesCategory =
      filterCategory === "all" ||
      (filterCategory === "public" && !item.isMemberOnly) ||
      (filterCategory === "member" && item.isMemberOnly);

    // グループフィルター
    let matchesGroup = true;
    if (filterGroupId !== "all") {
      if (filterGroupId === "no-group") {
        // グループ未指定 → メンバー限定 かつ groupIds が空またはundefined
        matchesGroup =
          item.isMemberOnly &&
          (!item.groupIds || item.groupIds.length === 0);
      } else {
        // 特定グループ → groupIds に含まれているか
        matchesGroup =
          item.groupIds?.includes(filterGroupId) || false;
      }
    }

    // 公開日フィルター（期間指定）
    let matchesDate = true;
    if (filterDateFrom && item.date < filterDateFrom) {
      matchesDate = false;
    }
    if (filterDateTo && item.date > filterDateTo) {
      matchesDate = false;
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesGroup &&
      matchesDate
    );
  });

  // 配信数を計算する関数
  const calculateDeliveryCount = (newsItem: News): string => {
    // 一般公開場合
    if (!newsItem.isMemberOnly) {
      return "-";
    }

    // メンバー限定 × グループ未指定の場合 → 全メンバー
    if (!newsItem.groupIds || newsItem.groupIds.length === 0) {
      return `${mockMembers.length}人`;
    }

    // メンバー限定 × グループ指定ありの場合 → グループ条件でフィルタリング
    // 複数グループの場合は、いずれかのグループに該当するメンバー（OR条件）
    const targetMemberIds = new Set<string>();

    newsItem.groupIds.forEach((groupId) => {
      const group = initialGroups.find((g) => g.id === groupId);
      if (group && group.flexibleFilterCondition) {
        const filteredMembers =
          filterMembersByFlexibleCondition(
            mockMembers,
            group.flexibleFilterCondition,
          );
        filteredMembers.forEach((member) =>
          targetMemberIds.add(member.id),
        );
      }
    });

    return `${targetMemberIds.size}人`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "タイトルを入力してください";
    }
    if (!formData.content.trim()) {
      newErrors.content = "本文を入力してください";
    }
    if (!formData.date) {
      newErrors.date = "公開日を選択してください";
    }
    if (!formData.titleEn || !formData.titleEn.trim()) {
      newErrors.titleEn = "英語タイトルを入力してください";
    }
    if (!formData.contentEn || !formData.contentEn.trim()) {
      newErrors.contentEn = "英語本文を入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddDialog = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      title: "",
      content: "",
      date: today,
      isImportant: false,
      isMemberOnly: false,
      groupIds: [],
      titleEn: "",
      contentEn: "",
    });
    setErrors({});
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (newsItem: News) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      date: newsItem.date,
      isImportant: newsItem.isImportant,
      isMemberOnly: newsItem.isMemberOnly,
      groupIds: newsItem.groupIds || [],
      titleEn: newsItem.titleEn || "",
      contentEn: newsItem.contentEn || "",
    });
    setErrors({});
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (isEditMode && selectedNews) {
      const updatedNews = news.map((item) =>
        item.id === selectedNews.id
          ? { ...item, ...formData }
          : item,
      );
      setNews(updatedNews);
      toast.success("お知らせを更新しました");
    } else {
      const newNews: News = {
        id: `news-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setNews([newNews, ...news]);
      toast.success("新しいお知らせを作成しました");
    }
    setIsDialogOpen(false);
  };

  const handleOpenDeleteDialog = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedNews) return;

    const updatedNews = news.filter(
      (item) => item.id !== selectedNews.id,
    );
    setNews(updatedNews);
    setIsDeleteDialogOpen(false);
    toast.success("お知らせを削除しました");
  };

  const handleOpenPreviewDialog = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsPreviewDialogOpen(true);
  };

  // 翻訳機能（AI実装）
  const handleTranslate = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      toast.error("日本語のタイトルまたは本文を入力してください");
      return;
    }

    // ローディング通知
    const loadingToast = toast.loading("AIで翻訳中...");

    try {
      // HTMLタグを除去してプレーンテキストに変換
      const stripHtml = (html: string): string => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      const plainTitle = stripHtml(formData.title).trim();
      const plainContent = stripHtml(formData.content).trim();

      console.log("翻訳開始:", { plainTitle, plainContent });

      // OpenAI API を使用して翻訳
      // 注意: 本番環境では、APIキーはバックエンドで管理してください
      const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // 実際のAPIキーに置き換えてください
      
      const translateWithAI = async (text: string): Promise<string> => {
        if (!text) return "";
        
        // 実際のAPI呼び出しの場合
        if (OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY_HERE") {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a professional translator specializing in Japanese to English translation. Translate the following Japanese text to natural, fluent English. Maintain the tone and meaning of the original text."
                },
                {
                  role: "user",
                  content: text
                }
              ],
              temperature: 0.3,
            }),
          });

          if (!response.ok) {
            throw new Error("翻訳APIの呼び出しに失敗しました");
          }

          const data = await response.json();
          return data.choices[0].message.content.trim();
        } else {
          // モック翻訳（APIキーが設定されていない場合）
          // デモ用の簡易翻訳辞書
          const mockTranslations: Record<string, string> = {
            "新野の盆踊りアプリをリリースしました": "We have released the Niino Bon-Odori App",
            "メンバー限定コンテンツを追加しました": "Added Member-Only Content",
            "2026年の盆踊り開催日程について": "About the 2026 Bon-Odori Schedule",
            "子ども向け盆踊り教室を催します": "We will hold a Bon-Odori class for children",
            "県外の方へ：宿泊施設のご案内": "For visitors from outside the prefecture: Accommodation information",
            "海外の方へ：英語ガイド付きツアーのご案内": "For international visitors: Guided tour in English",
            "上級者向け：音頭取り体験ワークショップ": "For advanced participants: Ondo-tori experience workshop",
            "メンバー登録いただいた方限定で、盆踊りの歴史や詳しい解説をご覧いただけるようになりました。": 
              "Members can now view the history of Bon-Odori and detailed explanations.",
            "新野の盆踊りの唄を楽しく学べるアプリをリリースしました。ゲームで楽しみながら唄を覚えましょう！":
              "We have released an app where you can enjoy learning the songs of Niino Bon-Odori. Learn the songs while having fun with games!",
            "2026年8月14日木）〜16日（土）の3日間、新野の盆踊りを開催します。今年も皆様のご参加をお待ちしております。":
              "Niino Bon-Odori will be held for three days from Thursday, August 14 to Saturday, August 16, 2026. We look forward to your participation this year.",
            "15歳以下のお子様を対象に、盆踊りの基礎から楽しくべる教室を開催します。初心者大歓迎！お気軽にご参加ください。":
              "We will hold a class where children aged 15 and under can learn the basics of Bon-Odori in a fun way. Beginners are welcome! Please feel free to join us.",
            "県外からお越しの皆様へ、盆踊り期間中の宿泊施設をご案内いたします。早めのご予約をお勧めします。":
              "For those coming from outside the prefecture, we will introduce accommodation during the Bon-Odori period. We recommend making reservations early.",
            "海外からお越しの皆様へ、英語ガイド付きの特別ツアーをご用意しました。新野の盆踊りの歴史や文化を詳しくご紹介します。":
              "For international visitors, we have prepared a special guided tour in English. We will introduce the history and culture of Niino Bon-Odori in detail.",
            "盆踊りに10回以上参加された上級者の皆様へ、音頭取り体験ワークショップを開催します。伝統の技を学びましょう。":
              "For advanced participants who have attended Bon-Odori 10 times or more, we will hold an Ondo-tori experience workshop. Learn traditional techniques.",
          };

          // 完全一致チェック
          if (mockTranslations[text]) {
            return mockTranslations[text];
          }

          // 簡易的な単語置換
          let translated = text
            .replace(/新野の盆踊り/g, "Niino Bon-Odori")
            .replace(/盆踊り/g, "Bon-Odori")
            .replace(/新野/g, "Niino")
            .replace(/お知らせ/g, "Announcement")
            .replace(/アプリ/g, "App")
            .replace(/メンバー/g, "Member")
            .replace(/限定/g, "Only")
            .replace(/コンテンツ/g, "Content")
            .replace(/追加/g, "Added")
            .replace(/開催/g, "Event")
            .replace(/日程/g, "Schedule");

          return translated;
        }
      };

      // タイトルと本文を並列で翻訳
      let translatedTitle = "";
      let translatedContent = "";
      
      if (plainTitle) {
        console.log("タイトル翻訳開始:", plainTitle);
        translatedTitle = await translateWithAI(plainTitle);
        console.log("タイトル翻訳結果:", translatedTitle);
      }
      
      if (plainContent) {
        console.log("本文翻訳開始:", plainContent);
        translatedContent = await translateWithAI(plainContent);
        console.log("本文翻訳結果:", translatedContent);
      }

      console.log("最終翻訳結果:", { translatedTitle, translatedContent });

      // 翻訳結果をフォームに設定
      const newFormData = {
        ...formData,
        titleEn: translatedTitle,
        contentEn: translatedContent,
      };
      
      console.log("設定する新しいフォームデータ:", newFormData);
      setFormData(newFormData);

      toast.dismiss(loadingToast);
      toast.success("翻訳が完了しました");
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Translation error:", error);
      toast.error("翻訳に失敗しました。もう一度お試しください。");
    }
  };

  const handleNavigate = (
    page:
      | "dashboard"
      | "members"
      | "accounts"
      | "master-stages"
      | "master-songs"
      | "master-sound-categories"
      | "master-sounds"
      | "master-survey-options"
      | "news"
      | "groups"
      | "pages",
  ) => {
    if (page === "dashboard") {
      navigate("/admin/dashboard");
    }
    if (page === "members") {
      navigate("/admin/members");
    }
    if (page === "accounts") {
      navigate("/admin/accounts");
    }
    if (page === "master-stages") {
      navigate("/admin/master/stages");
    }
    if (page === "master-songs") {
      navigate("/admin/master/songs");
    }
    if (page === "master-sound-categories") {
      navigate("/admin/master/sound-categories");
    }
    if (page === "master-sounds") {
      navigate("/admin/master/sounds");
    }
    if (page === "master-survey-options") {
      navigate("/admin/master/survey-options");
    }
    if (page === "groups") {
      navigate("/admin/groups");
    }
    if (page === "pages") {
      navigate("/admin/pages");
    }
    // news は現在の画面なので何もしない
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      <AdminSidebar
        currentPage="news"
        isCollapsed={isSidebarCollapsed}
        onToggle={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
        onNavigate={handleNavigate}
      />

      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64",
        )}
      >
        <header className="border-b border-border bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">
                  お知らせ管理
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  お知らせ管理
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>お知らせ一覧</CardTitle>
                    <CardDescription>
                      登録お知らせ数: {news.length}件 |
                      検索結果: {filteredNews.length}件
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={handleOpenAddDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規お知らせ作成
                </Button>
              </div>

              {/* フィルターエリア */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    絞り込み
                  </h3>
                </div>

                {/* 検索ボックス */}
                <div className="mb-4">
                  <Label
                    htmlFor="searchQuery"
                    className="text-xs text-gray-700 mb-1"
                  >
                    タイトル、本文で検索
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="searchQuery"
                      placeholder=""
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 区分フィルター */}
                  <div>
                    <Label
                      htmlFor="filterCategory"
                      className="text-xs text-gray-700 mb-1"
                    >
                      区分
                    </Label>
                    <select
                      id="filterCategory"
                      value={filterCategory}
                      onChange={(e) =>
                        setFilterCategory(
                          e.target.value as
                            | "all"
                            | "public"
                            | "member",
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="public">一般</option>
                      <option value="member">メンバー</option>
                    </select>
                  </div>

                  {/* グループフィルター */}
                  <div>
                    <Label
                      htmlFor="filterGroup"
                      className="text-xs text-gray-700 mb-1"
                    >
                      グループ
                    </Label>
                    <select
                      id="filterGroup"
                      value={filterGroupId}
                      onChange={(e) =>
                        setFilterGroupId(e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="no-group">
                        グループ未指定
                      </option>
                      {initialGroups
                        .filter(
                          (g) => g.isActive && !g.isDeleted,
                        )
                        .map((group) => (
                          <option
                            key={group.id}
                            value={group.id}
                          >
                            {group.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* 公開日（From） */}
                  <div>
                    <Label
                      htmlFor="filterDateFrom"
                      className="text-xs text-gray-700 mb-1"
                    >
                      公開日（開始）
                    </Label>
                    <Input
                      id="filterDateFrom"
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) =>
                        setFilterDateFrom(e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* 公開日（To） */}
                  <div>
                    <Label
                      htmlFor="filterDateTo"
                      className="text-xs text-gray-700 mb-1"
                    >
                      公開日（終了）
                    </Label>
                    <Input
                      id="filterDateTo"
                      type="date"
                      value={filterDateTo}
                      onChange={(e) =>
                        setFilterDateTo(e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* リセットボタン */}
                {(filterCategory !== "all" ||
                  filterGroupId !== "all" ||
                  filterDateFrom ||
                  filterDateTo) && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFilterCategory("all");
                        setFilterGroupId("all");
                        setFilterDateFrom("");
                        setFilterDateTo("");
                      }}
                      className="bg-white text-gray-700 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 mr-1" />
                      絞り込みをリセット
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>公開日</TableHead>
                    <TableHead>タイトル</TableHead>
                    <TableHead>区分</TableHead>
                    <TableHead>配信対象</TableHead>
                    <TableHead className="text-center">
                      配信数
                    </TableHead>
                    <TableHead className="text-right">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.length > 0 ? (
                    filteredNews
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((newsItem) => (
                        <TableRow
                          key={newsItem.id}
                          className="hover:bg-transparent"
                        >
                          <TableCell className="font-medium">
                            {newsItem.date}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {newsItem.isImportant && (
                                <Badge className="bg-red-600 text-white">
                                  重要
                                </Badge>
                              )}
                              <span>{newsItem.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {newsItem.isMemberOnly ? (
                              <Badge className="bg-amber-100 text-amber-800">
                                メンバー
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">
                                一般
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {newsItem.isMemberOnly ? (
                              newsItem.groupIds &&
                              newsItem.groupIds.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {newsItem.groupIds.map(
                                    (groupId) => {
                                      const group =
                                        initialGroups.find(
                                          (g) =>
                                            g.id === groupId,
                                        );
                                      return group ? (
                                        <Badge
                                          key={groupId}
                                          className="bg-teal-100 text-teal-800 text-xs"
                                        >
                                          <UsersRound className="w-3 h-3 mr-1" />
                                          {group.name}
                                        </Badge>
                                      ) : null;
                                    },
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  全メンバー
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-gray-400">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-medium text-gray-700">
                              {calculateDeliveryCount(newsItem)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenPreviewDialog(
                                    newsItem,
                                  )
                                }
                                className="bg-white text-gray-900 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                詳細
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenEditDialog(newsItem)
                                }
                                className="bg-white text-gray-900 hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                編集
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenDeleteDialog(
                                    newsItem,
                                  )
                                }
                                className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        該当するお知らせが見つかりませんでした
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>

        {/* Edit/Add Dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {isEditMode
                  ? "お知らせ編集"
                  : "新規お知らせ作成"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                お知らせの情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* 日本語セクション */}
              <div className="border-b pb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  日本語
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">
                      タイトル{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
                      }
                      placeholder="例: 新野の盆踊りアプリをリリースしました"
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="content">
                      本文{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <ReactQuill
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: e,
                        })
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      className="mt-1"
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 翻訳ボタン */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleTranslate}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  size="lg"
                >
                  <Languages className="w-5 h-5 mr-2" />
                  日本語を英語に翻訳
                </Button>
              </div>

              {/* 英語セクション */}
              <div className="border-b pb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  英語
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titleEn">
                      英語タイトル{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="titleEn"
                      value={formData.titleEn || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleEn: e.target.value,
                        })
                      }
                      placeholder="例: Niino Bon-Odori App Released"
                      className="mt-1"
                    />
                    {errors.titleEn && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.titleEn}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contentEn">
                      英語本文{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <ReactQuill
                      id="contentEn"
                      value={formData.contentEn || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contentEn: e,
                        })
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      className="mt-1"
                    />
                    {errors.contentEn && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.contentEn}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* その他設定セクション */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  その他設定
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">
                      公開日{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                    {errors.date && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isImportant}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isImportant: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        重要なお知らせとして表示
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isMemberOnly}
                        onChange={(e) => {
                          const isMemberOnly = e.target.checked;
                          // メンバー限定をOFFにした場合、グループ紐づけもクリア
                          setFormData({
                            ...formData,
                            isMemberOnly,
                            groupIds: isMemberOnly
                              ? formData.groupIds
                              : [],
                          });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        メンバー限定のお知らせにする
                      </span>
                    </label>
                  </div>

                  {/* グループとの紐づけ（任意）- メンバー限定の場合のみ表示 */}
                  {formData.isMemberOnly && (
                    <div className="border-t pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <UsersRound className="w-5 h-5 text-teal-600" />
                        <Label className="text-base font-semibold">
                          特定グループの配信（任意）
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        特定のグループに絞って配信する場合は、下記からグループを選択してください。未選択の場合は、すべてのメンバーに配信されます。
                      </p>

                      {/* 活動中のグループのみ表示 */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {initialGroups.filter(
                          (g) => g.isActive && !g.isDeleted,
                        ).length > 0 ? (
                          initialGroups
                            .filter(
                              (g) => g.isActive && !g.isDeleted,
                            )
                            .map((group) => (
                              <div
                                key={group.id}
                                className="flex items-start gap-2"
                              >
                                <Checkbox
                                  id={`group-${group.id}`}
                                  checked={
                                    formData.groupIds?.includes(
                                      group.id,
                                    ) || false
                                  }
                                  onCheckedChange={(
                                    checked,
                                  ) => {
                                    const currentGroups =
                                      formData.groupIds || [];
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        groupIds: [
                                          ...currentGroups,
                                          group.id,
                                        ],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        groupIds:
                                          currentGroups.filter(
                                            (id) =>
                                              id !== group.id,
                                          ),
                                      });
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`group-${group.id}`}
                                    className="text-sm cursor-pointer font-normal"
                                  >
                                    {group.name}
                                  </Label>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {group.description}
                                  </p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            活動中のグループがありません
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditMode ? "更新" : "作成"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                お知らせ詳細
              </DialogTitle>
              <DialogDescription className="sr-only">お知らせの詳細情報を表示しています</DialogDescription>
            </DialogHeader>
            {selectedNews && (
              <div className="space-y-6 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedNews.isImportant && (
                      <Badge className="bg-red-600 text-white">
                        重要
                      </Badge>
                    )}
                    {selectedNews.isMemberOnly ? (
                      <Badge className="bg-amber-100 text-amber-800">
                        メンバー
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        一般
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {selectedNews.date}
                    </span>
                  </div>
                </div>

                {/* 日本語セクション */}
                <div className="border-b pb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    日本語
                  </h3>
                  <h2 className="text-xl font-bold mb-3">
                    {selectedNews.title}
                  </h2>
                  <div
                    className="text-gray-700 prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedNews.content,
                    }}
                  />
                </div>

                {/* 英語セクション */}
                {(selectedNews.titleEn ||
                  selectedNews.contentEn) && (
                  <div className="border-b pb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">
                      英語
                    </h3>
                    {selectedNews.titleEn && (
                      <h2 className="text-xl font-bold mb-3">
                        {selectedNews.titleEn}
                      </h2>
                    )}
                    {selectedNews.contentEn && (
                      <div
                        className="text-gray-700 prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: selectedNews.contentEn,
                        }}
                      />
                    )}
                  </div>
                )}

                {/* グループ紐づけ情報 */}
                {selectedNews.groupIds &&
                  selectedNews.groupIds.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <UsersRound className="w-4 h-4 text-teal-600" />
                        <h3 className="font-semibold text-sm text-gray-900">
                          配信対象グループ
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {selectedNews.groupIds.map(
                          (groupId) => {
                            const group = initialGroups.find(
                              (g) => g.id === groupId,
                            );
                            return group ? (
                              <div
                                key={groupId}
                                className="flex items-start gap-2 bg-gray-50 p-3 rounded"
                              >
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {group.name}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {group.description}
                                  </p>
                                </div>
                              </div>
                            ) : null;
                          },
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        ※このお知らせは、上記グループに該当するメンバーにのみ表示されます
                      </p>
                    </div>
                  )}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsPreviewDialogOpen(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                閉じる
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent className="max-w-md bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                お知らせの削除
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                このお知らせを削除してもよろしいですか？
              </DialogDescription>
            </DialogHeader>
            {selectedNews && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      タイトル:
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedNews.title}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      公開日:
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedNews.date}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}