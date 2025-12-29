
import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Package, 
  ArrowRightLeft, 
  TrendingDown, 
  UserCheck,
  Building,
  Printer,
  MessageCircle,
  ArrowLeft,
  Search,
  List,
  CheckCircle2,
  FileEdit,
  Calendar,
  Download,
  Stethoscope
} from 'lucide-react';
import { MovementLog, Doctor, InvoiceItem } from '../types';

interface DashboardProps {
  recentLogs: MovementLog[];
  doctors: Doctor[];
  onNavigate: (page: string) => void;
  onInitiateTransfer?: (items: {doctorId: string, quantity: number}[]) => void;
  onInitiateOrder?: (items: InvoiceItem[]) => void;
  userName?: string;
}

type DashboardView = 'overview' | 'list';
type ListFilter = 'all_pb' | 'all_warehouse' | 'alerts';

const LOG_TYPE_LABELS: Record<string, string> = {
  'PURCHASE': 'Ingreso de Stock (Compra)',
  'TRANSFER_TO_PB': 'Reposición Interna (PB)',
  'DISTRIBUTE_TO_DOCTOR': 'Entrega a Médico',
  'ORDER_CREATED': 'Orden Generada'
};

export const Dashboard: React.FC<DashboardProps> = ({ recentLogs, doctors, onNavigate, onInitiateTransfer, onInitiateOrder, userName = "Administración" }) => {
  const [view, setView] = useState<DashboardView>('overview');
  const [activeFilter, setActiveFilter] = useState<ListFilter>('all_pb');
  const [searchTerm, setSearchTerm] = useState('');

  const totalPB = doctors.reduce((acc, doc) => acc + doc.padsInPB, 0);
  const totalWarehouse = doctors.reduce((acc, doc) => acc + doc.padsInWarehouse, 0);

  const doctorsLowInPB = doctors.filter(d => d.padsInPB <= d.minStockPB);
  const doctorsLowInWarehouse = doctors.filter(d => d.padsInWarehouse <= d.minStockWarehouse);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayDeliveries = useMemo(() => {
    return recentLogs.filter(log => 
      log.type === 'DISTRIBUTE_TO_DOCTOR' && 
      log.date.startsWith(todayDate)
    );
  }, [recentLogs, todayDate]);

  const totalDeliveredToday = todayDeliveries.reduce((acc, curr) => acc + curr.quantity, 0);

  // FUNCIÓN PARA GENERAR DOCUMENTO FORMAL (PDF)
  const handleDownloadPDF = (title: string, data: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const rows = data.map(item => {
      const name = item.name || item.details || 'N/A';
      const qty = item.padsInWarehouse !== undefined ? 100 : (item.quantity || 0);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${name.toUpperCase()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">UNIDADES</td>
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-text { font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1; }
            .logo-accent { color: #2563eb; }
            .doc-info { text-align: right; font-size: 12px; color: #64748b; }
            h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f8fafc; text-align: left; padding: 12px; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            .signature { margin-top: 80px; width: 200px; border-top: 1px solid #000; text-align: center; font-size: 12px; padding-top: 5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-text">CENTRO MÉDICO<br/><span class="logo-accent">ARÉVALO</span></div>
            <div class="doc-info">
              <div><strong>FECHA:</strong> ${dateStr}</div>
              <div><strong>ID OPERACIÓN:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
              <div><strong>SOLICITANTE:</strong> ${userName}</div>
            </div>
          </div>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
                <th>Descripción / Médico</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: center;">Tipo</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="signature">Firma y Sello Responsable</div>
          <div class="footer">
            <div>Documento generado por Sistema de Control de Stock CM Arévalo</div>
            <div>Página 1 de 1</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleWhatsAppOrder = () => {
    if (doctorsLowInWarehouse.length === 0) return;
    const header = "Hola! Necesito realizar un pedido de recetarios para Centro Médico Arévalo:%0A%0A";
    const list = doctorsLowInWarehouse.map(d => `- ${d.name} (100 un.)`).join('%0A');
    const footer = "%0A%0AMuchas gracias.";
    const fullMessage = `${header}${list}${footer}`;
    window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
  };

  const handleCreateSystemOrder = () => {
    if (doctorsLowInWarehouse.length === 0 || !onInitiateOrder) return;
    const items: InvoiceItem[] = doctorsLowInWarehouse.map(d => {
        const currentStock = Number(d.padsInWarehouse) || 0;
        const targetTotal = Number(d.idealStockWarehouse) || 0;
        let deficit = targetTotal - currentStock;
        const quantityToOrder = Math.max(0, deficit);
        return { doctorId: d.id, quantity: quantityToOrder };
    }).filter(item => item.quantity > 0);
    
    if (items.length > 0) {
        onInitiateOrder(items);
    } else {
        alert("El cálculo de reposición resultó en 0 unidades.");
    }
  };

  const handleWhatsAppInternalRequest = () => {
    if (doctorsLowInPB.length === 0) return;
    const header = "⚠️ *Alerta de Stock en PB* - Por favor bajar del depósito:%0A%0A";
    const list = doctorsLowInPB.map(d => `- ${d.name} (Faltan: ${Math.max(0, d.idealStockPB - d.padsInPB)})`).join('%0A');
    const fullMessage = `${header}${list}`;
    window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
  };

  const handleQuickRestockAllPB = () => {
    if(!onInitiateTransfer) return;
    const transfers = doctorsLowInPB
        .map(doc => {
            const needed = Math.max(0, doc.idealStockPB - doc.padsInPB);
            const quantity = Math.min(needed, doc.padsInWarehouse);
            return { doctorId: doc.id, quantity };
        })
        .filter(t => t.quantity > 0);

    if (transfers.length === 0) {
        alert("No hay stock suficiente en depósito.");
        return;
    }
    onInitiateTransfer(transfers);
  };

  const goToDetail = (filter: ListFilter) => {
    setActiveFilter(filter);
    setView('list');
    setSearchTerm('');
  };

  if (view === 'list') {
    let displayedDoctors = doctors;
    if (activeFilter === 'alerts') {
      displayedDoctors = doctors.filter(d => d.padsInPB <= d.minStockPB || d.padsInWarehouse <= d.minStockWarehouse);
    } else if (activeFilter === 'all_pb') {
      displayedDoctors = [...doctors].sort((a,b) => a.padsInPB - b.padsInPB); 
    } else {
      displayedDoctors = [...doctors].sort((a,b) => a.padsInWarehouse - b.padsInWarehouse);
    }

    if (searchTerm) {
      displayedDoctors = displayedDoctors.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('overview')} className="flex items-center text-gray-600 hover:text-blue-600 font-medium">
            <ArrowLeft size={20} className="mr-2" /> Volver
          </button>
          <div className="relative">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médico</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">PB</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Depósito</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {displayedDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-gray-900">{doc.name}</div></td>
                    <td className="px-6 py-4 text-center font-bold">{doc.padsInPB}</td>
                    <td className="px-6 py-4 text-center font-bold">{doc.padsInWarehouse}</td>
                    <td className="px-6 py-4 text-right">
                      {(doc.padsInPB <= doc.minStockPB || doc.padsInWarehouse <= doc.minStockWarehouse) ? <span className="text-red-600 font-bold">ALERTA</span> : <span className="text-green-600">OK</span>}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => goToDetail('all_pb')} className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer hover:shadow-md transition-all group border-blue-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Total en Planta Baja</p>
            <h3 className="text-3xl font-bold mt-2 text-blue-900">{totalPB}</h3>
          </div>
          <div className="p-4 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><Package size={28} /></div>
        </div>
        <div onClick={() => goToDetail('all_warehouse')} className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer hover:shadow-md transition-all group border-indigo-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Total en Depósito</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-900">{totalWarehouse}</h3>
          </div>
          <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform"><Building size={28} /></div>
        </div>
        <div onClick={() => goToDetail('alerts')} className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer hover:shadow-md transition-all group border-orange-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Alertas Activas</p>
            <h3 className={`text-3xl font-bold ${doctorsLowInPB.length + doctorsLowInWarehouse.length > 0 ? 'text-orange-500' : 'text-green-600'}`}>{doctorsLowInPB.length + doctorsLowInWarehouse.length}</h3>
          </div>
          <div className="p-4 rounded-full bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform"><AlertTriangle size={28} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: Faltantes PB */}
        <div className={`rounded-xl border p-4 flex flex-col h-[290px] ${doctorsLowInPB.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
           <div className="flex-1 overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-3">
                <h4 className={`font-bold flex items-center gap-2 ${doctorsLowInPB.length > 0 ? 'text-orange-800' : 'text-gray-700'}`}>
                  <AlertTriangle size={18} /> Faltantes PB
                </h4>
                <button 
                  onClick={() => handleDownloadPDF('Reporte de Reposición PB', doctorsLowInPB)}
                  className="p-1.5 hover:bg-orange-100 rounded text-orange-600 transition-colors"
                  title="Descargar reporte PDF"
                >
                  <Download size={16} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
                 {doctorsLowInPB.length > 0 ? doctorsLowInPB.map(doc => (
                   <div key={doc.id} className="flex justify-between items-center bg-white/80 p-2 rounded shadow-sm text-xs border border-orange-100">
                     <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                     <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Stock: {doc.padsInPB}</span>
                   </div>
                 )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle2 size={32} className="opacity-20 mb-2" />
                        <p className="text-[10px] italic">Stock completo en PB</p>
                    </div>
                 )}
             </div>
           </div>
           {doctorsLowInPB.length > 0 && (
             <div className="mt-3 pt-3 border-t border-orange-200 grid grid-cols-2 gap-2">
                <button onClick={handleWhatsAppInternalRequest} className="bg-green-100 text-green-700 py-1.5 rounded text-[10px] font-bold hover:bg-green-200 transition-colors">WhatsApp</button>
                <button onClick={handleQuickRestockAllPB} className="bg-orange-600 text-white py-1.5 rounded text-[10px] font-bold hover:bg-orange-700 transition-colors">Reponer Todo</button>
             </div>
           )}
        </div>

        {/* COLUMNA 2: Faltantes Depósito */}
        <div className={`rounded-xl border p-4 flex flex-col h-[290px] ${doctorsLowInWarehouse.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
           <div className="flex-1 overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-3">
                <h4 className={`font-bold flex items-center gap-2 ${doctorsLowInWarehouse.length > 0 ? 'text-red-800' : 'text-gray-700'}`}>
                  <TrendingDown size={18} /> Faltantes Depósito
                </h4>
                <button 
                  onClick={() => handleDownloadPDF('Orden de Pedido - Imprenta', doctorsLowInWarehouse)}
                  className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                  title="Descargar pedido formal PDF"
                >
                  <Download size={16} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
                 {doctorsLowInWarehouse.length > 0 ? doctorsLowInWarehouse.map(doc => (
                   <div key={doc.id} className="flex justify-between items-center bg-white/80 p-2 rounded shadow-sm text-xs border border-red-100">
                     <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                     <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Stock: {doc.padsInWarehouse}</span>
                   </div>
                 )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle2 size={32} className="opacity-20 mb-2" />
                        <p className="text-[10px] italic">Depósito abastecido</p>
                    </div>
                 )}
             </div>
           </div>
           {doctorsLowInWarehouse.length > 0 && (
             <div className="mt-3 pt-3 border-t border-red-200 grid grid-cols-2 gap-2">
               <button onClick={handleWhatsAppOrder} className="bg-green-100 text-green-700 py-1.5 rounded text-[10px] font-bold hover:bg-green-200 transition-colors">WhatsApp</button>
               <button onClick={handleCreateSystemOrder} className="bg-blue-600 text-white py-1.5 rounded text-[10px] font-bold hover:bg-blue-700 transition-colors">Generar Orden</button>
             </div>
           )}
        </div>

        {/* COLUMNA 3: Entregas de Hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col h-[290px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    Entregas Hoy
                </h4>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownloadPDF('Planilla de Entregas Diarias', todayDeliveries)}
                      className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                      title="Descargar planilla PDF"
                    >
                      <Download size={14} />
                    </button>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {totalDeliveredToday} unid.
                    </span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {todayDeliveries.length > 0 ? (
                    todayDeliveries.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100">
                            <div className="overflow-hidden">
                                <p className="text-[11px] font-bold text-gray-800 truncate">{log.details}</p>
                                <p className="text-[9px] text-gray-400 italic">Por: {log.user}</p>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border flex-shrink-0">
                                +{log.quantity}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-4">
                        <UserCheck size={28} className="opacity-20 mb-2" />
                        <p className="text-[10px] italic text-center">Sin entregas registradas hoy.</p>
                    </div>
                )}
            </div>
            <div className="mt-3 pt-3 border-t">
                <button onClick={() => onNavigate('distribution')} className="w-full text-center text-[10px] text-blue-600 font-bold hover:underline">
                    Ver todas las entregas →
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold">Actividad Reciente</h4>
            <button 
                onClick={() => handleDownloadPDF('Historial de Actividad Reciente', recentLogs.slice(0, 20))}
                className="text-xs flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold"
            >
                <Download size={14} /> Exportar Log
            </button>
          </div>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-100">
              {recentLogs.slice(0, 5).map((log) => (
                <li key={log.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{log.details}</p>
                      <p className="text-xs text-gray-500">
                        {LOG_TYPE_LABELS[log.type] || log.type} • {log.user}
                      </p>
                    </div>
                    <div className="font-bold bg-gray-100 px-3 py-1 rounded text-gray-800">{log.quantity}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
