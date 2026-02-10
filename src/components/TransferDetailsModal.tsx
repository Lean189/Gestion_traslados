"use client";

import { TransferJoined } from "@/lib/supabase";
import {
    X,
    MapPin,
    User,
    Info,
    Calendar,
    ArrowRightCircle,
    CheckCircle2,
    PlayCircle
} from "lucide-react";

interface TransferDetailsModalProps {
    transfer: TransferJoined;
    onClose: () => void;
}

export default function TransferDetailsModal({ transfer, onClose }: TransferDetailsModalProps) {
    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " hs";
    };


    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-2xl h-[95vh] sm:h-auto rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 sm:zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Info size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Detalles</h3>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">ID: {transfer.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[calc(95vh-160px)] sm:max-h-[75vh] overflow-y-auto pb-20 sm:pb-8">
                    {/* Sección Paciente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase">Paciente</p>
                            <div className="flex items-center gap-3">
                                <User className="text-blue-500" size={20} />
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-800">{transfer.patient_name}</span>
                                    {transfer.patient_room && (
                                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg w-fit">
                                            Habitación {transfer.patient_room}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase">DNI / ID</p>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-slate-600">
                                    {transfer.patient_history_number || "No registrado"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Sección Ruta y Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Desde</p>
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-slate-400" size={18} />
                                    <span className="font-bold text-slate-700">{transfer.origin_sector?.name}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Hacia</p>
                                <div className="flex items-center gap-3">
                                    <ArrowRightCircle className="text-blue-500" size={18} />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{transfer.destination_sector?.name}</span>
                                        {transfer.destination_room && (
                                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg w-fit">
                                                Habitación {transfer.destination_room}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase">Tipo de Traslado</p>
                                <div className="flex items-center gap-3">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                                        {transfer.transfer_type?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Tiempos y Estado */}
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" /> Seguimiento Temporal
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitado</p>
                                <p className="text-sm font-bold text-slate-700">{formatTime(transfer.requested_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Aceptado</p>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                        {transfer.accepted_at ? <PlayCircle size={14} className="text-blue-500" /> : null}
                                        <p className="text-sm font-bold text-slate-700">{formatTime(transfer.accepted_at)}</p>
                                    </div>
                                    {transfer.transporter_name && (
                                        <p className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                                            Por: {transfer.transporter_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Completado</p>
                                <div className="flex items-center gap-1">
                                    {transfer.completed_at ? <CheckCircle2 size={14} className="text-emerald-500" /> : null}
                                    <p className="text-sm font-bold text-slate-700">{formatTime(transfer.completed_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    {transfer.observation && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase">Observaciones Adicionales</p>
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-200 rounded-r-2xl">
                                <p className="text-slate-700 italic">{transfer.observation}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="btn-primary"
                    >
                        Cerrar Detalles
                    </button>
                </div>
            </div>
        </div>
    );
}
