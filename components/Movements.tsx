
import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, Plus, Trash2, Layers, CheckCircle } from 'lucide-react';
import { Doctor } from '../types';

interface MovementsProps {
  doctors: Doctor[];
  onBatchTransfer: (transfers: {doctorId: string, quantity: number}[]) => void;
  // Previously we used onInternalTransfer for single items, but we upgraded to batch logic in App.tsx
  // We can deprecate onInternalTransfer locally in this component in favor of batch handling
  onInternalTransfer?: (doctorId: string, quantity: number) => void;
  draftTransfers?: {doctorId: string, quantity: number}[];
  onClearDraft?: () => void;
}

interface PendingMovement {
  doctorId: string;
  doctorName: string;
  quantity: number;
}

export const Movements: React.FC<MovementsProps> = ({ doctors, onBatchTransfer, draftTransfers = [], onClearDraft }) => {
  const [transferQty, setTransferQty] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  
  // Batch State
  const [pendingList, setPendingList] = useState<PendingMovement[]>([]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Load draft items if present (from Dashboard)
  useEffect(() => {
    if (draftTransfers.length > 0) {
        const mappedItems: PendingMovement[] = draftTransfers.map(t => {
            const doc = doctors.find(d => d.id === t.doctorId);
            return {
                doctorId: t.doctorId,
                doctorName: doc ? doc.name : 'Desconocido',
                quantity: t.quantity
            }
        });
        
        // Prevent duplicates or add to existing if needed, but for now replace is safer for "Restock" action
        setPendingList(mappedItems);
        
        if (onClearDraft) {
            onClearDraft();
        }
    }
  }, [draftTransfers, doctors, onClearDraft]);

  // Filter pending items to calculate remaining stock dynamically while adding
  const getPendingQtyForDoctor = (id: string) => {
    return pendingList.filter(p => p.doctorId === id).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleAddToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor && transferQty > 0) {
      // Check stock limit including what's already in the pending list
      const currentPending = getPendingQtyForDoctor(selectedDoctor.id);
      if ((currentPending + transferQty) > selectedDoctor.padsInWarehouse) {
        alert(`No puede mover esa cantidad. Stock real: ${selectedDoctor.padsInWarehouse}, En lista de espera: ${currentPending}`);
        return;
      }

      const newItem: PendingMovement = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        quantity: transferQty
      };

      setPendingList([...pendingList, newItem]);
      
      // Reset inputs but keep focus handy
      setTransferQty(0);
      setSelectedDoctorId(null);
      setSearchTerm('');
    }
  };

  const handleRemoveFromList = (index: number) => {
    const newList = [...pendingList];
    newList.splice(index, 1);
    setPendingList(newList);
  };

  const handleProcessBatch = () => {
    // Convert to simple format for App.tsx handler
    const transfers = pendingList.map(p => ({ doctorId: p.doctorId, quantity: p.quantity }));
    onBatchTransfer(transfers);
    setPendingList([]);
    alert('Todos los movimientos han sido registrados exitosamente.');
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Movimientos Internos Masivos</h2>
           <p className="text-sm text-gray-500">Reponga el stock de Planta Baja seleccionando múltiples médicos.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium flex items-center">
            <Layers className="mr-2" size={20} />
            {pendingList.length} Movimientos pendientes
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Selection Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">1. Buscar Médico</label>
            
            {/* Search Container with Relative Positioning for Dropdown */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Escriba nombre del médico..." 
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Autocomplete Dropdown - Now correctly positioned and styled */}
              {searchTerm && !selectedDoctorId && (
                <div className="absolute top-full mt-1 left-0 w-full max-h-60 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100 bg-white z-50 shadow-xl">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doc => (
                      <div 
                        key={doc.id} 
                        className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center group transition-colors"
                        onClick={() => { setSelectedDoctorId(doc.id); setSearchTerm(''); }}
                      >
                        <div>
                            <span className="text-sm font-bold block text-gray-900">{doc.name}</span>
                            <span className="text-xs text-gray-600 font-medium">{doc.specialty}</span>
                        </div>
                        <span className="text-xs font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200 font-bold whitespace-nowrap">
                          Stock: {doc.padsInWarehouse}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center italic">
                      No se encontraron médicos con ese nombre.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Selected Doctor Info Card */}
            {selectedDoctor ? (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-indigo-900 leading-tight pr-2">{selectedDoctor.name}</h3>
                  <button onClick={() => setSelectedDoctorId(null)} className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium whitespace-nowrap">Cambiar</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                   <div className="bg-white p-2 rounded border border-indigo-100 text-center shadow-sm">
                      <span className="block text-xs text-gray-500 uppercase tracking-wide">Depósito</span>
                      <span className="font-bold text-xl text-gray-800">{selectedDoctor.padsInWarehouse}</span>
                   </div>
                   <div className="bg-white p-2 rounded border border-indigo-100 text-center shadow-sm">
                      <span className="block text-xs text-gray-500 uppercase tracking-wide">Planta Baja</span>
                      <span className="font-bold text-xl text-blue-600">{selectedDoctor.padsInPB}</span>
                   </div>
                </div>
              </div>
            ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm mb-4 bg-gray-50">
                    <p>Seleccione un médico de la lista para ver su stock disponible.</p>
                </div>
            )}

            <form onSubmit={handleAddToBatch}>
              <label className="block text-sm font-medium text-gray-700 mb-1">2. Cantidad a Mover</label>
              <div className="flex shadow-sm rounded-md">
                <input
                  type="number"
                  min="1"
                  // Max logic: Real Warehouse Stock minus what is already in the pending list
                  max={selectedDoctor ? selectedDoctor.padsInWarehouse - getPendingQtyForDoctor(selectedDoctor.id) : 1}
                  value={transferQty || ''}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                  className="flex-1 block w-full rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border text-gray-900 font-bold"
                  placeholder="0"
                  disabled={!selectedDoctor}
                />
                <button
                  type="submit"
                  disabled={!selectedDoctor || transferQty <= 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Pending List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[400px]">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700">Lista de Reposición Semanal</h3>
                 {pendingList.length > 0 && (
                     <button 
                        onClick={() => setPendingList([])} 
                        className="text-xs text-red-500 hover:text-red-700 font-medium bg-white px-2 py-1 rounded border border-red-100"
                     >
                        Vaciar lista
                     </button>
                 )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-0">
                 {pendingList.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                         <Layers size={48} className="mb-4 opacity-20" />
                         <p className="text-center">La lista de movimientos está vacía.<br/>Agregue médicos desde el panel izquierdo.</p>
                     </div>
                 ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médico</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingList.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.doctorName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center font-bold">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                            {item.quantity} <ArrowRight size={12} className="mx-1" /> PB
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleRemoveFromList(idx)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                            title="Eliminar de la lista"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
             </div>

             <div className="p-4 border-t border-gray-200 bg-gray-50">
                 <button
                    onClick={handleProcessBatch}
                    disabled={pendingList.length === 0}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold transition-all"
                 >
                    <CheckCircle className="mr-2" />
                    Confirmar Todos los Movimientos ({pendingList.length})
                 </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
