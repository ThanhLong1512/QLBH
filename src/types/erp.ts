// TypeScript definitions for NEXUS Retail & Distribution ERP

export type UserRole = 'admin' | 'manager' | 'cashier' | 'warehouse' | 'accountant';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle?: string;
  businessName: string;
  businessScale?: string;
  avatar?: string;
}

export type PermissionKey =
  | 'view_dashboard'
  | 'pos_sales'
  | 'manage_orders'
  | 'manage_returns'
  | 'cash_shift'
  | 'manage_products'
  | 'manage_inventory'
  | 'manage_warehouse'
  | 'manage_serials'
  | 'manage_warranty'
  | 'manage_customers'
  | 'manage_suppliers'
  | 'manage_debt_aging'
  | 'manage_employees'
  | 'manage_cashflow'
  | 'manage_approvals'
  | 'view_reports'
  | 'system_settings'
  | 'view_cost_price'
  | 'export_data';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    'view_dashboard',
    'pos_sales',
    'manage_orders',
    'manage_returns',
    'cash_shift',
    'manage_products',
    'manage_inventory',
    'manage_warehouse',
    'manage_serials',
    'manage_warranty',
    'manage_customers',
    'manage_suppliers',
    'manage_debt_aging',
    'manage_employees',
    'manage_cashflow',
    'manage_approvals',
    'view_reports',
    'system_settings',
    'view_cost_price',
    'export_data',
  ],
  manager: [
    'view_dashboard',
    'pos_sales',
    'manage_orders',
    'manage_returns',
    'cash_shift',
    'manage_products',
    'manage_inventory',
    'manage_warehouse',
    'manage_serials',
    'manage_warranty',
    'manage_customers',
    'manage_suppliers',
    'manage_debt_aging',
    'manage_cashflow',
    'manage_approvals',
    'view_reports',
    'view_cost_price',
    'export_data',
  ],
  cashier: [
    'pos_sales',
    'manage_orders',
    'manage_returns',
    'cash_shift',
    'manage_customers',
    'manage_warranty',
  ],
  warehouse: [
    'manage_products',
    'manage_inventory',
    'manage_warehouse',
    'manage_serials',
    'manage_suppliers',
    'manage_returns',
  ],
  accountant: [
    'view_dashboard',
    'manage_orders',
    'manage_customers',
    'manage_suppliers',
    'manage_debt_aging',
    'manage_cashflow',
    'manage_approvals',
    'view_reports',
    'view_cost_price',
    'export_data',
  ],
};

export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  title: string;
  badgeColor: string;
  defaultView: string;
  description: string;
}> = {
  admin: {
    label: 'Quản Trị Viên (Admin)',
    title: 'Tổng Quản Trị Hệ Thống',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    defaultView: 'dashboard',
    description: 'Toàn quyền điều hành, xem giá vốn, duyệt chi và cấu hình hệ thống',
  },
  manager: {
    label: 'Cửa Hàng Trưởng (Manager)',
    title: 'Cửa Hàng Trưởng / Quản Lý',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    defaultView: 'dashboard',
    description: 'Điều phối vận hành, duyệt vượt nợ, theo dõi doanh thu và kho hàng',
  },
  cashier: {
    label: 'Thu Ngân (Cashier)',
    title: 'Nhân Viên Thu Ngân POS',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    defaultView: 'pos',
    description: 'Thực hiện bán hàng POS, nhận bảo hành và chốt ca tiền mặt',
  },
  warehouse: {
    label: 'Thủ Kho (Warehouse)',
    title: 'Thủ Kho & Vận Hành',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    defaultView: 'inventory',
    description: 'Quản lý xuất nhập tồn, lô hạn dùng FEFO và Serial/IMEI',
  },
  accountant: {
    label: 'Kế Toán (Accountant)',
    title: 'Kế Toán Trưởng & Công Nợ',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    defaultView: 'cashflow',
    description: 'Quản lý sổ quỹ thu chi, báo cáo tuổi nợ và hóa đơn doanh thu',
  },
};


export type TierPriceType = 'retail' | 'wholesale' | 'vip';

export type OrderStatus = 'completed' | 'shipping' | 'pending_approval' | 'cancelled';

export type PaymentMethod = 'cash' | 'vietqr' | 'debt' | 'mixed';

export type CustomerTier = 'dong' | 'bac' | 'vang' | 'kim_cuong';

export interface PackagingUnit {
  name: string; // e.g. "Thùng", "Hộp", "Cái"
  conversionRate: number; // multiplier to base unit (e.g. 1 Thùng = 24 Cái -> rate 24; 1 Hộp = 6 Cái -> rate 6; 1 Cái -> rate 1)
  isBase: boolean;
  priceRetail: number;
  priceWholesale: number;
  priceVip: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  productCount?: number;
}

export interface ProductBatch {
  batchId: string;
  sku: string;
  productionDate: string;
  expiryDate: string;
  quantityBaseUnits: number;
  warehouseLocation: string;
  daysRemaining: number;
}

export type SerialStatus = 'in_stock' | 'sold' | 'rma' | 'defective' | 'returned';

