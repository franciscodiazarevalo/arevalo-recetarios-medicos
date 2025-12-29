
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Table as TableIcon,
  Calendar,
  Filter,
  Users,
  Stethoscope,
  ChevronDown,
  Search,
  Download,
  Clock,
  UserCheck
} from 'lucide-react';
import { MovementLog, Doctor } from '../types';

// Helper Component: Searchable Dropdown
interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  label: string; 
  placeholder: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentLabel = value === 'all' 
    ? label 
    : options.find(o => o.value === value)?.label || value;

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-w-[200px]">
        <div 
            onClick={() => { setIsOpen(!isOpen); setSearchTerm(''); }}
            className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm cursor-pointer flex justify-between items-center hover:border-blue-400 transition-colors"
        >
            <span className={`truncate mr-2 ${value === 'all' ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                {currentLabel}
            </span>
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        </div>

        {isOpen && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-2 text-gray-400"/>
                            <input 
                                autoFocus
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none"
                                placeholder={placeholder}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-b italic" onClick={() => { onChange('all'); setIsOpen(false); }}>{label}</div>
                        {filteredOptions.map(opt => (
                            <div key={opt.value} className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-transparent ${value === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`} onClick={() => { onChange(opt.value); setIsOpen(false); }}>
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

interface StatsProps {
  logs: MovementLog[];
  doctors: Doctor[];
}

