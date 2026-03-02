"use client";

import { Clock, CircleDot, CheckCircle2 } from "lucide-react";
import { TransferJoined } from "@/lib/supabase";

interface StatsCardsProps {
    transfers: TransferJoined[];
}

export function StatsCards({ transfers }: StatsCardsProps) {
    const pendingCount = transfers.filter((t) => t.status === 'PENDIENTE').length;
    const inProgressCount = transfers.filter((t) => t.status === 'EN_CURSO').length;
    const completedCount = transfers.filter((t) => t.status === 'COMPLETADO').length;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 mb-10">
            <div className="bg-white p-4 md:p-6 rounded-3xl card-shadow border border-slate-100 flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Clock size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{pendingCount}</p>
                    <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase md:normal-case">Pendientes</p>
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-3xl card-shadow border border-slate-100 flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <CircleDot size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{inProgressCount}</p>
                    <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase md:normal-case">En Curso</p>
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-3xl card-shadow border border-slate-100 flex items-center gap-3 md:gap-4 col-span-2 sm:col-span-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{completedCount}</p>
                    <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase md:normal-case">Completados</p>
                </div>
            </div>
        </div>
    );
}
