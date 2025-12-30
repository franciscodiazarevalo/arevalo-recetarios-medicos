
import React, { useState } from 'react';
import { Search, UserCheck, Minus, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export const Distribution = ({ doctors, onDistribute }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [lastDelivered, setLastDelivered] = useState<string | null>(null);

  const filteredDoctors = doctors.filter((d: any) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateQty = (id: string, delta: number) => {
    const current = quantities[id] || 1;
    const newVal = Math.max(1, current + delta);
    setQuantities({ ...quantities, [id]: newVal });
  };

  const confirmDistribution = (doc: any) => {
    const qty = quantities[doc.id] || 1;
    
    // Verificación de stock antes de entregar
    if ((doc.stock_pb || 0) < qty) {
      alert(`Atención: Solo quedan ${doc.stock_pb} recetarios en Planta Baja. No se pueden entregar ${qty}.`);
      return;
    }

    // Llamada a la función principal del App.tsx
    onDistribute(doc.id, qty);
    
    // Feedback visual
    setLastDelivered(doc.name);
    
    // Resetear cantidad local
    setQuantities({ ...quantities, [doc.id]: 1 });

    // Limpiar mensaje después de un tiempo
    setTimeout(() => setLastDelivered(null), 3500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Entregar a Médico</h2>
        <p className="text-gray-500 font-medium">Uso exclusivo para despacho inmediato en mostrador (Planta Baja).</p>
      </div>

      {lastDelivered && (
        <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-3 text-green-700 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} className="shrink-0" />
          <p className="font-bold">¡Entrega registrada con éxito para <span className="uppercase">{lastDelivered}</span>!</p>
        </div>
      )}

      <div className="relative mb-8 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
        <input
          type="text"
          placeholder="Escriba el nombre del profesional..."
          className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredDoctors.length > 0 ? filteredDoctors.map((doc: any) => {
          const qty = quantities[doc.id] || 1;
          const currentStock = doc.stock_pb || 0;
          const hasStock = currentStock > 0;

          return (
            <div 
              key={doc.id} 
              className={`bg-white p-6 rounded-3xl shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${!hasStock ? 'opacity-75 bg-gray-50 border-gray-200' : 'border-gray-100 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${hasStock ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-400'}`}>
                  <UserCheck size={28} />
                </div>
                <div>
                  <h4 className="font-black text-gray-800 uppercase leading-tight">{doc.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{doc.specialty}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${hasStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {hasStock ? `Disponible: ${currentStock}` : 'Sin Stock en PB'}
                    </span>
                  </div>
                </div>
              </div>

              {hasStock ? (
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleUpdateQty(doc.id, -1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-blue-600 hover:shadow-sm transition-all"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number"
                      className="w-12 text-center bg-transparent font-black text-blue-900 text-lg outline-none"
                      value={qty}
                      readOnly
                    />
                    <button 
                      onClick={() => handleUpdateQty(doc.id, 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-blue-600 hover:shadow-sm transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => confirmDistribution(doc)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center gap-2"
                  >
                    Entregar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-50 px-4 py-3 rounded-2xl border border-red-100">
                  <AlertCircle size={18} />
                  Debe reponer desde Depósito
                </div>
              )}
            </div>
          );
        }) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Search size={48} className="mx-auto text-gray-300 mb-4 opacity-50" />
                <p className="text-gray-500 font-bold italic">No se encontró ningún profesional con ese nombre.</p>
            </div>
        )}
      </div>
    </div>
  );
};
