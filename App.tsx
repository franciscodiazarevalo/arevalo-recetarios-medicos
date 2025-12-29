import React, { useState, useEffect, useMemo } from 'react';
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
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentUser = { id: '1', name: 'Admin Arévalo', role: 'ADMIN' };

  useEffect(() => {
    const loadFromSheets = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) {
          setLoading(false);
          return;
        }
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => ({
            id: String(d.id || Math.random()),
            name: String(d.nombre || 'Sin nombre'),
            specialty: String(d.especialidad || 'General'),
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
        console.error("Error cargando datos:", e);
        setLoading(false);
      }
    };
    loadFromSheets();
  }, []);

  const stats = useMemo(() => {
    return {
      totalPB: doctors.reduce((acc, d) => acc + d.stock_pb, 0),
      totalDep: doctors.reduce((acc, d) => acc + d.stock_deposito, 0),
      alerts: doctors.filter(d => d.stock_pb < d.min_pb).length
    };
  }, [doctors]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">
      <div className="text-center animate-bounce text-xl font-bold">Cargando Arévalo Stock...</div>
    </div>
  );

  const sharedProps = {
    currentUser,
    activePage,
    onNavigate: setActivePage,
    setActivePage,
    doctors,
    setDoctors,
    orders,
    setOrders,
    logs,
    setLogs,
    recentLogs: logs.slice(0, 5),
    stats
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...sharedProps} onLogout={() => window.location.reload()} />
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {activePage === 'dashboard' && <Dashboard {...sharedProps} />}
        {activePage === 'distribution' && <Distribution {...sharedProps} />}
        {activePage === 'movements' && <Movements {...sharedProps} />}
        {activePage === 'orders' && <Orders {...sharedProps} />}
        {activePage === 'stats' && <Stats {...sharedProps} />}
        {activePage === 'admin' && <AdminPanel {...sharedProps} />}
      </main>
    </div>
  );
};

export default App;