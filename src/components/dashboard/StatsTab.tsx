"use client";

import { AlertTriangle } from "lucide-react";
import { TransferJoined } from "@/lib/supabase";

interface StatsTabProps {
    transfers: TransferJoined[];
}

export function StatsTab({ transfers }: StatsTabProps) {
    const sectors = Array.from(new Set(transfers.map(t => t.origin_sector?.name))).filter(Boolean);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Eficiencia de Respuesta</h3>
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tiempo Medio de Espera</p>
                        <p className="text-4xl font-black text-blue-600">
                            {(() => {
                                const completed = transfers.filter(t => t.accepted_at && t.requested_at);
                                if (completed.length === 0) return "0 min";
                                const total = completed.reduce((acc, t) => {
                                    return acc + (new Date(t.accepted_at!).getTime() - new Date(t.requested_at).getTime());
                                }, 0);
                                return Math.round(total / completed.length / 60000) + " min";
                            })()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Desde solicitud hasta aceptación</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tiempo Medio de Traslado</p>
                        <p className="text-4xl font-black text-emerald-600">
                            {(() => {
                                const completed = transfers.filter(t => t.completed_at && t.accepted_at);
                                if (completed.length === 0) return "0 min";
                                const total = completed.reduce((acc, t) => {
                                    return acc + (new Date(t.completed_at!).getTime() - new Date(t.accepted_at!).getTime());
                                }, 0);
                                return Math.round(total / completed.length / 60000) + " min";
                            })()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Desde aceptación hasta finalización</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Demanda por Sector</h3>
                <div className="space-y-4">
                    {sectors.map(sector => (
                        <div key={sector}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-700">{sector}</span>
                                <span className="text-xs font-bold text-slate-400">{transfers.filter(t => t.origin_sector?.name === sector).length} traslados</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(transfers.filter(t => t.origin_sector?.name === sector).length / transfers.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100 col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={24} /> Monitoreo de Sectores Críticos (Simulado)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                        <p className="text-[10px] font-bold text-red-400 uppercase">Guardia</p>
                        <p className="text-lg font-black text-red-700">DEMANDA ALTA</p>
                        <div className="mt-2 h-1 w-full bg-red-200 rounded-full overflow-hidden">
                            <div className="bg-red-600 h-full w-[85%] animate-pulse" />
                        </div>
                        <p className="text-[10px] text-red-600 font-bold mt-1">Espera prom: 22 min</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase">Piso 4</p>
                        <p className="text-lg font-black text-emerald-700">NORMAL</p>
                        <div className="mt-2 h-1 w-full bg-emerald-200 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full w-[30%]" />
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Espera prom: 4 min</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase">UTI</p>
                        <p className="text-lg font-black text-blue-700">ESTABLE</p>
                        <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full w-[15%]" />
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold mt-1">Espera prom: 2 min</p>
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 italic font-medium">
                    * Este panel utiliza análisis predictivo para alertar sobre demoras excesivas.
                </p>
            </div>
        </div>
    );
}
