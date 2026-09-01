import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserProfile {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  birthDate: string;
  hasPet: string;
  petBreed: string;
  petBreed2?: string;
  hasFamily: string;
  concerns: string;
  howFound: string;
  expectations: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  deleteAccount: () => void;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
  register: () => {},
  updateProfile: () => {},
  changePassword: () => false,
  deleteAccount: () => {},
  pendingEmail: "",
  setPendingEmail: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const STORAGE_KEY = "elbosque_user";

export const DEMO_USER: UserProfile = {
  lastName: "山田",
  firstName: "太郎",
  lastNameKana: "やまだ",
  firstNameKana: "たろう",
  email: "demo@elbosque.jp",
  phone: "090-1234-5678",
  address: "東京都新宿区西新宿1-1-1",
  password: "demo1234",
  birthDate: "1985-06-15",
  hasPet: "small",
  petBreed: "トイプードル",
  hasFamily: "married",
  concerns: "特になし",
  howFound: "インターネット検索",
  expectations: "自然の中でゆっくり過ごしたい",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    // Check demo user
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      setUser(DEMO_USER);
      return true;
    }
    // Check registered user in localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const profile: UserProfile = JSON.parse(saved);
        if (profile.email === email && profile.password === password) {
          setUser(profile);
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = (profile: UserProfile) => {
    setUser(profile);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (user && user.password === currentPassword) {
      setUser({ ...user, password: newPassword });
      return true;
    }
    return false;
  };

  const deleteAccount = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, logout, register, updateProfile, changePassword, deleteAccount, pendingEmail, setPendingEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}