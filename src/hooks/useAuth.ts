"use client";

import { useState, useCallback, useEffect } from "react";

export function useAuth() {
    const [role] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("userRole");
        }
        return null;
    });

    const [sectorId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("userSectorId");
        }
        return null;
    });

    // isReady is true if we already have a role (and we are on client)
    const [isReady] = useState(() => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem("userRole");
        }
        return false;
    });

    useEffect(() => {
        if (!role && typeof window !== 'undefined') {
            window.location.href = "/";
        }
    }, [role]);

    const logout = useCallback(() => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userSectorId");
        window.location.href = "/";
    }, []);

    const loginSuccess = useCallback((userRole: string, userSectorId: string | null = null) => {
        localStorage.setItem("userRole", userRole);
        if (userSectorId) localStorage.setItem("userSectorId", userSectorId);
        window.location.href = "/dashboard";
    }, []);

    return {
        role,
        sectorId,
        isReady,
        logout,
        loginSuccess
    };
}
