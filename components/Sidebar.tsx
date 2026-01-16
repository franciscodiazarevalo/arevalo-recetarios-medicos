
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  FileText, 
  BarChart2, 
  LogOut,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  currentUser, 
  onLogout,
  isSidebarOpen,
  onToggleSidebar
}) => {
  
  const userRole = (currentUser?.role || 'ADMIN').toUpperCase();

  const allMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio', roles: ['ADMIN'] },
    { id: 'distribution', icon: Users, label: 'Entregar a Médico', roles: ['ADMIN', 'SECRETARY'] },
    { id: 'movements', icon: ArrowRightLeft, label: 'Movimientos Internos', roles: ['ADMIN'] },
    { id: 'orders', icon: FileText, label: 'Pedidos y Facturas', roles: ['ADMIN'] },
    { id: 'stats', icon: BarChart2, label: 'Estadísticas', roles: ['ADMIN'] },
    { id: 'admin', icon: Settings, label: 'Administración', roles: ['ADMIN'] },
  ];

  const visibleMenuItems = allMenuItems.filter(item => 
    userRole === 'ADMIN' || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Fondo oscuro para cerrar menú en móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] md:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Menú Lateral responsivo */}
      <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-slate-900 h-screen text-white shadow-2xl z-[110] font-sans transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Centro Médico <br/>
              <span className="text-blue-400">Arévalo</span>
            </h1>
            <p className="text-[9px] text-blue-300 mt-2 font-semibold tracking-wider">
              {userRole === 'ADMIN' ? '● MODO ADMINISTRADOR' : '● MODO SECRETARÍA'}
            </p>
          </div>
          {/* Botón cerrar para móviles */}
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activePage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <button 
            onClick={() => onLogout ? onLogout() : window.location.reload()}
            className="flex items-center space-x-3 text-slate-400 hover:text-rose-400 px-4 py-3 w-full transition-colors group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
          <div className="mt-4 px-4 py-3 bg-slate-900 rounded-xl border border-white/5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Usuario</p>
            <p className="text-xs font-bold text-slate-300 truncate mt-1">
              {currentUser?.name || 'Admin Arévalo'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
