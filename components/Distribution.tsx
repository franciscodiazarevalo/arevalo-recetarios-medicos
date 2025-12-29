import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, AlertCircle, CheckCircle, User, ShoppingCart, Trash2, X } from 'lucide-react';
import { Doctor } from '../types';

interface DistributionProps {
  doctors: Doctor[];
  onDistribute: (doctorId: string, quantity: number) => void;
}

export const Distribution: React.FC<DistributionProps> = ({ doctors, onDistribute }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // State to track multiple selections: { [doctorId]: quantity }
  const [selections, setSelections] = useState<Record<string, number>>({});

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals for the summary header
  const totalItems = (Object.values(selections) as number[]).reduce((acc, qty) => acc + qty, 0);
  const totalDoctorsSelected = Object.keys(selections).length;

  const handleQuantityChange = (doc: Doctor, delta: number) => {
    setSelections(prev => {
      const currentQty = prev[doc.id] || 0;
      const newQty = currentQty + delta;

      // Validation limits
      if (newQty < 0) return prev;
      if (newQty > doc.padsInPB) return prev; // Cannot exceed stock

      const next = { ...prev };
      if (newQty === 0) {
        delete next[doc.id];
      } else {
        next[doc.id] = newQty;
      }
      return next;
    });
  };

  const handleConfirmAll = () => {
    Object.entries(selections).forEach(([id, qty]) => {
      onDistribute(id, qty);
    });
    setSelections({});
    setSearchTerm('');
    // Optional feedback
    // alert('Entregas registradas correctamente'); 
  };

  const clearSelections = () => {
      if(window.confirm('¿Borrar toda la selección actual?')) {
          setSelections({});
      }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500 relative">
      
      {/* 1. TOP PANEL: Search & Summary Station */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm -mx-6 px-6 py-4 mb-4 space-y-3">
        
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Buscar médico por nombre o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>
            )}
        </div>

        {/* Action Bar (Visible only when items are selected) */}
        {totalItems > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-full">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-900">
                            {totalDoctorsSelected} {totalDoctorsSelected === 1 ? 'Médico' : 'Médicos'}
                        </p>
                        <p className="text-xs text-blue-700">
                            Total a entregar: <span className="font-bold">{totalItems} recetarios</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={clearSelections}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                        title="Limpiar todo"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={handleConfirmAll}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm shadow-sm transition-transform active:scale-95"
                    >
                        <CheckCircle size={16} className="mr-2" />
                        Confirmar Entrega
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* 2. LIST SECTION */}
      <div className="flex-1 overflow-y-auto pb-20 px-1">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 mx-1">
            <p className="text-gray-500">No se encontraron médicos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDoctors.map((doc) => {
               const qty = selections[doc.id] || 0;
               const hasStock = doc.padsInPB > 0;
               const isMaxed = qty >= doc.padsInPB;
               
               return (
                <div 
                  key={doc.id}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border transition-all
                    ${qty > 0 
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' 
                        : 'bg-white border-gray-100 hover:border-gray-300'
                    }
                    ${!hasStock ? 'opacity-60 bg-gray-50' : ''}
                  `}
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`
                        flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm
                        ${qty > 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
                    `}>
                        {doc.name.substring(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold truncate text-sm md:text-base ${qty > 0 ? 'text-blue-900' : 'text-gray-900'}`}>
                          {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 truncate max-w-[120px]">{doc.specialty}</span>
                          {!hasStock && <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> Sin Stock</span>}
                          {hasStock && <span className="text-gray-400">Stock: {doc.padsInPB}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="flex items-center gap-3 pl-2">
                    {hasStock ? (
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm h-9">
                            <button 
                                onClick={() => handleQuantityChange(doc, -1)}
                                disabled={qty === 0}
                                className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            
                            <div className={`w-8 text-center font-bold text-sm ${qty > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                {qty}
                            </div>

                            <button 
                                onClick={() => handleQuantityChange(doc, 1)}
                                disabled={isMaxed}
                                className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-r-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-gray-400 px-2">Agotado</span>
                    )}
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
};