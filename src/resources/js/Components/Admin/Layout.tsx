import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminSidebar, { type AdminPage } from "./Sidebar";
import { LogOut, Menu } from "lucide-react";
import type { SharedProps } from "../../types";

function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

interface Props {
    currentPage: AdminPage;
    title: string;
    children: React.ReactNode;
}

export default function AdminLayout({ currentPage, title, children }: Props) {
    const { auth = { admin: null } } = usePage<SharedProps>().props;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        document.body.setAttribute("data-admin", "true");
        return () => {
            document.body.removeAttribute("data-admin");
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767px)");
        const updateIsMobile = (event: MediaQueryList | MediaQueryListEvent) => {
            setIsMobile(event.matches);
            if (!event.matches) setIsMobileSidebarOpen(false);
        };

        updateIsMobile(mediaQuery);
        mediaQuery.addEventListener("change", updateIsMobile);
        return () => mediaQuery.removeEventListener("change", updateIsMobile);
    }, []);

    const handleLogout = () => {
        router.post("/admin/logout");
    };

    return (
        <div
            className="min-h-screen"
            style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                backgroundColor: "#f4f7f5",
            }}
        >
            {isMobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="メニューを閉じる"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                />
            )}
            <AdminSidebar
                currentPage={currentPage}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobileOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />

            <div
                className={cn(
                    "min-w-0 transition-all duration-300",
                    isSidebarCollapsed ? "md:ml-16" : "md:ml-64",
                )}
            >
                <header
                    className="bg-white"
                    style={{ borderBottom: "1px solid rgba(10,33,5,0.1)" }}
                >
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                {isMobile && (
                                    <button
                                        type="button"
                                        aria-label="メニューを開く"
                                        aria-expanded={isMobileSidebarOpen}
                                        onClick={() =>
                                            setIsMobileSidebarOpen(
                                                !isMobileSidebarOpen,
                                            )
                                        }
                                        className="shrink-0 rounded p-2 text-[#1b3a14] hover:bg-[#e8f5e9]"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </button>
                                )}
                                <h1 className="truncate text-xl text-gray-900">
                                    {title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.admin && (
                                    <span
                                        className="hidden text-sm sm:inline"
                                        style={{ color: "#1b3a14" }}
                                    >
                                        {auth.admin.name}
                                    </span>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                                    style={{ color: "#1b3a14" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#e8f5e9";
                                        e.currentTarget.style.color = "#0a2105";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "transparent";
                                        e.currentTarget.style.color = "#1b3a14";
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        ログアウト
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-6 py-8">{children}</main>
            </div>
        </div>
    );
}
