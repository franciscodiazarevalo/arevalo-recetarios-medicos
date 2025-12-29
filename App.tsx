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
        // TU LINK DIRECTO
        const url = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => {
            const pb = Number(d.stock_pb) || 0;
            const dep = Number(d.stock_dep) || 0;
            const min = Number(d.min_pb) || 0;

            return {
              id: String(d.id || Math.random()),
              name: String(d.nombre || 'Sin nombre'),
              specialty: String(d.especialidad || 'General'),
              // MAPEO MÚLTIPLE: Le damos todos los nombres posibles para que no falle
              stock_pb: pb,
              stock_pb_actual: pb,
              stockPBActual: pb,
              stock_deposito: dep,
              stock_dep: dep,
              stock_deposito_actual: dep,
              stockDepositoActual: dep,
              min_pb: min,
              minPB: min,
              ideal_pb: Number(d.ideal_pb) || 0
            };
          });
          setDoctors(mapped);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error cargando datos:", e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculamos los totales manualmente para forzar que aparezcan en los círculos
  const stats = useMemo(() => {
    const totalPB = doctors.reduce((acc, d) => acc + (d.stock_pb || 0), 0);
    const totalDep = doctors.reduce((acc, d) => acc + (d.stock_deposito || 0), 0);
    const alerts = doctors.filter(d => d.stock_pb < d.min_pb).length;
    
    return { 
      totalPB, 
      totalDep, 
      alerts,
      // Nombres alternativos por si el Dashboard los busca así
      totalPlantaBaja: totalPB,
      totalDeposito: totalDep,
      activeAlerts: alerts
    };
  }, [doctors]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans font-bold">
      <div className="text-center">Sincronizando Sistema Arévalo...</div>
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
    stats // Aquí van los números 153, 846, etc.
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
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