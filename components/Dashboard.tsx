import React from 'react';
import { Package, Building2, AlertTriangle, FileDown, MessageCircle, ShoppingCart } from 'lucide-react';

export const Dashboard = ({ doctors, stats, onNavigate }: any) => {
  const faltantesPB = doctors.filter((d: any) => d.stock_pb < d.min_pb);
  const faltantesDep = doctors.filter((d: any) => d.stock_deposito < d.min_deposito);

  const sendWhatsApp = (msg: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => onNavigate('distribution')} className="bg-white p-6 rounded-2xl shadow-sm border hover:border-blue-500 transition-all flex items-center justify-between text-left">
          <div><p className="text-sm text-gray-500">Total Planta Baja</p><h3 className="text-3xl font-bold">{stats.totalPB}</h3></div>
          <Package className="text-blue-500" size={32} />
        </button>
        <button onClick={() => onNavigate('admin')} className="bg-white p-6 rounded-2xl shadow-sm border hover:border-blue-500 transition-all flex items-center justify-between text-left">
          <div><p className="text-sm text-gray-500">Total Depósito</p><h3 className="text-3xl font-bold">{stats.totalDep}</h3></div>
          <Building2 className="text-indigo-500" size={32} />
        </button>
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Alertas</p><h3 className="text-3xl font-bold text-orange-600">{stats.alerts}</h3></div>
          <AlertTriangle className="text-orange-500" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow border">
          <div className="flex justify-between mb-4">
            <h4 className="font-bold text-lg text-orange-700">Faltantes PB</h4>
            <button onClick={() => window.print()} className="text-blue-600"><FileDown /></button>
          </div>
          <div className="space-y-2 mb-4">
            {faltantesPB.map((d: any) => (
              <div key={d.id} className="flex justify-between p-2 bg-orange-50 rounded">
                <span>{d.name}</span><span className="font-bold">Stock: {d.stock_pb}</span>
              </div>
            ))}
          </div>
          <button onClick={() => sendWhatsApp(`Pedido Stock PB: ${faltantesPB.map(d=>d.name).join(', ')}`)} className="w-full bg-green-500 text-white p-3 rounded-xl font-bold flex gap-2 justify-center"><MessageCircle/> Pedir por WhatsApp</button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border">
          <div className="flex justify-between mb-4">
            <h4 className="font-bold text-lg text-red-700">Faltantes Depósito</h4>
            <button onClick={() => window.print()} className="text-blue-600"><FileDown /></button>
          </div>
          <div className="space-y-2 mb-4">
            {faltantesDep.map((d: any) => (
              <div key={d.id} className="flex justify-between p-2 bg-red-50 rounded">
                <span>{d.name}</span><span className="font-bold">Stock: {d.stock_deposito}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => sendWhatsApp(`Pedido Imprenta: ${faltantesDep.map(d=>d.name).join(', ')}`)} className="flex-1 bg-green-600 text-white p-3 rounded-xl font-bold flex gap-2 justify-center"><MessageCircle/> Imprenta</button>
            <button className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold flex gap-2 justify-center"><ShoppingCart/> Orden Compra</button>
          </div>
        </div>
      </div>
    </div>
  );
};