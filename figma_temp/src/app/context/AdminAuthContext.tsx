import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "system_admin" | "facility_admin";
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
}

const defaultAdminAuthContext: AdminAuthContextType = {
  adminUser: null,
  isAdminLoggedIn: false,
  adminLogin: () => false,
  adminLogout: () => {},
};

const AdminAuthContext = createContext<AdminAuthContextType>(defaultAdminAuthContext);

const ADMIN_STORAGE_KEY = "elbosque_admin";

// デモ管理者アカウント
const DEMO_ADMIN: AdminUser = {
  id: "admin-001",
  name: "管理者",
  email: "admin@elbosque.jp",
  role: "system_admin",
};

const DEMO_ADMIN_PASSWORD = "admin1234";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [adminUser]);

  const adminLogin = (email: string, password: string): boolean => {
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN_PASSWORD) {
      setAdminUser(DEMO_ADMIN);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminLoggedIn: !!adminUser,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
