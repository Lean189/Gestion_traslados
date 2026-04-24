import React from 'react';

export function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'PENDIENTE': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Pendiente</span>;
        case 'EN_CURSO': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">En Curso</span>;
        case 'COMPLETADO': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Completado</span>;
        case 'CANCELADO': return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">Cancelado</span>;
        default: return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">{status}</span>;
    }
}
