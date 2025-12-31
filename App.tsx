
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Distribution } from './components/Distribution';
import { Movements } from './components/Movements';
import { AdminPanel } from './components/AdminPanel';
import { Stats } from './components/Stats';
import { Orders } from './components/Orders';
import { 
  Loader2, 
  CheckCircle, 
  CloudOff, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  Wifi, 
  Database,
  AlertTriangle,
  Activity,
  Heart
} from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState<'success' | 'error' | null>(null);
  const [syncTime, setSyncTime] = useState<string>('--:--');
  const [draftTransfers, setDraftTransfers] = useState<any[]>([]);
  const [netPulses, setNetPulses] = useState(0);
  
  const API_URL = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";

  const loadData = useCallback(async (force = false) => {
    setLoading(true);
    setLastSync(null);
    try {
      const url = force ? `${API_URL}?t=${Date.now()}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();

      if (!data || !Array.isArray(data)) {
        setLastSync('error');
        return;
      }

      const cleanData = data.map((d: any) => ({
        ...d,
        id: String(d.id || d.ID || ''),
        nombre: String(d.nombre || d.Nombre || d.name || 'Sin nombre').toUpperCase(),
        especialidad: String(d.especialidad || d.Especialidad || ''),
        stock_pb_actual: Number(d.stock_pb_actual ?? 0),
        stock_deposito_actual: Number(d.stock_deposito_actual ?? 0),
        min_pb: Number(d.min_pb ?? 0),
        ideal_pb: Number(d.ideal_pb ?? 0),
        min_deposito: Number(d.min_deposito ?? 0),
        ideal_deposito: Number(d.ideal_deposito ?? 0),
      }));
      setDoctors(cleanData);
      setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setNetPulses(prev => prev + 1);
      
    } catch (e) {
      console.error("Critical Load Error:", e);
      setLastSync('error');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => { loadData(); }, [loadData]);

  const syncWithSheet = async (updatedDoctors: any[]) => {
    setIsSaving(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoctors)
      });
      setLastSync('success');
      setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setNetPulses(prev => prev + 1);
      setTimeout(() => setLastSync(null), 4000);
    } catch (e) {
      setLastSync('error');
    } finally {
      setIsSaving(false);
    }
  };

  // HANDLERS
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

  const stats = useMemo(() => {
    const pb = doctors.reduce((acc, d) => acc + (Number(d.stock_pb_actual) || 0), 0);
    const dep = doctors.reduce((acc, d) => acc + (Number(d.stock_deposito_actual) || 0), 0);
    const alerts = doctors.filter(d => (Number(d.stock_pb_actual) < Number(d.min_pb)) || (Number(d.stock_deposito_actual) < Number(d.min_deposito))).length;
    return { totalPB: pb, totalDep: dep, alerts };
  }, [doctors]);

  if (loading && doctors.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0f18] text-white p-4">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-blue-500/30 blur-[100px] animate-pulse rounded-full"></div>
        <Loader2 className="animate-spin text-blue-500 relative z-10" size={80} />
      </div>
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">NÚCLEO ARÉVALO</h2>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
        <Activity size={16} className="text-blue-400 animate-bounce" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100/50">Negociando con Google Sheets...</span>
      </div>
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
    onPrepareDraft: (items: any[]) => { setDraftTransfers(items); setActivePage('movements'); },
    onAddDoctor: (d: any) => { const n = [...doctors, {...d, id: Date.now().toString()}]; setDoctors(n); syncWithSheet(n); },
    onUpdateDoctor: (d: any) => { const n = doctors.map(x => x.id === d.id ? d : x); setDoctors(n); syncWithSheet(n); },
    draftTransfers: draftTransfers,
    onClearDraft: () => setDraftTransfers([])
  };

  return (
    <div className="flex h-screen bg-[#fcfdfe] overflow-hidden font-sans select-none">
      <Sidebar {...sharedProps} onLogout={() => window.location.reload()} />
      <main className="flex-1 md:ml-64 overflow-y-auto custom-scrollbar">
        
        {/* Floating Notifications */}
        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-4">
          {isSaving && (
            <div className="bg-slate-900 text-white shadow-2xl p-4 rounded-3xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-right-10">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Nube...</p>
            </div>
          )}
          {lastSync === 'success' && (
            <div className="bg-emerald-600 text-white shadow-2xl p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-right-10">
              <CheckCircle size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest">Planilla Actualizada</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-10 py-8 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-4">
             <div className="bg-slate-950 text-white p-3 rounded-2xl shadow-lg shadow-slate-200">
                <Activity size={22} className={netPulses % 2 === 0 ? 'opacity-100 scale-110 transition-transform' : 'opacity-30 scale-100 transition-transform'} />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{activePage}</h2>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1 block">Online • Latido: {netPulses}p</span>
             </div>
          </div>
          <button 
            onClick={() => loadData(true)} 
            className="group bg-white border border-slate-100 shadow-sm px-6 py-3 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 flex items-center gap-3"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : "group-hover:rotate-180 transition-transform duration-700"} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Forzar Sincronía</span>
          </button>
        </div>

        {doctors.length === 0 && !loading && (
          <div className="p-12 h-[80vh] flex items-center justify-center">
            <div className="bg-white border border-red-50 p-20 rounded-[60px] shadow-2xl text-center max-w-xl">
              <ShieldAlert size={80} className="mx-auto mb-10 text-red-500" />
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter">Conexión Interrumpida</h3>
              <p className="text-slate-500 mb-10 leading-relaxed font-medium">No se detectó la respuesta de Google Sheets. Esto puede ser por falta de internet o error en el Apps Script.</p>
              <button onClick={() => loadData(true)} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all">Reintentar</button>
            </div>
          </div>
        )}

        <div className="pb-32 px-10">
          {activePage === 'dashboard' && doctors.length > 0 && <Dashboard {...sharedProps} />}
          {activePage === 'distribution' && doctors.length > 0 && <Distribution {...sharedProps} />}
          {activePage === 'movements' && doctors.length > 0 && <Movements {...sharedProps} />}
          {activePage === 'stats' && doctors.length > 0 && <Stats {...sharedProps} />}
          {activePage === 'orders' && doctors.length > 0 && <Orders {...sharedProps} />}
          {activePage === 'admin' && <AdminPanel {...sharedProps} />}
        </div>

        {/* Global Footer Monitor */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-slate-950 text-white/30 p-4 px-12 flex justify-between items-center z-50 border-t border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Wifi size={12} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Protocolo: G-SHEETS-V2</span>
            </div>
            <div className="h-4 w-px bg-white/5"></div>
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-rose-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Pulso: {syncTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">Centro Médico Arévalo v2.8.0</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
