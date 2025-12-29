
import React, { useState } from 'react';
import { User, Stethoscope, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (name: string, role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Lógica de detección automática de rol
      // Si el nombre contiene "admin", se asigna rol de Administrador. 
      // De lo contrario, es Secretaria.
      const lowerName = name.toLowerCase();
      const role: UserRole = lowerName.includes('admin') ? 'ADMIN' : 'SECRETARY';
      
      onLogin(name.trim(), role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Cabecera con Branding */}
          <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
             <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 rounded-2xl shadow-lg mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Stethoscope size={32} className="text-white" />
             </div>
             <h1 className="text-2xl font-black text-white tracking-tight">
                CENTRO MÉDICO <br/>
                <span className="text-blue-400">ARÉVALO</span>
             </h1>
             <p className="text-slate-400 text-xs mt-2 font-medium uppercase tracking-widest">Control de Stock v2.5</p>
          </div>

          {/* Formulario de Ingreso */}
          <div className="p-10">
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Acceso al Sistema</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label 
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    isFocused || name 
                      ? '-top-2.5 text-xs bg-white px-2 font-bold text-blue-600' 
                      : 'top-3.5 text-slate-400'
                  }`}
                >
                  Nombre de Usuario
                </label>
                <div className={`flex items-center border-2 rounded-xl transition-all duration-200 ${
                  isFocused ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'
                }`}>
                  <div className="pl-4 pr-2 text-slate-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    className="w-full py-3.5 pr-4 text-slate-800 font-medium outline-none rounded-xl"
                    value={name}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-blue-600 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group"
              >
                Ingresar al Sistema
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <div className="flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Acceso Seguro y Restringido</span>
               </div>
               <p className="text-[9px] text-slate-400 mt-2 px-6">
                  Si eres administrador, ingresa con tu usuario designado para habilitar todas las funciones.
               </p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} Centro Médico Arévalo. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
