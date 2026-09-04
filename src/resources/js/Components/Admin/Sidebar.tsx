import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Users,
    Shield,
    ChevronLeft,
    ChevronRight,
    Database,
    ChevronDown,
    Bell,
    FileText,
    CalendarDays,
    CreditCard,
    MessageSquare,
    BookOpen,
    BarChart3,
    Images,
} from "lucide-react";
import type { SharedProps } from "../../types";

export type AdminPage =
    | "dashboard"
    | "kpi"
    | "members"
    | "reservations"
    | "billing"
    | "contacts"
    | "news"
    | "pages"
    | "master-availability"
    | "master-experiences"
    | "master-pricing-setting"
    | "master-price-adjustment"
    | "master-cancel-policy"
    | "master-faq"
    | "accounts"
    | "manuals"
    | "images";

interface Props {
    currentPage: AdminPage;
    isCollapsed: boolean;
    onToggle: () => void;
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

export default function AdminSidebar({
    currentPage,
    isCollapsed,
    onToggle,
}: Props) {
    const { kpiEnabled } = usePage<SharedProps>().props;
    const menuItems = [
        {
            id: "dashboard" as const,
            label: "ダッシュボード",
            icon: LayoutDashboard,
            path: "/admin/dashboard",
        },
        ...(kpiEnabled
            ? [
                  {
                      id: "kpi" as const,
                      label: "集計（KPI）",
                      icon: BarChart3,
                      path: "/admin/kpi",
                  },
              ]
            : []),
        {
            id: "members" as const,
            label: "会員管理",
            icon: Users,
            path: "/admin/members",
        },
        {
            id: "reservations" as const,
            label: "予約管理",
            icon: CalendarDays,
            path: "/admin/reservations",
        },
        {
            id: "billing" as const,
            label: "請求管理",
            icon: CreditCard,
            path: "/admin/billing",
        },
        {
            id: "contacts" as const,
            label: "お問合せ管理",
            icon: MessageSquare,
            path: "/admin/contacts",
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
    ];

    const masterSubMenuItems = [
        {
            id: "master-availability" as const,
            label: "予約枠管理",
            path: "/admin/master/availability",
        },
        {
            id: "master-experiences" as const,
            label: "体験オプション管理",
            path: "/admin/master/experiences",
        },
        {
            id: "master-pricing-setting" as const,
            label: "料金設定",
            path: "/admin/master/pricing-setting",
        },
        {
            id: "master-price-adjustment" as const,
            label: "料金調整管理",
            path: "/admin/master/price-adjustment",
        },
        {
            id: "master-cancel-policy" as const,
            label: "キャンセルポリシー",
            path: "/admin/master/cancel-policy",
        },
        {
            id: "master-faq" as const,
            label: "よくある質問管理",
            path: "/admin/master/faq",
        },
    ];

    const isMasterPageActive = masterSubMenuItems.some(
        (item) => item.id === currentPage,
    );
    const [isMasterMenuOpen, setIsMasterMenuOpen] =
        useState(isMasterPageActive);

    useEffect(() => {
        if (isMasterPageActive) setIsMasterMenuOpen(true);
    }, [isMasterPageActive]);

    const renderMenuItem = (item: {
        id: string;
        label: string;
        icon: React.ElementType;
        path: string;
    }) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
            <button
                key={item.id}
                onClick={() => router.visit(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors relative"
                style={{
                    backgroundColor: isActive ? "#2c976c" : "transparent",
                    color: isActive ? "#ffffff" : "#c8ddd0",
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#122e0e";
                        e.currentTarget.style.color = "#ffffff";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#c8ddd0";
                    }
                }}
            >
                {isActive && (
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: "#6ee7a8" }}
                    />
                )}
                <Icon
                    className={cn(
                        "w-5 h-5 shrink-0",
                        isCollapsed ? "mx-auto" : "",
                    )}
                />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
        );
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen text-white transition-all duration-300 z-40 flex flex-col",
                isCollapsed ? "w-16" : "w-64",
            )}
            style={{ backgroundColor: "#0a2105" }}
        >
            <div
                className="h-16 flex items-center justify-between px-4"
                style={{ borderBottom: "1px solid rgba(44,151,108,0.3)" }}
            >
                {!isCollapsed && (
                    <div>
                        <h2 className="text-sm" style={{ color: "#e8f5e9" }}>
                            貸別荘エルボスケ
                        </h2>
                        <p className="text-xs" style={{ color: "#6ee7a8" }}>
                            管理画面
                        </p>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="rounded p-1 ml-auto"
                    style={{ color: "#c8ddd0" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#122e0e")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                    }
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map(renderMenuItem)}

                {/* マスタ管理 */}
                {!isCollapsed ? (
                    <>
                        <button
                            onClick={() =>
                                setIsMasterMenuOpen(!isMasterMenuOpen)
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 transition-colors relative"
                            style={{
                                backgroundColor: isMasterPageActive
                                    ? "#2c976c"
                                    : "transparent",
                                color: isMasterPageActive
                                    ? "#ffffff"
                                    : "#c8ddd0",
                            }}
                            onMouseEnter={(e) => {
                                if (!isMasterPageActive) {
                                    e.currentTarget.style.backgroundColor =
                                        "#122e0e";
                                    e.currentTarget.style.color = "#ffffff";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isMasterPageActive) {
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    e.currentTarget.style.color = "#c8ddd0";
                                }
                            }}
                        >
                            {isMasterPageActive && (
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1"
                                    style={{ backgroundColor: "#6ee7a8" }}
                                />
                            )}
                            <Database className="w-5 h-5 shrink-0" />
                            <span className="text-sm">マスタ管理</span>
                            <ChevronDown
                                className={cn(
                                    "w-5 h-5 shrink-0 ml-auto transition-transform",
                                    isMasterMenuOpen ? "rotate-180" : "",
                                )}
                            />
                        </button>
                        {isMasterMenuOpen && (
                            <div
                                style={{ backgroundColor: "rgba(10,33,5,0.6)" }}
                            >
                                {masterSubMenuItems.map((item) => {
                                    const isActive = currentPage === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                router.visit(item.path)
                                            }
                                            className="w-full flex items-center gap-3 pl-12 pr-4 py-2.5 transition-colors relative text-sm"
                                            style={{
                                                backgroundColor: isActive
                                                    ? "#2c976c"
                                                    : "transparent",
                                                color: isActive
                                                    ? "#ffffff"
                                                    : "#c8ddd0",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor =
                                                        "#122e0e";
                                                    e.currentTarget.style.color =
                                                        "#ffffff";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor =
                                                        "transparent";
                                                    e.currentTarget.style.color =
                                                        "#c8ddd0";
                                                }
                                            }}
                                        >
                                            {isActive && (
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 w-1"
                                                    style={{
                                                        backgroundColor:
                                                            "#6ee7a8",
                                                    }}
                                                />
                                            )}
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <button
                        onClick={() =>
                            router.visit("/admin/master/availability")
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors relative"
                        style={{
                            backgroundColor: isMasterPageActive
                                ? "#2c976c"
                                : "transparent",
                            color: isMasterPageActive ? "#ffffff" : "#c8ddd0",
                        }}
                        onMouseEnter={(e) => {
                            if (!isMasterPageActive) {
                                e.currentTarget.style.backgroundColor =
                                    "#122e0e";
                                e.currentTarget.style.color = "#ffffff";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMasterPageActive) {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                                e.currentTarget.style.color = "#c8ddd0";
                            }
                        }}
                    >
                        {isMasterPageActive && (
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1"
                                style={{ backgroundColor: "#6ee7a8" }}
                            />
                        )}
                        <Database className="w-5 h-5 shrink-0 mx-auto" />
                    </button>
                )}

                {renderMenuItem({
                    id: "accounts",
                    label: "アカウント管理",
                    icon: Shield,
                    path: "/admin/accounts",
                })}
                {renderMenuItem({
                    id: "manuals",
                    label: "マニュアル管理",
                    icon: BookOpen,
                    path: "/admin/manuals",
                })}
                {renderMenuItem({
                    id: "images",
                    label: "画像管理",
                    icon: Images,
                    path: "/admin/images",
                })}
            </nav>

            <div
                className="p-4"
                style={{ borderTop: "1px solid rgba(44,151,108,0.3)" }}
            >
                {!isCollapsed && (
                    <div className="text-xs" style={{ color: "#6ee7a8" }}>
                        <p>El bosque Admin</p>
                        <p className="mt-1">v1.0.0</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
