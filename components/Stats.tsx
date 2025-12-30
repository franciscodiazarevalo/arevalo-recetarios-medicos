import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Stats = ({ doctors }: any) => {
  const data = doctors.slice(0, 10).map((d: any) => ({
    name: d.name.split(' ')[0],
    stock: d.stock_pb
  }));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Estadísticas de Uso</h2>
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-[400px]">
        <p className="mb-4 text-gray-500">Top 10 médicos con más stock en Planta Baja</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};