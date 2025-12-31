
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Stats = ({ doctors }: any) => {
  // Solo mostramos los 10 con más stock en planta baja para que el gráfico no sea un caos
  const data = doctors
    .slice()
    .sort((a: any, b: any) => (Number(b.stock_pb_actual) || 0) - (Number(a.stock_pb_actual) || 0))
    .slice(0, 10)
    .map((d: any) => ({
      name: d.nombre.split(' ')[0], // Solo primer nombre/apellido
      stock: Number(d.stock_pb_actual) || 0
    }));

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Estadísticas de Uso</h2>
      <p className="text-gray-500 font-medium mb-8 italic">Distribución visual de los recetarios en mostrador (Planta Baja).</p>
      
      <div className="bg-white p-8 rounded-3xl border shadow-sm h-[500px]">
        <div className="mb-6 flex items-center justify-between">
            <h4 className="font-bold text-gray-700">Top 10 Profesionales con Mayor Stock en PB</h4>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Cantidades actuales</span>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12}} 
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            />
            <Bar 
              dataKey="stock" 
              fill="#3b82f6" 
              radius={[8, 8, 0, 0]} 
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
