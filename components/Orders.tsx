
import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Truck, FileText, Calendar, Plus, Trash2, X } from 'lucide-react';

export const Orders = ({ doctors, onReceiveOrder }: any) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  
  const [localOrders, setLocalOrders] = useState<any[]>([
    {
      id: 'ORD-PROMO',
      date: new Date().toLocaleDateString(),
      status: 'pending',
      items: doctors.filter((d:any) => (d.stock_deposito_actual || 0) < (d.min_deposito || 0)).slice(0, 3).map((d:any) => ({ 
        doctorId: d.id, 
        nombre: d.nombre, 
        quantity: 100 
      }))
    }
  ]);

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

  const pendingOrders = localOrders.filter(o => o.status === 'pending');
  const completedOrders = localOrders.filter(o => o.status === 'completed');

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
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

      {/* Modal Nuevo Pedido */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-2xl flex items-center gap-3"><ShoppingCart /> Nueva Orden</h3>
                <p className="text-slate-400 text-xs font-bold uppercase mt-1">Imprenta Central - Arévalo</p>
              </div>
              <button onClick={() => setShowNewOrder(false)} className="hover:bg-white/10 p-3 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4">Seleccione los profesionales (100 u. c/u):</p>
              <div className="grid grid-cols-1 gap-2">
                {doctors.map((d:any) => {
                  const isSelected = selectedDocs.some(s => s.doctorId === d.id);
                  const isLow = (d.stock_deposito_actual || 0) < (d.min_deposito || 0);
                  return (
                    <button 
                      key={d.id}
                      onClick={() => {
                        if (isSelected) setSelectedDocs(selectedDocs.filter(s => s.doctorId !== d.id));
                        else setSelectedDocs([...selectedDocs, { doctorId: d.id, nombre: d.nombre, quantity: 100 }]);
                      }}
                      className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      <div className="text-left">
                        <p className="font-black text-sm text-gray-800 uppercase">{d.nombre}</p>
                        <p className={`text-[10px] font-black uppercase mt-1 ${isLow ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                          Stock Dep: {d.stock_deposito_actual} {isLow && '⚠️'}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                         {isSelected && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 flex gap-4">
              <button onClick={() => setShowNewOrder(false)} className="flex-1 py-4 text-gray-400 font-black text-xs uppercase tracking-widest">Cancelar</button>
              <button 
                onClick={handleCreateOrder}
                disabled={selectedDocs.length === 0}
                className="flex-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:shadow-none"
              >
                Generar Pedido ({selectedDocs.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
