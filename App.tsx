
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Distribution } from './components/Distribution';
import { Movements } from './components/Movements';
import { Orders } from './components/Orders';
import { Stats } from './components/Stats';
import { AdminPanel } from './components/AdminPanel';
import { 
  MOCK_DOCTORS, 
  MOCK_LOGS, 
  MOCK_INVOICES 
} from './constants';
import { Doctor, MovementLog, PurchaseOrder, UserSession, UserRole, InvoiceItem } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // App Data State
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [logs, setLogs] = useState<MovementLog[]>(MOCK_LOGS);
  const [orders, setOrders] = useState<PurchaseOrder[]>(MOCK_INVOICES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Draft States for Auto-filling forms
  const [draftOrderItems, setDraftOrderItems] = useState<InvoiceItem[]>([]);
  const [draftTransfers, setDraftTransfers] = useState<{doctorId: string, quantity: number}[]>([]);

  // Authentication Handlers
  const handleLogin = (name: string, role: UserRole) => {
    setCurrentUser({ name, role });
    // Redirect based on role
    if (role === 'SECRETARY') {
      setActivePage('distribution');
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard'); // Reset to default for next login
  };

  // Helper to add logs
  const addLog = (type: MovementLog['type'], quantity: number, details: string, location: any) => {
    const newLog: MovementLog = {
      id: Date.now().toString() + Math.random(),
      date: new Date().toISOString(),
      type,
      quantity,
      user: currentUser ? currentUser.name : 'Unknown', // Use logged in user
      details,
      location
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 1. Distribute to Doctor (PB -> Doctor)
  const handleDistribution = (doctorId: string, quantity: number) => {
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc || doc.padsInPB < quantity) return;

    // Update Doctor
    setDoctors(prev => prev.map(d => {
      if (d.id === doctorId) {
        return {
          ...d,
          padsInPB: d.padsInPB - quantity,
          padsOnHand: d.padsOnHand + quantity,
          lastRestockDate: new Date().toISOString().split('T')[0]
        };
      }
      return d;
    }));

    // Log it
    const docName = doc.name;
    addLog('DISTRIBUTE_TO_DOCTOR', quantity, docName, 'Planta Baja (PB)');
  };

  // 2.1 Batch Internal Transfer
  const handleBatchInternalTransfer = (transfers: {doctorId: string, quantity: number}[]) => {
    // Update State
    setDoctors(prev => {
        let newDocs = [...prev];
        transfers.forEach(t => {
            const idx = newDocs.findIndex(d => d.id === t.doctorId);
            if(idx > -1 && newDocs[idx].padsInWarehouse >= t.quantity) {
                newDocs[idx] = {
                    ...newDocs[idx],
                    padsInWarehouse: newDocs[idx].padsInWarehouse - t.quantity,
                    padsInPB: newDocs[idx].padsInPB + t.quantity
                }
            }
        });
        return newDocs;
    });

    // Add Logs
    transfers.forEach(t => {
         const doc = doctors.find(d => d.id === t.doctorId);
         if(doc) {
             addLog('TRANSFER_TO_PB', t.quantity, `Reposición Masiva: ${doc.name}`, 'Planta Baja (PB)');
         }
    });
  };

  // 3. CREATE ORDER
  const handleCreateOrder = (items: InvoiceItem[]) => {
    const newOrder: PurchaseOrder = {
        id: `ORD-${Date.now()}`,
        status: 'PENDING',
        dateCreated: new Date().toISOString().split('T')[0],
        items: items
    };
    setOrders(prev => [newOrder, ...prev]);
    addLog('ORDER_CREATED', items.reduce((a,b)=>a+b.quantity,0), `Pedido generado #${newOrder.id}`, 'Depósito');
  };

  // 4. RECEIVE ORDER
  const handleReceiveOrder = (orderId: string, invoiceData: { invoiceNumber: string, supplier: string, date: string, cost: number, items: InvoiceItem[] }) => {
    setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
            return {
                ...o,
                status: 'COMPLETED',
                invoiceNumber: invoiceData.invoiceNumber,
                supplier: invoiceData.supplier,
                dateReceived: invoiceData.date,
                totalCost: invoiceData.cost,
                items: invoiceData.items
            };
        }
        return o;
    }));

    setDoctors(prev => {
        let newDocs = [...prev];
        invoiceData.items.forEach(item => {
            const idx = newDocs.findIndex(d => d.id === item.doctorId);
            if (idx > -1) {
                newDocs[idx] = {
                    ...newDocs[idx],
                    padsInWarehouse: newDocs[idx].padsInWarehouse + item.quantity
                };
            }
        });
        return newDocs;
    });

    invoiceData.items.forEach(item => {
        const docName = doctors.find(d => d.id === item.doctorId)?.name || 'Desconocido';
        addLog('PURCHASE', item.quantity, `Ingreso Fac: ${invoiceData.invoiceNumber} (${docName})`, 'Depósito');
    });
  };

  const handleInitiateOrder = (items: InvoiceItem[]) => {
    setDraftOrderItems(items);
    setActivePage('orders');
  };

  const handleInitiateTransfer = (items: {doctorId: string, quantity: number}[]) => {
    setDraftTransfers(items);
    setActivePage('movements');
  };

  // 5. Manage Doctors (Add / Update / Delete)
  const handleAddDoctor = (name: string, specialty: string, idealPB: number, minPB: number, idealWh: number, minWh: number) => {
    const newDoc: Doctor = {
        id: Date.now().toString(),
        name,
        specialty,
        padsInWarehouse: 0,
        padsInPB: 0,
        padsOnHand: 0,
        idealStockPB: idealPB,
        minStockPB: minPB,
        idealStockWarehouse: idealWh,
        minStockWarehouse: minWh
    };
    setDoctors(prev => [newDoc, ...prev]);
  };

  const handleUpdateDoctor = (id: string, updatedData: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...updatedData } : d));
  };

  const handleDeleteDoctor = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este médico? Se perderán sus datos de stock.')) {
        setDoctors(prev => prev.filter(d => d.id !== id));
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const handleNavigation = (p: string) => {
    setActivePage(p);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigation}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center shadow-md">
        <span className="font-bold">CM Arévalo</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-full bg-slate-800 text-white z-40 p-4 shadow-xl">
           <Sidebar 
             activePage={activePage} 
             onNavigate={handleNavigation}
             currentUser={currentUser}
             onLogout={handleLogout}
           /> 
        </div>
      )}

      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-6 overflow-y-auto">
        {activePage === 'dashboard' && currentUser.role === 'ADMIN' && (
          <Dashboard 
            recentLogs={logs} 
            doctors={doctors}
            onNavigate={setActivePage}
            onInitiateOrder={handleInitiateOrder}
            onInitiateTransfer={handleInitiateTransfer}
            userName={currentUser.name}
          />
        )}
        
        {activePage === 'distribution' && (
          <Distribution 
            doctors={doctors}
            onDistribute={handleDistribution}
          />
        )}
        
        {activePage === 'movements' && currentUser.role === 'ADMIN' && (
          <Movements 
            doctors={doctors}
            onBatchTransfer={handleBatchInternalTransfer}
            draftTransfers={draftTransfers}
            onClearDraft={() => setDraftTransfers([])}
          />
        )}
        
        {activePage === 'orders' && currentUser.role === 'ADMIN' && (
          <Orders 
            orders={orders}
            doctors={doctors}
            onCreateOrder={handleCreateOrder}
            onReceiveOrder={handleReceiveOrder}
            draftItems={draftOrderItems}
            onClearDraft={() => setDraftOrderItems([])}
          />
        )}
        
        {activePage === 'stats' && currentUser.role === 'ADMIN' && (
          <Stats logs={logs} doctors={doctors} />
        )}

        {activePage === 'admin' && currentUser.role === 'ADMIN' && (
            <AdminPanel 
                doctors={doctors}
                onAddDoctor={handleAddDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
            />
        )}
      </main>
    </div>
  );
};

export default App;
