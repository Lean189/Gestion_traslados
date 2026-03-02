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

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            if (typeof window === 'undefined') return;

            const isLoginPage = window.location.pathname === "/";
            const currentRole = localStorage.getItem("userRole");

            if (!currentRole && !isLoginPage) {
                window.location.href = "/";
            } else if (currentRole && isLoginPage) {
                window.location.href = "/dashboard";
            } else {
                setIsReady(true);
            }
        };

        checkSession();
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
