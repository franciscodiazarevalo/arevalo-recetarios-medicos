import React from 'react';
import { ShoppingCart, Clock } from 'lucide-react';

export const Orders = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Pedidos y Facturas</h2>
      <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
        <ShoppingCart className="mx-auto text-blue-400 mb-4" size={48} />
        <h3 className="text-lg font-bold text-blue-900">Historial de Pedidos</h3>
        <p className="text-blue-600">Aquí se listarán las órdenes de compra generadas para la imprenta.</p>
        <div className="mt-6 flex justify-center gap-2 text-sm text-blue-400">
          <Clock size={16}/> Próximamente: Sincronización con Facturas PDF
        </div>
      </div>
    </div>
  );
};