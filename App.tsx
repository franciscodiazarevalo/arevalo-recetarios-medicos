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
    const loadData = async () => {
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
            stock_pb: Number(d.stock_pb) || 0,
            stock_deposito: Number(d.stock_deposito) || 0,
            min_pb: Number(d.min_pb) || 0,
            ideal_pb: Number(d.ideal_pb) || 0,
            min_deposito: Number(d.min_deposito) || 0,
            ideal_deposito: Number(d.ideal_deposito) || 0
          }));
          setDoctors(mapped);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error:", e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // CÁLCULO SEGURO DE TOTALES: Si algo falla, devuelve 0, nunca NaN
  const stats = useMemo(() => {
    const totalPB = doctors.reduce((acc, d) => acc + (Number(d.stock_pb) || 0), 0);
    const totalDep = doctors.reduce((acc, d) => acc + (Number(d.stock_deposito) || 0), 0);
    const alerts = doctors.filter(d => (Number(d.stock_pb) || 0) < (Number(d.min_pb) || 0)).length;
    return { totalPB, totalDep, alerts };
  }, [doctors]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans text-xl font-bold tracking-wider">
      Sincronizando Stock Centro Médico Arévalo...
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
      <main className="flex-1 md:ml-64 overflow-y-auto bg-gray-50">
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