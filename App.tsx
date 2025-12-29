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
  const [loading, setLoading] = useState(true);
  
  const currentUser = { id: '1', name: 'Admin Arévalo', role: 'ADMIN' };

  useEffect(() => {
    const loadData = async () => {
      try {
        const url = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => {
            const pb = Number(d.stock_pb) || 0;
            const dep = Number(d.stock_dep) || 0;
            const min = Number(d.min_pb) || 0;
            return {
              ...d,
              id: String(d.id || Math.random()),
              name: d.nombre,
              specialty: d.especialidad,
              // Nombres universales para que el Dashboard no se pierda
              stock_pb: pb, stock_pb_actual: pb,
              stock_dep: dep, stock_deposito: dep, stock_deposito_actual: dep,
              min_pb: min, minPB: min
            };
          });
          setDoctors(mapped);
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const pb = doctors.reduce((acc, d) => acc + (d.stock_pb || 0), 0);
    const dep = doctors.reduce((acc, d) => acc + (d.stock_dep || 0), 0);
    return { 
      totalPB: pb, totalPlantaBaja: pb, total_pb: pb,
      totalDep: dep, totalDeposito: dep, total_dep: dep,
      alerts: doctors.filter(d => (d.stock_pb || 0) < (d.min_pb || 0)).length 
    };
  }, [doctors]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Cargando Arévalo Stock...</div>;

  const sharedProps = {
    currentUser, activePage, onNavigate: setActivePage, setActivePage,
    doctors, setDoctors, stats, logs: [], recentLogs: [], orders: [], setOrders: () => {}
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...sharedProps} onLogout={() => {}} />
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