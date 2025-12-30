import React from 'react';
import { Package, Building2, AlertTriangle, FileDown, MessageCircle, ShoppingCart } from 'lucide-react';

export const Dashboard = ({ doctors, stats, onNavigate }: any) => {
  const faltantesPB = doctors.filter((d: any) => d.stock_pb < d.min_pb);
  const faltantesDep = doctors.filter((d: any) => d.stock_deposito < d.min_deposito);

  const printReport = () => {
    window.print();
  };

  const sendWhatsApp = (title: string, list: any[]) => {
    const text = `*${title}*\n\n` + list.map(d => `- ${d.name} (Stock: ${d.stock_pb || d.stock_deposito})`).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-8 space-y-8">
      {/* Botones de Totales con Navegación Corregida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <button onClick={() => onNavigate('distribution')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between text-left group">
          <div><p className="text-sm text-gray-500 font-medium">Stock Planta Baja</p><h3 className="text-3xl font-bold text-blue-900 group-hover:scale-105 transition-transform">{stats.totalPB}</h3></div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Package size={28} /></div>
        </button>
        <button onClick={() => onNavigate('movements')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between text-left group">
          <div><p className="text-sm text-gray-500 font-medium">Stock Depósito</p><h3 className="text-3xl font-bold text-blue-900 group-hover:scale-105 transition-transform">{stats.totalDep}</h3></div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Building2 size={28} /></div>
        </button>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Alertas Stock</p><h3 className="text-3xl font-bold text-orange-600">{stats.alerts}</h3></div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><AlertTriangle size={28} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Faltantes PB */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2"><span className="w-2 h-6 bg-orange-500 rounded-full"></span> Faltantes PB</h4>
            <button onClick={printReport} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg no-print"><FileDown size={20}/></button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {faltantesPB.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                <span className="font-medium text-gray-700">{d.name}</span>
                <span className="text-orange-700 font-bold px-3 py-1 bg-white rounded-lg">Stock: {d.stock_pb}</span>
              </div>
            ))}
          </div>
          <button onClick={() => sendWhatsApp("PEDIDO REPOSICIÓN PB", faltantesPB)} className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 no-print"><MessageCircle size={20}/> Solicitar Reposición</button>
        </div>

        {/* Faltantes Depósito */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2"><span className="w-2 h-6 bg-red-500 rounded-full"></span> Faltantes Depósito</h4>
            <button onClick={printReport} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg no-print"><FileDown size={20}/></button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {faltantesDep.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="font-medium text-gray-700">{d.name}</span>
                <span className="text-red-700 font-bold px-3 py-1 bg-white rounded-lg">Stock: {d.stock_deposito}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4 no-print">
            <button onClick={() => sendWhatsApp("PEDIDO IMPRENTA", faltantesDep)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><MessageCircle size={20}/> Imprenta</button>
            <button onClick={() => onNavigate('orders')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><ShoppingCart size={20}/> Orden Compra</button>
          </div>
        </div>
      </div>
    </div>
  );
};