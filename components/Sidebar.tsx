
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  FileText, 
  BarChart2, 
  LogOut,
  Settings 
} from 'lucide-react';
import { UserSession } from '../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: UserSession;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, currentUser, onLogout }) => {
  
  const allMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio', roles: ['ADMIN'] },
    { id: 'distribution', icon: Users, label: 'Entregar a Médico', roles: ['ADMIN', 'SECRETARY'] },
    { id: 'movements', icon: ArrowRightLeft, label: 'Movimientos Internos', roles: ['ADMIN'] },
    { id: 'orders', icon: FileText, label: 'Pedidos y Facturas', roles: ['ADMIN'] },
    { id: 'stats', icon: BarChart2, label: 'Estadísticas', roles: ['ADMIN'] },
    { id: 'admin', icon: Settings, label: 'Administración', roles: ['ADMIN'] },
  ];

  const visibleMenuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">Centro Médico <br/><span className="text-blue-400">Arévalo</span></h1>
        <p className="text-xs text-slate-400 mt-2">
          {currentUser.role === 'ADMIN' ? 'Modo Administrador' : 'Modo Secretaria'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activePage === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-2 w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
        <div className="mt-4 px-4">
          <p className="text-xs text-slate-600">Usuario Actual</p>
          <p className="text-sm font-medium truncate" title={currentUser.name}>
            {currentUser.name}
          </p>
        </div>
      </div>
    </div>
  );
};
