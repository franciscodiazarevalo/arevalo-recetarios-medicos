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
          const safeData = data.map((d: any) => ({
            ...d,
            name: String(d.name || 'Sin Nombre'), // Asegura que sea Texto
            specialty: String(d.specialty || 'General'), // Asegura que sea Texto
            stock_pb: Number(d.stock_pb) || 0,
            stock_deposito: Number(d.stock_deposito) || 0,
            min_pb: Number(d.min_pb) || 0,
            ideal_pb: Number(d.ideal_pb) || 0,
            min_deposito: Number(d.min_deposito) || 0,
            ideal_deposito: Number(d.ideal_deposito) || 0
          }));
          setDoctors(safeData);
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
    const dep = doctors.reduce((acc, d) => acc + (d.stock_deposito || 0), 0);
    return { 
      totalPB: pb, totalDep: dep, 
      alerts: doctors.filter(d => d.stock_pb < d.min_pb).length 
    };
  }, [doctors]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Cargando Sistema Arévalo...</div>;

  const props = {
    currentUser, activePage, onNavigate: setActivePage, doctors, setDoctors, stats,
    orders: [], setOrders: () => {}, logs: [], recentLogs: []
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...props} onLogout={() => {}} />
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