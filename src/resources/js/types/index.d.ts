export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: "system_admin" | "facility_admin";
}

export interface SharedProps {
    kpiEnabled: boolean;
    auth: {
        admin: AdminUser | null;
    };
    flash: {
        message?: string;
        error?: string;
    };
    images?: Record<string, string>;
}
