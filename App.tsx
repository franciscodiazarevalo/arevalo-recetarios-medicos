import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usa la URL que configuramos en Netlify
        const response = await fetch(import.meta.env.VITE_API_URL);
        const data = await response.json();
        
        // Mapea tus datos de Excel
        const formatted = data.map((doc: any) => ({
          id: doc.id,
          name: doc.nombre,
          specialty: doc.especialidad,
          stock_pb: parseInt(doc.stock_pb_actual) || 0,
          stock_deposito: parseInt(doc.stock_deposito_actual) || 0
        }));
        setDoctors(formatted);
        setLoading(false);
      } catch (e) {
        console.error("Error:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">Conectando con la base de datos...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto p-8">
        {activePage === 'dashboard' && <Dashboard doctors={doctors} />}
      </main>
    </div>
  );
};

export default App;