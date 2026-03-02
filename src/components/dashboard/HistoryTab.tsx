"use client";

import { useState } from "react";
import { Plus, User, MapPin, Calendar, Clock, X, ArrowRightLeft } from "lucide-react";
import { TransferJoined } from "@/lib/supabase";

interface HistoryTabProps {
    transfers: TransferJoined[];
    onDetails: (transfer: TransferJoined) => void;
}

export function HistoryTab({ transfers, onDetails }: HistoryTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");
    const [filterDate, setFilterDate] = useState("");

    const exportToCSV = () => {
        if (transfers.length === 0) return;

        const headers = ["ID", "Paciente", "DNI", "Origen", "Destino", "Tipo", "Estado", "Prioridad", "Camillero", "Fecha Solicitud", "Aceptado", "Completado"];
        const rows = transfers.map(t => [
            t.id,
            t.patient_name,
            t.patient_history_number || "",
            t.origin_sector?.name || "",
            t.destination_sector?.name || "",
            t.transfer_type?.name || "",
            t.status,
            t.priority,
            t.transporter_name || "",
            new Date(t.requested_at).toLocaleString(),
            t.accepted_at ? new Date(t.accepted_at).toLocaleString() : "",
            t.completed_at ? new Date(t.completed_at).toLocaleString() : ""
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_traslados_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredTransfers = transfers.filter(t => {
        const matchSearch = t.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.patient_history_number?.includes(searchQuery));
        const matchStatus = filterStatus === "TODOS" || t.status === filterStatus;
        const matchDate = !filterDate || new Date(t.requested_at).toISOString().split('T')[0] === filterDate;
        return matchSearch && matchStatus && matchDate;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDIENTE': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Pendiente</span>;
            case 'EN_CURSO': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">En Curso</span>;
            case 'COMPLETADO': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Completado</span>;
            case 'CANCELADO': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">Cancelado</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl card-shadow border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por paciente o DNI..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-950 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all pl-14"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="w-full md:w-48 px-4 py-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="TODOS">Todos los estados</option>
                    <option value="EN_CURSO">En Curso</option>
                    <option value="COMPLETADO">Completados</option>
                    <option value="CANCELADO">Cancelados</option>
                </select>
                <input
                    type="date"
                    className="w-full md:w-48 px-4 py-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
                <button
                    onClick={exportToCSV}
                    className="p-3 px-5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold transition-all border border-emerald-100 flex items-center gap-2"
                >
                    <ArrowRightLeft size={18} className="rotate-90" />
                    Exportar
                </button>
                {(searchQuery || filterStatus !== "TODOS" || filterDate) && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setFilterStatus("TODOS");
                            setFilterDate("");
                        }}
                        className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all border border-slate-200"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 pb-20">
                {filteredTransfers.map((transfer) => (
                    <div key={transfer.id} className="bg-white p-5 rounded-3xl card-shadow border border-slate-100 opacity-90 hover:opacity-100 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 text-slate-400">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <h4 className="font-bold text-slate-900 text-lg leading-none">{transfer.patient_name}</h4>
                                        {transfer.patient_history_number && (
                                            <span className="text-xs font-semibold text-slate-400">DNI: {transfer.patient_history_number}</span>
                                        )}
                                        {getStatusBadge(transfer.status)}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={16} /> {transfer.origin_sector?.name} → {transfer.destination_sector?.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={16} /> {new Date(transfer.requested_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={16} /> {new Date(transfer.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onDetails(transfer)}
                                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-slate-200 active:scale-95 border border-slate-200 w-full lg:w-auto"
                            >
                                Ver Registro
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
