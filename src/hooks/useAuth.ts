"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [sectorId, setSectorId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const isLoginPage = pathname === "/";
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                if (!isLoginPage) router.replace("/");
                else setIsReady(true);
                return;
            }

            // User is signed in. Check their role in active_sessions
            const { data: sessionData, error } = await supabase
                .from('active_sessions')
                .select('role_name, sector_id')
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                // PGRST116 = postgrest code for no rows returned.
                // If the session row is missing, sign out. Otherwise, it might be a temporary network error.
                if (error.code === 'PGRST116') {
                    await supabase.auth.signOut();
                    if (!isLoginPage) router.replace("/");
                    else setIsReady(true);
                } else {
                    console.error("Error checking session (likely network loss):", error);
                    setIsReady(true);
                }
                return;
            }

            if (!sessionData) {
                await supabase.auth.signOut();
                if (!isLoginPage) router.replace("/");
                else setIsReady(true);
                return;
            }

            setRole(sessionData.role_name);
            setSectorId(sessionData.sector_id);

            if (isLoginPage) {
                router.replace("/dashboard");
            } else {
                setIsReady(true);
            }
        };

        checkSession();
    }, [router, pathname]);

    const logout = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // Limpiar tabla de sesiones activas antes de salir
            await supabase.from('active_sessions').delete().eq('user_id', session.user.id);
        }
        await supabase.auth.signOut();
        router.replace("/");
    }, [router]);

    const loginSuccess = useCallback(() => {
        router.replace("/dashboard");
    }, [router]);

    return {
        role,
        sectorId,
        isReady,
        logout,
        loginSuccess
    };
}
