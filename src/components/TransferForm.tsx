"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, Sector, TransferType, TransferJoined } from "@/lib/supabase";
import { X, Send, AlertCircle, ChevronDown } from "lucide-react";

export default function TransferForm({
    onClose,
    onSuccess,
    editData
}: {
    onClose: () => void,
    onSuccess: () => void,
    editData?: TransferJoined | null
}) {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [types, setTypes] = useState<TransferType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        patient_name: editData?.patient_name || "",
        patient_history_number: editData?.patient_history_number || "",
        origin_sector_id: editData?.origin_sector_id || "",
        destination_sector_id: editData?.destination_sector_id || "",
        transfer_type_id: editData?.transfer_type_id || "",
        patient_room: editData?.patient_room || "",
        destination_room: editData?.destination_room || "",
        observation: editData?.observation || ""
    });

    const fetchData = useCallback(async () => {
        const { data: sectorsData } = await supabase.from('sectors').select('id, name').order('name');
        const { data: typesData } = await supabase.from('transfer_types').select('id, name').order('name');
        setSectors(sectorsData as Sector[] || []);
        setTypes(typesData as TransferType[] || []);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getAvailableRooms = useCallback((sectorId: string) => {
        const sector = sectors.find(s => s.id === sectorId);
        if (!sector) return [];
        const name = sector.name.toLowerCase();

        if (name.includes("guardia")) {
            return ["121", "122", "123", "124", "125", "126", "127"];
        }
        if (name.includes("consultorio")) {
            return Array.from({ length: 10 }, (_, i) => `${i + 1}`);
        }

        const floorMatch = sector.name.match(/Piso (\d+)/i);
        if (floorMatch) {
            const floorNum = floorMatch[1];
            const rooms = Array.from({ length: 24 }, (_, i) => `${floorNum}${String(i + 1).padStart(2, '0')}`);
            if (floorNum === "2") {
                rooms.push(...Array.from({ length: 10 }, (_, i) => `QX ${i + 1}`));
            } else if (floorNum === "5") {
                rooms.push("QX 1", "QX 2");
            }
            return rooms;
        }
        return [];
    }, [sectors]);

    const originRooms = useMemo(() => getAvailableRooms(formData.origin_sector_id), [getAvailableRooms, formData.origin_sector_id]);
    const destinationRooms = useMemo(() => getAvailableRooms(formData.destination_sector_id), [getAvailableRooms, formData.destination_sector_id]);

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
            patient_history_number: formData.patient_history_number || null,
            patient_room: formData.patient_room || null,
            destination_room: formData.destination_room || null,
            priority: 'MEDIA'
        };

        if (editData?.id) {
            const { error: dbError } = await supabase
                .from('transfers')
                .update(dataToInsert)
                .eq('id', editData.id);

            if (!dbError) {
                onSuccess();
                onClose();
            } else {
                setError("No se pudo actualizar la solicitud. (Detalle: " + dbError.message + ")");
            }
        } else {
            const { error: dbError } = await supabase
                .from('transfers')
                .insert([dataToInsert]);

            if (!dbError) {
                onSuccess();
                onClose();
            } else {
                setError("No se pudo crear la solicitud. (Detalle: " + dbError.message + ")");
            }
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:max-w-lg h-[95vh] sm:h-auto rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in slide-in-from-bottom-10 sm:zoom-in duration-300">
                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                            {editData ? "Editar solicitud" : "Nueva solicitud"}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            {editData ? "Modifica los datos del traslado" : "Completa los datos del paciente"}
                        </p>
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
                            <label className="block text-sm font-bold text-slate-700 mb-2">DNI del Paciente *</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej: 35.123.456"
                                className="input-field"
                                value={formData.patient_history_number}
                                onChange={(e) => setFormData({ ...formData, patient_history_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Sector Origen */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Sector Origen *</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="input-field appearance-none"
                                        value={formData.origin_sector_id}
                                        onChange={(e) => setFormData({ ...formData, origin_sector_id: e.target.value, patient_room: "" })}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            {originRooms.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-left-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Hab. Origen *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="input-field appearance-none"
                                            value={formData.patient_room}
                                            onChange={(e) => setFormData({ ...formData, patient_room: e.target.value })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {originRooms.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sector Destino */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Sector Destino *</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="input-field appearance-none"
                                        value={formData.destination_sector_id}
                                        onChange={(e) => setFormData({ ...formData, destination_sector_id: e.target.value, destination_room: "" })}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            {destinationRooms.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-left-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Hab. Destino *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="input-field appearance-none"
                                            value={formData.destination_room}
                                            onChange={(e) => setFormData({ ...formData, destination_room: e.target.value })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {destinationRooms.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Tipo de Traslado *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {types.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transfer_type_id: t.id })}
                                    className={`px-4 py-4 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center justify-center gap-2 ${formData.transfer_type_id === t.id
                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones</label>
                        <textarea
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Ej: Requiere oxígeno..."
                            value={formData.observation}
                            onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading || !formData.transfer_type_id}
                            type="submit"
                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-lg rounded-2xl shadow-blue-500/25 disabled:opacity-50"
                        >
                            {loading ? "Procesando..." : (
                                <>
                                    <Send size={22} /> {editData ? "Guardar Cambios" : "Enviar Solicitud"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
