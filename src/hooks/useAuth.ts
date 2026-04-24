"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useAuth() {
    const [role, setRole] = useState<string | null>(null);
    const [sectorId, setSectorId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            if (typeof window === 'undefined') return;

            const isLoginPage = window.location.pathname === "/";
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                if (!isLoginPage) window.location.href = "/";
                else setIsReady(true);
                return;
            }

            // User is signed in. Check their role in active_sessions
            const { data: sessionData, error } = await supabase
                .from('active_sessions')
                .select('role_name, sector_id')
                .eq('user_id', session.user.id)
                .single();

            if (error || !sessionData) {
                // Invalid or missing session data
                await supabase.auth.signOut();
                if (!isLoginPage) window.location.href = "/";
                else setIsReady(true);
                return;
            }

            setRole(sessionData.role_name);
            setSectorId(sessionData.sector_id);

            if (isLoginPage) {
                window.location.href = "/dashboard";
            } else {
                setIsReady(true);
            }
        };

        checkSession();
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    }, []);

    const loginSuccess = useCallback(() => {
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
