import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("Iniciando...");

  useEffect(() => {
    const loadData = async () => {
      try {
        const url = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";
        setDebugInfo("Llamando a Google...");
        
        const response = await fetch(url);
        const data = await response.json();
        
        setDebugInfo(`Recibidos ${data.length} registros. Ejemplo: ${JSON.stringify(data[0])}`);

        if (Array.isArray(data)) {
          // MAPEO AGRESIVO: Le damos TODAS las variantes posibles
          const mapped = data.map((d: any) => ({
            ...d,
            name: d.nombre,
            stock_pb: Number(d.stock_pb) || 0,
            stock_pb_actual: Number(d.stock_pb) || 0,
            stock_deposito: Number(d.stock_dep) || 0,
            stock_deposito_actual: Number(d.stock_dep) || 0,
            min_pb: Number(d.min_pb) || 0,
          }));
          setDoctors(mapped);
        }
        setLoading(false);
      } catch (e) {
        setDebugInfo("ERROR: " + e.message);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const pb = doctors.reduce((acc, d) => acc + (Number(d.stock_pb) || 0), 0);
    const dep = doctors.reduce((acc, d) => acc + (Number(d.stock_deposito) || 0), 0);
    return { 
      totalPB: pb, totalPlantaBaja: pb, 
      totalDep: dep, totalDeposito: dep,
      alerts: doctors.filter(d => d.stock_pb < d.min_pb).length 
    };
  }, [doctors]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} currentUser={{name:'Admin', role:'ADMIN'}} />
      <main className="flex-1 md:ml-64 overflow-y-auto p-4">
        {/* CAJA DE DIAGNÓSTICO VISUAL */}
        <div className="bg-black text-green-400 p-4 mb-4 font-mono text-xs rounded-lg shadow-2xl border-2 border-green-900">
          <p className="">[DIAGNÓSTICO ARÉVALO]</p>
          <p>Status: {debugInfo}</p>
          <p>Total PB Calculado: {stats.totalPB}</p>
        </div>

        {activePage === 'dashboard' && (
          <Dashboard doctors={doctors} stats={stats} currentUser={{role:'ADMIN'}} recentLogs={[]} onNavigate={setActivePage} />
        )}
      </main>
    </div>
  );
};

export default App;