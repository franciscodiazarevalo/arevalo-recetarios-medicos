
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
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftTransfers, setDraftTransfers] = useState<any[]>([]);
  
  // URL de tu Google Apps Script
  const API_URL = "https://script.google.com/macros/s/AKfycbywESXcQnvwGa9VSIIweljqUE9E9HnVMLnb9teY2yRebXFXC2R11YZ5a0Z17gPZ59rbjg/exec";

  const loadData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        const cleanData = data.map((d: any) => ({
          ...d,
          stock_pb: Number(d.stock_pb) || 0,
          stock_deposito: Number(d.stock_deposito) || 0,
          min_pb: Number(d.min_pb) || 0,
          ideal_pb: Number(d.ideal_pb) || 0,
          min_deposito: Number(d.min_deposito) || 0,
          ideal_deposito: Number(d.ideal_deposito) || 0,
        }));
        setDoctors(cleanData);
      }
      setLoading(false);
    } catch (e) {
      console.error("Error cargando datos", e);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleBatchTransfer = (transfers: { doctorId: string; quantity: number }[]) => {
    setDoctors((prev) =>
      prev.map((doc: any) => {
        const transfer = transfers.find((t) => t.doctorId === doc.id);
        if (transfer) {
          return {
            ...doc,
            stock_pb: (doc.stock_pb || 0) + transfer.quantity,
            stock_deposito: (doc.stock_deposito || 0) - transfer.quantity,
          };
        }
        return doc;
      })
    );
  };

  const handleDistribute = (doctorId: string, quantity: number = 1) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id === doctorId) {
        return { 
          ...doc, 
          stock_pb: Math.max(0, (doc.stock_pb || 0) - quantity),
          padsOnHand: (doc.padsOnHand || 0) + quantity 
        };
      }
      return doc;
    }));
  };

  const handleReceiveOrder = (orderId: string, invoiceData: any) => {
    setDoctors(prev => {
      let newDocs = [...prev];
      invoiceData.items.forEach((item: any) => {
        const idx = newDocs.findIndex(d => d.id === item.doctorId);
        if (idx > -1) {
          newDocs[idx] = {
            ...newDocs[idx],
            stock_deposito: newDocs[idx].stock_deposito + item.quantity,
          };
        }
      });
      return newDocs;
    });
  };

  const handlePrepareDraft = (items: any[]) => {
    setDraftTransfers(items);
    setActivePage('movements');
  };

  const stats = useMemo(() => {
    const pb = doctors.reduce((acc, d) => acc + (d.stock_pb || 0), 0);
    const dep = doctors.reduce((acc, d) => acc + (d.stock_deposito || 0), 0);
    const alerts = doctors.filter(d => d.stock_pb < d.min_pb || d.stock_deposito < d.min_deposito).length;
    return { totalPB: pb, totalDep: dep, alerts };
  }, [doctors]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold animate-pulse">
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
    draftTransfers: draftTransfers,
    onClearDraft: () => setDraftTransfers([])
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar {...sharedProps} onLogout={() => window.location.reload()} />
      <main className="flex-1 md:ml-64 overflow-y-auto bg-gray-50">
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
