
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Distribution } from './components/Distribution';
import { Movements } from './components/Movements';
import { AdminPanel } from './components/AdminPanel';
import { Stats } from './components/Stats';
import { Orders } from './components/Orders';
import { Loader2, CloudCheck, CloudOff, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState<'success' | 'error' | null>(null);
  const [draftTransfers, setDraftTransfers] = useState<any[]>([]);
  
  // URL de tu Google Apps Script
  const API_URL = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        const cleanData = data.map((d: any) => ({
          ...d,
          id: String(d.id),
          // Mapeo exacto a tus nombres de la planilla (con _actual)
          stock_pb_actual: Number(d.stock_pb_actual) || 0,
          stock_deposito_actual: Number(d.stock_deposito_actual) || 0,
          min_pb: Number(d.min_pb) || 0,
          ideal_pb: Number(d.ideal_pb) || 0,
          min_deposito: Number(d.min_deposito) || 0,
          ideal_deposito: Number(d.ideal_deposito) || 0,
        }));
        setDoctors(cleanData);
      }
    } catch (e) {
      console.error("Error cargando datos", e);
      setLastSync('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const syncWithSheet = async (updatedDoctors: any[]) => {
    setIsSaving(true);
    setLastSync(null);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoctors)
      });
      setLastSync('success');
      setTimeout(() => setLastSync(null), 3000);
    } catch (e) {
      console.error("Error sincronizando", e);
      setLastSync('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatchTransfer = (transfers: { doctorId: string; quantity: number }[]) => {
    const newDoctors = doctors.map((doc: any) => {
      const transfer = transfers.find((t) => String(t.doctorId) === String(doc.id));
      if (transfer) {
        return {
          ...doc,
          stock_pb_actual: (doc.stock_pb_actual || 0) + transfer.quantity,
          stock_deposito_actual: (doc.stock_deposito_actual || 0) - transfer.quantity,
        };
      }
      return doc;
    });
    setDoctors(newDoctors);
    syncWithSheet(newDoctors);
  };

  const handleDistribute = (doctorId: string, quantity: number = 1) => {
    const newDoctors = doctors.map(doc => {
      if (String(doc.id) === String(doctorId)) {
        return { 
          ...doc, 
          stock_pb_actual: Math.max(0, (doc.stock_pb_actual || 0) - quantity),
        };
      }
      return doc;
    });
    setDoctors(newDoctors);
    syncWithSheet(newDoctors);
  };

  const handleReceiveOrder = (orderId: string, invoiceData: any) => {
    let newDocs = [...doctors];
    invoiceData.items.forEach((item: any) => {
      const idx = newDocs.findIndex(d => String(d.id) === String(item.doctorId));
      if (idx > -1) {
        newDocs[idx] = {
          ...newDocs[idx],
          stock_deposito_actual: (newDocs[idx].stock_deposito_actual || 0) + item.quantity,
        };
      }
    });
    setDoctors(newDocs);
    syncWithSheet(newDocs);
  };

  const handleAddDoctor = (newDoc: any) => {
    const docWithId = { ...newDoc, id: String(Date.now()) };
    const updated = [...doctors, docWithId];
    setDoctors(updated);
    syncWithSheet(updated);
  };

  const handleUpdateDoctor = (updatedDoc: any) => {
    const updated = doctors.map(d => String(d.id) === String(updatedDoc.id) ? updatedDoc : d);
    setDoctors(updated);
    syncWithSheet(updated);
  };

  const handlePrepareDraft = (items: any[]) => {
    setDraftTransfers(items);
    setActivePage('movements');
  };

  const stats = useMemo(() => {
    const pb = doctors.reduce((acc, d) => acc + (Number(d.stock_pb_actual) || 0), 0);
    const dep = doctors.reduce((acc, d) => acc + (Number(d.stock_deposito_actual) || 0), 0);
    const alerts = doctors.filter(d => (d.stock_pb_actual < d.min_pb) || (d.stock_deposito_actual < d.min_deposito)).length;
    return { totalPB: pb, totalDep: dep, alerts };
  }, [doctors]);

  if (loading && doctors.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-bold text-center p-4">
      <Loader2 className="animate-spin mb-4" size={48} />
      Cargando Sistema Arévalo...
    </div>
  );

  const sharedProps = {
    currentUser: { name: 'Admin Arévalo', role: 'ADMIN' },
    activePage,
    onNavigate: setActivePage,
    doctors,
    setDoctors,
    stats,
    onBatchTransfer: handleBatchTransfer,
    onDistribute: handleDistribute,
    onReceiveOrder: handleReceiveOrder,
    onPrepareDraft: handlePrepareDraft,
    onAddDoctor: handleAddDoctor,
    onUpdateDoctor: handleUpdateDoctor,
    draftTransfers: draftTransfers,
    onClearDraft: () => setDraftTransfers([])
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...sharedProps} onLogout={() => window.location.reload()} />
      <main className="flex-1 md:ml-64 overflow-y-auto bg-gray-50">
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
          <button 
            onClick={loadData}
            className="bg-white border shadow-sm p-2 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          
          {isSaving && (
            <div className="bg-white border shadow-lg px-4 py-2 rounded-full flex items-center gap-2 text-blue-600 font-bold text-xs animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Guardando...
            </div>
          )}
          {lastSync === 'success' && (
            <div className="bg-green-600 text-white shadow-lg px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs">
              <CloudCheck size={14} /> ¡Guardado en Excel!
            </div>
          )}
          {lastSync === 'error' && (
            <div className="bg-red-600 text-white shadow-lg px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs">
              <CloudOff size={14} /> Error de red
            </div>
          )}
        </div>

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
