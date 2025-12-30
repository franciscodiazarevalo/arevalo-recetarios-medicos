
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Layers, CheckCircle, Edit3, Info } from 'lucide-react';

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

  // Efecto para cargar los datos sugeridos desde el Dashboard
  useEffect(() => {
    if (draftTransfers && draftTransfers.length > 0) {
      const mappedItems = draftTransfers.map((t: any) => {
        const doc = doctors.find((d: any) => d.id === t.doctorId);
        return {
          doctorId: t.doctorId,
          doctorName: doc ? doc.name : 'Profesional',
          doctorSpecialty: doc ? doc.specialty : '',
          currentPB: doc ? doc.stock_pb : 0,
          idealPB: doc ? doc.ideal_pb : 0,
          currentDepot: doc ? doc.stock_deposito : 0,
          quantity: t.quantity
        };
      });
      
      setPendingList(mappedItems);
      
      // Limpiamos el borrador para que no se duplique al navegar
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
          doctorName: selectedDoctor.name,
          doctorSpecialty: selectedDoctor.specialty,
          currentPB: selectedDoctor.stock_pb,
          idealPB: selectedDoctor.ideal_pb,
          currentDepot: selectedDoctor.stock_deposito,
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
    alert('Traslado confirmado. El stock de Planta Baja ha sido actualizado.');
  };

  const filteredDoctors = doctors.filter((doc:any) => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-black text-gray-900">Traslado Masivo a Planta Baja</h2>
           <p className="text-sm text-gray-500 font-medium italic">Revise el detalle de los faltantes antes de confirmar la bajada de mercadería.</p>
        </div>
        <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-100">
            <Layers className="mr-2" size={20} />
            {pendingList.length} Médicos en Lista
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Columna de Agregar Manual */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-600"/> Agregar otro Médico</h3>
            
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="w-full pl-4 pr-3 py-3 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && !selectedDoctorId && (
                <div className="absolute top-full mt-2 left-0 w-full max-h-60 overflow-y-auto border border-gray-100 rounded-xl bg-white z-50 shadow-2xl">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc:any) => (
                      <div 
                        key={doc.id} 
                        className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors border-b last:border-0"
                        onClick={() => { setSelectedDoctorId(doc.id); setSearchTerm(''); }}
                      >
                        <div>
                            <span className="text-sm font-bold block text-gray-800">{doc.name}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase">Depósito: {doc.stock_deposito}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-gray-400 text-center">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
            
            {selectedDoctor && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-blue-900 text-xs leading-tight pr-2 uppercase">{selectedDoctor.name}</h3>
                  <button onClick={() => setSelectedDoctorId(null)} className="text-[10px] text-blue-400 font-black">X</button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={transferQty || ''}
                    onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 rounded-xl border-none text-sm font-bold outline-none shadow-inner"
                    placeholder="Cantidad"
                  />
                  <button
                    onClick={() => handleAddToBatch()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
              <div className="flex items-start gap-3">
                  <Info className="text-amber-600 mt-1 shrink-0" size={20} />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      La cantidad sugerida se calcula restando el <b>Stock Actual</b> del <b>Stock Ideal</b> definido en la ficha de cada médico.
                  </p>
              </div>
          </div>
        </div>

        {/* Columna de la Planilla Detallada */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
             <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                 <h3 className="font-black text-gray-700 uppercase tracking-widest text-xs">Planilla Detallada de Traslado</h3>
                 {pendingList.length > 0 && (
                     <button 
                        onClick={() => setPendingList([])} 
                        className="text-[10px] text-red-500 font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-red-50 hover:bg-red-50"
                     >
                        Limpiar Todo
                     </button>
                 )}
             </div>
             
             <div className="flex-1 overflow-x-auto">
                 {pendingList.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 p-20 opacity-30">
                         <Layers size={64} className="mb-4" />
                         <p className="text-center font-bold text-sm">No hay médicos seleccionados para trasladar.</p>
                     </div>
                 ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                            <tr>
                                <th className="px-6 py-4">Profesional</th>
                                <th className="px-6 py-4 text-center">Estado actual PB</th>
                                <th className="px-6 py-4 text-center">Stock Depósito</th>
                                <th className="px-6 py-4 text-center w-40">Cantidad a Bajar</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pendingList.map((item, idx) => {
                                const isOverStock = item.quantity > item.currentDepot;
                                return (
                                    <tr key={item.doctorId} className={`group transition-colors ${isOverStock ? 'bg-red-50/30' : 'hover:bg-blue-50/20'}`}>
                                        <td className="px-6 py-4">
                                          <p className="text-sm font-bold text-gray-800 uppercase">{item.doctorName}</p>
                                          <p className="text-[10px] text-gray-500 font-medium">{item.doctorSpecialty}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          <div className="inline-flex flex-col items-center">
                                              <span className="text-xs font-black text-gray-700">{item.currentPB} / {item.idealPB}</span>
                                              <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                  <div 
                                                    className={`h-full ${item.currentPB === 0 ? 'bg-red-500' : 'bg-orange-400'}`} 
                                                    style={{ width: `${Math.min(100, (item.currentPB / item.idealPB) * 100)}%` }}
                                                  ></div>
                                              </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.currentDepot === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {item.currentDepot} disponibles
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`flex items-center gap-2 bg-white rounded-xl border p-1 shadow-sm transition-all ${isOverStock ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 focus-within:border-blue-500'}`}>
                                              <input 
                                                type="number" 
                                                className="w-full text-center text-sm font-black text-blue-600 outline-none border-none bg-transparent"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value) || 0)}
                                              />
                                              <Edit3 size={14} className="text-gray-300 mr-2" />
                                            </div>
                                            {isOverStock && <p className="text-[9px] text-red-500 font-black mt-1 uppercase tracking-tighter">Insuficiente en depósito</p>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleRemoveFromList(idx)}
                                                className="text-gray-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-white shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 )}
             </div>

             <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                 <button
                    onClick={handleProcessBatch}
                    disabled={pendingList.length === 0}
                    className="w-full flex items-center justify-center py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:shadow-none"
                 >
                    <CheckCircle className="mr-3" size={24} />
                    Confirmar Bajada de {pendingList.length} Profesionales
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
