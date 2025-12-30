
import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Truck, FileText, Calendar, Plus, Trash2, X } from 'lucide-react';

export const Orders = ({ doctors, onReceiveOrder }: any) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  
  // En un entorno real, esto vendría de Sheet. Aquí simulamos órdenes locales.
  const [localOrders, setLocalOrders] = useState<any[]>([
    {
      id: 'ORD-1234',
      date: new Date().toLocaleDateString(),
      status: 'pending',
      items: doctors.filter((d:any) => d.stock_deposito < d.min_deposito).map((d:any) => ({ doctorId: d.id, name: d.name, quantity: 100 }))
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

    // Actualizamos el stock global a través de la función del App.tsx
    onReceiveOrder(orderId, {
      invoiceNumber: invoiceNum,
      supplier: "Imprenta Central",
      date: new Date().toISOString(),
      cost: 0,
      items: order.items.map((i:any) => ({ doctorId: i.doctorId, quantity: i.quantity }))
    });

    // Cambiamos estado local
    setLocalOrders(localOrders.map(o => 
      o.id === orderId ? { ...o, status: 'completed', invoice: invoiceNum } : o
    ));
  };

  const pendingOrders = localOrders.filter(o => o.status === 'pending');
  const completedOrders = localOrders.filter(o => o.status === 'completed');

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Gestión de Pedidos</h2>
          <p className="text-gray-500 text-sm">Controle las órdenes de compra y la entrada de mercadería.</p>
        </div>
        <button 
          onClick={() => setShowNewOrder(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Nuevo Pedido
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Pendientes de Recibir ({pendingOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Historial / Completados
        </button>
      </div>

      <div className="grid gap-6">
        {(activeTab === 'pending' ? pendingOrders : completedOrders).map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${order.status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                  {order.status === 'pending' ? <Truck size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h4 className="font-black text-gray-800 flex items-center gap-2">
                    {order.id} 
                    {order.invoice && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">Factura: {order.invoice}</span>}
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 font-medium italic">
                    <Calendar size={12} /> Creado el {order.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Profesionales</p>
                  <p className="font-bold text-gray-700">{order.items.length}</p>
                </div>
                {order.status === 'pending' ? (
                  <button 
                    onClick={() => handleCompleteOrder(order.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-green-100"
                  >
                    Recibir Mercadería
                  </button>
                ) : (
                  <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                    <CheckCircle2 size={16} /> Ingresado
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-4 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {order.items.map((item:any, idx:number) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 text-sm">
                  <span className="font-bold text-gray-700 truncate mr-2">{item.name}</span>
                  <span className="bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded text-xs">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(activeTab === 'pending' ? pendingOrders : completedOrders).length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4 opacity-50" />
            <p className="text-gray-500 font-bold italic">No hay órdenes en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Modal Nuevo Pedido */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2"><ShoppingCart /> Nuevo Pedido a Imprenta</h3>
              <button onClick={() => setShowNewOrder(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-500 font-medium">Seleccione los médicos que necesitan reposición (100 unidades c/u):</p>
              <div className="space-y-2">
                {doctors.map((d:any) => {
                  const isSelected = selectedDocs.some(s => s.doctorId === d.id);
                  return (
                    <button 
                      key={d.id}
                      onClick={() => {
                        if (isSelected) setSelectedDocs(selectedDocs.filter(s => s.doctorId !== d.id));
                        else setSelectedDocs([...selectedDocs, { doctorId: d.id, name: d.name, quantity: 100 }]);
                      }}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm text-gray-800">{d.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">Stock Actual: {d.stock_deposito}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="text-blue-600" size={18} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button onClick={() => setShowNewOrder(false)} className="flex-1 py-3 text-gray-500 font-bold">Cancelar</button>
              <button 
                onClick={handleCreateOrder}
                disabled={selectedDocs.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                Crear Orden ({selectedDocs.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
