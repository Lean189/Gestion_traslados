"use client";

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { TransferJoined } from "@/lib/supabase";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { useTransfers } from "@/hooks/useTransfers";

// Components
import { Header } from "@/components/dashboard/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TransferCard } from "@/components/dashboard/TransferCard";
import { HistoryTab } from "@/components/dashboard/HistoryTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import TransferForm from "@/components/TransferForm";
import TransferDetailsModal from "@/components/TransferDetailsModal";
import StatusModal from "@/components/ui/StatusModal";
import { Skeleton } from "@/components/ui/Skeleton";

export const dynamic = 'force-dynamic';

export default function Dashboard() {
    const { role, isReady, logout } = useAuth();
    const {
        transfers,
        loading,
        error,
        fetchTransfers,
        updateStatus,
        deleteTransfer,
        cancelTransfer
    } = useTransfers();

    // UI state
    const [activeTab, setActiveTab] = useState<'live' | 'history' | 'stats'>('live');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferJoined | null>(null);
    const [transferToEdit, setTransferToEdit] = useState<TransferJoined | null>(null);
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'input' | 'confirm';
        title: string;
        description: string;
        confirmText: string;
        onConfirm: (val: string) => void;
    }>({
        isOpen: false,
        type: 'input',
        title: '',
        description: '',
        confirmText: '',
        onConfirm: () => { }
    });

    const handleUpdateStatus = (id: string, nextStatus: string) => {
        if (nextStatus === 'EN_CURSO') {
            setStatusModal({
                isOpen: true,
                type: 'input',
                title: 'Aceptar Traslado',
                description: 'Por favor, ingresa tu nombre para aceptar el traslado y llevar un registro equitativo.',
                confirmText: 'Aceptar',
                onConfirm: (name) => {
                    updateStatus(id, nextStatus, name);
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                }
            });
            return;
        }
        updateStatus(id, nextStatus);
    };

    const handleCancel = (transfer: TransferJoined) => {
        setStatusModal({
            isOpen: true,
            type: 'input',
            title: 'Cancelar Traslado',
            description: 'Indica el motivo de la cancelación para informar al sector de origen.',
            confirmText: 'Confirmar Cancelación',
            onConfirm: (reason) => {
                cancelTransfer(transfer.id, reason, transfer.observation);
                setStatusModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleDelete = (id: string) => {
        setStatusModal({
            isOpen: true,
            type: 'confirm',
            title: '¿Eliminar Traslado?',
            description: 'Esta acción no se puede deshacer. El traslado desaparecerá del historial.',
            confirmText: 'Eliminar',
            onConfirm: () => {
                deleteTransfer(id);
                setStatusModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    if (!isReady || (loading && transfers.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Cargando sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Header role={role} logout={logout} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Dashboard Action Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Panel de Control</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Gestiona y supervisa los traslados.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {role === 'admin' && (
                            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 w-full md:w-auto overflow-x-auto shadow-inner border border-slate-200/50">
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

                        {(role === 'sector') && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2 w-full md:w-auto justify-center"
                            >
                                <Plus size={20} /> Nueva Solicitud
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-3 font-medium animate-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        {error}
                        <button onClick={() => fetchTransfers()} className="ml-auto underline hover:text-red-800 transition-colors">
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Content based on Active Tab */}
                {activeTab === 'live' && (
                    <>
                        <StatsCards transfers={transfers} />

                        <div className="space-y-4 pb-20">
                            <h3 className="font-bold text-slate-800 text-lg ml-1">Traslados Recientes</h3>

                            {transfers.filter(t => t.status !== 'COMPLETADO' && t.status !== 'CANCELADO').length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                                    <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-slate-500 font-medium text-lg">No hay traslados activos en este momento.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {transfers
                                        .filter(t => t.status !== 'COMPLETADO' && t.status !== 'CANCELADO')
                                        .map((transfer) => (
                                            <TransferCard
                                                key={transfer.id}
                                                transfer={transfer}
                                                role={role}
                                                onStatusUpdate={handleUpdateStatus}
                                                onDelete={handleDelete}
                                                onEdit={setTransferToEdit}
                                                onCancel={handleCancel}
                                                onDetails={setSelectedTransfer}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <HistoryTab transfers={transfers} onDetails={setSelectedTransfer} />
                )}

                {activeTab === 'stats' && (
                    <StatsTab transfers={transfers} />
                )}
            </main>

            {/* Modals */}
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

            <StatusModal
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                description={statusModal.description}
                confirmText={statusModal.confirmText}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={statusModal.onConfirm}
            />

            {/* FAB for mobile (sector role) */}
            {(role === 'sector') && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
                    aria-label="Nueva Solicitud"
                >
                    <Plus size={28} />
                </button>
            )}
        </div>
    );
}
