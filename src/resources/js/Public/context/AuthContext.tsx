import { router, usePage } from "@inertiajs/react";
import { createContext, useContext, type ReactNode } from "react";

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
    login: (
        email: string,
        password: string,
        redirect: string,
        onError: (message: string) => void,
    ) => void;
    logout: () => void;
    register: (
        profile: UserProfile,
        redirect: string,
        onSuccess: () => void,
        onError: (message: string) => void,
    ) => void;
    updateProfile: (
        updates: Partial<UserProfile>,
        onSuccess?: () => void,
    ) => void;
    changePassword: (
        currentPassword: string,
        newPassword: string,
        onSuccess: () => void,
        onError: () => void,
    ) => void;
    deleteAccount: () => void;
    pendingEmail: string;
    setPendingEmail: (email: string) => void;
}

const defaultAuthContext: AuthContextType = {
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
    register: () => {},
    updateProfile: () => {},
    changePassword: () => {},
    deleteAccount: () => {},
    pendingEmail: "",
    setPendingEmail: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { auth } = usePage<{ auth: { user: UserProfile | null } }>().props;
    const login: AuthContextType["login"] = (
        email,
        password,
        redirect,
        onError,
    ) => {
        router.post(
            "/login",
            { email, password, redirect },
            {
                onError: (errors) =>
                    onError(
                        String(errors.email ?? "ログインできませんでした。"),
                    ),
            },
        );
    };
    const logout = () => router.post("/logout");
    const register: AuthContextType["register"] = (
        profile,
        redirect,
        onSuccess,
        onError,
    ) => {
        router.post(
            "/register",
            {
                ...profile,
                password_confirmation: profile.password,
                redirect,
            },
            {
                onSuccess,
                onError: (errors) =>
                    onError(
                        String(
                            Object.values(errors)[0] ??
                                "会員登録に失敗しました。",
                        ),
                    ),
            },
        );
    };
    const updateProfile: AuthContextType["updateProfile"] = (
        updates,
        onSuccess,
    ) => {
        router.patch("/mypage", updates, { preserveScroll: true, onSuccess });
    };
    const changePassword: AuthContextType["changePassword"] = (
        currentPassword,
        newPassword,
        onSuccess,
        onError,
    ) => {
        router.patch(
            "/mypage/password",
            {
                currentPassword,
                newPassword,
                newPassword_confirmation: newPassword,
            },
            { preserveScroll: true, onSuccess, onError },
        );
    };
    const deleteAccount = () => router.delete("/mypage");

    return (
        <AuthContext.Provider
            value={{
                user: auth.user,
                isLoggedIn: !!auth.user,
                login,
                logout,
                register,
                updateProfile,
                changePassword,
                deleteAccount,
                pendingEmail: "",
                setPendingEmail: () => {},
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
