"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, TransferJoined } from "@/lib/supabase";
import {
    Plus,
    LogOut,
    Clock,
    MapPin,
    User,
    AlertCircle,
    CheckCircle2,
    CircleDot,
    ArrowRightLeft,
    Calendar,
    Edit2,
    Trash2,
    X
} from "lucide-react";

import TransferForm from "@/components/TransferForm";
import TransferDetailsModal from "@/components/TransferDetailsModal";

export const dynamic = 'force-dynamic';

export default function Dashboard() {
    const [role, setRole] = useState<string | null>(null);
    const [transfers, setTransfers] = useState<TransferJoined[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferJoined | null>(null);
    const [activeTab, setActiveTab] = useState<'live' | 'history' | 'stats'>('live');
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("TODOS");
    const [filterDate, setFilterDate] = useState("");
    const [transferToEdit, setTransferToEdit] = useState<TransferJoined | null>(null);

    const fetchTransfers = useCallback(async () => {
        const { data, error } = await supabase
            .from('transfers')
            .select(`
        *,
        origin_sector:sectors!origin_sector_id(name),
        destination_sector:sectors!destination_sector_id(name),
        transfer_type:transfer_types!transfer_type_id(name)
      `)
            .order('requested_at', { ascending: false });

        if (!error) {
            setTransfers((data || []) as unknown as TransferJoined[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const savedRole = localStorage.getItem("userRole");
        if (!savedRole) {
            window.location.href = "/";
        } else {
            setRole(savedRole);
            fetchTransfers();

            const channel = supabase
                .channel('schema-db-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'transfers' },
                    () => fetchTransfers()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [fetchTransfers]);

    const updateStatus = async (id: string, nextStatus: string) => {
        try {
            // 1. Obtener el estado actual del traslado antes de actualizar
            const { data: current, error: fetchError } = await supabase
                .from('transfers')
                .select('status')
                .eq('id', id)
                .single();

            if (fetchError || !current) {
                alert("Error al verificar el estado del traslado. Verifica tu conexión.");
                return;
            }

            // 2. Validaciones de flujo lógico
            if (nextStatus === 'EN_CURSO' && current.status !== 'PENDIENTE') {
                alert("Este traslado ya no está disponible (fue tomado por otro camillero o cancelado).");
                fetchTransfers(); // Refrescar lista
                return;
            }

            if (nextStatus === 'COMPLETADO' && current.status !== 'EN_CURSO') {
                alert("El traslado debe estar 'En Curso' para poder finalizarlo.");
                fetchTransfers();
                return;
            }

            // 3. Preparar datos de actualización
            const updateData: {
                status: string;
                accepted_at?: string;
                completed_at?: string;
            } = { status: nextStatus };

            if (nextStatus === 'EN_CURSO') updateData.accepted_at = new Date().toISOString();
            if (nextStatus === 'COMPLETADO') updateData.completed_at = new Date().toISOString();

            // 4. Realizar la actualización con un check adicional de seguridad (mismo estado que leímos)
            const { error: updateError } = await supabase
                .from('transfers')
                .update(updateData)
                .eq('id', id)
                .eq('status', current.status); // Check atómico: solo actualiza si el estado no cambió en el milisegundo intermedio

            if (updateError) {
                alert("No se pudo actualizar: " + updateError.message);
            } else {
                // Éxito: el realtime channel se encargará de refrescar la UI, 
                // pero forzamos un fetch para estar seguros en conexiones lentas.
                fetchTransfers();
            }
        } catch (err) {
            console.error(err);
            alert("Ocurrió un error inesperado al actualizar el traslado.");
        }
    };

    const deleteTransfer = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este traslado?")) return;

        const { error } = await supabase
            .from('transfers')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            fetchTransfers();
        }
    };

    const logout = () => {
        localStorage.removeItem("userRole");
        window.location.href = "/";
    };

    const cancelTransfer = async (transfer: TransferJoined) => {
        const reason = prompt("Ingrese el motivo de la cancelación:");
        if (reason === null) return; // Usuario canceló el prompt
        if (!reason.trim()) {
            alert("Debe ingresar un motivo para cancelar.");
            return;
        }

        const newObservation = transfer.observation
            ? `${transfer.observation}\n\nMOTIVO CANCELACIÓN: ${reason}`
            : `MOTIVO CANCELACIÓN: ${reason}`;

        const { error } = await supabase
            .from('transfers')
            .update({
                status: 'CANCELADO',
                observation: newObservation
            })
            .eq('id', transfer.id);

        if (error) {
            alert("Error al cancelar: " + error.message);
        } else {
            fetchTransfers();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDIENTE': return <span className="badge bg-amber-100 text-amber-700">Pendiente</span>;
            case 'EN_CURSO': return <span className="badge bg-blue-100 text-blue-700">En Curso</span>;
            case 'COMPLETADO': return <span className="badge bg-emerald-100 text-emerald-700">Completado</span>;
            case 'CANCELADO': return <span className="badge bg-red-100 text-red-700">Cancelado</span>;
            default: return <span className="badge bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="glass sticky top-0 z-10 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                            <ArrowRightLeft size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 leading-tight">Traslados</h2>
                            <p className="text-xs text-slate-500 font-medium">Sanatorio San José</p>
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

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Panel de Control</h1>
                        <p className="text-slate-500 font-medium">Gestiona y supervisa los traslados.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {role === 'admin' && (
                            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 w-full md:w-auto overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('live')}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'live' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    En Vivo
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Historial
                                </button>
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Analíticas
                                </button>
                            </div>
                        )}

                        {(role === 'sector' || role === 'imagenes') && (
                            <>
                                {/* Botón de escritorio */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn-primary hidden md:flex items-center gap-2 w-full md:w-auto justify-center"
                                >
                                    <Plus size={20} /> Nueva Solicitud
                                </button>

                                {/* FAB para móviles */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
                                    aria-label="Nueva Solicitud"
                                >
                                    <Plus size={28} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {activeTab === 'live' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 mb-10">
                            <div className="bg-white p-4 md:p-6 rounded-3xl card-shadow border border-slate-100 flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                    <Clock size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{transfers.filter((t: TransferJoined) => t.status === 'PENDIENTE').length}</p>
                                    <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase md:normal-case">Pendientes</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 md:p-6 rounded-3xl card-shadow border border-slate-100 flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <CircleDot size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{transfers.filter((t: TransferJoined) => t.status === 'EN_CURSO').length}</p>
                                    <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase md:normal-case">En Curso</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 md:p-6 rounded-3xl card-shadow border border-slate-100 flex items-center gap-3 md:gap-4 col-span-2 sm:col-span-1">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{transfers.filter((t: TransferJoined) => t.status === 'COMPLETADO').length}</p>
                                    <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase md:normal-case">Completados</p>
                                </div>
                            </div>
                        </div>

                        {/* Transfers List */}
                        <div className="space-y-4 pb-20">
                            <h3 className="font-bold text-slate-800 text-lg ml-1">Traslados Recientes</h3>
                            {transfers.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                                    <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-slate-500 font-medium text-lg">No hay traslados activos en este momento.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {transfers.map((transfer: TransferJoined) => (
                                        <div key={transfer.id} className="bg-white p-5 rounded-3xl card-shadow border border-slate-100 hover:border-blue-100 transition-all group">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-4 rounded-2xl ${transfer.priority === 'URGENTE' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                                                        }`}>
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
                                                            {transfer.priority === 'URGENTE' && <span className="badge bg-red-100 text-red-600">Urgente</span>}
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
                                                            onClick={() => updateStatus(transfer.id, 'EN_CURSO')}
                                                            className="btn-primary w-full lg:w-auto"
                                                        >
                                                            Aceptar Traslado
                                                        </button>
                                                    )}
                                                    {role === 'camillero' && transfer.status === 'EN_CURSO' && (
                                                        <button
                                                            onClick={() => updateStatus(transfer.id, 'COMPLETADO')}
                                                            className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 w-full lg:w-auto"
                                                        >
                                                            Finalizar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedTransfer(transfer)}
                                                        className="btn-secondary w-full lg:w-auto"
                                                    >
                                                        Detalles
                                                    </button>

                                                    <button
                                                        onClick={() => setTransferToEdit(transfer)}
                                                        className="p-3 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-all border border-slate-100 flex-1 lg:flex-none justify-center flex items-center"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    {role === 'admin' && (
                                                        <button
                                                            onClick={() => deleteTransfer(transfer.id)}
                                                            className="p-3 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-all border border-slate-100 flex-1 lg:flex-none justify-center flex items-center"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                    {(role === 'admin' || role === 'sector') && transfer.status !== 'CANCELADO' && transfer.status !== 'COMPLETADO' && (
                                                        <button
                                                            onClick={() => cancelTransfer(transfer)}
                                                            className="p-3 rounded-xl hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-all border border-slate-100 flex-1 lg:flex-none justify-center flex items-center"
                                                            title="Cancelar Traslado"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'history' && role === 'admin' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl card-shadow border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente o DNI..."
                                    className="input-field pl-12"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="input-field md:w-48"
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
                                className="input-field md:w-48"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                            {(searchQuery || filterStatus !== "TODOS" || filterDate) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFilterStatus("TODOS");
                                        setFilterDate("");
                                    }}
                                    className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all border border-slate-200"
                                    title="Limpiar filtros"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 pb-20">
                            {transfers
                                .filter(t => {
                                    const matchSearch = t.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (t.patient_history_number?.includes(searchQuery));
                                    const matchStatus = filterStatus === "TODOS" || t.status === filterStatus;
                                    const matchDate = !filterDate || new Date(t.requested_at).toISOString().split('T')[0] === filterDate;
                                    return matchSearch && matchStatus && matchDate;
                                })
                                .map((transfer: TransferJoined) => (
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
                                                onClick={() => setSelectedTransfer(transfer)}
                                                className="btn-secondary w-full lg:w-auto"
                                            >
                                                Ver Registro
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                {activeTab === 'stats' && role === 'admin' && (
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
                                {Array.from(new Set(transfers.map(t => t.origin_sector?.name))).filter(Boolean).map(sector => (
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
                    </div>
                )}
            </main>

            {isModalOpen && (
                <TransferForm
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchTransfers}
                />
            )}

            {transferToEdit && (
                <TransferForm
                    editData={transferToEdit}
                    onClose={() => setTransferToEdit(null)}
                    onSuccess={fetchTransfers}
                />
            )}

            {selectedTransfer && (
                <TransferDetailsModal
                    transfer={selectedTransfer}
                    onClose={() => setSelectedTransfer(null)}
                />
            )}
        </div>
    );
}
