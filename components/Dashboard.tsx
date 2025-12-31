
import React, { useState } from 'react';
import { Package, Building2, AlertTriangle, MessageCircle, ShoppingCart, ArrowLeft, Search, ArrowRightLeft, FileText, Printer } from 'lucide-react';

export const Dashboard = ({ doctors, stats, onNavigate, onPrepareDraft }: any) => {
  const [view, setView] = useState<'overview' | 'list'>('overview');
  const [listType, setListType] = useState<'pb' | 'deposito'>('pb');
  const [searchTerm, setSearchTerm] = useState('');

  const faltantesPB = doctors.filter((d: any) => (Number(d.stock_pb_actual) || 0) < (Number(d.min_pb) || 0));
  const faltantesDep = doctors.filter((d: any) => (Number(d.stock_deposito_actual) || 0) < (Number(d.min_deposito) || 0));

  const handleWhatsApp = (doc: any, type: 'PB' | 'DEP') => {
    const stock = type === 'PB' ? doc.stock_pb_actual : doc.stock_deposito_actual;
    const msg = `Hola! Aviso de Stock: El profesional ${doc.nombre} tiene solo ${stock} recetarios en ${type === 'PB' ? 'Planta Baja' : 'Depósito'}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShowList = (type: 'pb' | 'deposito') => {
    setListType(type);
    setView('list');
  };

  const handleCreateDraftMovements = () => {
    const suggestedMovements = faltantesPB.map((d: any) => {
      const quantityNeeded = Math.max(0, (Number(d.ideal_pb) || 0) - (Number(d.stock_pb_actual) || 0));
      return {
        doctorId: d.id,
        quantity: quantityNeeded || 0
      };
    });

    if (suggestedMovements.length === 0) {
      alert("No hay médicos con stock bajo en Planta Baja.");
      return;
    }

    onPrepareDraft(suggestedMovements);
  };

  const filteredDoctors = doctors.filter((d: any) => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a: any, b: any) => {
    const valA = listType === 'pb' ? (a.stock_pb_actual || 0) : (a.stock_deposito_actual || 0);
    const valB = listType === 'pb' ? (b.stock_pb_actual || 0) : (b.stock_deposito_actual || 0);
    return valA - valB;
  });

  if (view === 'list') {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between no-print">
          <button onClick={() => setView('overview')} className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
            <ArrowLeft size={20} /> Volver al Resumen
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handlePrint} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase transition-all hover:bg-gray-200">
              <Printer size={16} /> Imprimir Lista
            </button>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Vista para impresión */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 bg-gray-50 border-b hidden print:block">
            <h1 className="text-xl font-black uppercase">Reporte de Stock - {listType === 'pb' ? 'Planta Baja' : 'Depósito'}</h1>
            <p className="text-sm text-gray-500 font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Profesional</th>
                <th className="p-4 text-center">Stock Actual</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((d: any) => {
                const stock = listType === 'pb' ? (d.stock_pb_actual || 0) : (d.stock_deposito_actual || 0);
                const min = listType === 'pb' ? (d.min_pb || 0) : (d.min_deposito || 0);
                const isLow = stock < min;
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-800 uppercase text-xs">{d.nombre}</p>
                    </td>
                    <td className={`p-4 text-center font-black text-lg ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                      {stock}
                    </td>
                    <td className="p-4 text-center">
                      {isLow ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Bajo</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Bien</span>
                      )}
                    </td>
                    <td className="p-4 text-right no-print">
                       <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => handleWhatsApp(d, listType === 'pb' ? 'PB' : 'DEP')}
                           className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                           title="Enviar WhatsApp"
                         >
                           <MessageCircle size={18} />
                         </button>
                       </div>
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
        <button onClick={() => handleShowList('pb')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all flex items-center justify-between text-left group">
          <div><p className="text-xs text-gray-400 font-bold uppercase">Stock Planta Baja</p><h3 className="text-2xl font-black text-blue-900">{stats.totalPB}</h3></div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Package size={24} /></div>
        </button>
        <button onClick={() => handleShowList('deposito')} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 transition-all flex items-center justify-between text-left group">
          <div><p className="text-xs text-gray-400 font-bold uppercase">Stock Depósito</p><h3 className="text-2xl font-black text-blue-900">{stats.totalDep}</h3></div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Building2 size={24} /></div>
        </button>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-xs text-gray-400 font-bold uppercase">Alertas</p><h3 className="text-2xl font-black text-orange-600">{stats.alerts}</h3></div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><AlertTriangle size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FALTANTES PB */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="w-1.5 h-5 bg-orange-500 rounded-full"></span> Faltantes PB</h4>
            <button onClick={handlePrint} className="no-print p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <FileText size={18}/>
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {faltantesPB.length > 0 ? faltantesPB.map((d: any) => (
              <div key={d.id} className="group flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100 text-sm hover:shadow-sm transition-all">
                <span className="font-bold text-gray-700 truncate mr-2 uppercase text-[11px]">{d.nombre}</span>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleWhatsApp(d, 'PB')}
                     className="md:opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-500 text-white rounded-lg transition-all shadow-sm"
                   >
                     <MessageCircle size={14} />
                   </button>
                   <span className="text-orange-700 font-black px-2 py-0.5 bg-white rounded text-[10px] whitespace-nowrap">Stock: {d.stock_pb_actual}</span>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 py-10 text-xs font-bold uppercase tracking-widest">Sin faltantes en PB</p>}
          </div>
          <div className="flex gap-3 mt-4 no-print">
            <button 
                onClick={(e) => { e.preventDefault(); handleCreateDraftMovements(); }} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
                <ArrowRightLeft size={16}/> Preparar Traslado
            </button>
          </div>
        </div>

        {/* FALTANTES DEPOSITO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="w-1.5 h-5 bg-red-500 rounded-full"></span> Faltantes Depósito</h4>
            <button onClick={handlePrint} className="no-print p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <FileText size={18}/>
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {faltantesDep.length > 0 ? faltantesDep.map((d: any) => (
              <div key={d.id} className="group flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100 text-sm hover:shadow-sm transition-all">
                <span className="font-bold text-gray-700 truncate mr-2 uppercase text-[11px]">{d.nombre}</span>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleWhatsApp(d, 'DEP')}
                     className="md:opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-500 text-white rounded-lg transition-all shadow-sm"
                   >
                     <MessageCircle size={14} />
                   </button>
                   <span className="text-red-700 font-black px-2 py-0.5 bg-white rounded text-[10px] whitespace-nowrap">Stock: {d.stock_deposito_actual}</span>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 py-10 text-xs font-bold uppercase tracking-widest">Depósito abastecido</p>}
          </div>
          <div className="flex gap-3 mt-4 no-print">
            <button onClick={() => onNavigate('orders')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100"><ShoppingCart size={16}/> Generar Órden de Compra</button>
          </div>
        </div>
      </div>
    </div>
  );
};
