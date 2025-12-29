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

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, currentUser, onLogout }) => {
  
  // Normalizamos el rol a mayúsculas para que coincida siempre
  const userRole = (currentUser?.role || 'ADMIN').toUpperCase();

  const allMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio', roles: ['ADMIN'] },
    { id: 'distribution', icon: Users, label: 'Entregar a Médico', roles: ['ADMIN', 'SECRETARY'] },
    { id: 'movements', icon: ArrowRightLeft, label: 'Movimientos Internos', roles: ['ADMIN'] },
    { id: 'orders', icon: FileText, label: 'Pedidos y Facturas', roles: ['ADMIN'] },
    { id: 'stats', icon: BarChart2, label: 'Estadísticas', roles: ['ADMIN'] },
    { id: 'admin', icon: Settings, label: 'Administración', roles: ['ADMIN'] },
  ];

  // Filtramos los items: si eres ADMIN ves todo.
  const visibleMenuItems = allMenuItems.filter(item => 
    userRole === 'ADMIN' || item.roles.includes(userRole)
  );

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white shadow-xl z-50 font-sans">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Centro Médico <br/>
          <span className="text-blue-400">Arévalo</span>
        </h1>
        <p className="text-xs text-blue-300 mt-2 font-semibold">
          {userRole === 'ADMIN' ? '● MODO ADMINISTRADOR' : '● MODO SECRETARÍA'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
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
          onClick={() => onLogout ? onLogout() : console.log('Logout')}
          className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-2 w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm">Cerrar Sesión</span>
        </button>
        <div className="mt-4 px-4">
          <p className="text-xs text-slate-500">Usuario Actual</p>
          <p className="text-sm font-medium text-slate-300 truncate">
            {currentUser?.name || 'Admin Arévalo'}
          </p>
        </div>
      </div>
    </div>
  );
};