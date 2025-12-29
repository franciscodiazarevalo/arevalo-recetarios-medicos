
// Fix: Added useMemo to the React imports
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, FileCheck, Clock, CheckCircle2, Edit3, ArrowRight, Plus, Search, ChevronDown, X } from 'lucide-react';
import { PurchaseOrder, Doctor, InvoiceItem } from '../types';

interface OrdersProps {
  orders: PurchaseOrder[];
  doctors: Doctor[];
  onCreateOrder: (items: InvoiceItem[]) => void;
  onReceiveOrder: (orderId: string, invoiceData: { invoiceNumber: string, supplier: string, date: string, cost: number, items: InvoiceItem[] }) => void;
  draftItems?: InvoiceItem[];
  onClearDraft: () => void;
}

export const Orders: React.FC<OrdersProps> = ({ orders, doctors, onCreateOrder, onReceiveOrder, draftItems = [], onClearDraft }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'pending' | 'history'>('create');
  
  // Estado para Nuevo Pedido
  const [newItems, setNewItems] = useState<InvoiceItem[]>([]);
  const [newItemDoctorId, setNewItemDoctorId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(100);
  
  // Estado para Buscador de Médicos en Nuevo Pedido
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estado para Recepción
  const [receivingOrderId, setReceivingOrderId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalCost, setTotalCost] = useState(0);
  const [receiveItems, setReceiveItems] = useState<InvoiceItem[]>([]);
  const [extraReceiveDocId, setExtraReceiveDocId] = useState('');
  const [extraReceiveQty, setExtraReceiveQty] = useState(100);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- ESCUCHA DE DRAFT ITEMS ---
  useEffect(() => {
    if (draftItems && draftItems.length > 0) {
        const cleanItems: InvoiceItem[] = draftItems.map(item => {
            let qty = Number(item.quantity);
            if (isNaN(qty) || qty < 0) qty = 0;
            return { doctorId: item.doctorId, quantity: qty };
        }).filter(item => item.quantity > 0);
        
        if (cleanItems.length > 0) {
            setNewItems(cleanItems);
            setActiveTab('create');
        }
        onClearDraft(); 
    }
  }, [draftItems, onClearDraft]);

  const filteredDoctorsForSearch = useMemo(() => {
    return doctors.filter(d => 
        d.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) || 
        d.specialty.toLowerCase().includes(doctorSearchTerm.toLowerCase())
    );
  }, [doctors, doctorSearchTerm]);

  const selectedDoctorLabel = useMemo(() => {
    if (!newItemDoctorId) return '';
    return doctors.find(d => d.id === newItemDoctorId)?.name || '';
  }, [newItemDoctorId, doctors]);

  const handleAddItemToNewOrder = () => {
    if (newItemDoctorId && newItemQuantity > 0) {
        const exists = newItems.find(i => i.doctorId === newItemDoctorId);
        if (exists) {
            setNewItems(newItems.map(i => i.doctorId === newItemDoctorId ? {...i, quantity: i.quantity + newItemQuantity} : i));
        } else {
            setNewItems([...newItems, { doctorId: newItemDoctorId, quantity: newItemQuantity }]);
        }
        setNewItemDoctorId('');
        setDoctorSearchTerm('');
        setNewItemQuantity(100);
    }
  };

  const handleRemoveFromNewOrder = (idx: number) => {
    const next = [...newItems];
    next.splice(idx, 1);
    setNewItems(next);
  };

  const handleSaveOrder = () => {
    if (newItems.length === 0) return;
    onCreateOrder(newItems);
    setNewItems([]);
    setActiveTab('pending');
    alert('Orden generada correctamente.');
  };

  const startReceiving = (order: PurchaseOrder) => {
    setReceivingOrderId(order.id);
    setReceiveItems(JSON.parse(JSON.stringify(order.items)));
    setInvoiceNumber('');
    setSupplier(order.supplier || '');
    setReceiveDate(new Date().toISOString().split('T')[0]);
    setTotalCost(0);
    setActiveTab('pending');
  };

  const handleUpdateReceiveItem = (idx: number, qty: number) => {
      const next = [...receiveItems];
      next[idx].quantity = qty;
      setReceiveItems(next);
  };

  const handleConfirmReception = (e: React.FormEvent) => {
    e.preventDefault();
    if (receivingOrderId && invoiceNumber && supplier && totalCost > 0) {
        onReceiveOrder(receivingOrderId, {
            invoiceNumber,
            supplier,
            date: receiveDate,
            cost: Number(totalCost),
            items: receiveItems
        });
        setReceivingOrderId(null);
        setActiveTab('history');
    }
  };

  const handleAddExtraReceiveItem = () => {
      if (extraReceiveDocId && extraReceiveQty > 0) {
          setReceiveItems([...receiveItems, { doctorId: extraReceiveDocId, quantity: Number(extraReceiveQty) }]);
          setExtraReceiveDocId('');
          setExtraReceiveQty(100);
      }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const historyOrders = orders.filter(o => o.status === 'COMPLETED').sort((a,b) => new Date(b.dateReceived || '').getTime() - new Date(a.dateReceived || '').getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b pb-2">
         <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
         <div className="flex bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'create' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Nuevo</button>
             <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'pending' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Pendientes ({pendingOrders.length})</button>
             <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'history' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Historial</button>
         </div>
      </div>

      {activeTab === 'create' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="mb-6"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><PlusCircle className="text-blue-500" /> Nuevo Pedido</h3></div>
             
             <div className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-gray-50 p-4 rounded-lg border mb-6">
                {/* BUSCADOR DE MÉDICO */}
                <div className="flex-1 w-full relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Médico</label>
                    <div 
                        className="relative w-full cursor-pointer"
                        onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Buscar médico por nombre..."
                            value={isDoctorDropdownOpen ? doctorSearchTerm : selectedDoctorLabel}
                            onChange={(e) => {
                                setDoctorSearchTerm(e.target.value);
                                if (!isDoctorDropdownOpen) setIsDoctorDropdownOpen(true);
                            }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {newItemDoctorId && !isDoctorDropdownOpen ? (
                                <button onClick={(e) => { e.stopPropagation(); setNewItemDoctorId(''); setDoctorSearchTerm(''); }} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            ) : (
                                <ChevronDown size={16} className="text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Resultados del Buscador */}
                    {isDoctorDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white shadow-xl border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                            {filteredDoctorsForSearch.length > 0 ? (
                                filteredDoctorsForSearch.map(d => (
                                    <div 
                                        key={d.id} 
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                                        onClick={() => {
                                            setNewItemDoctorId(d.id);
                                            setDoctorSearchTerm('');
                                            setIsDoctorDropdownOpen(false);
                                        }}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{d.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{d.specialty}</p>
                                        </div>
                                        {newItemDoctorId === d.id && <CheckCircle2 size={16} className="text-blue-600" />}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-400 italic text-center">
                                    No se encontraron médicos
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full md:w-32">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Cantidad</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500" value={newItemQuantity} onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 0)} />
                </div>
                
                <button 
                    onClick={handleAddItemToNewOrder} 
                    disabled={!newItemDoctorId} 
                    className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm h-[38px]"
                >
                    Agregar
                </button>
             </div>

             {newItems.length > 0 ? (
                 <div className="space-y-4">
                     <div className="border rounded-xl overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Médico</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Cantidad</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y">
                                {newItems.map((item, idx) => {
                                    const doc = doctors.find(d => d.id === item.doctorId);
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900">{doc?.name}</p>
                                                <p className="text-xs text-gray-500">{doc?.specialty}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleRemoveFromNewOrder(idx)} className="text-red-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18}/>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                     </div>
                     <div className="flex justify-end pt-4">
                        <button onClick={handleSaveOrder} className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 font-bold flex gap-2 transition-all active:scale-95"><FileCheck size={20} /> Guardar Pedido</button>
                     </div>
                 </div>
             ) : (
                 <div className="text-center py-16 border-2 border-dashed bg-gray-50 rounded-xl flex flex-col items-center">
                    <Clock size={40} className="text-gray-300 mb-3" />
                    <p className="text-gray-400 font-medium">No hay médicos en la lista de pedido.</p>
                 </div>
             )}
          </div>
      )}

      {activeTab === 'pending' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                  {pendingOrders.length > 0 ? pendingOrders.map(order => (
                      <div key={order.id} onClick={() => !receivingOrderId && startReceiving(order)} className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${receivingOrderId === order.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-100'}`}>
                          <div className="flex justify-between mb-2">
                             <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-wider">Pendiente</span>
                             <span className="text-xs text-gray-400 font-medium">{new Date(order.dateCreated).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">{order.items.length} Médicos incluidos</p>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase">ID: {order.id}</p>
                      </div>
                  )) : (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 italic text-gray-400">
                        No hay pedidos pendientes
                    </div>
                  )}
              </div>
              <div className="lg:col-span-2">
                 {receivingOrderId ? (
                     <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                         <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
                            <h3 className="font-bold flex gap-2 items-center"><CheckCircle2 size={20} /> Registrar Recepción de Stock</h3>
                            <button onClick={() => setReceivingOrderId(null)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">Cerrar</button>
                         </div>
                         <form onSubmit={handleConfirmReception} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nº Factura</label><input type="text" required value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="0001-XXXXXXX" /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Proveedor / Imprenta</label><input type="text" required value={supplier} onChange={e=>setSupplier(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Nombre imprenta..." /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Costo Total ($)</label><input type="number" required value={totalCost} onChange={e=>setTotalCost(parseFloat(e.target.value))} className="w-full border rounded-lg p-2 font-bold text-green-700 focus:ring-2 focus:ring-green-500" placeholder="0.00" /></div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Cantidades Recibidas</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {receiveItems.map((item, idx) => {
                                        const doc = doctors.find(d => d.id === item.doctorId);
                                        return (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                                                <div className="overflow-hidden mr-4">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{doc?.name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">{doc?.specialty}</p>
                                                </div>
                                                <input type="number" value={item.quantity} onChange={(e) => handleUpdateReceiveItem(idx, parseInt(e.target.value)||0)} className="w-20 border rounded-md p-1.5 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row gap-2">
                                    <select className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500" value={extraReceiveDocId} onChange={e=>setExtraReceiveDocId(e.target.value)}>
                                        <option value="">+ Agregar otro médico al ingreso...</option>
                                        {doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <input type="number" className="w-24 border rounded-lg p-2 text-sm" value={extraReceiveQty} onChange={e=>setExtraReceiveQty(parseInt(e.target.value)||0)} />
                                        <button type="button" onClick={handleAddExtraReceiveItem} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors">OK</button>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]">Confirmar Ingreso de Stock</button>
                         </form>
                     </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl bg-white/50 p-10">
                        <Edit3 size={48} className="opacity-10 mb-4" />
                        <p className="italic font-medium">Seleccione un pedido de la lista para registrar su ingreso.</p>
                    </div>
                 )}
              </div>
          </div>
      )}

      {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileCheck size={18} className="text-green-500"/> Historial de Ingresos</h3>
                  <span className="text-xs font-bold text-gray-400">{historyOrders.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr className="text-left">
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Rec.</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Factura / Proveedor</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Médicos</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Costo Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {historyOrders.length > 0 ? historyOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(o.dateReceived||'').toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-900">{o.invoiceNumber}</p>
                                    <p className="text-xs text-gray-500">{o.supplier}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {o.items.slice(0, 4).map((item, i) => (
                                            <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700" title={doctors.find(d=>d.id===item.doctorId)?.name}>
                                                {doctors.find(d=>d.id===item.doctorId)?.name.charAt(0)}
                                            </div>
                                        ))}
                                        {o.items.length > 4 && <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">+{o.items.length - 4}</div>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <span className="text-sm font-bold text-green-700 font-mono">${o.totalCost?.toLocaleString()}</span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No hay historial de compras registrado.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}
    </div>
  );
};
