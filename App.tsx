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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) {
          console.error("No se encontró la URL de la API en Netlify");
          setLoading(false);
          return;
        }
        const response = await fetch(url);
        const data = await response.json();
        
        // Mapeo de tus columnas de Google Sheets
        const formatted = data.map((doc: any) => ({
          id: String(doc.id || ''),
          name: doc.nombre || 'Sin nombre',
          specialty: doc.especialidad || 'General',
          stock_pb: parseInt(doc.stock_pb_actual) || 0,
          stock_deposito: parseInt(doc.stock_deposito_actual) || 0,
          min_pb: parseInt(doc.min_pb) || 2,
          ideal_pb: parseInt(doc.ideal_pb) || 5,
          min_deposito: parseInt(doc.min_deposito) || 5,
          ideal_deposito: parseInt(doc.ideal_deposito) || 20
        }));
        
        setDoctors(formatted);
        setLoading(false);
      } catch (e) {
        console.error("Error cargando datos:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="text-xl text-blue-600 animate-pulse">Cargando base de datos de Arévalo...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar corregido con onNavigate */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
      <main className="flex-1 overflow-y-auto">
        {activePage === 'dashboard' && (
          <Dashboard 
            doctors={doctors} 
            recentLogs={[]} 
            onNavigate={setActivePage} 
          />
        )}
        {activePage === 'distribution' && <Distribution doctors={doctors} />}
        {activePage === 'movements' && <Movements />}
        {activePage === 'orders' && <Orders />}
        {activePage === 'stats' && <Stats doctors={doctors} />}
        {activePage === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
};

export default App;