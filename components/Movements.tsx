
import React, { useState, useEffect } from 'react';
// Added X to the import list
import { Search, Plus, Trash2, Layers, CheckCircle, Edit3, Info, UserCheck, Activity, X } from 'lucide-react';

interface PendingMovement {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  currentPB: number;
  idealPB: number;
  currentDepot: number;
  quantity: number;
}

export const Movements = ({ doctors, onBatchTransfer, draftTransfers = [], onClearDraft }: any) => {
  const [transferQty, setTransferQty] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [pendingList, setPendingList] = useState<PendingMovement[]>([]);

  const selectedDoctor = doctors.find((d:any) => d.id === selectedDoctorId);

  useEffect(() => {
    if (draftTransfers && draftTransfers.length > 0) {
      const mappedItems = draftTransfers.map((t: any) => {
        const doc = doctors.find((d: any) => d.id === t.doctorId);
        if (!doc) return null;
        return {
          doctorId: t.doctorId,
          doctorName: doc.nombre,
          doctorSpecialty: doc.especialidad,
          currentPB: (doc.stock_pb_actual || 0),
          idealPB: (doc.ideal_pb || 0),
          currentDepot: (doc.stock_deposito_actual || 0),
          quantity: t.quantity
        };
      }).filter(Boolean);
      
      // Combinar con lo existente evitando duplicados
      setPendingList(prev => {
        const newList = [...prev];
        mappedItems.forEach((newItem: any) => {
          if (!newList.some(e => e.doctorId === newItem.doctorId)) {
            newList.push(newItem);
          }
        });
        return newList;
      });
      if (onClearDraft) onClearDraft();
    }
  }, [draftTransfers, doctors]);

  const handleAddToBatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedDoctor && transferQty > 0) {
      const existingIdx = pendingList.findIndex(p => p.doctorId === selectedDoctor.id);
      if (existingIdx > -1) {
        const newList = [...pendingList];
        newList[existingIdx].quantity += transferQty;
        setPendingList(newList);
      } else {
        setPendingList([...pendingList, {
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.nombre,
          doctorSpecialty: selectedDoctor.especialidad,
          currentPB: (selectedDoctor.stock_pb_actual || 0),
          idealPB: (selectedDoctor.ideal_pb || 0),
          currentDepot: (selectedDoctor.stock_deposito_actual || 0),
          quantity: transferQty
        }]);
      }
      setTransferQty(0);
      setSelectedDoctorId(null);
      setSearchTerm('');
    }
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    const newList = [...pendingList];
    newList[index].quantity = Math.max(0, newQty);
    setPendingList(newList);
  };

  const handleRemoveFromList = (index: number) => {
    const newList = [...pendingList];
    newList.splice(index, 1);
    setPendingList(newList);
  };

  const handleProcessBatch = () => {
    if (pendingList.length === 0) return;
    
    const overStock = pendingList.some(p => p.quantity > p.currentDepot);
    if (overStock) {
        if (!confirm("Atención: Hay cantidades que superan el stock registrado en Depósito. ¿Deseas confirmar el traslado de todas formas?")) {
            return;
        }
    }

    const transfers = pendingList.map(p => ({ doctorId: p.doctorId, quantity: p.quantity }));
    onBatchTransfer(transfers);
    setPendingList([]);
    alert('Traslado confirmado con éxito.');
  };

  const filteredDoctors = doctors.filter((doc:any) => 
    doc.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Movimientos Internos</h2>
           <p className="text-sm text-gray-500 font-medium">Baje recetarios del depósito a planta baja seleccionando cualquier profesional.</p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center shadow-2xl shadow-slate-200">
            <Layers className="mr-3 text-blue-400" size={18} />
            {pendingList.length} Profesionales en Lista
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Columna de BUSCADOR GLOBAL */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Search size={18} className="text-blue-600"/> Buscador Global
            </h3>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Nombre del médico..." 
                className="w-full pl-5 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && !selectedDoctorId && (
                <div className="absolute top-full mt-2 left-0 w-full max-h-80 overflow-y-auto border border-gray-100 rounded-[24px] bg-white z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.1)] custom-scrollbar">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc:any) => (
                      <button 
                        key={doc.id} 
                        className="w-full p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors border-b last:border-0 text-left"
                        onClick={() => { setSelectedDoctorId(doc.id); setSearchTerm(''); }}
                      >
                        <div>
                            <span className="text-xs font-black block text-gray-800 uppercase leading-tight group-hover:text-blue-600 transition-colors">{doc.nombre}</span>
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Stock DEP: {doc.stock_deposito_actual}</span>
                        </div>
                        <Plus size={14} className="text-gray-300 group-hover:text-blue-500 group-hover:scale-125 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
            
            {selectedDoctor ? (
              <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-xl shadow-blue-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Seleccionado</p>
                    <h3 className="font-black text-sm leading-tight pr-2 uppercase mt-1">{selectedDoctor.nombre}</h3>
                  </div>
                  {/* Now using imported X icon */}
                  <button onClick={() => setSelectedDoctorId(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={14}/></button>
                </div>
                <div className="flex gap-3 mt-4">
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={transferQty || ''}
                    onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-white text-slate-900 px-4 py-3 rounded-xl text-sm font-black outline-none shadow-inner"
                    placeholder="Cant."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddToBatch()}
                  />
                  <button
                    onClick={() => handleAddToBatch()}
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all active:scale-95"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ) : (
               <div className="py-10 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100 opacity-60">
                   <UserCheck size={32} className="mx-auto text-gray-300 mb-3" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 leading-relaxed">Busque un médico arriba para sumarlo a la bajada</p>
               </div>
            )}
          </div>
        </div>

        {/* Columna de la Planilla Detallada */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
             <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Activity size={20} className="text-blue-500" />
                    <h3 className="font-black text-gray-800 uppercase tracking-[0.2em] text-xs">Planilla de Bajada a Planta Baja</h3>
                 </div>
                 {pendingList.length > 0 && (
                     <button 
                        onClick={() => setPendingList([])} 
                        className="text-[9px] text-red-500 font-black uppercase bg-white px-4 py-2 rounded-xl border border-red-100 hover:bg-red-50 transition-all shadow-sm"
                     >
                        Vaciar Lista
                     </button>
                 )}
             </div>
             
             <div className="flex-1 overflow-x-auto custom-scrollbar">
                 {pendingList.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-300 p-20">
                         <Layers size={80} className="mb-6 opacity-20" />
                         <p className="text-center font-black text-xs uppercase tracking-[0.2em] opacity-40">No hay traslados pendientes</p>
                     </div>
                 ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Profesional</th>
                                <th className="px-6 py-5 text-center">Estado Actual PB</th>
                                <th className="px-6 py-5 text-center">Stock Depósito</th>
                                <th className="px-6 py-5 text-center w-48">Cant. a Bajar</th>
                                <th className="px-8 py-5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pendingList.map((item, idx) => {
                                const isOverStock = item.quantity > item.currentDepot;
                                return (
                                    <tr key={item.doctorId} className={`group transition-colors ${isOverStock ? 'bg-red-50/50' : 'hover:bg-blue-50/20'}`}>
                                        <td className="px-8 py-5">
                                          <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{item.doctorName}</p>
                                          <p className="text-[10px] text-gray-400 font-bold italic">{item.doctorSpecialty}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <div className="inline-flex flex-col items-center">
                                              <span className={`text-[11px] font-black ${item.currentPB < 5 ? 'text-orange-500' : 'text-gray-600'}`}>
                                                {item.currentPB} / {item.idealPB}
                                              </span>
                                              <div className="w-20 h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden border border-gray-50 shadow-inner">
                                                  <div 
                                                    className={`h-full transition-all duration-700 ${item.currentPB === 0 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${Math.min(100, (item.currentPB / (item.idealPB || 1)) * 100)}%` }}
                                                  ></div>
                                              </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${item.currentDepot === 0 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {item.currentDepot} DISP.
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className={`flex items-center gap-2 bg-white rounded-2xl border-2 px-3 py-2 transition-all ${isOverStock ? 'border-red-400 bg-red-50 shadow-lg shadow-red-100 ring-2 ring-red-100' : 'border-gray-100 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-50'}`}>
                                              <input 
                                                type="number" 
                                                className="w-full text-center text-sm font-black text-blue-700 outline-none border-none bg-transparent"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value) || 0)}
                                              />
                                              <Edit3 size={14} className="text-blue-200" />
                                            </div>
                                            {isOverStock && <p className="text-[9px] text-red-500 font-black mt-2 uppercase tracking-tighter animate-pulse">Stock Insuficiente</p>}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleRemoveFromList(idx)}
                                                className="text-gray-200 hover:text-red-500 transition-all p-3 rounded-2xl hover:bg-white hover:shadow-xl group"
                                            >
                                                <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 )}
             </div>

             <div className="p-10 border-t border-gray-100 bg-white">
                 <button
                    onClick={handleProcessBatch}
                    disabled={pendingList.length === 0}
                    className="w-full flex items-center justify-center py-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] disabled:shadow-none"
                 >
                    <CheckCircle className="mr-4" size={28} />
                    Confirmar Bajada de {pendingList.length} Profesionales
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
