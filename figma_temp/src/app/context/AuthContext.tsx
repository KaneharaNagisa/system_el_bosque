import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { PREFECTURES, getCities } from "../data/japanLocations";

export interface UserProfile {
  nickname: string;
  email: string;
  phone: string;
  prefecture: string;
  city: string;
  password: string;
  birthDate: string;
  hasPet: string;
  petBreed: string;
  petBreed2?: string;
  hasFamily: string;
  familyBirthYears: string[];
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

function normalizeProfile(profile: any): UserProfile {
  if (profile.nickname && profile.prefecture !== undefined && profile.city !== undefined) {
    return {
      ...profile,
      familyBirthYears: profile.familyBirthYears ?? [],
    } as UserProfile;
  }

  const legacyAddress = profile.address ?? "";
  const prefecture = PREFECTURES.find((item) => legacyAddress.includes(item)) ?? "";
  const city = getCities(prefecture).find((item) => legacyAddress.includes(item)) ?? "";

  return {
    ...profile,
    nickname: profile.nickname || `${profile.lastName ?? ""}${profile.firstName ?? ""}` || "ゲスト",
    prefecture,
    city,
    familyBirthYears: profile.familyBirthYears ?? [],
  };
}

export const DEMO_USER: UserProfile = {
  nickname: "たろう",
  email: "demo@elbosque.jp",
  phone: "090-1234-5678",
  prefecture: "東京都",
  city: "新宿区",
  password: "demo1234",
  birthDate: "1985-06-15",
  hasPet: "small",
  petBreed: "トイプードル",
  hasFamily: "married",
  familyBirthYears: [],
  concerns: "特になし",
  howFound: "インターネット検索",
  expectations: "自然の中でゆっくり過ごしたい",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      return normalizeProfile(JSON.parse(saved));
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
        const profile = normalizeProfile(JSON.parse(saved));
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
