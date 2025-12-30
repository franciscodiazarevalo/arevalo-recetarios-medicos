import React from 'react';
import { Package, Building2, AlertTriangle, FileDown, MessageCircle } from 'lucide-react';

export const Dashboard = ({ doctors = [], stats = {} }: any) => {
  const pbTotal = Number(stats.totalPB || 0);
  const depTotal = Number(stats.totalDep || 0);
  const alertsCount = Number(stats.alerts || 0);

  const faltantesPB = doctors.filter((d: any) => (Number(d.stock_pb) || 0) < (Number(d.min_pb) || 0));
  const faltantesDep = doctors.filter((d: any) => (Number(d.stock_deposito) || 0) < (Number(d.min_deposito) || 0));

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Total en Planta Baja</p><h3 className="text-3xl font-bold text-blue-900">{pbTotal}</h3></div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Package size={28} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Total en Depósito</p><h3 className="text-3xl font-bold text-blue-900">{depTotal}</h3></div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Building2 size={28} /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-medium">Alertas Activas</p><h3 className="text-3xl font-bold text-orange-600">{alertsCount}</h3></div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><AlertTriangle size={28} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faltantes PB */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span className="w-2 h-6 bg-orange-500 rounded-full"></span> Faltantes PB</h4>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FileDown size={20} /></button>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {faltantesPB.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                <span className="font-medium text-gray-700">{d.name}</span>
                <span className="text-orange-700 font-bold px-3 py-1 bg-white rounded-lg shadow-sm">Stock: {d.stock_pb}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"><MessageCircle size={20}/> Pedir vía WhatsApp</button>
        </div>

        {/* Faltantes Depósito */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span className="w-2 h-6 bg-red-500 rounded-full"></span> Faltantes Depósito</h4>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FileDown size={20} /></button>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {faltantesDep.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="font-medium text-gray-700">{d.name}</span>
                <span className="text-red-700 font-bold px-3 py-1 bg-white rounded-lg shadow-sm">Stock: {d.stock_deposito}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">Generar Orden de Compra</button>
        </div>
      </div>
    </div>
  );
};