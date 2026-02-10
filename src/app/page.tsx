"use client";

import { useState, useEffect } from "react";
import { supabase, Sector } from "@/lib/supabase";
import {
  ClipboardList,
  Truck,
  Stethoscope,
  ChevronRight,
  Lock,
  ArrowRightLeft
} from "lucide-react";

export default function LoginPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: "sector", name: "Sectores / Pisos", icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "camillero", name: "Camilleros", icon: Truck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "imagenes", name: "Imágenes", icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "admin", name: "Administración / Control", icon: Lock, color: "text-red-500", bg: "bg-red-50" },
  ];

  useEffect(() => {
    async function fetchSectors() {
      const { data } = await supabase.from('sectors').select('id, name').order('name');
      setSectors(data || []);
    }
    fetchSectors();
  }, []);

  const handleLogin = async () => {
    if (pin.length < 4) {
      setError("El PIN debe tener al menos 4 dígitos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = supabase.from('access_codes').select('*');

      if (selectedRole === 'sector') {
        // Buscamos código específico del sector o bien el genérico de rol 'sector'
        const { data: specificCode } = await query
          .eq('sector_id', selectedSectorId)
          .eq('code', pin)
          .maybeSingle();

        if (specificCode) {
          loginSuccess('sector', selectedSectorId);
          return;
        }

        // Si no hay específico, buscamos el genérico del rol
        const { data: genericCode } = await supabase
          .from('access_codes')
          .select('*')
          .eq('role_name', 'sector')
          .eq('code', pin)
          .maybeSingle();

        if (genericCode) {
          loginSuccess('sector', selectedSectorId);
        } else {
          setError("PIN incorrecto para este sector.");
        }
      } else {
        // Para admin, camillero, imagenes
        const { data: codeData } = await query
          .eq('role_name', selectedRole)
          .eq('code', pin)
          .maybeSingle();

        if (codeData) {
          loginSuccess(selectedRole!);
        } else {
          setError("PIN incorrecto para " + roles.find(r => r.id === selectedRole)?.name);
        }
      }
    } catch {
      setError("Error al validar el código.");
    } finally {
      setLoading(false);
    }
  };

  const loginSuccess = (role: string, sectorId: string | null = null) => {
    localStorage.setItem("userRole", role);
    if (sectorId) localStorage.setItem("userSectorId", sectorId);
    window.location.href = "/dashboard";
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    if (roleId !== 'sector') {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4">
            <ArrowRightLeft size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Traslados</h1>
          <p className="text-slate-500 mt-2 text-lg italic tracking-tight font-medium">Sanatorio San José</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && !selectedRole && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Selecciona tu función:</p>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-xl ${role.bg} ${role.color}`}>
                        <role.icon size={24} />
                      </div>
                      <span className="font-bold text-slate-700 text-lg">{role.name}</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && selectedRole === 'sector' && (
            <div className="space-y-6">
              <button onClick={() => setSelectedRole(null)} className="text-sm text-slate-400 font-bold hover:text-blue-600 transition-colors flex items-center gap-1">
                ← Volver a roles
              </button>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-4">¿En qué sector estás?</p>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {sectors.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSectorId(s.id); setStep(2); }}
                      className="w-full p-4 rounded-xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50 text-left font-bold text-slate-600 transition-all"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <button
                onClick={() => { setStep(1); if (selectedRole !== 'sector') setSelectedRole(null); }}
                className="text-sm text-slate-400 font-bold hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                ← Cambiar {selectedRole === 'sector' ? 'sector' : 'rol'}
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Ingresar PIN de Acceso</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {selectedRole === 'sector'
                    ? sectors.find(s => s.id === selectedSectorId)?.name
                    : roles.find(r => r.id === selectedRole)?.name}
                </p>
              </div>

              <div className="relative">
                <div
                  className="flex justify-center gap-3 cursor-text"
                  onClick={() => {
                    const input = document.getElementById('pin-input');
                    input?.focus();
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pin.length > i ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                      {pin[i] ? '•' : ''}
                    </div>
                  ))}
                </div>
                <input
                  id="pin-input"
                  autoFocus
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-default"
                />
                {error && <p className="text-red-500 text-xs mt-4 text-center font-bold animate-pulse">{error}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((num) => (
                  <button
                    key={num}
                    disabled={loading}
                    onClick={() => {
                      if (num === 'C') setPin("");
                      else if (num === 'OK') handleLogin();
                      else if (typeof num === 'number' && pin.length < 4) setPin(pin + num);
                    }}
                    className={`h-16 rounded-2xl font-black text-xl flex items-center justify-center transition-all active:scale-90 ${num === 'OK' ? 'bg-blue-600 text-white col-span-1' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-slate-400 leading-relaxed font-medium">
                Uso interno exclusivo Sanatorio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
