
import React, { useState } from 'react';
import { Package, Building2, AlertTriangle, MessageCircle, ShoppingCart, ArrowLeft, Search, ArrowRightLeft } from 'lucide-react';

export const Dashboard = ({ doctors, stats, onNavigate, onPrepareDraft }: any) => {
  const [view, setView] = useState<'overview' | 'list'>('overview');
  const [listType, setListType] = useState<'pb' | 'deposito'>('pb');
  const [searchTerm, setSearchTerm] = useState('');

  const faltantesPB = doctors.filter((d: any) => (d.stock_pb || 0) < (d.min_pb || 0));
  const faltantesDep = doctors.filter((d: any) => (d.stock_deposito || 0) < (d.min_deposito || 0));

  const handleShowList = (type: 'pb' | 'deposito') => {
    setListType(type);
    setView('list');
  };

  const handleCreateDraftMovements = () => {
    // Tomamos TODOS los médicos que están por debajo del mínimo en PB
    const suggestedMovements = faltantesPB.map((d: any) => {
      // Calculamos cuánto le falta para llegar a su stock IDEAL
      const quantityNeeded = Math.max(0, (d.ideal_pb || 0) - (d.stock_pb || 0));
      return {
        doctorId: d.id,
        quantity: quantityNeeded || 0 // Si es 0, igual lo mandamos para que el usuario complete
      };
    });

    if (suggestedMovements.length === 0) {
      alert("No hay médicos con stock bajo el mínimo en Planta Baja.");
      return;
    }

    onPrepareDraft(suggestedMovements);
  };

  const filteredDoctors = doctors.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a: any, b: any) => listType === 'pb' ? a.stock_pb - b.stock_pb : a.stock_deposito - b.stock_deposito);

  if (view === 'list') {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('overview')} className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
            <ArrowLeft size={20} /> Volver al Resumen
          </button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar médico..." 
              className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Médico / Profesional</th>
                <th className="p-4 text-center">Stock {listType === 'pb' ? 'Planta Baja' : 'Depósito'}</th>
                <th className="p-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((d: any) => {
                const stock = listType === 'pb' ? d.stock_pb : d.stock_deposito;
                const min = listType === 'pb' ? d.min_pb : d.min_deposito;
                const isLow = stock < min;
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.specialty}</p>
                    </td>
                    <td className={`p-4 text-center font-black text-lg ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                      {stock}
                    </td>
                    <td className="p-4 text-center">
                      {isLow ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Crítico</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Óptimo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <button onClick={() => handleShowList('pb')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between text-left group">
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Stock PB</p><h3 className="text-2xl font-black text-blue-900 group-hover:scale-105 transition-transform">{stats.totalPB}</h3></div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Package size={24} /></div>
        </button>
        <button onClick={() => handleShowList('deposito')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between text-left group">
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Stock Depósito</p><h3 className="text-2xl font-black text-blue-900 group-hover:scale-105 transition-transform">{stats.totalDep}</h3></div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Building2 size={24} /></div>
        </button>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Alertas</p><h3 className="text-2xl font-black text-orange-600">{stats.alerts}</h3></div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><AlertTriangle size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="w-1.5 h-5 bg-orange-500 rounded-full"></span> Faltantes PB</h4>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {faltantesPB.length > 0 ? faltantesPB.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-2.5 bg-orange-50 rounded-xl border border-orange-100 text-sm">
                <span className="font-bold text-gray-700 truncate mr-2">{d.name}</span>
                <span className="text-orange-700 font-bold px-2 py-0.5 bg-white rounded border border-orange-200 whitespace-nowrap">Stock: {d.stock_pb}</span>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <Package size={40} className="mb-2" />
                <p className="text-xs font-bold uppercase">Sin faltantes en PB</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4 no-print">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("*PEDIDO REPOSICIÓN PB*\n\n" + faltantesPB.map((d:any) => `- ${d.name} (Stock: ${d.stock_pb})`).join('\n'))}`, '_blank')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98]"><MessageCircle size={16}/> WhatsApp</button>
            <button 
                onClick={(e) => { e.preventDefault(); handleCreateDraftMovements(); }} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98] shadow-md shadow-blue-100"
            >
                <ArrowRightLeft size={16}/> Preparar Traslado
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="w-1.5 h-5 bg-red-500 rounded-full"></span> Faltantes Depósito</h4>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {faltantesDep.length > 0 ? faltantesDep.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-2.5 bg-red-50 rounded-xl border border-red-100 text-sm">
                <span className="font-bold text-gray-700 truncate mr-2">{d.name}</span>
                <span className="text-red-700 font-bold px-2 py-0.5 bg-white rounded border border-red-200 whitespace-nowrap">Stock: {d.stock_deposito}</span>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <Building2 size={40} className="mb-2" />
                <p className="text-xs font-bold uppercase">Depósito abastecido</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4 no-print">
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("*PEDIDO IMPRENTA*\n\n" + faltantesDep.map((d:any) => `- ${d.name} (Stock: ${d.stock_deposito})`).join('\n'))}`, '_blank')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98]"><MessageCircle size={16}/> WhatsApp</button>
            <button onClick={() => onNavigate('orders')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98]"><ShoppingCart size={16}/> Órden Compra</button>
          </div>
        </div>
      </div>
    </div>
  );
};
