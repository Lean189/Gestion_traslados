"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase, TransferJoined } from "@/lib/supabase";
import { toast } from "sonner";

export function useTransfers() {
    const [transfers, setTransfers] = useState<TransferJoined[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransfers = useCallback(async () => {
        try {
            const { data, error: dbError } = await supabase
                .from('transfers')
                .select(`
          *,
          origin_sector:sectors!origin_sector_id(name),
          destination_sector:sectors!destination_sector_id(name),
          transfer_type:transfer_types!transfer_type_id(name)
        `)
                .order('requested_at', { ascending: false });

            if (dbError) {
                console.error("Database error:", dbError);
                setError("Error al cargar los traslados.");
                toast.error("Error al cargar los traslados");
            } else {
                setTransfers((data || []) as unknown as TransferJoined[]);
                setError(null);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Error inesperado en la conexión.");
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    }, []);

    const playNotificationSound = useCallback(() => {
        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(() => console.log("Audio play blocked by browser."));
        } catch (err) {
            console.error("Audio error:", err);
        }
    }, []);

    useEffect(() => {
        fetchTransfers();

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transfers' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        playNotificationSound();
                        toast.info("Nueva solicitud recibida");
                    }
                    fetchTransfers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTransfers, playNotificationSound]);

    const updateStatus = async (id: string, nextStatus: string, transporterName?: string) => {
        try {
            const { data: current, error: fetchError } = await supabase
                .from('transfers')
                .select('status')
                .eq('id', id)
                .single();

            if (fetchError || !current) {
                toast.error("Error al verificar el estado del traslado");
                return false;
            }

            if (nextStatus === 'EN_CURSO' && current.status !== 'PENDIENTE') {
                toast.warning("Este traslado ya no está disponible.");
                fetchTransfers();
                return false;
            }

            const updateData: {
                status: string;
                accepted_at?: string;
                transporter_name?: string;
                completed_at?: string;
            } = { status: nextStatus };

            if (nextStatus === 'EN_CURSO') {
                updateData.accepted_at = new Date().toISOString();
                if (transporterName) updateData.transporter_name = transporterName;
            }
            if (nextStatus === 'COMPLETADO') {
                updateData.completed_at = new Date().toISOString();
            }

            const { error: updateError } = await supabase
                .from('transfers')
                .update(updateData)
                .eq('id', id);

            if (updateError) {
                toast.error("No se pudo actualizar: " + updateError.message);
                return false;
            }

            toast.success(`Traslado actualizado a ${nextStatus.replace('_', ' ')}`);
            fetchTransfers();
            return true;
        } catch {
            toast.error("Error inesperado al actualizar");
            return false;
        }
    };

    const deleteTransfer = async (id: string) => {
        const { error } = await supabase
            .from('transfers')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Error al eliminar: " + error.message);
            return false;
        }

        toast.success("Traslado eliminado");
        fetchTransfers();
        return true;
    };

    const cancelTransfer = async (id: string, reason: string, currentObservation: string | null) => {
        const newObservation = currentObservation
            ? `${currentObservation}\n\nMOTIVO CANCELACIÓN: ${reason}`
            : `MOTIVO CANCELACIÓN: ${reason}`;

        const { error } = await supabase
            .from('transfers')
            .update({
                status: 'CANCELADO',
                observation: newObservation
            })
            .eq('id', id);

        if (error) {
            toast.error("Error al cancelar: " + error.message);
            return false;
        }

        toast.success("Traslado cancelado");
        fetchTransfers();
        return true;
    };

    return {
        transfers,
        loading,
        error,
        fetchTransfers,
        updateStatus,
        deleteTransfer,
        cancelTransfer
    };
}
