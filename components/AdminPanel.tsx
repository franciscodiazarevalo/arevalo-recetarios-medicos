import React, { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';

export const AdminPanel = ({ doctors, onAddDoctor, onUpdateDoctor }: any) => {
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const startEdit = (doc: any) => {
    setEditing(doc.id);
    setFormData(doc);
  };

  const save = () => {
    if (editing) onUpdateDoctor(formData);
    else onAddDoctor(formData);
    setEditing(null);
    setFormData({});
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border h-fit">
          <h3 className="font-bold text-xl mb-6">{editing ? 'Editar Médico' : 'Agregar Nuevo'}</h3>
          <div className="space-y-4">
            <input className="w-full border p-3 rounded-xl" placeholder="Nombre" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} />
            <input className="w-full border p-3 rounded-xl" placeholder="Especialidad" value={formData.specialty || ''} onChange={e=>setFormData({...formData, specialty: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs mb-1">Mín PB</p><input type="number" className="w-full border p-2 rounded" value={formData.min_pb || 0} onChange={e=>setFormData({...formData, min_pb: Number(e.target.value)})} /></div>
              <div><p className="text-xs mb-1">Ideal PB</p><input type="number" className="w-full border p-2 rounded" value={formData.ideal_pb || 0} onChange={e=>setFormData({...formData, ideal_pb: Number(e.target.value)})} /></div>
              <div><p className="text-xs mb-1">Mín Dep</p><input type="number" className="w-full border p-2 rounded" value={formData.min_deposito || 0} onChange={e=>setFormData({...formData, min_deposito: Number(e.target.value)})} /></div>
              <div><p className="text-xs mb-1">Ideal Dep</p><input type="number" className="w-full border p-2 rounded" value={formData.ideal_deposito || 0} onChange={e=>setFormData({...formData, ideal_deposito: Number(e.target.value)})} /></div>
            </div>
            <button onClick={save} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold mt-4">
              {editing ? 'Guardar Cambios' : 'Registrar Médico'}
            </button>
            {editing && <button onClick={()=>setEditing(null)} className="w-full text-gray-500 mt-2">Cancelar</button>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
              <tr>
                <th className="p-4">Médico</th>
                <th className="p-4 text-center">Config PB</th>
                <th className="p-4 text-center">Config DEP</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {doctors.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.specialty}</p>
                  </td>
                  <td className="p-4 text-center text-sm font-mono">{d.min_pb}/{d.ideal_pb}</td>
                  <td className="p-4 text-center text-sm font-mono">{d.min_deposito}/{d.ideal_deposito}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};