import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Distribution } from './components/Distribution';
import { AdminPanel } from './components/AdminPanel';

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

  const handleSync = async (action: string, doctorData: any) => {
    setLoading(true);
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action, ...doctorData })
    });
    setTimeout(loadData, 2000); // Esperamos a que Google procese
  };

  const stats = useMemo(() => {
    const pb = doctors.reduce((acc, d) => acc + (d.stock_pb || 0), 0);
    const dep = doctors.reduce((acc, d) => acc + (d.stock_deposito || 0), 0);
    const alerts = doctors.filter(d => d.stock_pb < d.min_pb).length;
    return { totalPB: pb, totalDep: dep, alerts };
  }, [doctors]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Sincronizando con Excel...</div>;

  const sharedProps = {
    currentUser: { name: 'Admin Arévalo', role: 'ADMIN' },
    activePage, onNavigate: setActivePage, doctors, stats,
    onAddDoctor: (d: any) => handleSync('add', d),
    onUpdateDoctor: (d: any) => handleSync('update', d)
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...sharedProps} onLogout={() => {}} />
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {activePage === 'dashboard' && <Dashboard {...sharedProps} />}
        {activePage === 'admin' && <AdminPanel {...sharedProps} />}
        {activePage === 'distribution' && <Distribution {...sharedProps} />}
      </main>
    </div>
  );
};
export default App;