import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  ChevronDown, 
  Bell,
  UsersRound,
  FileText,
  DollarSign,
  Languages,
  BookOpen // マニュアル管理用アイコン
} from "lucide-react";
import { cn } from "./ui/utils";

interface AdminSidebarProps {
  currentPage: 
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
    | "pages"
    | "affiliate"
    | "translations"
    | "manuals"; // マニュアル管理を追加
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({
  currentPage,
  isCollapsed,
  onToggle,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      id: "dashboard" as const,
      label: "ダッシュボード",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      id: "members" as const,
      label: "メンバー管理",
      icon: Users,
      path: "/admin/members",
    },
    {
      id: "groups" as const,
      label: "グループ管理",
      icon: UsersRound,
      path: "/admin/groups",
    },
    {
      id: "news" as const,
      label: "お知らせ管理",
      icon: Bell,
      path: "/admin/news",
    },
    {
      id: "pages" as const,
      label: "固定ページ管理",
      icon: FileText,
      path: "/admin/pages",
    },
    {
      id: "affiliate" as const,
      label: "アフィリエイト管理",
      icon: DollarSign,
      path: "/admin/affiliate-management",
    },
  ];

  const masterSubMenuItems = [
    { id: "master-stages" as const, label: "ステージ管理", path: "/admin/master/stages" },
    { id: "master-songs" as const, label: "盆唄管理", path: "/admin/master/songs" },
    { id: "master-sound-categories" as const, label: "盆唄種別管理", path: "/admin/master/sound-categories" },
    { id: "master-sounds" as const, label: "サウンド管理", path: "/admin/master/sounds" },
    { id: "master-survey-options" as const, label: "アンケート選択肢管理", path: "/admin/master/survey-options" },
  ];

  const accountMenuItem = {
    id: "accounts" as const,
    label: "アカウント管理",
    icon: Shield,
    path: "/admin/accounts",
  };

  // マスタ管理ページにいる場合は自動的にメニューを開く
  const isMasterPageActive = masterSubMenuItems.some(item => item.id === currentPage);
  const [isMasterMenuOpen, setIsMasterMenuOpen] = useState(isMasterPageActive);

  useEffect(() => {
    setIsMasterMenuOpen(isMasterPageActive);
  }, [isMasterPageActive]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4">
        {!isCollapsed && (
          <div>
            <h2 className="font-semibold">管理画面</h2>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-white hover:bg-slate-800 ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-colors relative",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
              )}
              <Icon className={cn("w-5 h-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* Master Menu */}
        {!isCollapsed && (
          <>
            <button
              onClick={() => setIsMasterMenuOpen(!isMasterMenuOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-colors relative",
                isMasterPageActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {isMasterPageActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
              )}
              <Database className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">マスタ管理</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 shrink-0 ml-auto transition-transform",
                  isMasterMenuOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Master Sub Menu */}
            {isMasterMenuOpen && (
              <div className="bg-slate-800/50">
                {masterSubMenuItems.map((item) => {
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 pl-12 pr-4 py-2.5 transition-colors relative text-sm",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
        
        {isCollapsed && (
          <button
            onClick={() => navigate("/admin/master/stages")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-colors relative",
              isMasterPageActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {isMasterPageActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
            )}
            <Database className="w-5 h-5 shrink-0 mx-auto" />
          </button>
        )}

        {/* Translation Menu Item */}
        {(() => {
          const translationMenuItem = {
            id: "translations" as const,
            label: "翻訳管理",
            icon: Languages,
            path: "/admin/translations",
          };
          const Icon = translationMenuItem.icon;
          const isActive = currentPage === translationMenuItem.id;

          return (
            <button
              key={translationMenuItem.id}
              onClick={() => navigate(translationMenuItem.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-colors relative",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
              )}
              <Icon className={cn("w-5 h-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{translationMenuItem.label}</span>
              )}
            </button>
          );
        })()}

        {/* Manual Menu Item */}
        {(() => {
          const manualMenuItem = {
            id: "manuals" as const,
            label: "マニュアル管理",
            icon: BookOpen,
            path: "/admin/manuals",
          };
          const Icon = manualMenuItem.icon;
          const isActive = currentPage === manualMenuItem.id;

          return (
            <button
              key={manualMenuItem.id}
              onClick={() => navigate(manualMenuItem.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-colors relative",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
              )}
              <Icon className={cn("w-5 h-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{manualMenuItem.label}</span>
              )}
            </button>
          );
        })()}

        {/* Account Menu Item */}
        {(() => {
          const Icon = accountMenuItem.icon;
          const isActive = currentPage === accountMenuItem.id;

          return (
            <button
              key={accountMenuItem.id}
              onClick={() => navigate(accountMenuItem.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-colors relative",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
              )}
              <Icon className={cn("w-5 h-5 shrink-0", isCollapsed ? "mx-auto" : "")} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{accountMenuItem.label}</span>
              )}
            </button>
          );
        })()}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        {!isCollapsed && (
          <div className="text-xs text-slate-400">
            <p>盆唄システム</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}