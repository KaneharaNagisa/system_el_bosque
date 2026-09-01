import React from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Users, Shield, LogOut, TrendingUp, UserCheck, Bell, FileText, Music, Heart, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { cn } from "./ui/utils";
import { useState } from "react";
import { mockSongs } from "../data/mockData";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // アコーディオンの開閉状態
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isStageProgressOpen, setIsStageProgressOpen] = useState(false);
  const [isFavoriteRankingOpen, setIsFavoriteRankingOpen] = useState(false);
  const [isDifficultQuestionsOpen, setIsDifficultQuestionsOpen] = useState(false);

  // 管理画面モードの設定（Portal対応）
  React.useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    return () => {
      document.body.removeAttribute('data-admin');
    };
  }, []);

  // モック統計データ - アンケート結果を追加
  const stats = {
    totalMembers: 124,
    newMembersThisMonth: 15,
    totalAdmins: 8,
    activeAccounts: 120,
  };

  // アンケート集計データ（モック）
  const surveyStats = {
    participationCount: [
      { range: '1-3回', count: 35 },
      { range: '4-10回', count: 42 },
      { range: '11回以上', count: 25 },
      { range: '未参加', count: 22 },
    ],
    residence: [
      { type: '町内＋近郊', count: 45 },
      { type: '県内', count: 38 },
      { type: '県外', count: 35 },
      { type: '海外', count: 6 },
    ],
    leadSingerInterest: [
      { level: 'とても興味がある', count: 18 },
      { level: '少し興味がある', count: 45 },
      { level: 'どちらでもない', count: 38 },
      { level: '興味はない', count: 23 },
    ],
    gender: [
      { type: '男性', count: 58 },
      { type: '女性', count: 52 },
      { type: 'その他', count: 8 },
      { type: '回答しない', count: 6 },
    ],
    ageGroup: [
      { range: '10代以下', count: 12 },
      { range: '20代', count: 25 },
      { range: '30代', count: 32 },
      { range: '40代', count: 28 },
      { range: '50代', count: 15 },
      { range: '60代', count: 8 },
      { range: '70代', count: 3 },
      { range: '80代以上', count: 1 },
    ],
    favoriteDance: [
      { name: '能登', count: 42 },
      { name: '伊那', count: 38 },
      { name: '高い山', count: 28 },
      { name: 'すくも', count: 16 },
    ],
  };

  // ステージ進捗状況（モック）
  const stageProgress = [
    { id: '1', name: 'すくいさ', completionRate: 85 },
    { id: '2', name: '音頭', completionRate: 72 },
    { id: '3', name: '高い山', completionRate: 68 },
    { id: '4', name: 'おさま甚句', completionRate: 55 },
    { id: '5', name: '十六', completionRate: 48 },
    { id: '6', name: 'おやま', completionRate: 42 },
    { id: '7', name: '能登', completionRate: 38 },
    { id: '8', name: '唄', completionRate: 35 },
    { id: '9', name: '踊り', completionRate: 28 },
    { id: '10', name: '盆', completionRate: 22 },
    { id: '11', name: '寺', completionRate: 18 },
    { id: '12', name: '新野', completionRate: 12 },
  ];

  // お気入りランキング（モック）
  // 各曲にランダムなお気に入り数を付与してソート
  const favoriteSongsRanking = React.useMemo(() => {
    return mockSongs
      .map(song => ({
        ...song,
        favoriteCount: Math.floor(Math.random() * 150) + 10, // 10-160のランダム数
      }))
      .sort((a, b) => b.favoriteCount - a.favoriteCount)
      .slice(0, 15); // 上位15件
  }, []);

  // 難問ランキング（モック）
  // 各曲にランダムな間違い回数を付与してソート
  const difficultQuestionsRanking = React.useMemo(() => {
    return mockSongs
      .map(song => ({
        ...song,
        mistakeCount: Math.floor(Math.random() * 200) + 20, // 20-220のランダム数
      }))
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, 15); // 上位15件
  }, []);

  const handleNavigate = (page: "dashboard" | "members" | "accounts" | "master-skills" | "master-hobbies" | "master-personalities" | "master-challenges") => {
    if (page === "members") {
      navigate("/admin/members");
    } else if (page === "accounts") {
      navigate("/admin/accounts");
    } else if (page === "master-skills") {
      navigate("/admin/master-skills");
    } else if (page === "master-hobbies") {
      navigate("/admin/master-hobbies");
    } else if (page === "master-personalities") {
      navigate("/admin/master-personalities");
    } else if (page === "master-challenges") {
      navigate("/admin/master-challenges");
    }
  };

  return (
    <div className="admin-page min-h-screen bg-white font-sans font-normal text-gray-900">
      {/* Sidebar */}
      <AdminSidebar
        currentPage="dashboard"
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNavigate={handleNavigate}
      />

      {/* Main Content with offset */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="border-b border-border bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">管理画面</h1>
              <Button variant="outline" onClick={() => navigate("/logout")}>
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ダッシュボード
              </h2>
              <p className="text-gray-600">システムの状況と管理機能</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card 
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/admin/analytics/total-members")}
              >
                <CardHeader className="pb-3">
                  <CardDescription>総メンバー数</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.totalMembers}
                    </div>
                    <Users className="w-8 h-8 text-blue-600 opacity-50" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">登録メンバーの総数</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/admin/analytics/new-registrations")}
              >
                <CardHeader className="pb-3">
                  <CardDescription>今月の新規登録</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.newMembersThisMonth}
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">今月の新規メンバー</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/admin/analytics/active-members")}
              >
                <CardHeader className="pb-3">
                  <CardDescription>アクティブメンバー</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-orange-600">
                      {stats.activeAccounts}
                    </div>
                    <UserCheck className="w-8 h-8 text-orange-600 opacity-50" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">過去30日間の利用</p>
                </CardContent>
              </Card>
            </div>

            {/* Survey Results Section - Accordion */}
            <div className="mb-8">
              <Card className="bg-white">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
                  onClick={() => setIsSurveyOpen(!isSurveyOpen)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      アンケート集計結果
                    </h2>
                    <div className="flex-shrink-0 ml-4">
                      {isSurveyOpen ? (
                        <ChevronUp className="w-6 h-6 text-gray-700" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-700" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isSurveyOpen && (
                  <CardContent>
                    {/* 上段：性別、盆踊り参加回数、音頭取りへの興味 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* 性別 */}
                      <Card className="bg-white border">
                        <CardHeader>
                          <CardTitle className="text-base">性別</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {surveyStats.gender.map((item) => (
                              <div key={item.type}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{item.type}</span>
                                  <span className="font-bold text-indigo-600">{item.count}人</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 盆踊り参加回数 */}
                      <Card className="bg-white border">
                        <CardHeader>
                          <CardTitle className="text-base">盆踊り参加回数</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {surveyStats.participationCount.map((item) => (
                              <div key={item.range}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{item.range}</span>
                                  <span className="font-bold text-blue-600">{item.count}人</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 音頭取りへの興味 */}
                      <Card className="bg-white border">
                        <CardHeader>
                          <CardTitle className="text-base">音頭取りへの興味</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {surveyStats.leadSingerInterest.map((item) => (
                              <div key={item.level}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700 text-xs">{item.level}</span>
                                  <span className="font-bold text-purple-600">{item.count}人</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 下段：年代、お住まい、好きな踊り */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 年代 */}
                      <Card className="bg-white border">
                        <CardHeader>
                          <CardTitle className="text-base">年代</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {surveyStats.ageGroup.map((item) => (
                              <div key={item.range}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{item.range}</span>
                                  <span className="font-bold text-orange-600">{item.count}人</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-orange-600 h-2 rounded-full"
                                    style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* お住まい */}
                      <Card className="bg-white border">
                        <CardHeader>
                          <CardTitle className="text-base">お住まい</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {surveyStats.residence.map((item) => (
                              <div key={item.type}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{item.type}</span>
                                  <span className="font-bold text-green-600">{item.count}人</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 好きな踊り */}
                      <Card className="bg-white border">
                        <CardHeader>
                          <CardTitle className="text-base">好きな踊り</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {surveyStats.favoriteDance.map((item) => (
                              <div key={item.name}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{item.name}</span>
                                  <span className="font-bold text-pink-600">{item.count}人</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-pink-600 h-2 rounded-full"
                                    style={{ width: `${(item.count / stats.totalMembers) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* ステージ進捗状況 Section - Accordion */}
            <div className="mb-8">
              <Card className="bg-white">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
                  onClick={() => setIsStageProgressOpen(!isStageProgressOpen)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      ステージ進捗状況
                    </h2>
                    <div className="flex-shrink-0 ml-4">
                      {isStageProgressOpen ? (
                        <ChevronUp className="w-6 h-6 text-gray-700" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-700" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isStageProgressOpen && (
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {stageProgress.map((stage) => (
                        <div key={stage.id} className="text-sm">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-medium text-gray-900 text-xs">{stage.name}</span>
                            <span className="text-xs font-bold text-blue-600">
                              {stage.completionRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stage.completionRate}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {Math.round((stats.totalMembers * stage.completionRate) / 100)}人 / {stats.totalMembers}人がクリア
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* お気入りランキング Section - Accordion */}
            <div className="mb-8">
              <Card className="bg-white">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
                  onClick={() => setIsFavoriteRankingOpen(!isFavoriteRankingOpen)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      お気入りランキング
                    </h2>
                    <div className="flex-shrink-0 ml-4">
                      {isFavoriteRankingOpen ? (
                        <ChevronUp className="w-6 h-6 text-gray-700" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-700" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isFavoriteRankingOpen && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {favoriteSongsRanking.map((song, index) => (
                        <div 
                          key={song.id} 
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          {/* ランキング順位 */}
                          <div className="flex-shrink-0">
                            <div 
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                                index === 0 && "bg-yellow-400 text-yellow-900",
                                index === 1 && "bg-gray-300 text-gray-700",
                                index === 2 && "bg-orange-400 text-orange-900",
                                index >= 3 && "bg-gray-100 text-gray-600"
                              )}
                            >
                              {index + 1}
                            </div>
                          </div>

                          {/* 盆唄内容（1行表示） */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800 truncate">
                              {song.fullText.replace(/\n/g, ' ')}
                            </p>
                          </div>

                          {/* お気に入り数 */}
                          <div className="flex-shrink-0 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                            <span className="font-bold text-red-600 text-xs whitespace-nowrap">
                              {song.favoriteCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* 難問ランキング Section - Accordion */}
            <div className="mb-8">
              <Card className="bg-white">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
                  onClick={() => setIsDifficultQuestionsOpen(!isDifficultQuestionsOpen)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                      難問ランキング
                    </h2>
                    <div className="flex-shrink-0 ml-4">
                      {isDifficultQuestionsOpen ? (
                        <ChevronUp className="w-6 h-6 text-gray-700" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-700" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isDifficultQuestionsOpen && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {difficultQuestionsRanking.map((song, index) => (
                        <div 
                          key={song.id} 
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          {/* ランキング順位 */}
                          <div className="flex-shrink-0">
                            <div 
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                                index === 0 && "bg-yellow-400 text-yellow-900",
                                index === 1 && "bg-gray-300 text-gray-700",
                                index === 2 && "bg-orange-400 text-orange-900",
                                index >= 3 && "bg-gray-100 text-gray-600"
                              )}
                            >
                              {index + 1}
                            </div>
                          </div>

                          {/* 盆唄内容（1行表示） */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-800 truncate">
                              {song.fullText.replace(/\n/g, ' ')}
                            </p>
                          </div>

                          {/* 間違い回数 */}
                          <div className="flex-shrink-0 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-500 fill-red-500" />
                            <span className="font-bold text-red-600 text-xs whitespace-nowrap">
                              {song.mistakeCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Management Menu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
                onClick={() => navigate("/admin/members")}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">メンバー管理</CardTitle>
                      <CardDescription className="mt-1">
                        メンバー情報の確認・検索・管理を行います
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• メンバー一覧の表示</li>
                    <li>• メンバー情報の詳細確認</li>
                    <li>• メンバーの検索・フィルタリング</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-300"
                onClick={() => navigate("/admin/news")}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">お知らせ管理</CardTitle>
                      <CardDescription className="mt-1">
                        お知らせの作成・編集・削除を行います
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• お知らせの新規作成</li>
                    <li>• お知らせの編集・削除</li>
                    <li>• お知らせの一覧表示</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300"
                onClick={() => navigate("/admin/pages")}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">固定ページ管理</CardTitle>
                      <CardDescription className="mt-1">
                        固定ページの作成・編集・削除を行います
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 固定ページの新規作成</li>
                    <li>• ページ内容の編集・削除</li>
                    <li>• ページの一覧表示</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300"
                onClick={() => navigate("/admin/master/songs")}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Music className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">盆唄管理</CardTitle>
                      <CardDescription className="mt-1">
                        盆唄データの作成・編集・削除を行います
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 盆唄の新規作成</li>
                    <li>• 盆唄の編集・削除</li>
                    <li>• 盆唄の一覧表示</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <Card className="bg-white mt-8">
              <CardHeader>
                <CardTitle>システム情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">システム名</h4>
                    <p className="text-gray-600">盆唄システム</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">バージョン</h4>
                    <p className="text-gray-600">v1.0.0</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">最終更新</h4>
                    <p className="text-gray-600">2026-02-05</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}