
import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Truck, Calendar, Plus, X, Edit3, Search, Printer } from 'lucide-react';

export const Orders = ({ doctors, onReceiveOrder, draftOrder = [], onClearOrderDraft }: any) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  
  const [localOrders, setLocalOrders] = useState<any[]>([]);

  // Pre-fill modal if a draft order comes from Dashboard
  useEffect(() => {
    if (draftOrder && draftOrder.length > 0) {
      setSelectedDocs(draftOrder);
      setShowNewOrder(true);
      if (onClearOrderDraft) onClearOrderDraft();
    }
  }, [draftOrder, onClearOrderDraft]);

  const handleToggleDoctor = (d: any) => {
    const isSelected = selectedDocs.some(s => s.doctorId === d.id);
    if (isSelected) {
      setSelectedDocs(selectedDocs.filter(s => s.doctorId !== d.id));
    } else {
      const suggestedQty = Math.max(0, (d.ideal_deposito || 0) - (d.stock_deposito_actual || 0));
      setSelectedDocs([...selectedDocs, { 
        doctorId: d.id, 
        nombre: d.nombre, 
        quantity: suggestedQty || 100
      }]);
    }
  };

  const handleUpdateQuantity = (doctorId: string, newQty: number) => {
    setSelectedDocs(selectedDocs.map(s => 
      s.doctorId === doctorId ? { ...s, quantity: Math.max(1, newQty) } : s
    ));
  };

  const handleCreateOrder = () => {
    if (selectedDocs.length === 0) return;
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toLocaleDateString(),
      status: 'pending',
      items: selectedDocs
    };
    setLocalOrders([newOrder, ...localOrders]);
    setShowNewOrder(false);
    setSelectedDocs([]);
    setModalSearchTerm('');
  };

  const handleCompleteOrder = (orderId: string) => {
    const invoiceNum = prompt("Ingrese el Nº de Factura para completar:");
    if (!invoiceNum) return;

    const order = localOrders.find(o => o.id === orderId);
    if (!order) return;

    onReceiveOrder(orderId, {
      invoiceNumber: invoiceNum,
      supplier: "Imprenta Central",
      date: new Date().toISOString(),
      items: order.items.map((i:any) => ({ doctorId: i.doctorId, quantity: i.quantity }))
    });

    setLocalOrders(localOrders.map(o => 
      o.id === orderId ? { ...o, status: 'completed', invoice: invoiceNum } : o
    ));
    alert("Stock ingresado correctamente al depósito.");
  };

  const filteredDoctorsModal = doctors.filter((d:any) => 
    d.nombre.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  const pendingOrders = localOrders.filter(o => o.status === 'pending');
  const completedOrders = localOrders.filter(o => o.status === 'completed');

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500 no-print">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pedidos a Imprenta</h2>
          <p className="text-gray-500 font-medium">Controle la reposición de stock en Depósito.</p>
        </div>
        <button 
          onClick={() => setShowNewOrder(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-100"
        >
          <Plus size={20} /> Generar Orden
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Órdenes en Camino ({pendingOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-2 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Historial de Facturas
        </button>
      </div>

      <div className="grid gap-6">
        {(activeTab === 'pending' ? pendingOrders : completedOrders).map((order) => (
          <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl shadow-inner ${order.status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                  {order.status === 'pending' ? <Truck size={32} /> : <CheckCircle2 size={32} />}
                </div>
                <div>
                  <h4 className="font-black text-xl text-gray-800 flex items-center gap-3">
                    {order.id} 
                    {order.invoice && <span className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">FAC: {order.invoice}</span>}
                  </h4>
                  <p className="text-sm text-gray-400 font-bold flex items-center gap-1 mt-1">
                    <Calendar size={14} /> Emitido: {order.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Items</p>
                  <p className="font-black text-lg text-gray-700">{order.items.length}</p>
                </div>
                {order.status === 'pending' ? (
                  <button 
                    onClick={() => handleCompleteOrder(order.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-100"
                  >
                    Confirmar Entrega
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full">
                    <CheckCircle2 size={16} /> Completado
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-6 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.items.map((item:any, idx:number) => (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="font-black text-gray-700 truncate mr-2 text-xs uppercase">{item.nombre}</span>
                  <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-lg text-xs">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(activeTab === 'pending' ? pendingOrders : completedOrders).length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ShoppingCart size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No hay registros para mostrar</p>
          </div>
        )}
      </div>

      {/* Modal Nuevo Pedido Rediseñado con BUSCADOR */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-2xl flex items-center gap-3"><ShoppingCart /> Nueva Orden de Compra</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Calculando faltantes según stock ideal de depósito</p>
              </div>
              <button onClick={() => { setShowNewOrder(false); setModalSearchTerm(''); }} className="hover:bg-white/10 p-3 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* Paso 1: Selección con Buscador */}
                <div className="flex flex-col h-full bg-white p-6 rounded-[32px] border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Paso 1: Filtrar y Seleccionar Médicos</p>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-gray-300" size={18} />
                    <input 
                       type="text" 
                       placeholder="Escriba nombre del profesional..." 
                       className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                       value={modalSearchTerm}
                       onChange={(e) => setModalSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredDoctorsModal.map((d:any) => {
                      const isSelected = selectedDocs.some(s => s.doctorId === d.id);
                      const isLow = (d.stock_deposito_actual || 0) < (d.min_deposito || 0);

                      return (
                        <button 
                          key={d.id}
                          onClick={() => handleToggleDoctor(d)}
                          className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all group ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-transparent hover:border-gray-200 bg-gray-50/30'}`}
                        >
                          <div className="text-left">
                            <p className="font-black text-xs text-gray-800 uppercase leading-tight group-hover:text-blue-700">{d.nombre}</p>
                            <p className={`text-[9px] font-black uppercase mt-1 ${isLow ? 'text-red-500' : 'text-gray-400'}`}>
                              Depósito: {d.stock_deposito_actual} / Ideal: {d.ideal_deposito} {isLow && '⚠️'}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'border-gray-200 group-hover:border-blue-300'}`}>
                             {isSelected && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Paso 2: Edición de Cantidades */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col h-full shadow-inner">
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Paso 2: Ajustar Cantidades del Pedido</p>
                   {selectedDocs.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                        <Edit3 size={40} className="mb-4 text-gray-300" />
                        <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Busca y selecciona médicos de la lista de la izquierda</p>
                     </div>
                   ) : (
                     <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedDocs.map((item) => (
                           <div key={item.doctorId} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 animate-in slide-in-from-right-4">
                              <div className="flex justify-between items-center mb-3">
                                <p className="text-[10px] font-black text-gray-800 uppercase truncate">{item.nombre}</p>
                                <button onClick={() => handleToggleDoctor({id: item.doctorId})} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                              </div>
                              <div className="flex items-center gap-3">
                                 <input 
                                   type="number" 
                                   className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-blue-600 outline-none focus:border-blue-600 shadow-sm transition-all"
                                   value={item.quantity}
                                   onChange={(e) => handleUpdateQuantity(item.doctorId, parseInt(e.target.value) || 0)}
                                 />
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Cant.</span>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
              <button onClick={() => { setShowNewOrder(false); setModalSearchTerm(''); }} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-gray-600">Cancelar</button>
              <button 
                onClick={handleCreateOrder}
                disabled={selectedDocs.length === 0}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-100 transition-all active:scale-95 disabled:shadow-none"
              >
                Confirmar Orden ({selectedDocs.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
