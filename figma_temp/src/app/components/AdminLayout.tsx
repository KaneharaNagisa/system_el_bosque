import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminSidebar, { type AdminPage } from "./AdminSidebar";
import { cn } from "./ui/utils";
import { LogOut } from "lucide-react";

interface AdminLayoutProps {
  currentPage: AdminPage;
  title: string;
  children?: React.ReactNode;
}

export function AdminLayout({ currentPage, title, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { adminUser, isAdminLoggedIn, adminLogout } = useAdminAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/admin");
    }
  }, [isAdminLoggedIn, navigate]);

  useEffect(() => {
    document.body.setAttribute("data-admin", "true");
    return () => {
      document.body.removeAttribute("data-admin");
    };
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin");
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="admin-page min-h-screen" style={{ fontFamily: "'Noto Sans JP', sans-serif", backgroundColor: "#f4f7f5" }}>
      <AdminSidebar
        currentPage={currentPage}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={cn("transition-all duration-300", isSidebarCollapsed ? "ml-16" : "ml-64")}>
        {/* Header */}
        <header className="bg-white" style={{ borderBottom: "1px solid rgba(10,33,5,0.1)" }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl text-gray-900">{title}</h1>
              <div className="flex items-center gap-4">
                {adminUser && (
                  <span className="text-sm" style={{ color: "#1b3a14" }}>{adminUser.name}</span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                  style={{ color: "#1b3a14" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e8f5e9"; e.currentTarget.style.color = "#0a2105"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#1b3a14"; }}
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}