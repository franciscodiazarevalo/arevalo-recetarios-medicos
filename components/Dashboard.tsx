import React from 'react';
import { Package, Building2, AlertTriangle } from 'lucide-react';

export const Dashboard = ({ doctors = [], stats = {} }: any) => {
  // Aseguramos que los números sean números reales
  const pbTotal = Number(stats.totalPB || stats.totalPlantaBaja || 0);
  const depTotal = Number(stats.totalDep || stats.totalDeposito || 0);
  const alertsCount = Number(stats.alerts || 0);

  const faltantesPB = doctors.filter((d: any) => (Number(d.stock_pb) || 0) < (Number(d.min_pb) || 0));
  const faltantesDep = doctors.filter((d: any) => (Number(d.stock_dep) || 0) < (Number(d.min_deposito) || 5));

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total en Planta Baja</p>
            <h3 className="text-3xl font-bold text-blue-900">{pbTotal}</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Package size={28} /></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total en Depósito</p>
            <h3 className="text-3xl font-bold text-blue-900">{depTotal}</h3>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Building2 size={28} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Alertas Activas</p>
            <h3 className="text-3xl font-bold text-orange-600">{alertsCount}</h3>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><AlertTriangle size={28} /></div>
        </div>
      </div>

      {/* Listas de Faltantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-orange-500 rounded-full"></span> Faltantes PB
          </h4>
          <div className="space-y-3">
            {faltantesPB.length > 0 ? faltantesPB.map((d:any) => (
              <div key={d.id} className="flex justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="font-medium text-gray-700">{d.name}</span>
                <span className="text-orange-700 font-bold">Stock: {d.stock_pb}</span>
              </div>
            )) : <p className="text-gray-400 text-sm italic">Todo abastecido en PB</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-red-500 rounded-full"></span> Faltantes Depósito
          </h4>
          <div className="space-y-3">
            {faltantesDep.length > 0 ? faltantesDep.map((d:any) => (
              <div key={d.id} className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="font-medium text-gray-700">{d.name}</span>
                <span className="text-red-700 font-bold">Stock: {d.stock_dep}</span>
              </div>
            )) : <p className="text-gray-400 text-sm italic">Depósito completo</p>}
          </div>
        </div>
      </div>
    </div>
  );
};