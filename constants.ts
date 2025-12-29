
import { Doctor, PurchaseOrder, MovementLog } from './types';

// Helper to generate initial data
const createDoc = (id: string, name: string, specialty: string) => ({
  id,
  name: name.toUpperCase(),
  specialty,
  padsInWarehouse: Math.floor(Math.random() * 20) + 5, // Random stock 5-25
  padsInPB: Math.floor(Math.random() * 5) + 1,       // Random stock 1-6
  padsOnHand: 0,
  lastRestockDate: '2023-10-01',
  // Defaults based on previous constants
  idealStockPB: 5,
  minStockPB: 2,
  idealStockWarehouse: 150, // Default target for warehouse
  minStockWarehouse: 5
});

export const MOCK_DOCTORS: Doctor[] = [
  createDoc('1', 'AGUDO SARACHAGA LUIS', 'Otorrinolaringologo'),
  createDoc('2', 'AGUDO SARACHAGA MARIA LAURA', 'Pediatra'),
  createDoc('3', 'AGUERO AVILA MARCELO', 'Flebologo'),
  createDoc('4', 'ALONSO RODOLFO', 'Dermatologo'),
  createDoc('5', 'ALTAMIRANDA HUGO', 'Neurologo'),
  createDoc('6', 'APARICIO MAXIMILIANO', 'Traumatologo'),
  createDoc('7', 'ARANCIBIA MAGDALENA BEATRIZ', 'Clinica'),
  createDoc('8', 'AREVALO', 'General'),
  createDoc('9', 'AUN MARIA EUGENIA', 'Gastroenterologa'),
  createDoc('10', 'BENZAL ELISABET VERONICA', 'Pediatra'),
  createDoc('11', 'BERTOLLI SIOMARA', 'Pediatra'),
  createDoc('12', 'CABRAL CRISTINA', 'Pediatra'),
  createDoc('13', 'CARRIZO LILIANA', 'Odontologo'),
  createDoc('14', 'CHARIF SILVANA', 'Clinica'),
  createDoc('15', 'COSENTINO HORACIO', 'Gastroenterologa'),
  createDoc('16', 'DIAZ SAN ROMAN ANTONIO', 'Cirujano'),
  createDoc('17', 'DRUBE JULIO', 'Traumatologo'),
  createDoc('18', 'DRUBE VICTOR', 'Pediatrra'),
  createDoc('19', 'ECOGRAFIA', 'Diagnostico'),
  createDoc('20', 'ELGOTAS LAURA', 'Fonoaudiologa'),
  createDoc('21', 'ENFERMERIA', 'General'),
  createDoc('22', 'ERAZU JOSE DANIEL', 'Traumatologo'),
  createDoc('23', 'GIMENEZ GENARO JULIO', 'Clinico'),
  createDoc('24', 'GOMEZ JUAN JOSE', 'Urologo'),
  createDoc('25', 'GUIA JUAN CARLOS', 'Cardiologo'),
  createDoc('26', 'GUTIERREZ RODOLFO', 'Ginecologo'),
  createDoc('27', 'HERRERA MARIANELA', 'Nutricionista'),
  createDoc('28', 'INSAURRALDE INES', 'Odontologa'),
  createDoc('29', 'ITURRE MARIA JULIANA', 'Odontologa'),
  createDoc('30', 'JACOB JOSE MIGUEL', 'Cardiologo'),
  createDoc('31', 'JUAREZ ARIEL', 'Cirujano'),
  createDoc('32', 'LEAL SILVIA ISABEL', 'Odontologo'),
  createDoc('33', 'MARTINEZ RIBO GERARDO', 'Ginecologo'),
  createDoc('34', 'MECLE JOSE', 'Ginecologo'),
  createDoc('35', 'MENDEZ HORACIO', 'Urologo'),
  createDoc('36', 'NANNI SILVIA', 'Oftalmologo'),
  createDoc('37', 'NAVARRO RITA', 'Cardiologo'),
  createDoc('38', 'NICAY IVANA', 'Odontologo'),
  createDoc('39', 'NICAY KARINA', 'Odontologo'),
  createDoc('40', 'ORTEGA ANCASI SILVANA', 'Ginecologa'),
  createDoc('41', 'PATRONE MARCELA', 'Pediatra'),
  createDoc('42', 'PAZ RODOLFO', 'Clinico'),
  createDoc('43', 'POSSE MARIA VIRGINIA', 'Clinica'),
  createDoc('44', 'RAMOS TORINO LUCIA', 'Ginecologa'),
  createDoc('45', 'SEGOVIA NANCY', 'Fonoaudiologa'),
  createDoc('46', 'RODRIGUEZ GERARDO', 'Endocrinologo'),
  createDoc('47', 'RODRIGUEZ ISABEL', 'Clinica'),
  createDoc('48', 'ROMERO PABLO', 'Cardiologo'),
  createDoc('49', 'SALADO FACUNDO', 'Odontologo'),
  createDoc('50', 'SARMIENTO CLAUDIA', 'Fonoaudiologa'),
  createDoc('51', 'SEVALD PABLO', 'Oftamologo'),
  createDoc('52', 'SOSA PIÑERO CARLOS', 'Ginecologo'),
  createDoc('53', 'STISMAN OSCAR', 'Dermatologo'),
  createDoc('54', 'TADDEI GABRIELA', 'Odontologo'),
  createDoc('55', 'VECE NICOLAS', 'Reumatologo'),
  createDoc('56', 'VECE PABLO', 'Clinico'),
];

// Set a few low stock for demo
MOCK_DOCTORS[0].padsInWarehouse = 1; 
MOCK_DOCTORS[0].padsInPB = 1;
MOCK_DOCTORS[5].padsInPB = 0;

export const MOCK_INVOICES: PurchaseOrder[] = [
  { 
    id: 'ORD-001', 
    status: 'COMPLETED',
    dateCreated: '2023-10-20',
    invoiceNumber: '0001-0004523',
    dateReceived: '2023-10-25', 
    supplier: 'Imprenta Central', 
    items: [{ doctorId: '1', quantity: 100 }],
    totalCost: 70000 
  },
  {
    id: 'ORD-002',
    status: 'PENDING',
    dateCreated: new Date().toISOString().split('T')[0],
    items: [{ doctorId: '5', quantity: 50 }, { doctorId: '10', quantity: 100 }]
  }
];

export const MOCK_LOGS: MovementLog[] = [
  { id: 'L1', date: '2023-10-26 09:30', type: 'DISTRIBUTE_TO_DOCTOR', quantity: 1, user: 'Maria (Sec)', details: 'Dr. AGUDO SARACHAGA LUIS', location: 'Planta Baja (PB)' as any },
];

export const LOW_STOCK_THRESHOLD_PB = 2; // DEPRECATED: Use doctor.minStockPB
export const LOW_STOCK_THRESHOLD_WAREHOUSE = 5; // DEPRECATED: Use doctor.minStockWarehouse
