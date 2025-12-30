import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Distribution } from './components/Distribution';
import { Movements } from './components/Movements';
import { AdminPanel } from './components/AdminPanel';
import { Stats } from './components/Stats';
import { Orders } from './components/Orders';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";

  const loadData = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (Array.isArray(data)) setDoctors(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdate = async (action: string, doctorData: any) => {
    setLoading(true);
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action, ...doctorData })
    });
    setTimeout(loadData, 1500); // Recarga automática
  };

  const stats = useMemo(() => {
    const totalPB = doctors.reduce((acc, d) => acc + (d.stock_pb || 0), 0);
    const totalDep = doctors.reduce((acc, d) => acc + (d.stock_deposito || 0), 0);
    const alerts = doctors.filter(d => d.stock_pb < d.min_pb || d.stock_deposito < d.min_deposito).length;
    return { totalPB, totalDep, alerts };
  }, [doctors]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Actualizando datos...</div>;

  const sharedProps = {
    currentUser: { name: 'Admin Arévalo', role: 'ADMIN' },
    activePage, onNavigate: setActivePage, doctors, stats,
    onUpdate: handleUpdate
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans printable-area">
      <Sidebar {...sharedProps} onLogout={() => window.location.reload()} />
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {activePage === 'dashboard' && <Dashboard {...sharedProps} />}
        {activePage === 'distribution' && <Distribution {...sharedProps} />}
        {activePage === 'movements' && <Movements {...sharedProps} />}
        {activePage === 'stats' && <Stats {...sharedProps} />}
        {activePage === 'orders' && <Orders {...sharedProps} />}
        {activePage === 'admin' && <AdminPanel {...sharedProps} />}
      </main>
    </div>
  );
};
export default App;