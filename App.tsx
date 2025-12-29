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
  
  // Usuario con todos los permisos para habilitar el menú completo
  const fullUser = { 
    id: '1', 
    name: 'Admin Arévalo', 
    role: 'admin',
    email: 'admin@arevalo.com'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) return;
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => ({
            id: String(d.id || Math.random()),
            name: d.nombre || 'Sin nombre',
            specialty: d.especialidad || 'General',
            // Buscamos los nombres exactos de tus columnas en minúsculas
            stock_pb: Number(d.stock_pb_actual) || 0,
            stock_deposito: Number(d.stock_deposito_actual) || 0,
            min_pb: Number(d.min_pb) || 2,
            ideal_pb: Number(d.ideal_pb) || 5,
            min_deposito: Number(d.min_deposito) || 5,
            ideal_deposito: Number(d.ideal_deposito) || 20
          }));
          setDoctors(mapped);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error de conexión:", e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">
      <div className="text-center animate-pulse">Sincronizando con Arévalo Stock...</div>
    </div>
  );

  // Propiedades que el Sidebar y Dashboard necesitan para mostrarse bien
  const appProps = {
    user: fullUser,
    currentUser: fullUser,
    activePage: activePage,
    setActivePage: setActivePage,
    onNavigate: setActivePage, // Algunos componentes usan este nombre
    doctors: doctors,
    setDoctors: setDoctors,
    logs: [],
    recentLogs: []
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar {...appProps} />
      <main className="flex-1 overflow-y-auto">
        {activePage === 'dashboard' && <Dashboard {...appProps} />}
        {activePage === 'distribution' && <Distribution {...appProps} />}
        {activePage === 'movements' && <Movements {...appProps} />}
        {activePage === 'orders' && <Orders {...appProps} />}
        {activePage === 'stats' && <Stats {...appProps} />}
        {activePage === 'admin' && <AdminPanel {...appProps} />}
      </main>
    </div>
  );
};

export default App;