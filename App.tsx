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
  const [loading, setLoading] = useState(true);
  
  const currentUser = { id: '1', name: 'Admin Arévalo', role: 'ADMIN' };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) return;
        const response = await fetch(url);
        const data = await response.json();
        if (Array.isArray(data)) {
          setDoctors(data);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // CÁLCULO DE TOTALES BLINDADO: Si no hay datos, muestra 0, nunca NaN
  const stats = useMemo(() => {
    const totalPB = doctors.reduce((acc, d) => acc + (Number(d.stock_pb) || 0), 0);
    const totalDep = doctors.reduce((acc, d) => acc + (Number(d.stock_dep) || 0), 0);
    const alerts = doctors.filter(d => (Number(d.stock_pb) || 0) < (Number(d.min_pb) || 0)).length;
    return { totalPB, totalDep, alerts };
  }, [doctors]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans text-xl">
      Sincronizando Sistema Arévalo...
    </div>
  );

  const sharedProps = {
    currentUser, activePage, onNavigate: setActivePage, setActivePage,
    doctors, setDoctors, orders, setOrders, stats,
    logs: [], recentLogs: []
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