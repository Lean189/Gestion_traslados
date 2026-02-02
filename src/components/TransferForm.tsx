"use client";

import { useState, useEffect } from "react";
import { supabase, Sector, TransferType } from "@/lib/supabase";
import { X, Send, AlertCircle } from "lucide-react";

export default function TransferForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [types, setTypes] = useState<TransferType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        patient_name: "",
        patient_history_number: "",
        origin_sector_id: "",
        destination_sector_id: "",
        transfer_type_id: "",
        priority: "MEDIA",
        observation: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: sectorsData } = await supabase.from('sectors').select('id, name').order('name');
            const { data: typesData } = await supabase.from('transfer_types').select('id, name').order('name');
            setSectors(sectorsData as Sector[] || []);
            setTypes(typesData as TransferType[] || []);
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.origin_sector_id === formData.destination_sector_id) {
            setError("El origen y el destino no pueden ser el mismo.");
            setLoading(false);
            return;
        }

        const dataToInsert = {
            ...formData,
            patient_history_number: formData.patient_history_number || null
        };

        const { error: dbError } = await supabase
            .from('transfers')
            .insert([dataToInsert]);

        if (!dbError) {
            onSuccess();
            onClose();
        } else {
            setError("Error al crear la solicitud: " + dbError.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:max-w-lg h-[95vh] sm:h-auto rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in slide-in-from-bottom-10 sm:zoom-in duration-300">
                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Nueva solicitud</h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">Completa los datos del paciente</p>
                    </div>
                    <button onClick={onClose} className="p-2 sm:p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 sm:space-y-6 max-h-[calc(95vh-100px)] sm:max-h-[75vh] overflow-y-auto pb-20 sm:pb-8">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-3 font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Paciente *</label>
                            <input
                                required
                                type="text"
                                maxLength={100}
                                placeholder="Nombre completo"
                                className="input-field"
                                value={formData.patient_name}
                                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-slate-700 mb-2">DNI del Paciente (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Ej: 35.123.456"
                                className="input-field"
                                value={formData.patient_history_number}
                                onChange={(e) => setFormData({ ...formData, patient_history_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Sector Origen *</label>
                            <select
                                required
                                className="input-field"
                                value={formData.origin_sector_id}
                                onChange={(e) => setFormData({ ...formData, origin_sector_id: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Sector Destino *</label>
                            <select
                                required
                                className="input-field"
                                value={formData.destination_sector_id}
                                onChange={(e) => setFormData({ ...formData, destination_sector_id: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Traslado *</label>
                            <select
                                required
                                className="input-field"
                                value={formData.transfer_type_id}
                                onChange={(e) => setFormData({ ...formData, transfer_type_id: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Prioridad</label>
                            <select
                                className="input-field"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="BAJA">Baja</option>
                                <option value="MEDIA">Media</option>
                                <option value="ALTA">Alta</option>
                                <option value="URGENTE">Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones</label>
                        <textarea
                            className="input-field min-h-[120px] resize-none"
                            placeholder="Ej: Requiere oxígeno, paciente con movilidad reducida..."
                            value={formData.observation}
                            onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            type="submit"
                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-lg rounded-2xl shadow-blue-500/25"
                        >
                            {loading ? "Creando solicitud..." : (
                                <>
                                    <Send size={22} /> Enviar Solicitud
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
