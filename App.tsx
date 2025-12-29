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
  
  // Usuario administrador para que ningún componente falle al leer 'role'
  const adminUser = { 
    id: '1', 
    name: 'Admin Arévalo', 
    role: 'admin' 
  };

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) return;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctors(data.map((d: any) => ({
            id: String(d.id || Math.random()),
            name: d.nombre || 'Sin nombre',
            specialty: d.especialidad || 'General',
            stock_pb: parseInt(d.stock_pb_actual) || 0,
            stock_deposito: parseInt(d.stock_deposito_actual) || 0,
            min_pb: 2,
            ideal_pb: 5
          })));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };
    fetchSheetData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center animate-pulse text-xl">
          Iniciando Sistema Arévalo...
        </div>
      </div>
    );
  }

  // Preparamos los datos para que todos los componentes los reciban igual
  const commonProps = {
    user: adminUser,
    currentUser: adminUser, // Por si el componente busca 'currentUser'
    onNavigate: setActivePage,
    setActivePage: setActivePage,
    activePage: activePage,
    doctors: doctors,
    recentLogs: []
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <Sidebar {...commonProps} />
      <main className="flex-1 overflow-y-auto">
        {activePage === 'dashboard' && <Dashboard {...commonProps} />}
        {activePage === 'distribution' && <Distribution {...commonProps} />}
        {activePage === 'movements' && <Movements {...commonProps} />}
        {activePage === 'orders' && <Orders {...commonProps} />}
        {activePage === 'stats' && <Stats {...commonProps} />}
        {activePage === 'admin' && <AdminPanel {...commonProps} />}
      </main>
    </div>
  );
};

export default App;