export const Stats: React.FC<StatsProps> = ({ logs, doctors }) => {
  // Estados de Filtros
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  
  // Estados de Filtro de Fecha
  const [filterType, setFilterType] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Derivar Opciones Únicas
  const specialties = useMemo(() => Array.from(new Set(doctors.map(d => d.specialty))).sort(), [doctors]);
  const allUsersFromLogs = useMemo(() => Array.from(new Set(logs.map(l => l.user))).sort(), [logs]);
  const availableDoctors = useMemo(() => selectedSpecialty === 'all' ? doctors : doctors.filter(d => d.specialty === selectedSpecialty), [doctors, selectedSpecialty]);

  const specialtyOptions = useMemo(() => specialties.map(s => ({ value: s, label: s })), [specialties]);
  const doctorOptions = useMemo(() => availableDoctors.map(d => ({ value: d.id, label: d.name })), [availableDoctors]);
  const userOptions = useMemo(() => allUsersFromLogs.map(u => ({ value: u, label: u })), [allUsersFromLogs]);

  // Lógica principal de filtrado
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Solo distribuciones (Entregas)
      if (log.type !== 'DISTRIBUTE_TO_DOCTOR') return false;

      // Filtro de Usuario
      if (selectedUser !== 'all' && log.user !== selectedUser) return false;

      // Filtro de Médico
      if (selectedDoctorId !== 'all') {
          const doc = doctors.find(d => d.id === selectedDoctorId);
          if (doc && !log.details.includes(doc.name)) return false;
      }
      
      // Filtro de Especialidad
      if (selectedSpecialty !== 'all' && selectedDoctorId === 'all') {
         const docInLog = doctors.find(d => log.details.includes(d.name));
         if (!docInLog || docInLog.specialty !== selectedSpecialty) return false;
      }

      // Filtros de Fecha
      const logDate = new Date(log.date);
      if (filterType === 'day') {
          if (log.date.split('T')[0] !== selectedDate) return false;
      } else if (filterType === 'week') {
          // Lógica simplificada de semana: últimos 7 días desde la fecha seleccionada o actual
          const weekStart = new Date(selectedDate);
          weekStart.setDate(weekStart.getDate() - 7);
          const currentLogDate = new Date(log.date);
          if (currentLogDate < weekStart || currentLogDate > new Date(selectedDate + 'T23:59:59')) return false;
      } else if (filterType === 'month') {
          if (logDate.getMonth() + 1 !== selectedMonth || logDate.getFullYear() !== selectedYear) return false;
      } else if (filterType === 'year') {
          if (logDate.getFullYear() !== selectedYear) return false;
      }
      
      return true;
    });
  }, [logs, selectedUser, selectedDoctorId, selectedSpecialty, filterType, selectedDate, selectedMonth, selectedYear, doctors]);

  // Datos Agregados para Gráficos
  const doctorConsumptionSummary = useMemo(() => {
      const summary: Record<string, { name: string, specialty: string, total: number }> = {};
      
      filteredLogs.forEach(log => {
          const doc = doctors.find(d => log.details.includes(d.name));
          if (doc) {
              if (!summary[doc.id]) {
                  summary[doc.id] = { name: doc.name, specialty: doc.specialty, total: 0 };
              }
              summary[doc.id].total += log.quantity;
          }
      });

      return Object.values(summary).sort((a,b) => b.total - a.total);
  }, [filteredLogs, doctors]);

  const top10Usage = doctorConsumptionSummary.slice(0, 10).map(s => ({ name: s.name, quantity: s.total }));

  const userActivity = useMemo(() => {
      const activity: Record<string, number> = {};
      filteredLogs.forEach(log => {
        activity[log.user] = (activity[log.user] || 0) + log.quantity;
      });
      return Object.keys(activity).map(user => ({ name: user, value: activity[user] }));
  }, [filteredLogs]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Sección de Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 font-bold text-gray-800 mb-6 border-b pb-4">
            <Filter size={20} className="text-blue-600"/> Filtros del Reporte
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Filtros de Perfil */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Especialidad</label>
                <SearchableSelect label="Todas las Esp." placeholder="Buscar esp..." options={specialtyOptions} value={selectedSpecialty} onChange={val => { setSelectedSpecialty(val); setSelectedDoctorId('all'); }} />
            </div>

            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Médico</label>
                <SearchableSelect label="Todos los Médicos" placeholder="Buscar médico..." options={doctorOptions} value={selectedDoctorId} onChange={setSelectedDoctorId} />
            </div>

            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Personal de Entrega</label>
                <SearchableSelect label="Todos los Usuarios" placeholder="Buscar usuario..." options={userOptions} value={selectedUser} onChange={setSelectedUser} />
            </div>

            {/* Filtros de Fecha */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Período de Tiempo</label>
                <div className="flex flex-col gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-md overflow-x-auto no-scrollbar">
                        {(['all', 'day', 'week', 'month', 'year'] as const).map(type => (
                            <button key={type} onClick={() => setFilterType(type)} className={`flex-1 min-w-[50px] py-1 text-[10px] font-bold rounded capitalize transition-all ${filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                                {type === 'all' ? 'Todo' : type === 'day' ? 'Día' : type === 'week' ? 'Sem.' : type === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>

                    {(filterType === 'day' || filterType === 'week') && (
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full text-sm border rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none" />
                    )}
                    
                    {filterType === 'month' && (
                        <div className="flex gap-1">
                            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="flex-1 text-sm border rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none">
                                {Array.from({length: 12}).map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('es', {month: 'long'})}</option>)}
                            </select>
                            <input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-20 text-sm border rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                    )}

                    {filterType === 'year' && (
                        <input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full text-sm border rounded p-1.5 focus:ring-1 focus:ring-blue-500 outline-none" />
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Stethoscope size={20} className="text-blue-500"/> Top 10 Consumo</h3>
          {top10Usage.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10Usage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          ) : <div className="h-72 flex items-center justify-center text-gray-400 italic">No hay datos</div>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-green-500"/> Distribución por Usuario</h3>
          {userActivity.length > 0 ? (
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={userActivity} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                            {userActivity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={10} wrapperStyle={{fontSize: 12}} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
           ) : <div className="h-72 flex items-center justify-center text-gray-400 italic">No hay datos</div>}
        </div>
      </div>

      {/* Tabla Detallada de Consumo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TableIcon size={18} className="text-blue-500" />
                Detalle de Entregas por Médico y Usuario
            </h3>
            <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 bg-white border px-3 py-1.5 rounded transition-all">
                <Download size={14} /> Exportar Reporte
            </button>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregado Por</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cant.</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, idx) => {
                            const doctorName = log.details;
                            const doc = doctors.find(d => doctorName.includes(d.name));
                            return (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{doctorName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc?.specialty || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex items-center gap-1">
                                            {/* Fix: Added UserCheck to lucide-react imports */}
                                            <UserCheck size={14} className="text-green-500" />
                                            {log.user}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                            {log.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500 font-medium">
                                        <div className="flex flex-col items-end">
                                            <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(log.date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 opacity-60"><Clock size={10}/> {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No hay registros de entregas para este período y selección.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <p className="text-xs text-gray-500 font-medium">Mostrando {filteredLogs.length} registros</p>
            <div className="text-sm font-bold text-gray-800">
                Total del período: <span className="text-blue-600 text-lg">{filteredLogs.reduce((a,b) => a + b.quantity, 0)}</span>
            </div>
        </div>
      </div>

    </div>
  );
};
