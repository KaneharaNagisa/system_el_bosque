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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  Users,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";
import { toast } from "sonner@2.0.3";
import { mockSounds } from "../data/mockData";

interface Member {
  id: string;
  // 基本情報
  nickname: string;
  birthYear: string;
  gender: string;
  email: string;
  phone?: string;
  residence: string;
  // アンケート
  participationCount?: string;
  howKnown?: string;
  favoriteDance?: string;
  favoriteSong?: string;
  bonOdoriMemories?: string;
  interestInLeadSinger?: string;
  // 管理画面のみ
  registeredAt: string;
  lastLoginAt?: string;
  // ゲーム進捗
  gameProgress?: number; // 0-100の進捗率
  // お気に入り
  favoriteCount?: number; // お気に入りに登録した盆唄の数
  // ステータス
  status?: number; // 1: 利用中, 9: 退会
}

// モックデータ
const mockMembers: Member[] = [
  {
    id: "MEM-001",
    nickname: "踊り太郎",
    birthYear: "1985",
    gender: "男性",
    email: "yamada@example.com",
    phone: "090-1234-5678",
    residence: "町内＋近郊",
    participationCount: "5",
    howKnown: "友人の紹介",
    favoriteDance: "新野の盆踊り",
    favoriteSong: "盆唄の心",
    bonOdoriMemories:
      "初めて参加した時の感動は今でも忘れません",
    interestInLeadSinger: "とても興味がある",
    registeredAt: "2024-01-15",
    lastLoginAt: "2025-01-07 10:30",
    gameProgress: 75,
    favoriteCount: 12,
    status: 1, // 利用中
  },
  {
    id: "MEM-002",
    nickname: "花子ダンサー",
    birthYear: "1990",
    gender: "女性",
    email: "sato@example.com",
    phone: "090-2345-6789",
    residence: "下伊那郡内",
    participationCount: "10",
    howKnown: "SNS広告",
    favoriteDance: "音頭",
    favoriteSong: "伝統の響き",
    bonOdoriMemories: "家族みんなで楽しめました",
    interestInLeadSinger: "少し興味がある",
    registeredAt: "2024-01-20",
    lastLoginAt: "2025-01-06 15:20",
    gameProgress: 100,
    favoriteCount: 25,
    status: 1, // 利用中
  },
  {
    id: "MEM-003",
    nickname: "一郎ビート",
    birthYear: "1980",
    gender: "男性",
    email: "suzuki@example.com",
    residence: "県内",
    participationCount: "3",
    howKnown: "イベントポスター",
    favoriteDance: "新野の盆踊り",
    bonOdoriMemories: "地元の文化に触れることができました",
    interestInLeadSinger: "どちらでもない",
    registeredAt: "2024-02-01",
    lastLoginAt: "2025-01-05 09:45",
    gameProgress: 30,
    favoriteCount: 5,
    status: 9, // 退会
  },
];

