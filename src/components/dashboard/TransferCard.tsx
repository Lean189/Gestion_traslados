"use client";

import {
    User,
    MapPin,
    Clock,
    ArrowRightLeft,
    Edit2,
    Trash2,
    X,
    QrCode
} from "lucide-react";
import { TransferJoined } from "@/lib/supabase";

interface TransferCardProps {
    transfer: TransferJoined;
    role: string | null;
    onStatusUpdate: (id: string, status: string) => void;
    onDelete: (id: string) => void;
    onEdit: (transfer: TransferJoined) => void;
    onCancel: (transfer: TransferJoined) => void;
    onDetails: (transfer: TransferJoined) => void;
}

export function TransferCard({
    transfer,
    role,
    onStatusUpdate,
    onDelete,
    onEdit,
    onCancel,
    onDetails,
}: TransferCardProps) {

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
        <div className="bg-white p-5 rounded-3xl card-shadow border border-slate-100 hover:border-blue-100 transition-all group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl ${transfer.priority === 'URGENTE' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                        <User size={24} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-900 text-lg leading-none">{transfer.patient_name}</h4>
                            {transfer.patient_history_number && (
                                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                    DNI: {transfer.patient_history_number}
                                </span>
                            )}
                            {getStatusBadge(transfer.status)}
                            {transfer.priority === 'URGENTE' && <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-600">Urgente</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1 bg-slate-50 md:bg-transparent p-1 px-2 md:p-0 rounded-lg">
                                <MapPin size={16} className="text-slate-400" />
                                {transfer.origin_sector?.name}
                                <ArrowRightLeft size={12} className="mx-1" />
                                {transfer.destination_sector?.name}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 md:bg-transparent p-1 px-2 md:p-0 rounded-lg">
                                <Clock size={16} className="text-slate-400" />
                                {new Date(transfer.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                            </span>
                        </div>
                        {transfer.observation && (
                            <p className="mt-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-2xl italic border-l-4 border-slate-200">
                                &quot;{transfer.observation}&quot;
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 lg:border-l lg:pl-6 border-slate-100">
                    {role === 'camillero' && transfer.status === 'PENDIENTE' && (
                        <button
                            onClick={() => onStatusUpdate(transfer.id, 'EN_CURSO')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20 w-full lg:w-auto"
                        >
                            Aceptar Traslado
                        </button>
                    )}
                    {role === 'camillero' && transfer.status === 'EN_CURSO' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <button
                                onClick={() => alert("Escanea la pulsera QR del paciente...")}
                                className="bg-slate-50 text-blue-600 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-blue-50 active:scale-95 border border-blue-200 flex items-center justify-center gap-2"
                            >
                                <QrCode size={18} /> Validar QR
                            </button>
                            <button
                                onClick={() => onStatusUpdate(transfer.id, 'COMPLETADO')}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                                Finalizar
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => onDetails(transfer)}
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-slate-200 active:scale-95 border border-slate-200 w-full lg:w-auto"
                    >
                        Detalles
                    </button>

                    <button
                        onClick={() => onEdit(transfer)}
                        className="p-3 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-all border border-slate-100 flex-1 lg:flex-none justify-center flex items-center"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    {role === 'admin' && (
                        <button
                            onClick={() => onDelete(transfer.id)}
                            className="p-3 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all border border-slate-100 flex-1 lg:flex-none justify-center flex items-center"
                            title="Eliminar"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    {(role === 'admin' || role === 'sector') && transfer.status !== 'CANCELADO' && transfer.status !== 'COMPLETADO' && (
                        <button
                            onClick={() => onCancel(transfer)}
                            className="p-3 rounded-xl hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-all border border-slate-100 flex-1 lg:flex-none justify-center flex items-center"
                            title="Cancelar Traslado"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
