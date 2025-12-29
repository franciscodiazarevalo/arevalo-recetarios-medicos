import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // USUARIO FIJO: Esto elimina el error de 'reading role'
  const currentUser = { id: '1', name: 'Administrador', role: 'admin' };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        if (!url) return;
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formatted = data.map((doc: any) => ({
            id: String(doc.id || Math.random()),
            name: doc.nombre || 'Sin nombre',
            specialty: doc.especialidad || 'General',
            stock_pb: parseInt(doc.stock_pb_actual) || 0,
            stock_deposito: parseInt(doc.stock_deposito_actual) || 0,
            min_pb: 2,
            ideal_pb: 5
          }));
          setDoctors(formatted);
        }
        setLoading(false);
      } catch (e) {
        console.error("Error:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-sans bg-slate-50">Cargando Sistema Arévalo...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
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
            user={currentUser}
          />
        )}
      </main>
    </div>
  );
};

export default App;