
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
// Added Landmark to the import list
import { DollarSign, TrendingUp, History, Package, Landmark } from 'lucide-react';

export const Stats = ({ doctors }: any) => {
  // Datos para stock
  const stockData = doctors
    .slice()
    .sort((a: any, b: any) => (Number(b.stock_pb_actual) || 0) - (Number(a.stock_pb_actual) || 0))
    .slice(0, 10)
    .map((d: any) => ({
      name: d.nombre.split(' ')[0],
      stock: Number(d.stock_pb_actual) || 0
    }));

  // Simulación de datos históricos de precios (basado en lo que el sistema guarda en localStorage)
  const savedOrders = JSON.parse(localStorage.getItem('arevalo_orders_history') || '[]');
  const priceHistory = savedOrders
    .filter((o: any) => o.status === 'completed' && o.unitPrice)
    .sort((a: any, b: any) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime())
    .map((o: any) => ({
      date: o.receivedDate,
      price: o.unitPrice,
      supplier: o.supplier
    }));

  const lastPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : 0;
  const avgPrice = priceHistory.length > 0 ? priceHistory.reduce((acc:any, curr:any) => acc + curr.price, 0) / priceHistory.length : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 space-y-10">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Análisis y Estadísticas</h2>
        <p className="text-gray-500 font-medium italic">Monitoreo de inventario y auditoría de costos de producción.</p>
      </div>

      {/* Tarjetas de Resumen de Costos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-2xl shadow-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Último Costo Unitario</p>
                <h3 className="text-4xl font-black">${lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
              <DollarSign size={48} className="opacity-20" />
          </div>
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Precio Promedio Histórico</p>
                <h3 className="text-4xl font-black">${avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
              <TrendingUp size={48} className="opacity-20" />
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Médicos Activos</p>
                <h3 className="text-4xl font-black text-slate-800">{doctors.length}</h3>
              </div>
              <Package size={48} className="text-blue-100" />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Precios */}
        <div className="bg-white p-8 rounded-[40px] border shadow-sm h-[450px]">
          <div className="mb-8 flex items-center justify-between">
              <h4 className="font-black text-gray-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <History size={18} className="text-emerald-500"/> Histórico de Precios de Compra
              </h4>
          </div>
          
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={priceHistory.length > 0 ? priceHistory : [{date: 'N/A', price: 0}]}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.1)'}}
                labelStyle={{fontWeight: 'black', marginBottom: '4px'}}
              />
              <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Stock */}
        <div className="bg-white p-8 rounded-[40px] border shadow-sm h-[450px]">
          <div className="mb-8 flex items-center justify-between">
              <h4 className="font-black text-gray-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <Package size={18} className="text-blue-500"/> Top 10 Disponibilidad en PB
              </h4>
          </div>
          
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="stock" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Detalle Histórico de Precios */}
      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
          <div className="p-8 border-b bg-gray-50/50 flex items-center gap-3">
              <Landmark size={20} className="text-gray-400" />
              <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">Desglose de Facturas Recibidas</h3>
          </div>
          <table className="w-full text-left">
              <thead className="bg-gray-50/30 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
                  <tr>
                      <th className="px-8 py-4">Fecha Recibido</th>
                      <th className="px-8 py-4">Proveedor</th>
                      <th className="px-8 py-4">Nº Factura</th>
                      <th className="px-8 py-4 text-center">Total Monto</th>
                      <th className="px-8 py-4 text-right">Precio Unitario</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                  {priceHistory.slice().reverse().map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-5 text-xs font-bold text-gray-500">{item.date}</td>
                          <td className="px-8 py-5 text-xs font-black text-gray-800 uppercase">{item.supplier}</td>
                          <td className="px-8 py-5 text-xs font-bold text-blue-600">{savedOrders.find((o:any)=>o.receivedDate === item.date)?.invoice}</td>
                          <td className="px-8 py-5 text-xs font-black text-center">${(item.price * savedOrders.find((o:any)=>o.receivedDate === item.date)?.items.reduce((a:any,b:any)=>a+b.quantity, 0)).toLocaleString()}</td>
                          <td className="px-8 py-5 text-right">
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-black text-xs">
                                  ${item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </span>
                          </td>
                      </tr>
                  ))}
                  {priceHistory.length === 0 && (
                      <tr>
                          <td colSpan={5} className="py-20 text-center text-gray-400 font-black text-[10px] uppercase tracking-widest">Sin datos históricos disponibles</td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};
