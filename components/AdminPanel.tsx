
import React, { useState } from 'react';
import { Edit2, Plus, Save, X, UserPlus, Download, Upload, DatabaseZap } from 'lucide-react';

export const AdminPanel = ({ doctors, onAddDoctor, onUpdateDoctor, setDoctors }: any) => {
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const startEdit = (doc: any) => {
    setEditing(doc.id);
    setFormData(doc);
  };

  const save = () => {
    if (!formData.nombre) {
      alert("El nombre del profesional es obligatorio");
      return;
    }
    
    if (editing) {
      onUpdateDoctor(formData);
    } else {
      onAddDoctor(formData);
    }
    setEditing(null);
    setFormData({});
  };

  const cancel = () => {
    setEditing(null);
    setFormData({});
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doctors, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_arevalo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            if (confirm("¿Estás seguro? Esto reemplazará todos los datos actuales por los del archivo.")) {
              setDoctors(json);
              alert("Datos importados con éxito. No olvides sincronizar.");
            }
          }
        } catch (err) {
          alert("Error al leer el archivo. Formato inválido.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Administración</h2>
          <p className="text-gray-500 font-medium italic">Gestión técnica y respaldo de base de datos.</p>
        </div>
        
        {/* Botones de Backup */}
        <div className="flex gap-2">
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
           >
             <Download size={16} /> Exportar Backup
           </button>
           <label className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-2xl border border-blue-100 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-blue-100 transition-all">
             <Upload size={16} /> Importar JSON
             <input type="file" accept=".json" className="hidden" onChange={handleImport} />
           </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 sticky top-8">
            <div className="flex items-center gap-3 mb-6 text-blue-600">
              {editing ? <Edit2 size={24} /> : <UserPlus size={24} />}
              <h3 className="font-black text-xl text-gray-800">{editing ? 'Editar Médico' : 'Nuevo Médico'}</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Completo</label>
                <input 
                  className="w-full border-2 border-gray-100 bg-gray-50 p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700 uppercase" 
                  placeholder="EJ: AGUDO SARACHAGA LUIS" 
                  value={formData.nombre || ''} 
                  onChange={e => setFormData({...formData, nombre: e.target.value.toUpperCase()})} 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Especialidad</label>
                <input 
                  className="w-full border-2 border-gray-100 bg-gray-50 p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-700" 
                  placeholder="EJ: OTORRINOLARINGÓLOGO" 
                  value={formData.especialidad || ''} 
                  onChange={e => setFormData({...formData, especialidad: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-orange-500 ml-1">Min Planta Baja</label>
                  <input type="number" className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl font-black text-center" value={formData.min_pb || 0} onChange={e => setFormData({...formData, min_pb: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-blue-500 ml-1">Ideal Planta Baja</label>
                  <input type="number" className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl font-black text-center" value={formData.ideal_pb || 0} onChange={e => setFormData({...formData, ideal_pb: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-red-500 ml-1">Min Depósito</label>
                  <input type="number" className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl font-black text-center" value={formData.min_deposito || 0} onChange={e => setFormData({...formData, min_deposito: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-indigo-500 ml-1">Ideal Depósito</label>
                  <input type="number" className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl font-black text-center" value={formData.ideal_deposito || 0} onChange={e => setFormData({...formData, ideal_deposito: Number(e.target.value)})} />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button onClick={save} className="w-full bg-slate-900 hover:bg-blue-600 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Save size={18} /> {editing ? 'Guardar Cambios' : 'Registrar Profesional'}
                </button>
                {editing && (
                  <button onClick={cancel} className="w-full text-gray-400 font-bold text-xs uppercase py-2 hover:text-gray-600">
                    Cancelar Edición
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-gray-100">
             <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                <DatabaseZap size={18} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Listado Maestro de Profesionales</span>
             </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50/30 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Profesional</th>
                  <th className="px-6 py-4 text-center">Metas PB</th>
                  <th className="px-6 py-4 text-center">Metas DEP</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((d: any) => (
                  <tr key={d.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-gray-800 uppercase text-sm leading-tight">{d.nombre}</p>
                      <p className="text-[11px] text-gray-400 font-bold">{d.especialidad}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black">
                        {d.min_pb} / {d.ideal_pb}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black">
                        {d.min_deposito} / {d.ideal_deposito}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => startEdit(d)} 
                        className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
