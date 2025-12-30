import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';

export const Distribution = ({ doctors }: any) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter((d: any) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Entregar a Médico (Planta Baja)</h2>
        <p className="text-gray-500">Registre la entrega de recetarios de forma inmediata.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar médico por nombre o especialidad..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredDoctors.map((doc: any) => (
          <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-800">{doc.name}</h4>
              <p className="text-sm text-gray-500">{doc.specialty}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-bold">Stock PB</p>
                <p className={`text-lg font-bold ${doc.stock_pb > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {doc.stock_pb > 0 ? `${doc.stock_pb} unidades` : 'Agotado'}
                </p>
              </div>
              <button 
                disabled={doc.stock_pb <= 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold disabled:bg-gray-200 disabled:text-gray-400 transition-all"
              >
                Entregar 1
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};