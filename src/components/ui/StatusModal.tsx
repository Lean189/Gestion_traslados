"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: string) => void;
    title: string;
    description: string;
    placeholder?: string;
    confirmText?: string;
    type?: "input" | "confirm";
}

export default function StatusModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    placeholder = "Escribe aquí...",
    confirmText = "Confirmar",
    type = "input"
}: StatusModalProps) {
    const [value, setValue] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {type === "input" ? <CheckCircle2 size={32} /> : <AlertCircle size={32} className="text-orange-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-6">{description}</p>

                    {type === "input" && (
                        <input
                            autoFocus
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all mb-4"
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && value.trim()) {
                                    onConfirm(value.trim());
                                    setValue("");
                                }
                            }}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={type === "input" && !value.trim()}
                            onClick={() => {
                                if (type === "confirm" || value.trim()) {
                                    onConfirm(type === "confirm" ? "YES" : value.trim());
                                    setValue("");
                                }
                            }}
                            className="px-4 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
