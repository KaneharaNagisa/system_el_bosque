import React, { useState } from "react";
import { useNavigate } from "react-router";
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
import {
  FileText,
  Search,
  Edit2,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";
import { toast } from "sonner@2.0.3";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

interface Page {
  id: string;
  title: string;
  titleEnglish: string;
  slug: string;
  content: string;
  contentEnglish: string;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
}

// モック固定ページデータ
const initialPages: Page[] = [
  {
    id: "page-001",
    title: "利用規約",
    titleEnglish: "Terms of Service",
    slug: "terms",
    content:
      "第1条（目的）\nこの利用規約（以下、「本規約」といいます。）は、新野の盆踊りアプリ（以下、「本サービス」といいます。）の利用条件を定めるものです。\n\n第2条（利用登録）\n本サービスの利用を希望する方は、本規約に同意の上、当サイトの定める方法によって利用登録を申請し、当サイトがこれを承認することによって、利用登録が完了するものとします。",
    contentEnglish:
      "Article 1 (Purpose)\nThese Terms of Service (hereinafter referred to as 'these Terms') set forth the terms and conditions for use of the Niino Bon Odori App (hereinafter referred to as 'this Service').\n\nArticle 2 (User Registration)\nThose who wish to use this Service shall apply for user registration in the manner prescribed by this Site with their consent to these Terms, and user registration shall be completed when this Site approves the application.",
    isPublished: true,
    updatedAt: "2026-01-15",
    createdAt: "2024-01-01",
  },
  {
    id: "page-002",
    title: "プライバシーポリシー",
    titleEnglish: "Privacy Policy",
    slug: "privacy",
    content:
      "新野の盆踊りアプリ（以下、「当アプリ」といいます。）は、ご利用者様の個人情報の保護について、以下のとおりプライバシーポリシーを定めます。\n\n第1条（個人情報）\n「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。",
    contentEnglish:
      "The Niino Bon Odori App (hereinafter referred to as 'this App') establishes the following Privacy Policy regarding the protection of users' personal information.\n\nArticle 1 (Personal Information)\n'Personal Information' refers to 'personal information' as defined in the Personal Information Protection Act, which is information about living individuals that can identify a specific individual through the name, date of birth, address, telephone number, contact information, or other descriptions contained in such information.",
    isPublished: true,
    updatedAt: "2026-01-10",
    createdAt: "2024-01-01",
  },
  {
    id: "page-003",
    title: "新野の盆踊りについて",
    titleEnglish: "About Niino Bon Odori",
    slug: "about",
    content:
      "新野の盆踊りは、長野県阿南町新野地区に伝わる伝統的な盆踊りです。国の重要無形民俗文化財に指定されており、毎年8月14日から16日の3日間、夜通し踊り続けられます。\n\n歴史：\n新野の盆踊りの起源は定かではありませんが、少なくとも400年以上の歴史があると言われています。",
    contentEnglish:
      "The Niino Bon Odori is a traditional Bon dance passed down in the Niino district of Anan Town, Nagano Prefecture. It is designated as an Important Intangible Folk Cultural Property of Japan and is performed throughout the night for three days from August 14th to 16th every year.\n\nHistory:\nThe origin of the Niino Bon Odori is not clear, but it is said to have a history of at least 400 years.",
    isPublished: true,
    updatedAt: "2026-01-05",
    createdAt: "2024-01-01",
  },
  {
    id: "page-004",
    title: "お問い合わせ",
    titleEnglish: "Contact Us",
    slug: "contact",
    content:
      "新野の盆踊りアプリに関するお問い合わせは、以下のフォームよりお願いいたします。\n\n【お問い合わせ先】\nメール: info@niino-bonodori.jp\n電話: 0260-XX-XXXX\n受付時間: 平日 9:00～17:00",
    contentEnglish:
      "For inquiries about the Niino Bon Odori App, please use the form below.\n\n[Contact Information]\nEmail: info@niino-bonodori.jp\nPhone: 0260-XX-XXXX\nOffice Hours: Weekdays 9:00-17:00",
    isPublished: false,
    updatedAt: "2025-12-20",
    createdAt: "2024-02-01",
  },
];

export default function AdminPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<Page | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] =
    useState(false);

  // 管理画面モードの設定（Portal対応）
  React.useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    return () => {
      document.body.removeAttribute('data-admin');
    };
  }, []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  const [formData, setFormData] = useState<
    Omit<Page, "id" | "createdAt" | "updatedAt">
  >({
    title: "",
    titleEnglish: "",
    slug: "",
    content: "",
    contentEnglish: "",
    isPublished: false,
  });

  const filteredPages = pages.filter(
    (page) =>
      page.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      page.slug
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      page.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "ページタイトルを入力してください";
    }
    if (!formData.titleEnglish.trim()) {
      newErrors.titleEnglish =
        "ページタイトル（英語）を入力してください";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "スラッグを入力してください";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "スラッグは英小文字、数字、ハイフンのみ使用できます";
    }
    if (!formData.content.trim()) {
      newErrors.content = "本文を入力してください";
    }
    if (!formData.contentEnglish.trim()) {
      newErrors.contentEnglish =
        "本文（英語）を入力してください";
    }

    // スラッグの重複チェック
    if (formData.slug.trim()) {
      const duplicatePage = pages.find(
        (page) =>
          page.slug === formData.slug &&
          (!isEditMode ||
            (selectedPage && page.id !== selectedPage.id)),
      );
      if (duplicatePage) {
        newErrors.slug = "このスラッグは既に使用されています";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddDialog = () => {
    setFormData({
      title: "",
      titleEnglish: "",
      slug: "",
      content: "",
      contentEnglish: "",
      isPublished: false,
    });
    setErrors({});
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      titleEnglish: page.titleEnglish,
      slug: page.slug,
      content: page.content,
      contentEnglish: page.contentEnglish,
      isPublished: page.isPublished,
    });
    setErrors({});
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString().split("T")[0];

    if (isEditMode && selectedPage) {
      const updatedPages = pages.map((page) =>
        page.id === selectedPage.id
          ? { ...page, ...formData, updatedAt: now }
          : page,
      );
      setPages(updatedPages);
      toast.success("ページ情報を更新しました");
    } else {
      const newPage: Page = {
        id: `page-${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setPages([...pages, newPage]);
      toast.success("新しいページを作成しました");
    }
    setIsDialogOpen(false);
  };

  const handleOpenDeleteDialog = (page: Page) => {
    setSelectedPage(page);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedPage) return;

    const updatedPages = pages.filter(
      (page) => page.id !== selectedPage.id,
    );
    setPages(updatedPages);
    setIsDeleteDialogOpen(false);
    toast.success("ページを削除しました");
  };

  const handleOpenPreviewDialog = (page: Page) => {
    setSelectedPage(page);
    setIsPreviewDialogOpen(true);
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
    if (page === "news") {
      navigate("/admin/news");
    }
    if (page === "groups") {
      navigate("/admin/groups");
    }
    // pages は現在の画面なので何もしない
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      <AdminSidebar
        currentPage="pages"
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
                  固定ページ管理
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  固定ページ管理
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
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>固定ページ一覧</CardTitle>
                    <CardDescription>
                      登録ページ数: {pages.length}件 | 検索結果:{" "}
                      {filteredPages.length}件
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={handleOpenAddDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規ページ作成
                </Button>
              </div>
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="タイトル、スラッグで検索..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>
                      ページタイトル（日本語）
                    </TableHead>
                    <TableHead>
                      ページタイトル（英語）
                    </TableHead>
                    <TableHead>スラッグ</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>更新日</TableHead>
                    <TableHead className="text-right">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.length > 0 ? (
                    filteredPages
                      .sort(
                        (a, b) =>
                          new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime(),
                      )
                      .map((page) => (
                        <TableRow
                          key={page.id}
                          className="hover:bg-transparent"
                        >
                          <TableCell className="font-medium">
                            {page.title}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {page.titleEnglish}
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                              /{page.slug}
                            </code>
                          </TableCell>
                          <TableCell>
                            {page.isPublished ? (
                              <Badge className="bg-green-100 text-green-800">
                                公開中
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                下書き
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {page.updatedAt}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenPreviewDialog(page)
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
                                  handleOpenEditDialog(page)
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
                                  handleOpenDeleteDialog(page)
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
                        該当する固定ページが見つかりませんでした
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {isEditMode
                  ? "固定ページ編集"
                  : "新規固定ページ作成"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                固定ページの情報を入力してください（日本語・英語両方必須）
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="japanese" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 h-auto p-1 rounded-lg">
                <TabsTrigger
                  value="japanese"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 hover:bg-blue-50 data-[state=active]:hover:bg-blue-700 transition-colors font-medium py-2.5"
                >
                  日本語
                </TabsTrigger>
                <TabsTrigger
                  value="english"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 hover:bg-blue-50 data-[state=active]:hover:bg-blue-700 transition-colors font-medium py-2.5"
                >
                  英語
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 hover:bg-blue-50 data-[state=active]:hover:bg-blue-700 transition-colors font-medium py-2.5"
                >
                  設定
                </TabsTrigger>
              </TabsList>

              {/* 日本語タブ */}
              <TabsContent
                value="japanese"
                className="space-y-4 mt-4"
              >
                <div>
                  <Label htmlFor="title">
                    ページタイトル{" "}
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
                    placeholder="例: 利用規約"
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
                    本文 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: e.target.value,
                      })
                    }
                    rows={16}
                    placeholder="ページの本文を入力してください"
                    className="mt-1 font-mono text-sm"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.content}
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* 英語タブ */}
              <TabsContent
                value="english"
                className="space-y-4 mt-4"
              >
                <div>
                  <Label htmlFor="titleEnglish">
                    ページタイトル（英語）{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titleEnglish"
                    value={formData.titleEnglish}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        titleEnglish: e.target.value,
                      })
                    }
                    placeholder="Example: Terms of Service"
                    className="mt-1"
                  />
                  {errors.titleEnglish && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.titleEnglish}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contentEnglish">
                    本文（英語）{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="contentEnglish"
                    value={formData.contentEnglish}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentEnglish: e.target.value,
                      })
                    }
                    rows={16}
                    placeholder="Enter the page content in English"
                    className="mt-1 font-mono text-sm"
                  />
                  {errors.contentEnglish && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.contentEnglish}
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* 設定タブ */}
              <TabsContent
                value="settings"
                className="space-y-4 mt-4"
              >
                <div>
                  <Label htmlFor="slug">
                    スラッグ{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="例: terms (英小文字、数字、ハイフンのみ)"
                    className="mt-1"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.slug}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    ※ページのURLになります（例: /terms）
                  </p>
                </div>

                <div>
                  <Label htmlFor="isPublished">状態</Label>
                  <div className="mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPublished: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">公開する</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      ※下書きのページはアプリから見えなくなります
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                固定ページ詳細
              </DialogTitle>
            </DialogHeader>
            {selectedPage && (
              <div className="py-4">
                <Tabs
                  defaultValue="japanese"
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-auto p-1 rounded-lg mb-6">
                    <TabsTrigger
                      value="japanese"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 hover:bg-blue-50 data-[state=active]:hover:bg-blue-700 transition-colors font-medium py-2.5"
                    >
                      日本語
                    </TabsTrigger>
                    <TabsTrigger
                      value="english"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-700 hover:bg-blue-50 data-[state=active]:hover:bg-blue-700 transition-colors font-medium py-2.5"
                    >
                      英語
                    </TabsTrigger>
                  </TabsList>

                  {/* 日本語タブ */}
                  <TabsContent
                    value="japanese"
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {selectedPage.isPublished ? (
                          <Badge className="bg-green-100 text-green-800">
                            公開中
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            下書き
                          </Badge>
                        )}
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                          /{selectedPage.slug}
                        </code>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">
                        {selectedPage.title}
                      </h2>
                      <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {selectedPage.content}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">
                            作成日:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedPage.createdAt}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">
                            更新日:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedPage.updatedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 英語タブ */}
                  <TabsContent
                    value="english"
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {selectedPage.isPublished ? (
                          <Badge className="bg-green-100 text-green-800">
                            公開中
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Draft
                          </Badge>
                        )}
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                          /{selectedPage.slug}
                        </code>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">
                        {selectedPage.titleEnglish}
                      </h2>
                      <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {selectedPage.contentEnglish}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">
                            作成日:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedPage.createdAt}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">
                            更新日:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedPage.updatedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
                固定ページの削除
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                この固定ページを削除してもよろしいですか？
              </DialogDescription>
            </DialogHeader>
            {selectedPage && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      タイトル:
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedPage.title}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      スラッグ:
                    </span>
                    <code className="text-sm text-gray-900">
                      /{selectedPage.slug}
                    </code>
                  </div>
                  {selectedPage.isPublished && (
                    <p className="text-sm text-red-600 mt-2">
                      ※このページは公開中です。削除するとアプリから見えなくなります。
                    </p>
                  )}
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