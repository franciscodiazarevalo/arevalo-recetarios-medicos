
export enum StockLocation {
  DEPOSITO = 'Depósito',
  PLANTA_BAJA = 'Planta Baja (PB)',
}

export type UserRole = 'ADMIN' | 'SECRETARY';

export type OrderStatus = 'PENDING' | 'COMPLETED';

export interface UserSession {
  name: string;
  role: UserRole;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  padsInWarehouse: number; // Stock in Deposit specific to this doctor
  padsInPB: number;        // Stock in PB specific to this doctor
  padsOnHand: number;      // Stock distributed to the doctor (consumed/held)
  lastRestockDate?: string;
  
  // New Configuration Fields
  idealStockPB: number;      // Cantidad ideal para tener en mostrador (Objetivo de reposición)
  minStockPB: number;        // Cantidad mínima en PB antes de alertar
  idealStockWarehouse: number; // Cantidad ideal/total a mantener en depósito
  minStockWarehouse: number; // Cantidad mínima en depósito antes de alertar compra
}

export interface InvoiceItem {
  doctorId: string;
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  status: OrderStatus;
  dateCreated: string; // Date the order was made
  
  // Fields that might be empty initially
  invoiceNumber?: string; 
  dateReceived?: string; // Date the invoice/stock arrived
  supplier?: string;
  totalCost?: number;
  
  items: InvoiceItem[]; 
}

export interface MovementLog {
  id: string;
  date: string;
  type: 'PURCHASE' | 'TRANSFER_TO_PB' | 'DISTRIBUTE_TO_DOCTOR' | 'ORDER_CREATED';
  quantity: number;
  user: string;
  details: string;
  location: StockLocation;
}
