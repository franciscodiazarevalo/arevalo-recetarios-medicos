import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Creamos un usuario "Admin" por defecto para que la app no pida 'role' y se rompa
  const [currentUser] = useState({ id: '1', name: 'Administrador', role: 'admin' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) return;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const formatted = data.map((doc: any) => ({
          id: String(doc.id || Math.random()),
          name: doc.nombre || 'Sin nombre',
          specialty: doc.especialidad || 'General',
          stock_pb: parseInt(doc.stock_pb_actual) || 0,
          stock_deposito: parseInt(doc.stock_deposito_actual) || 0,
          min_pb: parseInt(doc.min_pb) || 2,
          ideal_pb: parseInt(doc.ideal_pb) || 5
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
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Centro Médico Arévalo</div>
          <div className="animate-pulse">Conectando con Google Sheets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Pasamos onNavigate y el usuario para evitar errores de 'role' */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        user={currentUser} 
      />
      
      <main className="flex-1 overflow-y-auto">
        {activePage === 'dashboard' && (
          <Dashboard 
            doctors={doctors} 
            recentLogs={[]} 
            onNavigate={setActivePage} 
          />
        )}
        <div className="p-4 text-xs text-gray-400 text-right">
          Conectado a: {import.meta.env.VITE_API_URL ? 'Google Cloud Success' : 'Error de URL'}
        </div>
      </main>
    </div>
  );
};

export default App;