export default function AdminMemberManagement() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] =
    useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  // フォーム用のステート
  const [formData, setFormData] = useState<
    Omit<Member, "id" | "registeredAt" | "lastLoginAt">
  >({
    nickname: "",
    birthYear: "",
    gender: "",
    email: "",
    phone: "",
    residence: "",
    participationCount: "",
    howKnown: "",
    favoriteDance: "",
    favoriteSong: "",
    bonOdoriMemories: "",
    interestInLeadSinger: "",
    status: 1, // デフォルトは利用中
  });

  // パスワード用のステート（新規登録・編集時のみ使用）
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // フィルター用ステート
  const [filterAgeMin, setFilterAgeMin] = useState("");
  const [filterAgeMax, setFilterAgeMax] = useState("");
  const [filterGender, setFilterGender] =
    useState<string>("all");
  const [filterResidence, setFilterResidence] =
    useState<string>("all");
  const [filterParticipationMin, setFilterParticipationMin] =
    useState("");
  const [filterParticipationMax, setFilterParticipationMax] =
    useState("");
  const [filterFavoriteDance, setFilterFavoriteDance] =
    useState<string>("all");
  const [
    filterInterestInLeadSinger,
    setFilterInterestInLeadSinger,
  ] = useState<string>("all");
  const [
    filterRegisteredDateFrom,
    setFilterRegisteredDateFrom,
  ] = useState("");
  const [filterRegisteredDateTo, setFilterRegisteredDateTo] =
    useState("");
  const [filterLastLoginFrom, setFilterLastLoginFrom] =
    useState("");
  const [filterLastLoginTo, setFilterLastLoginTo] =
    useState("");
  const [filterProgressMin, setFilterProgressMin] =
    useState("");
  const [filterProgressMax, setFilterProgressMax] =
    useState("");
  const [filterFavoriteMin, setFilterFavoriteMin] =
    useState("");
  const [filterFavoriteMax, setFilterFavoriteMax] =
    useState("");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");

  // ソート用ステート
  type SortField =
    | "registeredAt"
    | "lastLoginAt"
    | "gameProgress"
    | "favoriteCount"
    | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  // ページネーション用ステート
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 管理画面モードの設定（Portal対応）
  React.useEffect(() => {
    document.body.setAttribute("data-admin", "true");
    return () => {
      document.body.removeAttribute("data-admin");
    };
  }, []);

  const filteredMembers = members.filter((member) => {
    // テキスト検索
    const matchesSearch =
      member.nickname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // 年齢フィルター（birthYearから年齢を計算）
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(member.birthYear);
    let matchesAge = true;
    if (filterAgeMin && age < parseInt(filterAgeMin)) {
      matchesAge = false;
    }
    if (filterAgeMax && age > parseInt(filterAgeMax)) {
      matchesAge = false;
    }

    // 性別フィルター
    const matchesGender =
      filterGender === "all" || member.gender === filterGender;

    // お住まいフィルター
    const matchesResidence =
      filterResidence === "all" ||
      member.residence === filterResidence;

    // 盆踊り参加回数フィルター
    let matchesParticipation = true;
    if (member.participationCount) {
      const count = parseInt(member.participationCount);
      if (
        filterParticipationMin &&
        count < parseInt(filterParticipationMin)
      ) {
        matchesParticipation = false;
      }
      if (
        filterParticipationMax &&
        count > parseInt(filterParticipationMax)
      ) {
        matchesParticipation = false;
      }
    } else {
      // participationCountが未入力の場合は、最小値が設定されていればフィルタリング対象外
      if (filterParticipationMin) {
        matchesParticipation = false;
      }
    }

    // 好きな踊りフィルター
    const matchesFavoriteDance =
      filterFavoriteDance === "all" ||
      member.favoriteDance === filterFavoriteDance;

    // 音頭取りに興味フィルター
    const matchesInterest =
      filterInterestInLeadSinger === "all" ||
      member.interestInLeadSinger ===
        filterInterestInLeadSinger;

    // 登録日フィルター（期間指定）
    let matchesRegisteredDate = true;
    if (
      filterRegisteredDateFrom &&
      member.registeredAt < filterRegisteredDateFrom
    ) {
      matchesRegisteredDate = false;
    }
    if (
      filterRegisteredDateTo &&
      member.registeredAt > filterRegisteredDateTo
    ) {
      matchesRegisteredDate = false;
    }

    // 最終ログインフィルター（期間指定）
    let matchesLastLogin = true;
    if (filterLastLoginFrom || filterLastLoginTo) {
      if (!member.lastLoginAt) {
        // lastLoginAtが未設定の場合は条件に合わない
        matchesLastLogin = false;
      } else {
        // lastLoginAtから日付部分のみ抽出（"2025-01-07 10:30" → "2025-01-07"）
        const lastLoginDate = member.lastLoginAt.split(" ")[0];
        if (
          filterLastLoginFrom &&
          lastLoginDate < filterLastLoginFrom
        ) {
          matchesLastLogin = false;
        }
        if (
          filterLastLoginTo &&
          lastLoginDate > filterLastLoginTo
        ) {
          matchesLastLogin = false;
        }
      }
    }

    // 進捗率フィルター
    let matchesProgress = true;
    if (member.gameProgress !== undefined) {
      if (
        filterProgressMin &&
        member.gameProgress < parseInt(filterProgressMin)
      ) {
        matchesProgress = false;
      }
      if (
        filterProgressMax &&
        member.gameProgress > parseInt(filterProgressMax)
      ) {
        matchesProgress = false;
      }
    } else {
      // gameProgressが未設定の場合は、最小値が設定されていればフィルタリング対象外
      if (filterProgressMin) {
        matchesProgress = false;
      }
    }

    // お気に入り数フィルター
    let matchesFavorite = true;
    if (member.favoriteCount !== undefined) {
      if (
        filterFavoriteMin &&
        member.favoriteCount < parseInt(filterFavoriteMin)
      ) {
        matchesFavorite = false;
      }
      if (
        filterFavoriteMax &&
        member.favoriteCount > parseInt(filterFavoriteMax)
      ) {
        matchesFavorite = false;
      }
    } else {
      // favoriteCountが未設定の場合は、最小値が設定されていればフィルタリング対象外
      if (filterFavoriteMin) {
        matchesFavorite = false;
      }
    }

    // ステータスフィルター
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "1" && (member.status === 1 || member.status === undefined)) ||
      (filterStatus === "9" && member.status === 9);

    return (
      matchesSearch &&
      matchesAge &&
      matchesGender &&
      matchesResidence &&
      matchesParticipation &&
      matchesFavoriteDance &&
      matchesInterest &&
      matchesRegisteredDate &&
      matchesLastLogin &&
      matchesProgress &&
      matchesFavorite &&
      matchesStatus
    );
  });

  // ソート処理
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortField) return 0;

    let compareValue = 0;

    if (sortField === "registeredAt") {
      compareValue = a.registeredAt.localeCompare(
        b.registeredAt,
      );
    } else if (sortField === "lastLoginAt") {
      const aLogin = a.lastLoginAt || "";
      const bLogin = b.lastLoginAt || "";
      compareValue = aLogin.localeCompare(bLogin);
    } else if (sortField === "gameProgress") {
      const aProgress = a.gameProgress ?? -1;
      const bProgress = b.gameProgress ?? -1;
      compareValue = aProgress - bProgress;
    } else if (sortField === "favoriteCount") {
      const aFavorite = a.favoriteCount ?? -1;
      const bFavorite = b.favoriteCount ?? -1;
      compareValue = aFavorite - bFavorite;
    }

    return sortDirection === "asc"
      ? compareValue
      : -compareValue;
  });

  // ソートボタンのハンドラー
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 同じフィールドをクリックした場合：昇順→降順→解除
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(null);
        setSortDirection("asc");
      }
    } else {
      // 新しいフィールドをクリックした場合：昇順でソート開始
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ページネーション計算
  const totalPages = Math.ceil(
    sortedMembers.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = sortedMembers.slice(
    startIndex,
    endIndex,
  );

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // フィルターやソートが変更されたらページを1に戻す
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    filterAgeMin,
    filterAgeMax,
    filterGender,
    filterResidence,
    filterParticipationMin,
    filterParticipationMax,
    filterFavoriteDance,
    filterInterestInLeadSinger,
    filterRegisteredDateFrom,
    filterRegisteredDateTo,
    filterLastLoginFrom,
    filterLastLoginTo,
    filterProgressMin,
    filterProgressMax,
    filterStatus,
    sortField,
    sortDirection,
  ]);

  // ソートアイコンを取得する関数
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />
      );
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 text-gray-900" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 text-gray-900" />;
  };

  // バリデーション関数
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = "ニックネームを入力してください";
    }
    if (!formData.birthYear) {
      newErrors.birthYear = "誕生年を選択してください";
    }
    if (!formData.gender) {
      newErrors.gender = "性別を選択してください";
    }
    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email =
        "有効なメールアドレスを入力してください";
    }
    if (!formData.residence) {
      newErrors.residence = "お住まいを選択してください";
    }

    // パスワードのバリデーション（新規登録時のみ）
    if (isAddDialogOpen) {
      if (!password.trim()) {
        newErrors.password = "パスワードを入力してください";
      } else if (password.length < 8) {
        newErrors.password =
          "パスワードは8文字以上で入力してください";
      }
      if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "パスワードが一致しません";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 新規メンバー登録ダイアログを開く
  const handleOpenAddDialog = () => {
    setFormData({
      nickname: "",
      birthYear: "",
      gender: "",
      email: "",
      phone: "",
      residence: "",
      participationCount: "",
      howKnown: "",
      favoriteDance: "",
      favoriteSong: "",
      bonOdoriMemories: "",
      interestInLeadSinger: "",
    });
    setPassword("");
    setPasswordConfirm("");
    setErrors({});
    setIsAddDialogOpen(true);
  };

  // 新規メンバーを追加
  const handleAddMember = () => {
    if (!validateForm()) return;

    const newMember: Member = {
      id: `MEM-${String(members.length + 1).padStart(3, "0")}`,
      ...formData,
      registeredAt: new Date().toISOString().split("T")[0],
    };

    setMembers([...members, newMember]);
    setIsAddDialogOpen(false);
    toast.success("新規メンバーを登録しました");
  };

  // 編集ダイアログを開く
  const handleOpenEditDialog = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      nickname: member.nickname,
      birthYear: member.birthYear,
      gender: member.gender,
      email: member.email,
      phone: member.phone || "",
      residence: member.residence,
      participationCount: member.participationCount || "",
      howKnown: member.howKnown || "",
      favoriteDance: member.favoriteDance || "",
      favoriteSong: member.favoriteSong || "",
      bonOdoriMemories: member.bonOdoriMemories || "",
      interestInLeadSinger: member.interestInLeadSinger || "",
      status: member.status || 1,
    });
    setPassword("");
    setPasswordConfirm("");
    setErrors({});
    setIsEditMode(true);
    setIsDetailDialogOpen(true);
  };

  // メンバー情報を更新
  const handleUpdateMember = () => {
    if (!validateForm() || !selectedMember) return;

    const updatedMembers = members.map((member) =>
      member.id === selectedMember.id
        ? { ...member, ...formData }
        : member,
    );

    setMembers(updatedMembers);
    setIsEditMode(false);
    setIsDetailDialogOpen(false);
    toast.success("メンバー情報を更新しました");
  };

  // 削除確認ダイアログを開く
  const handleOpenDeleteDialog = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  // メンバーを削除
  const handleDeleteMember = () => {
    if (!selectedMember) return;

    const updatedMembers = members.filter(
      (member) => member.id !== selectedMember.id,
    );
    setMembers(updatedMembers);
    setIsDeleteDialogOpen(false);
    setIsDetailDialogOpen(false);
    toast.success("メンバーを削除しました");
  };

  // 編集モードをキャンセル
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (selectedMember) {
      setFormData({
        nickname: selectedMember.nickname,
        birthYear: selectedMember.birthYear,
        gender: selectedMember.gender,
        email: selectedMember.email,
        phone: selectedMember.phone || "",
        residence: selectedMember.residence,
        participationCount:
          selectedMember.participationCount || "",
        howKnown: selectedMember.howKnown || "",
        favoriteDance: selectedMember.favoriteDance || "",
        favoriteSong: selectedMember.favoriteSong || "",
        bonOdoriMemories: selectedMember.bonOdoriMemories || "",
        interestInLeadSinger:
          selectedMember.interestInLeadSinger || "",
        status: selectedMember.status || 1,
      });
    }
    setErrors({});
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
    if (page === "pages") {
      navigate("/admin/pages");
    }
    // members は現在の画面なので何もしない
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        currentPage="members"
        isCollapsed={isSidebarCollapsed}
        onToggle={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
        onNavigate={handleNavigate}
      />

      {/* Main Content with offset */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64",
        )}
      >
        {/* Header */}
        <header className="border-b border-border bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                メンバー管理
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>メンバー一覧</CardTitle>
                    <CardDescription>
                      登録メンバー数: {members.length}名 |
                      検索結果: {filteredMembers.length}名
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={handleOpenAddDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  新規メンバー登録
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
                    ニックネーム、メール、IDで検索
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

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* 年齢（min） */}
                  <div>
                    <Label
                      htmlFor="filterAgeMin"
                      className="text-xs text-gray-700 mb-1"
                    >
                      年齢（最小）
                    </Label>
                    <Input
                      id="filterAgeMin"
                      type="number"
                      value={filterAgeMin}
                      onChange={(e) =>
                        setFilterAgeMin(e.target.value)
                      }
                      placeholder="例: 18"
                      className="text-sm"
                      min="0"
                    />
                  </div>

                  {/* 年齢（max） */}
                  <div>
                    <Label
                      htmlFor="filterAgeMax"
                      className="text-xs text-gray-700 mb-1"
                    >
                      年齢（最大）
                    </Label>
                    <Input
                      id="filterAgeMax"
                      type="number"
                      value={filterAgeMax}
                      onChange={(e) =>
                        setFilterAgeMax(e.target.value)
                      }
                      placeholder="例: 65"
                      className="text-sm"
                      min="0"
                    />
                  </div>

                  {/* 性別 */}
                  <div>
                    <Label
                      htmlFor="filterGender"
                      className="text-xs text-gray-700 mb-1"
                    >
                      性別
                    </Label>
                    <select
                      id="filterGender"
                      value={filterGender}
                      onChange={(e) =>
                        setFilterGender(e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="男性">男性</option>
                      <option value="女性">女性</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  {/* お住まい */}
                  <div>
                    <Label
                      htmlFor="filterResidence"
                      className="text-xs text-gray-700 mb-1"
                    >
                      お住まい
                    </Label>
                    <select
                      id="filterResidence"
                      value={filterResidence}
                      onChange={(e) =>
                        setFilterResidence(e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="町内＋近郊">
                        町内＋近郊
                      </option>
                      <option value="下伊那郡内">
                        下伊那郡内
                      </option>
                      <option value="県内">県内</option>
                      <option value="県外">県外</option>
                      <option value="海外">海外</option>
                    </select>
                  </div>

                  {/* 盆踊り参加回数（min） */}
                  <div>
                    <Label
                      htmlFor="filterParticipationMin"
                      className="text-xs text-gray-700 mb-1"
                    >
                      参加回数（最小）
                    </Label>
                    <Input
                      id="filterParticipationMin"
                      type="number"
                      value={filterParticipationMin}
                      onChange={(e) =>
                        setFilterParticipationMin(
                          e.target.value,
                        )
                      }
                      placeholder="例: 1"
                      className="text-sm"
                      min="0"
                    />
                  </div>

                  {/* 盆踊り参加回数（max） */}
                  <div>
                    <Label
                      htmlFor="filterParticipationMax"
                      className="text-xs text-gray-700 mb-1"
                    >
                      参加回数（最大）
                    </Label>
                    <Input
                      id="filterParticipationMax"
                      type="number"
                      value={filterParticipationMax}
                      onChange={(e) =>
                        setFilterParticipationMax(
                          e.target.value,
                        )
                      }
                      placeholder="例: 10"
                      className="text-sm"
                      min="0"
                    />
                  </div>

                  {/* 好きな踊り */}
                  <div>
                    <Label
                      htmlFor="filterFavoriteDance"
                      className="text-xs text-gray-700 mb-1"
                    >
                      好きな踊り
                    </Label>
                    <select
                      id="filterFavoriteDance"
                      value={filterFavoriteDance}
                      onChange={(e) =>
                        setFilterFavoriteDance(e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      {mockSounds.map((sound) => (
                        <option
                          key={sound.id}
                          value={sound.name}
                        >
                          {sound.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 音頭取りに興味 */}
                  <div>
                    <Label
                      htmlFor="filterInterestInLeadSinger"
                      className="text-xs text-gray-700 mb-1"
                    >
                      音頭取りに興味
                    </Label>
                    <select
                      id="filterInterestInLeadSinger"
                      value={filterInterestInLeadSinger}
                      onChange={(e) =>
                        setFilterInterestInLeadSinger(
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="とても興味がある">
                        とても興味がある
                      </option>
                      <option value="少し興味がある">
                        少し興味がある
                      </option>
                      <option value="どちらでもない">
                        どちらでもない
                      </option>
                      <option value="興味はない">
                        興味はない
                      </option>
                    </select>
                  </div>

                  {/* 登録日（From） */}
                  <div>
                    <Label
                      htmlFor="filterRegisteredDateFrom"
                      className="text-xs text-gray-700 mb-1"
                    >
                      登録日（開始）
                    </Label>
                    <Input
                      id="filterRegisteredDateFrom"
                      type="date"
                      value={filterRegisteredDateFrom}
                      onChange={(e) =>
                        setFilterRegisteredDateFrom(
                          e.target.value,
                        )
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* 登録日（To） */}
                  <div>
                    <Label
                      htmlFor="filterRegisteredDateTo"
                      className="text-xs text-gray-700 mb-1"
                    >
                      登録日（終了）
                    </Label>
                    <Input
                      id="filterRegisteredDateTo"
                      type="date"
                      value={filterRegisteredDateTo}
                      onChange={(e) =>
                        setFilterRegisteredDateTo(
                          e.target.value,
                        )
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* 最終ログイン（From） */}
                  <div>
                    <Label
                      htmlFor="filterLastLoginFrom"
                      className="text-xs text-gray-700 mb-1"
                    >
                      最終ログイン（開始）
                    </Label>
                    <Input
                      id="filterLastLoginFrom"
                      type="date"
                      value={filterLastLoginFrom}
                      onChange={(e) =>
                        setFilterLastLoginFrom(e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* 最終ログイン（To） */}
                  <div>
                    <Label
                      htmlFor="filterLastLoginTo"
                      className="text-xs text-gray-700 mb-1"
                    >
                      最終ログイン（終了）
                    </Label>
                    <Input
                      id="filterLastLoginTo"
                      type="date"
                      value={filterLastLoginTo}
                      onChange={(e) =>
                        setFilterLastLoginTo(e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* 進捗率（min） */}
                  <div>
                    <Label
                      htmlFor="filterProgressMin"
                      className="text-xs text-gray-700 mb-1"
                    >
                      進捗率（最小）
                    </Label>
                    <Input
                      id="filterProgressMin"
                      type="number"
                      value={filterProgressMin}
                      onChange={(e) =>
                        setFilterProgressMin(e.target.value)
                      }
                      placeholder="例: 0"
                      className="text-sm"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* 進捗率（max） */}
                  <div>
                    <Label
                      htmlFor="filterProgressMax"
                      className="text-xs text-gray-700 mb-1"
                    >
                      進捗率（最大）
                    </Label>
                    <Input
                      id="filterProgressMax"
                      type="number"
                      value={filterProgressMax}
                      onChange={(e) =>
                        setFilterProgressMax(e.target.value)
                      }
                      placeholder="例: 100"
                      className="text-sm"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* お気に入り数（min） */}
                  <div>
                    <Label
                      htmlFor="filterFavoriteMin"
                      className="text-xs text-gray-700 mb-1"
                    >
                      お気に入り数（最小）
                    </Label>
                    <Input
                      id="filterFavoriteMin"
                      type="number"
                      value={filterFavoriteMin}
                      onChange={(e) =>
                        setFilterFavoriteMin(e.target.value)
                      }
                      placeholder="例: 0"
                      className="text-sm"
                      min="0"
                    />
                  </div>

                  {/* お気に入り数（max） */}
                  <div>
                    <Label
                      htmlFor="filterFavoriteMax"
                      className="text-xs text-gray-700 mb-1"
                    >
                      お気に入り数（最大）
                    </Label>
                    <Input
                      id="filterFavoriteMax"
                      type="number"
                      value={filterFavoriteMax}
                      onChange={(e) =>
                        setFilterFavoriteMax(e.target.value)
                      }
                      placeholder="例: 50"
                      className="text-sm"
                      min="0"
                    />
                  </div>

                  {/* ステータス */}
                  <div>
                    <Label
                      htmlFor="filterStatus"
                      className="text-xs text-gray-700 mb-1"
                    >
                      ステータス
                    </Label>
                    <select
                      id="filterStatus"
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="all">すべて</option>
                      <option value="1">利用中</option>
                      <option value="9">退会</option>
                    </select>
                  </div>
                </div>

                {/* リセットボタン */}
                {(filterAgeMin ||
                  filterAgeMax ||
                  filterGender !== "all" ||
                  filterResidence !== "all" ||
                  filterParticipationMin ||
                  filterParticipationMax ||
                  filterFavoriteDance !== "all" ||
                  filterInterestInLeadSinger !== "all" ||
                  filterRegisteredDateFrom ||
                  filterRegisteredDateTo ||
                  filterLastLoginFrom ||
                  filterLastLoginTo ||
                  filterProgressMin ||
                  filterProgressMax ||
                  filterFavoriteMin ||
                  filterFavoriteMax ||
                  filterStatus !== "all") && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFilterAgeMin("");
                        setFilterAgeMax("");
                        setFilterGender("all");
                        setFilterResidence("all");
                        setFilterParticipationMin("");
                        setFilterParticipationMax("");
                        setFilterFavoriteDance("all");
                        setFilterInterestInLeadSinger("all");
                        setFilterRegisteredDateFrom("");
                        setFilterRegisteredDateTo("");
                        setFilterLastLoginFrom("");
                        setFilterLastLoginTo("");
                        setFilterProgressMin("");
                        setFilterProgressMax("");
                        setFilterFavoriteMin("");
                        setFilterFavoriteMax("");
                        setFilterStatus("all");
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
                    <TableHead>メンバーID</TableHead>
                    <TableHead>ニックネーム</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>
                      <button
                        onClick={() =>
                          handleSort("registeredAt")
                        }
                        className="flex items-center hover:text-gray-900 transition-colors"
                      >
                        登録日
                        {getSortIcon("registeredAt")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() =>
                          handleSort("lastLoginAt")
                        }
                        className="flex items-center hover:text-gray-900 transition-colors"
                      >
                        最終ログイン
                        {getSortIcon("lastLoginAt")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() =>
                          handleSort("gameProgress")
                        }
                        className="flex items-center hover:text-gray-900 transition-colors"
                      >
                        進捗率
                        {getSortIcon("gameProgress")}
                      </button>
                    </TableHead>
                    <TableHead className="text-center">
                      <button
                        onClick={() =>
                          handleSort("favoriteCount")
                        }
                        className="flex items-center justify-center hover:text-gray-900 transition-colors w-full"
                      >
                        お気に入り
                        {getSortIcon("favoriteCount")}
                      </button>
                    </TableHead>
                    <TableHead className="text-center">
                      ステータス
                    </TableHead>
                    <TableHead className="text-right">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.length > 0 ? (
                    paginatedMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className="hover:bg-transparent"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono"
                          >
                            {member.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {member.nickname}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {member.registeredAt}
                        </TableCell>
                        <TableCell>
                          {member.lastLoginAt || "-"}
                        </TableCell>
                        <TableCell>
                          {member.gameProgress !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${member.gameProgress}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                                {member.gameProgress}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.favoriteCount !== undefined ? (
                            <span className="text-sm font-medium text-gray-900">
                              {member.favoriteCount}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {member.status === 9 ? (
                            <Badge variant="secondary" className="bg-gray-400 text-white">
                              退会
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500 text-white">
                              利用中
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOpenEditDialog(member)
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
                                handleOpenDeleteDialog(member)
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
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        該当するメンバーが見つかりませんでした
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {sortedMembers.length}件中 {startIndex + 1}
                    〜{Math.min(endIndex, sortedMembers.length)}
                    件を表示
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                      className="bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      前へ
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1,
                      ).map((page) => {
                        // 最初、最後、現在のページの前後2ページのみ表示
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 &&
                            page <= currentPage + 2)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handlePageChange(page)
                              }
                              className={cn(
                                "min-w-[40px]",
                                currentPage === page
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-white text-gray-900 hover:bg-gray-100",
                              )}
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 3 ||
                          page === currentPage + 3
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                      className="bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                    >
                      次へ
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Member Detail/Edit Dialog */}
        <Dialog
          open={isDetailDialogOpen}
          onOpenChange={(open) => {
            setIsDetailDialogOpen(open);
            if (!open) {
              setIsEditMode(false);
              setErrors({});
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {isEditMode
                  ? "メンバー情報編集"
                  : "メンバー詳細情報"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {isEditMode
                  ? "メンバー情報を編集できます"
                  : "メンバーの詳細情報を確認できます"}
              </DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-6 py-4">
                {/* メンバーID */}
                <div>
                  <Label>メンバーID</Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="font-mono"
                    >
                      {selectedMember.id}
                    </Badge>
                  </div>
                </div>

                {/* 基本情報 */}
                <div>
                  <h3 className="font-medium text-lg mb-4 pb-2 border-b text-gray-900">
                    基本情報
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-nickname">
                        ニックネーム{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isEditMode ? (
                        <>
                          <Input
                            id="edit-nickname"
                            value={formData.nickname}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nickname: e.target.value,
                              })
                            }
                            placeholder="例: 踊り太郎"
                            className="mt-1"
                          />
                          {errors.nickname && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.nickname}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.nickname}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-birthYear">
                        誕生年{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isEditMode ? (
                        <>
                          <Select
                            value={formData.birthYear}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                birthYear: value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                { length: 101 },
                                (_, i) => 1926 + i,
                              ).map((year) => (
                                <SelectItem
                                  key={year}
                                  value={year.toString()}
                                >
                                  {year}年
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.birthYear && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.birthYear}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.birthYear}年
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-gender">
                        性別{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isEditMode ? (
                        <>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                gender: value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="男性">
                                男性
                              </SelectItem>
                              <SelectItem value="女性">
                                女性
                              </SelectItem>
                              <SelectItem value="その他">
                                その他
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.gender && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.gender}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.gender}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-email">
                        メールアドレス{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isEditMode ? (
                        <>
                          <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="example@email.com"
                            className="mt-1"
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.email}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.email}
                        </div>
                      )}
                    </div>

                    {isEditMode && (
                      <>
                        <div>
                          <Label htmlFor="edit-password">
                            パスワード（変更する場合のみ）
                          </Label>
                          <Input
                            id="edit-password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                            placeholder="8文字以上"
                            className="mt-1"
                          />
                          {errors.password && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="edit-passwordConfirm">
                            パスワード（確認）
                          </Label>
                          <Input
                            id="edit-passwordConfirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) =>
                              setPasswordConfirm(e.target.value)
                            }
                            placeholder="もう一度入力してください"
                            className="mt-1"
                          />
                          {errors.passwordConfirm && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.passwordConfirm}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="edit-phone">
                        電話番号（任意）
                      </Label>
                      {isEditMode ? (
                        <Input
                          id="edit-phone"
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="090-1234-5678"
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.phone || "-"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-residence">
                        お住まい{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isEditMode ? (
                        <>
                          <Select
                            value={formData.residence}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                residence: value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="町内＋近郊">
                                町内＋近郊
                              </SelectItem>
                              <SelectItem value="下伊那郡内">
                                下伊那郡内
                              </SelectItem>
                              <SelectItem value="県内">
                                県内
                              </SelectItem>
                              <SelectItem value="県外">
                                県外
                              </SelectItem>
                              <SelectItem value="海外">
                                海外
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.residence && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.residence}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.residence}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* アンケート */}
                <div>
                  <h3 className="font-medium text-lg mb-4 pb-2 border-b text-gray-900">
                    アンケート（任意）
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-participationCount">
                        盆踊り参加回数
                      </Label>
                      {isEditMode ? (
                        <Input
                          id="edit-participationCount"
                          type="number"
                          value={
                            formData.participationCount || ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              participationCount:
                                e.target.value,
                            })
                          }
                          placeholder="例: 5回"
                          className="mt-1"
                          min="0"
                        />
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.participationCount ||
                            "-"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-howKnown">
                        盆踊りを知ったきっかけ
                      </Label>
                      {isEditMode ? (
                        <Textarea
                          id="edit-howKnown"
                          value={formData.howKnown || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              howKnown: e.target.value,
                            })
                          }
                          rows={3}
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.howKnown || "-"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-favoriteDance">
                        好きな踊り
                      </Label>
                      {isEditMode ? (
                        <Select
                          value={formData.favoriteDance || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              favoriteDance: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockSounds.map((sound) => (
                              <SelectItem
                                key={sound.id}
                                value={sound.name}
                              >
                                {sound.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.favoriteDance || "-"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-favoriteSong">
                        好きな盆唄
                      </Label>
                      {isEditMode ? (
                        <Textarea
                          id="edit-favoriteSong"
                          value={formData.favoriteSong || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              favoriteSong: e.target.value,
                            })
                          }
                          rows={3}
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.favoriteSong || "-"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-bonOdoriMemories">
                        盆踊りの思い出
                      </Label>
                      {isEditMode ? (
                        <Textarea
                          id="edit-bonOdoriMemories"
                          value={
                            formData.bonOdoriMemories || ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bonOdoriMemories: e.target.value,
                            })
                          }
                          rows={3}
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.bonOdoriMemories ||
                            "-"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-interestInLeadSinger">
                        音頭取りに興味はありますか
                      </Label>
                      {isEditMode ? (
                        <Select
                          value={
                            formData.interestInLeadSinger || ""
                          }
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              interestInLeadSinger: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="とても興味がある">
                              とても興味がある
                            </SelectItem>
                            <SelectItem value="少し興味がある">
                              少し興味がある
                            </SelectItem>
                            <SelectItem value="どちらでもない">
                              どちらでもない
                            </SelectItem>
                            <SelectItem value="興味はない">
                              興味はない
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 mt-1">
                          {selectedMember.interestInLeadSinger ||
                            "-"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 管理情報 */}
                <div>
                  <h3 className="font-medium text-lg mb-4 pb-2 border-b text-gray-900">
                    管理情報
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="text-sm font-medium text-gray-500 w-32">
                        登録日
                      </div>
                      <div className="flex-1 text-gray-900">
                        {selectedMember.registeredAt}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-sm font-medium text-gray-500 w-32">
                        最終ログイン
                      </div>
                      <div className="flex-1 text-gray-900">
                        {selectedMember.lastLoginAt || "-"}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-status">
                        ステータス{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isEditMode ? (
                        <Select
                          value={String(formData.status || 1)}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              status: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">利用中</SelectItem>
                            <SelectItem value="9">退会</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          {selectedMember.status === 9 ? (
                            <Badge variant="secondary" className="bg-gray-400 text-white">
                              退会
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500 text-white">
                              利用中
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-between">
                  <div>
                    {!isEditMode && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          selectedMember &&
                          handleOpenDeleteDialog(selectedMember)
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        削除
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditMode ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          キャンセル
                        </Button>
                        <Button
                          onClick={handleUpdateMember}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          更新
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setIsDetailDialogOpen(false)
                          }
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          閉じる
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditMode(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          編集
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                新規メンバー登録
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                新しいメンバーを登録します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* 基本情報 */}
              <div>
                <h3 className="font-medium text-lg mb-4 pb-2 border-b text-gray-900">
                  基本情報
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="add-nickname">
                      ニックネーム{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-nickname"
                      value={formData.nickname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nickname: e.target.value,
                        })
                      }
                      placeholder="例: 踊り太郎"
                      className="mt-1"
                    />
                    {errors.nickname && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.nickname}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="add-birthYear">
                      誕生年{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.birthYear}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          birthYear: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: 101 },
                          (_, i) => 1926 + i,
                        ).map((year) => (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                          >
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.birthYear && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.birthYear}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="add-gender">
                      性別{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          gender: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="男性">
                          男性
                        </SelectItem>
                        <SelectItem value="女性">
                          女性
                        </SelectItem>
                        <SelectItem value="その他">
                          その他
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="add-email">
                      メールアドレス{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="example@email.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="add-password">
                      パスワード{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-password"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="8文字以上"
                      className="mt-1"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="add-passwordConfirm">
                      パスワード（確認）{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-passwordConfirm"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) =>
                        setPasswordConfirm(e.target.value)
                      }
                      placeholder="もう一度入力してください"
                      className="mt-1"
                    />
                    {errors.passwordConfirm && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.passwordConfirm}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="add-phone">
                      電���番号（任意）
                    </Label>
                    <Input
                      id="add-phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="090-1234-5678"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-residence">
                      お住まい{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.residence}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          residence: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="町内＋近郊">
                          町内＋近郊
                        </SelectItem>
                        <SelectItem value="下伊那郡内">
                          下伊那郡内
                        </SelectItem>
                        <SelectItem value="県内">
                          県内
                        </SelectItem>
                        <SelectItem value="県外">
                          県外
                        </SelectItem>
                        <SelectItem value="海外">
                          海外
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.residence && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.residence}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* アンケート */}
              <div>
                <h3 className="font-medium text-lg mb-4 pb-2 border-b text-gray-900">
                  アンケート（任意）
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="add-participationCount">
                      盆踊り参加回数
                    </Label>
                    <Input
                      id="add-participationCount"
                      type="number"
                      value={formData.participationCount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          participationCount: e.target.value,
                        })
                      }
                      placeholder="例: 5回"
                      className="mt-1"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-howKnown">
                      盆踊りを知ったきっかけ
                    </Label>
                    <Textarea
                      id="add-howKnown"
                      value={formData.howKnown || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          howKnown: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-favoriteDance">
                      好きな踊り
                    </Label>
                    <Select
                      value={formData.favoriteDance || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          favoriteDance: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSounds.map((sound) => (
                          <SelectItem
                            key={sound.id}
                            value={sound.name}
                          >
                            {sound.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="add-favoriteSong">
                      好きな盆唄
                    </Label>
                    <Textarea
                      id="add-favoriteSong"
                      value={formData.favoriteSong || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          favoriteSong: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-bonOdoriMemories">
                      盆踊りの思い出
                    </Label>
                    <Textarea
                      id="add-bonOdoriMemories"
                      value={formData.bonOdoriMemories || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bonOdoriMemories: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-interestInLeadSinger">
                      音頭取りに興味はありますか
                    </Label>
                    <Select
                      value={
                        formData.interestInLeadSinger || ""
                      }
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          interestInLeadSinger: value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="とても興味がある">
                          とても興味がある
                        </SelectItem>
                        <SelectItem value="少し興味がある">
                          少し興味がある
                        </SelectItem>
                        <SelectItem value="どちらでもない">
                          どちらでもない
                        </SelectItem>
                        <SelectItem value="興味はない">
                          興味はない
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleAddMember}
                className="bg-blue-600 hover:bg-blue-700"
              >
                登録
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent className="max-w-md bg-white text-gray-900 font-sans">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                メンバーの削除
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                このメンバーを削除してもよろしいですか？
              </DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      ID:
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedMember.id}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      ニックネーム:
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedMember.nickname}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      メール:
                    </span>
                    <span className="text-sm text-gray-900">
                      {selectedMember.email}
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
                onClick={handleDeleteMember}
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