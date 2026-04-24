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
                    <AlertTriangle className="text-amber-500" size={24} /> Estado Actual de Traslados Activos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {['URGENTE', 'ALTA', 'MEDIA', 'BAJA'].map(p => {
                        const count = transfers.filter(t => t.priority === p && t.status !== 'COMPLETADO' && t.status !== 'CANCELADO').length;
                        return (
                            <div key={p} className={`p-4 rounded-2xl border ${
                                p === 'URGENTE' ? 'bg-red-50 border-red-100' :
                                p === 'ALTA' ? 'bg-orange-50 border-orange-100' :
                                p === 'MEDIA' ? 'bg-blue-50 border-blue-100' :
                                'bg-slate-50 border-slate-100'
                            }`}>
                                <p className={`text-[10px] font-bold uppercase ${
                                    p === 'URGENTE' ? 'text-red-400' :
                                    p === 'ALTA' ? 'text-orange-400' :
                                    p === 'MEDIA' ? 'text-blue-400' :
                                    'text-slate-400'
                                }`}>Prioridad {p}</p>
                                <p className={`text-2xl font-black ${
                                    p === 'URGENTE' ? 'text-red-700' :
                                    p === 'ALTA' ? 'text-orange-700' :
                                    p === 'MEDIA' ? 'text-blue-700' :
                                    'text-slate-700'
                                }`}>{count}</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">Traslados Activos</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
