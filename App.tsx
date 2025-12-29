import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Distribution } from './components/Distribution';
import { Movements } from './components/Movements';
import { Orders } from './components/Orders';
import { Stats } from './components/Stats';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Enviamos 'ADMIN' en mayúsculas para que el Sidebar lo reconozca
  const adminUser = { 
    name: 'Admin Arévalo', 
    role: 'ADMIN' 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) return;
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => ({
            id: String(d.id || Math.random()),
            name: String(d.nombre || 'Sin nombre'),
            specialty: String(d.especialidad || 'General'),
            // Limpiamos los datos para evitar el NaN
            stock_pb: parseInt(d.stock_pb_actual) || 0,
            stock_deposito: parseInt(d.stock_deposito_actual) || 0,
            min_pb: parseInt(d.min_pb) || 0,
            ideal_pb: parseInt(d.ideal_pb) || 0,
            min_deposito: parseInt(d.min_deposito) || 0,
            ideal_deposito: parseInt(d.ideal_deposito) || 0
          }));
          setDoctors(mapped);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center animate-pulse">Sincronizando Sistema Arévalo...</div>
    </div>
  );

  // Propiedades unificadas para todos los componentes
  const props = {
    activePage,
    onNavigate: setActivePage,
    currentUser: adminUser,
    doctors,
    setDoctors,
    logs: [],
    recentLogs: [],
    onLogout: () => console.log('Sesión cerrada')
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...props} />
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {activePage === 'dashboard' && <Dashboard {...props} />}
        {activePage === 'distribution' && <Distribution {...props} />}
        {activePage === 'movements' && <Movements {...props} />}
        {activePage === 'orders' && <Orders {...props} />}
        {activePage === 'stats' && <Stats {...props} />}
        {activePage === 'admin' && <AdminPanel {...props} />}
      </main>
    </div>
  );
};

export default App;