export interface SerialTimelineEvent {
  id: string;
  timestamp: string;
  action: 'imported' | 'sold' | 'warranty_received' | 'warranty_returned' | 'status_changed';
  description: string;
  referenceCode?: string;
  actor: string;
}

export interface SerialItem {
  serialNumber: string;
  sku: string;
  productName: string;
  importDate: string;
  supplier: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  warrantyUntil: string;
  status: SerialStatus;
  notes?: string;
  batchNumber?: string;
  timeline?: SerialTimelineEvent[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Điện Máy' | 'Gia Dụng' | 'Hóa Mỹ Phẩm' | 'Vật Liệu' | 'Dịch Vụ' | 'Dầu Nhờn & Phụ Gia' | string;
  baseUnit: string; // e.g. "Cái", "Can", "Bao", "Hộp"
  units: PackagingUnit[];
  costPrice: number; // Giá vốn (ẩn với thu ngân)
  priceRetail: number; // Giá bán lẻ base unit
  priceWholesale: number; // Giá bán sỉ base unit
  priceVip: number; // Giá đại lý VIP base unit
  stockBaseUnits: number; // Tổng tồn kho theo đơn vị cơ bản
  minStockAlert: number;
  minStockThreshold?: number;
  hasSerial: boolean;
  hasExpiry: boolean;
  barcode: string;
  imageUrl?: string;
  image?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  tier: CustomerTier;
  creditLimit: number; // Hạn mức tín dụng (VND)
  currentDebt: number; // Dư nợ hiện tại (VND)
  taxId?: string;
  paymentTermDays?: number;
  historicalRevenue?: number;
  debtAging: {
    within30: number;
    days31to60: number;
    days61to90: number;
    over90: number;
  };
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  productName?: string;
  category: string;
  selectedUnit: string; // name of chosen packaging unit
  unitName?: string;
  conversionRate: number;
  quantity: number;
  unitPrice: number; // price per selected unit
  costPricePerUnit: number; // for anti-loss detection
  totalPrice: number;
  discountPercent: number; // e.g. 5%
  serialNumbers?: string[];
  batchId?: string;
}

export interface POSTab {
  id: string;
  name: string;
  customerId: string;
  tierPrice: TierPriceType;
  items: CartItem[];
  discountAmount: number;
  shippingFee: number;
  paidAmount: number;
  notes: string;
  requiresManagerPin: boolean;
  pinOverrideGranted: boolean;
  requiresCreditApproval: boolean;
  creditApprovalGranted: boolean;
  approvalRequestId?: string;
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  cashierName: string;
  notes?: string;
  hasPinOverride?: boolean;
  vatRate?: number; // 0, 5, 8, 10
  vatAmount?: number; // Tiền thuế VAT
  salesChannel?: 'pos' | 'b2b' | 'online';
  invoiceNumber?: string;
  customerTaxId?: string;
}

export interface CreditApprovalRequest {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderTotal: number;
  currentDebt: number;
  creditLimit: number;
  excessAmount: number;
  requestedAt: string;
  requestedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
  resolvedBy?: string;
  messages: {
    sender: string;
    role: string;
    timestamp: string;
    text: string;
  }[];
}

export interface CashShift {
  id: string;
  cashierName: string;
  startedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  vietQrSales: number;
  debtSales: number;
  cashDrops: number; // Rút tiền két
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  varianceReason?: string;
  isClosed: boolean;
  managerSignOff?: string;
}

export interface CashTransaction {
  id: string;
  code: string;
  type: 'thu' | 'chi';
  category: string;
  amount: number;
  date: string;
  person: string;
  description: string;
  shiftId?: string;
  fundType?: 'cash' | 'bank'; // Quỹ tiền mặt hoặc Quỹ ngân hàng
  partnerType?: 'customer' | 'supplier' | 'employee' | 'other';
  partnerId?: string;
  partnerName?: string;
  referenceCode?: string; // Mã chứng từ tham chiếu (Đơn hàng, PNK, PTH...)
  paymentMethod?: 'cash' | 'vietqr' | 'bank_transfer';
}

export interface TelegramAlert {
  id: string;
  timestamp: string;
  type: 'credit_limit' | 'pin_override' | 'low_stock' | 'shift_variance';
  title: string;
  message: string;
  delivered: boolean;
}

// 1. Quản lý Nhân viên (Staff / Employee)
export type EmployeeRole = 'admin' | 'manager' | 'cashier' | 'warehouse' | 'accountant';

export interface Employee {
  id: string;
  code: string; // e.g. "NV-001"
  name: string;
  phone: string;
  email: string;
  role: EmployeeRole;
  roleTitle: string; // "Quản Trị Viên", "Cửa Hàng Trưởng", "Thu Ngân", "Thủ Kho", "Kế Toán"
  branch: string;
  status: 'active' | 'inactive';
  hireDate: string;
  baseSalary: number; // Lương cơ bản VND
  commissionRate: number; // % hoa hồng doanh số
  totalOrdersHandled: number;
  totalRevenueGenerated: number;
  notes?: string;
  avatar?: string;
}

// 2. Quản lý Nhà cung cấp (Suppliers)
export interface Supplier {
  id: string;
  code: string; // e.g. "NCC-001"
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  category: string; // e.g. "Điện Máy", "Hóa Mỹ Phẩm", "Gia Dụng"...
  currentDebt: number; // Công nợ phải trả NCC (VND)
  paymentTermsDays: number; // Hạn thanh toán (ngày)
  totalPurchased: number; // Tổng giá trị nhập hàng lũy kế
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  status: 'active' | 'inactive';
  notes?: string;
}

// 3. Quản lý Xuất Nhập Tồn (Inventory Import/Export/Balance)
export interface StockInboundItem {
  productId: string;
  productName: string;
  sku: string;
  unitName: string;
  conversionRate: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface StockInboundReceipt {
  id: string;
  code: string; // e.g. "PNK-20260910-001"
  date: string;
  supplierId: string;
  supplierName: string;
  creatorName: string;
  items: StockInboundItem[];
  totalCost: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'debt';
  notes?: string;
  status: 'completed' | 'draft';
}

export interface StockOutboundItem {
  productId: string;
  productName: string;
  sku: string;
  unitName: string;
  conversionRate: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StockOutboundReceipt {
  id: string;
  code: string; // e.g. "PXK-20260910-001"
  date: string;
  reason: 'damaged' | 'internal_use' | 'loss' | 'transfer' | 'other';
  reasonLabel: string;
  creatorName: string;
  destination?: string;
  items: StockOutboundItem[];
  totalCost: number;
  notes?: string;
  status: 'completed';
}

export interface StocktakeItem {
  productId: string;
  sku: string;
  productName: string;
  unitName: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  unitCost: number;
  differenceValue: number;
  note?: string;
}

export interface StocktakeReport {
  id: string;
  code: string; // e.g. "PKK-20260910-001"
  date: string;
  creatorName: string;
  items: StocktakeItem[];
  totalDiscrepancyAmount: number;
  status: 'balanced' | 'pending';
  notes?: string;
}

// 4. Quản lý Trả hàng (Returns / Refunds)
export interface ReturnItem {
  productId: string;
  productName: string;
  sku: string;
  unitName: string;
  conversionRate: number;
  quantity: number;
  unitPrice: number;
  totalRefund: number;
  condition: 'restock' | 'damaged'; // Hàng còn nguyên (nhập lại kho) hoặc Hỏng (hủy)
  reason: string;
}

export interface ReturnReceipt {
  id: string;
  code: string; // e.g. "PTH-20260910-001"
  type: 'customer_return' | 'supplier_return';
  date: string;
  referenceOrderCode?: string;
  partnerId: string;
  partnerName: string;
  partnerPhone?: string;
  creatorName: string;
  items: ReturnItem[];
  totalRefundAmount: number;
  refundMethod: 'cash' | 'vietqr' | 'debt_deduction';
  status: 'completed' | 'pending';
  notes?: string;
}

// 5. Quản lý Bảo Hành & Sửa Chữa (Warranty Management)
export type WarrantyTicketStatus =
  | 'receiving' // Mới tiếp nhận
  | 'inspecting' // Đang kiểm tra / chẩn đoán lỗi
  | 'repairing' // Đang xử lý / sửa chữa
  | 'waiting_parts' // Chờ linh kiện thay thế
  | 'completed' // Đã sửa xong, chờ khách lấy
  | 'returned_to_customer' // Đã bàn giao trả khách
  | 'canceled'; // Hủy tiếp nhận / Trả về nguyên trạng

export interface WarrantyServiceRecord {
  id: string;
  date: string;
  technicianName: string;
  action: string;
  spareParts?: string;
  cost: number;
  notes?: string;
}

export interface WarrantyTicket {
  id: string;
  code: string; // e.g. "PBH-20260910-001"
  customerName: string;
  customerPhone: string;
  customerId?: string;
  productId: string;
  productName: string;
  sku: string;
  serialNumber?: string;
  orderCode?: string;
  receivedDate: string;
  estimatedReturnDate?: string;
  returnedDate?: string;
  status: WarrantyTicketStatus;
  issueDescription: string;
  accessoriesAttached?: string; // Sạc, cáp, hộp, v.v.
  technicianName: string;
  isUnderWarranty: boolean; // Còn bảo hành chính hãng hay Sửa dịch vụ
  warrantyExpiryDate?: string;
  repairCost: number;
  sparePartsCost: number;
  totalCost: number;
  serviceRecords: WarrantyServiceRecord[];
  notes?: string;
}

// 6. Quản lý Chat Nội Bộ (Internal Team Chat)
export interface ChatAttachment {
  type: 'order' | 'product' | 'image';
  title: string;
  code?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  tag?: string;
  attachments?: ChatAttachment[];
  reactions?: Record<string, string[]>;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'channel' | 'direct';
  recipientId?: string;
  recipientName?: string;
  recipientRole?: UserRole;
  recipientAvatar?: string;
  isOnline?: boolean;
}

