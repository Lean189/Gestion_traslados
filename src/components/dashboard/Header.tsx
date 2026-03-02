"use client";

import { LogOut, ArrowRightLeft } from "lucide-react";
import type { Metadata } from "next";

interface HeaderProps {
    role: string | null;
    logout: () => void;
}

export const metadata: Metadata = {
    title: "Sistema de Gestión de Traslados",
    description: "Plataforma de gestión de traslados de pacientes en tiempo real para sectores y áreas críticas.",
};

export function Header({ role, logout }: HeaderProps) {
    return (
        <header className="glass sticky top-0 z-10 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                        <ArrowRightLeft size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 leading-tight">Traslados</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sesión como</p>
                        <p className="font-semibold text-slate-700 capitalize">{role}</p>
                    </div>
                    <button
                        onClick={logout}
                        aria-label="Cerrar Sesión"
                        className="p-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
