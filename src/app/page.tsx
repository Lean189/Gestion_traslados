"use client";

import { useState } from "react";
import {
  ClipboardList,
  Truck,
  Stethoscope,
  ChevronRight,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const roles = [
    { id: "sector", name: "Solicitante (Enfermería/Pisos)", icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "camillero", name: "Camillero / Traslado", icon: Truck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "imagenes", name: "Sector Imágenes", icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "admin", name: "Administración / Control", icon: Lock, color: "text-red-500", bg: "bg-red-50" },
  ];

  const handleLogin = () => {
    // Para el test usamos contraseñas simples fijas
    const simplePasswords: Record<string, string> = {
      sector: "enfermeria123",
      camillero: "camillero123",
      imagenes: "imagenes123",
      admin: "admin123"
    };

    if (selectedRole && password === simplePasswords[selectedRole]) {
      localStorage.setItem("userRole", selectedRole);
      window.location.href = "/dashboard";
    } else {
      setError("Contraseña incorrecta para el rol seleccionado.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4">
            <Truck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Traslados</h1>
          <p className="text-slate-500 mt-2 text-lg italic">Sanatorio XXX</p>
        </div>

        <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
          {!selectedRole ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Selecciona tu función:</p>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${role.bg} ${role.color}`}>
                      <role.icon size={24} />
                    </div>
                    <span className="font-semibold text-slate-900">{role.name}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                ← Cambiar rol
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña de {roles.find(r => r.id === selectedRole)?.name}
                </label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduce la clave de prueba"
                    className="input-field !pl-14 pr-12 text-slate-950 font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
              </div>

              <button onClick={handleLogin} className="btn-primary w-full py-4 text-lg">
                Ingresar al Sistema
              </button>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                Uso interno exclusivo para el personal autorizado del sanatorio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
