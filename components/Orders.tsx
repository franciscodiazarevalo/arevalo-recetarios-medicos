
import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Truck, Calendar, Plus, X, Edit3, Search, Printer, Trash2, Save, DollarSign, Tag, Landmark } from 'lucide-react';

export const Orders = ({ doctors, onReceiveOrder, draftOrder = [], onClearOrderDraft }: any) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [orderToComplete, setOrderToComplete] = useState<any>(null);
  
  // Datos del formulario de factura
  const [invoiceData, setInvoiceData] = useState({
    number: '',
    supplier: 'Imprenta Central',
    totalAmount: 0
  });

  const [localOrders, setLocalOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('arevalo_orders_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('arevalo_orders_history', JSON.stringify(localOrders));
  }, [localOrders]);

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

  // Función para abrir edición de una orden ya generada
  const handleEditExistingOrder = (order: any) => {
    setSelectedDocs(order.items);
    setLocalOrders(localOrders.filter(o => o.id !== order.id));
    setShowNewOrder(true);
  };

  const handleConfirmArrival = (order: any) => {
    setOrderToComplete(order);
    setShowCompleteModal(true);
  };

  const finalizeOrder = () => {
    if (!invoiceData.number || !invoiceData.supplier || invoiceData.totalAmount <= 0) {
      alert("Por favor complete todos los datos de la factura correctamente.");
      return;
    }

    const totalQty = orderToComplete.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const unitPrice = invoiceData.totalAmount / totalQty;

    onReceiveOrder(orderToComplete.id, {
      invoiceNumber: invoiceData.number,
      supplier: invoiceData.supplier,
      totalAmount: invoiceData.totalAmount,
      unitPrice: unitPrice,
      items: orderToComplete.items
    });

    setLocalOrders(localOrders.map(o => 
      o.id === orderToComplete.id ? { 
        ...o, 
        status: 'completed', 
        invoice: invoiceData.number,
        supplier: invoiceData.supplier,
        totalAmount: invoiceData.totalAmount,
        unitPrice: unitPrice,
        receivedDate: new Date().toLocaleDateString()
      } : o
    ));

    setShowCompleteModal(false);
    setOrderToComplete(null);
    setInvoiceData({ number: '', supplier: 'Imprenta Central', totalAmount: 0 });
    alert("Stock ingresado y costos registrados con éxito.");
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pedidos y Facturas</h2>
          <p className="text-gray-500 font-medium">Control de reposición y auditoría de costos de imprenta.</p>
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
          Pendientes / En Camino ({pendingOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-2 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Historial de Facturas ({completedOrders.length})
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
                    {order.invoice && <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">FAC: {order.invoice}</span>}
                  </h4>
                  <p className="text-sm text-gray-400 font-bold flex items-center gap-1 mt-1 uppercase">
                    <Calendar size={14} /> {order.status === 'pending' ? `Pedido: ${order.date}` : `Recibido: ${order.receivedDate}`}
                  </p>
                  {order.supplier && <p className="text-[10px] text-blue-600 font-black uppercase mt-1">PROVEEDOR: {order.supplier}</p>}
                </div>
              </div>

              <div className="flex items-center gap-6">
                {order.status === 'completed' && (
                  <div className="text-right px-6 border-r border-gray-100">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Costo Unitario</p>
                    <p className="font-black text-xl text-emerald-600">${order.unitPrice?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">Total: ${order.totalAmount?.toLocaleString()}</p>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Total Recetarios</p>
                  <p className="font-black text-lg text-gray-700">{order.items.reduce((a:any,b:any)=>a+b.quantity, 0)}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {order.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleConfirmArrival(order)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-100"
                      >
                        Confirmar Entrega
                      </button>
                      <button 
                        onClick={() => handleEditExistingOrder(order)}
                        className="bg-gray-100 text-gray-500 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        Editar Pedido
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full">
                      <CheckCircle2 size={16} /> Procesado
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-6 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {order.items.map((item:any, idx:number) => (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="font-black text-gray-700 truncate mr-2 text-[10px] uppercase">{item.nombre}</span>
                  <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-lg text-[10px]">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Orden / Editar */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-2xl flex items-center gap-3"><ShoppingCart /> Configurar Pedido</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Seleccione médicos y ajuste cantidades para el proveedor</p>
              </div>
              <button onClick={() => setShowNewOrder(false)} className="hover:bg-white/10 p-3 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col h-full bg-white p-6 rounded-[32px] border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Paso 1: Médicos Disponibles</p>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-gray-300" size={18} />
                    <input 
                       type="text" 
                       placeholder="Buscar profesional..." 
                       className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all"
                       value={modalSearchTerm}
                       onChange={(e) => setModalSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredDoctorsModal.map((d:any) => {
                      const isSelected = selectedDocs.some(s => s.doctorId === d.id);
                      return (
                        <button 
                          key={d.id}
                          onClick={() => handleToggleDoctor(d)}
                          className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-transparent hover:border-gray-200 bg-gray-50/30'}`}
                        >
                          <div className="text-left">
                            <p className="font-black text-xs text-gray-800 uppercase">{d.nombre}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase mt-1">DEP: {d.stock_deposito_actual} / IDEAL: {d.ideal_deposito}</p>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col h-full shadow-inner">
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Paso 2: Ajuste de cantidades para el pedido</p>
                   <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedDocs.map((item) => (
                         <div key={item.doctorId} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[9px] font-black text-gray-800 uppercase truncate">{item.nombre}</p>
                              <button onClick={() => handleToggleDoctor({id: item.doctorId})} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                            <input 
                              type="number" 
                              className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-black text-blue-600 outline-none"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.doctorId, parseInt(e.target.value) || 0)}
                            />
                         </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
              <button onClick={() => setShowNewOrder(false)} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
              <button 
                onClick={handleCreateOrder}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-100 transition-all active:scale-95"
              >
                Confirmar y Generar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalización (Confirmar Entrega de Factura) */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10 bg-emerald-600 text-white flex justify-between items-center">
                 <div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Recepcionar Pedido</h3>
                    <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-1">Ingrese los datos reales de la factura recibida</p>
                 </div>
                 <CheckCircle2 size={40} className="text-emerald-200" />
              </div>
              
              <div className="p-10 space-y-6">
                 <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">
                       <Tag size={14}/> Nº de Factura
                    </label>
                    <input 
                       type="text" 
                       placeholder="Ej: 0001-00004523"
                       className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                       value={invoiceData.number}
                       onChange={e => setInvoiceData({...invoiceData, number: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">
                       <Landmark size={14}/> Proveedor
                    </label>
                    <input 
                       type="text" 
                       placeholder="Nombre de la imprenta"
                       className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                       value={invoiceData.supplier}
                       onChange={e => setInvoiceData({...invoiceData, supplier: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">
                       <DollarSign size={14}/> Monto Total de la Factura ($)
                    </label>
                    <input 
                       type="number" 
                       placeholder="0.00"
                       className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-emerald-600 text-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all"
                       value={invoiceData.totalAmount || ''}
                       onChange={e => setInvoiceData({...invoiceData, totalAmount: parseFloat(e.target.value) || 0})}
                    />
                    {invoiceData.totalAmount > 0 && orderToComplete && (
                      <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase text-center bg-gray-50 py-2 rounded-xl border border-dashed border-gray-200">
                        Costo estimado por recetario: <span className="text-emerald-600">${(invoiceData.totalAmount / orderToComplete.items.reduce((a:any,b:any)=>a+b.quantity, 0)).toFixed(2)}</span>
                      </p>
                    )}
                 </div>
              </div>

              <div className="p-10 border-t flex gap-4">
                 <button onClick={() => setShowCompleteModal(false)} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest">Cerrar</button>
                 <button 
                    onClick={finalizeOrder}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all active:scale-95"
                 >
                    Confirmar Ingreso
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
