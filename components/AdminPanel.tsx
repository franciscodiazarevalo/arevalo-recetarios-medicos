
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Stethoscope, Users, Settings, Edit3, X, Save, Search } from 'lucide-react';
import { Doctor } from '../types';

interface AdminPanelProps {
  doctors: Doctor[];
  onAddDoctor: (name: string, specialty: string, idealPB: number, minPB: number, idealWh: number, minWh: number) => void;
  onUpdateDoctor: (id: string, data: Partial<Doctor>) => void;
  onDeleteDoctor: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ doctors, onAddDoctor, onUpdateDoctor, onDeleteDoctor }) => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'users'>('doctors');
  
  // State for Search
  const [searchTerm, setSearchTerm] = useState('');

  // State for Edit Mode
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [idealStockPB, setIdealStockPB] = useState(5);
  const [minStockPB, setMinStockPB] = useState(2);
  const [idealStockWarehouse, setIdealStockWarehouse] = useState(150);
  const [minStockWarehouse, setMinStockWarehouse] = useState(10);

  // User Mock State
  const [users, setUsers] = useState(['Maria (Secretaria)', 'Juan (Secretaria)', 'Lucia (Admin)']);
  const [newUser, setNewUser] = useState('');

  // Filtering Logic
  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setName(doc.name);
    setSpecialty(doc.specialty);
    setIdealStockPB(doc.idealStockPB);
    setMinStockPB(doc.minStockPB);
    setIdealStockWarehouse(doc.idealStockWarehouse);
    setMinStockWarehouse(doc.minStockWarehouse);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingDoctorId(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSpecialty('');
    setIdealStockPB(5);
    setMinStockPB(2);
    setIdealStockWarehouse(150);
    setMinStockWarehouse(10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) return;

    if (editingDoctorId) {
      onUpdateDoctor(editingDoctorId, {
        name: name.toUpperCase(),
        specialty,
        idealStockPB,
        minStockPB,
        idealStockWarehouse,
        minStockWarehouse
      });
      setEditingDoctorId(null);
    } else {
      onAddDoctor(name.toUpperCase(), specialty, idealStockPB, minStockPB, idealStockWarehouse, minStockWarehouse);
    }
    resetForm();
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser) {
      setUsers([...users, newUser]);
      setNewUser('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Administración</h2>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'doctors' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Médicos ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'users' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Usuarios Autorizados
        </button>
      </div>

      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl shadow-sm border transition-all sticky top-6 ${editingDoctorId ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {editingDoctorId ? (
                    <><Edit3 size={20} className="text-amber-600" /> Editar Médico</>
                  ) : (
                    <><Plus size={20} className="text-blue-600" /> Agregar Nuevo</>
                  )}
                </h3>
                {editingDoctorId && (
                    <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Ej. JUAN PEREZ"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Ej. Cardiología"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Settings size={14} />
                        Configuración de Stock
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                             <label className="block text-xs font-medium text-gray-600 mb-1">Ideal en PB</label>
                             <input 
                                type="number" 
                                min="1"
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm bg-white"
                                value={idealStockPB}
                                onChange={(e) => setIdealStockPB(parseInt(e.target.value) || 0)}
                             />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-medium text-gray-600 mb-1">Mínimo PB</label>
                             <input 
                                type="number" 
                                min="0"
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm bg-white"
                                value={minStockPB}
                                onChange={(e) => setMinStockPB(parseInt(e.target.value) || 0)}
                             />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-medium text-gray-600 mb-1">Ideal Depósito</label>
                             <input 
                                type="number" 
                                min="1"
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm bg-white font-bold"
                                value={idealStockWarehouse}
                                onChange={(e) => setIdealStockWarehouse(parseInt(e.target.value) || 0)}
                             />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-medium text-gray-600 mb-1">Mínimo Depósito</label>
                             <input 
                                type="number" 
                                min="0"
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm bg-white"
                                value={minStockWarehouse}
                                onChange={(e) => setMinStockWarehouse(parseInt(e.target.value) || 0)}
                             />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {editingDoctorId && (
                        <button
                            type="button"
                            onClick={cancelEditing}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                            editingDoctorId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {editingDoctorId ? <><Save size={16}/> Actualizar</> : 'Guardar Médico'}
                    </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Search Filter for Table */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Filtrar médicos por nombre o especialidad..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre / Especialidad</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Config PB (Min/Ideal)</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Config Depósito (Min/Ideal)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.slice().reverse().map((doc) => (
                      <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${editingDoctorId === doc.id ? 'bg-amber-50/50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <Stethoscope size={18} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{doc.name}</div>
                              <div className="text-xs text-gray-500">{doc.specialty}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                            {doc.minStockPB} / <span className="text-blue-600">{doc.idealStockPB}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                            {doc.minStockWarehouse} / <span className="font-bold text-gray-800">{doc.idealStockWarehouse}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => startEditing(doc)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Editar médico"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    onClick={() => onDeleteDoctor(doc.id)}
                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                                    title="Eliminar médico"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                {searchTerm ? 'No hay resultados para la búsqueda.' : 'No hay médicos registrados.'}
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-green-600" />
                Agregar Usuario
              </h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre (Secretaria/o)</label>
                  <input
                    type="text"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="Ej. Ana Gomez"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                >
                  Registrar Usuario
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {users.map((user, idx) => (
                  <li key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                       <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                         <Users size={20} />
                       </div>
                       <p className="ml-4 text-sm font-medium text-gray-900">{user}</p>
                    </div>
                    <button className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
