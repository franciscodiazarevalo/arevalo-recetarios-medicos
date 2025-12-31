
import React, { useState } from 'react';
import { Package, Building2, AlertTriangle, MessageCircle, ShoppingCart, ArrowLeft, Search, ArrowRightLeft, FileText, Printer } from 'lucide-react';

export const Dashboard = ({ doctors, stats, onNavigate, onPrepareDraft, onPrepareOrder }: any) => {
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

  const handleWhatsAppFullList = (type: 'PB' | 'DEP') => {
    const list = type === 'PB' ? faltantesPB : faltantesDep;
    if (list.length === 0) return;
    
    let msg = `*RESUMEN FALTANTES ${type} - CENTRO ARÉVALO*\n\n`;
    list.forEach((d: any) => {
      const stock = type === 'PB' ? d.stock_pb_actual : d.stock_deposito_actual;
      msg += `• ${d.nombre}: ${stock} unidades\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintList = (type: 'pb' | 'deposito') => {
    setListType(type);
    setView('list');
    setTimeout(() => window.print(), 500);
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

  const handleCreateDraftOrder = () => {
    const suggestedOrder = faltantesDep.map((d: any) => {
      const quantityNeeded = Math.max(0, (Number(d.ideal_deposito) || 0) - (Number(d.stock_deposito_actual) || 0));
      return {
        doctorId: d.id,
        nombre: d.nombre,
        quantity: quantityNeeded || 100 // Default to 100 if ideal is not set
      };
    });

    if (suggestedOrder.length === 0) {
      alert("No hay médicos con stock bajo en Depósito.");
      return;
    }

    onPrepareOrder(suggestedOrder);
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
            <button onClick={() => window.print()} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase transition-all hover:bg-gray-200">
              <Printer size={16} /> Imprimir Reporte
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
          <div className="p-10 bg-gray-50 border-b hidden print:block text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter">Centro Médico Arévalo</h1>
            <p className="text-md font-bold text-gray-700 mt-2">REPORTE DE FALTANTES: {listType === 'pb' ? 'PLANTA BAJA (Búsqueda en Depósito)' : 'DEPÓSITO (Pedido a Proveedores)'}</p>
            <p className="text-xs text-gray-500 font-bold mt-1">Fecha: {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b">
              <tr>
                <th className="p-6">Profesional</th>
                <th className="p-6 text-center">Stock Actual</th>
                <th className="p-6 text-center">Mínimo</th>
                <th className="p-6 text-center">Sugerido Reponer</th>
                <th className="p-6 text-right no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((d: any) => {
                const stock = listType === 'pb' ? (d.stock_pb_actual || 0) : (d.stock_deposito_actual || 0);
                const min = listType === 'pb' ? (d.min_pb || 0) : (d.min_deposito || 0);
                const ideal = listType === 'pb' ? (d.ideal_pb || 0) : (d.ideal_deposito || 0);
                const suggest = Math.max(0, ideal - stock);
                const isLow = stock < min;
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-gray-800 uppercase text-xs">{d.nombre}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{d.especialidad}</p>
                    </td>
                    <td className={`p-6 text-center font-black text-lg ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                      {stock}
                    </td>
                    <td className="p-6 text-center font-bold text-gray-400 text-sm">
                      {min}
                    </td>
                    <td className="p-6 text-center font-black text-blue-600 text-lg">
                      {suggest}
                    </td>
                    <td className="p-6 text-right no-print">
                       <button 
                         onClick={() => handleWhatsApp(d, listType === 'pb' ? 'PB' : 'DEP')}
                         className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                         title="Enviar WhatsApp"
                       >
                         <MessageCircle size={18} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-10 border-t bg-gray-50 hidden print:block text-center italic text-[10px] text-gray-400 font-bold">
            Documento generado automáticamente por Arévalo Stock Manager. Uso interno.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 no-print">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="w-1.5 h-5 bg-orange-500 rounded-full"></span> Faltantes PB</h4>
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
          <div className="flex flex-col gap-3 mt-4">
            <button 
                onClick={handleCreateDraftMovements} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
                <ArrowRightLeft size={16}/> Preparar Traslado
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleWhatsAppFullList('PB')}
                className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-all"
              >
                <MessageCircle size={14}/> WhatsApp Lista
              </button>
              <button 
                onClick={() => handlePrintList('pb')}
                className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100 hover:bg-gray-100 transition-all"
              >
                <Printer size={14}/> PDF Lista
              </button>
            </div>
          </div>
        </div>

        {/* FALTANTES DEPOSITO */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="w-1.5 h-5 bg-red-500 rounded-full"></span> Faltantes Depósito</h4>
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
          <div className="flex flex-col gap-3 mt-4">
            <button 
                onClick={handleCreateDraftOrder} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
                <ShoppingCart size={16}/> Generar Órden de Compra
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleWhatsAppFullList('DEP')}
                className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-all"
              >
                <MessageCircle size={14}/> WhatsApp Pedido
              </button>
              <button 
                onClick={() => handlePrintList('deposito')}
                className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100 hover:bg-gray-100 transition-all"
              >
                <Printer size={14}/> PDF Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
