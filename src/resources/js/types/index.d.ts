export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: "system_admin" | "facility_admin";
}

export interface SharedProps {
    auth: {
        admin: AdminUser | null;
    };
    flash: {
        message?: string;
        error?: string;
    };
}
