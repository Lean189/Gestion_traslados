import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'CRITICAL: Supabase environment variables are missing. Check your .env.local file.';
  console.error(errorMsg);
  // We throw if we're on the server during build, or just warn on client to avoid crashing the whole app immediately
  if (typeof window === 'undefined') {
    // throw new Error(errorMsg); // Optional: keep it as warning to not break local dev if they don't use it
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export type Database = {
  public: {
    Tables: {
      sectors: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
      };
      transfer_types: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
      };
      transfers: {
        Row: {
          id: string;
          patient_name: string;
          patient_history_number: string | null;
          origin_sector_id: string;
          destination_sector_id: string;
          transfer_type_id: string;
          priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
          status: 'PENDIENTE' | 'EN_ADJUDICACION' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';
          requester_id: string | null;
          transporter_id: string | null;
          observation: string | null;
          patient_room: string | null;
          destination_room: string | null;
          requested_at: string;
          accepted_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          patient_name: string;
          patient_history_number?: string | null;
          origin_sector_id: string;
          destination_sector_id: string;
          transfer_type_id: string;
          priority?: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
          status?: 'PENDIENTE' | 'EN_ADJUDICACION' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';
          requester_id?: string | null;
          transporter_id?: string | null;
          observation?: string | null;
          patient_room?: string | null;
          destination_room?: string | null;
          requested_at?: string;
          accepted_at?: string | null;
          completed_at?: string | null;
        };
      };
      access_codes: {
        Row: {
          id: string;
          role_name: string;
          sector_id: string | null;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_name: string;
          sector_id?: string | null;
          code: string;
          created_at?: string;
        };
      };
    };
  };
};

export interface Sector {
  id: string;
  name: string;
}

export interface TransferType {
  id: string;
  name: string;
}

export interface TransferJoined {
  id: string;
  patient_name: string;
  patient_history_number: string | null;
  origin_sector_id: string;
  destination_sector_id: string;
  transfer_type_id: string;
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'PENDIENTE' | 'EN_ADJUDICACION' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO';
  observation: string | null;
  patient_room: string | null;
  destination_room: string | null;
  requested_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  origin_sector: { name: string } | null;
  destination_sector: { name: string } | null;
  transfer_type: { name: string } | null;
}
