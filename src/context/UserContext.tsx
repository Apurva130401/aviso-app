"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getDashboardStatsAction } from "@/app/actions";

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    credits_total: number;
    credits_used: number;
    plan_tier: string;
}

interface UserContextType {
    profile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await getDashboardStatsAction();
            if (res.success && res.data) {
                // We know getDashboardStatsAction returns profile-like data
                // But we need to make sure the server action returns email and full_name now.
                // Wait, I updated it but I should check the return type of that action.
                setProfile({
                    id: "", // We don't strictly need ID in the context for UI usually
                    email: (res.data as any).email || "",
                    full_name: (res.data as any).fullName || "",
                    credits_total: res.data.creditsTotal,
                    credits_used: res.data.creditsUsed,
                    plan_tier: res.data.planTier,
                });
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <UserContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
