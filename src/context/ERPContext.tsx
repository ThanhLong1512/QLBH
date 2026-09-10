"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  AuthUser,
  Product,
  Customer,
  ProductBatch,
  SerialItem,
  Order,
  POSTab,
  CashShift,
  CashTransaction,
  TelegramAlert,
  CreditApprovalRequest,
  PaymentMethod,
  TierPriceType,
  Employee,
  Supplier,
  StockInboundReceipt,
  StockOutboundReceipt,
  StocktakeReport,
  ReturnReceipt,
  WarrantyTicket,
  WarrantyServiceRecord
} from '../types/erp';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_BATCHES,
  INITIAL_SERIALS,
  INITIAL_ORDERS,
  INITIAL_SHIFTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_APPROVALS,
  INITIAL_EMPLOYEES,
  INITIAL_SUPPLIERS,
  INITIAL_INBOUNDS,
  INITIAL_OUTBOUNDS,
  INITIAL_RETURNS,
  INITIAL_WARRANTIES
} from '../data/mockData';

interface PrintModalState {
  isOpen: boolean;
  mode: 'k80' | 'a5' | 'a6';
  order: Order | null;
}

interface VietQRModalState {
  isOpen: boolean;
  amount: number;
  orderCode: string;
  customerName?: string;
  onSuccess?: () => void;
}

interface PinModalState {
  isOpen: boolean;
  onSuccess: () => void;
  reason: string;
}

interface ScannerModalState {
  isOpen: boolean;
  onDetected: (code: string) => void;
}

interface ERPContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  canViewCosts: boolean;
  canExportExcel: boolean;

  // Authentication & Current User
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, targetRole?: UserRole) => boolean;
  logout: () => void;
  register: (data: { name: string; email: string; phone: string; businessName: string; password: string; businessScale: string; role?: UserRole }) => boolean;
  resetPassword: (email: string, newPass: string) => boolean;

  // Products & Warehouse
  products: Product[];
  batches: ProductBatch[];
  serials: SerialItem[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getConvertedStockText: (product: Product) => string;

  // Serial / IMEI Management (Quản lý Serial)
  addSerial: (serial: SerialItem) => void;
  updateSerial: (serial: SerialItem) => void;
  deleteSerial: (serialNumber: string) => void;
  bulkAddSerials: (items: SerialItem[]) => void;

  // Warranty Management (Quản lý bảo hành)
  warranties: WarrantyTicket[];
  addWarranty: (ticket: Omit<WarrantyTicket, 'id' | 'code'>) => void;
  updateWarranty: (ticket: WarrantyTicket) => void;
  deleteWarranty: (ticketId: string) => void;
  addWarrantyServiceRecord: (ticketId: string, record: Omit<WarrantyServiceRecord, 'id'>) => void;

  // Customers & CRM
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  recordCustomerPayment: (customerId: string, amount: number, paymentMethod: string, notes: string) => void;

  // Employees & Staff Management
  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  // Suppliers Management
  suppliers: Supplier[];
  addSupplier: (sup: Supplier) => void;
  updateSupplier: (sup: Supplier) => void;
  deleteSupplier: (id: string) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: string, notes: string) => void;

  // Inventory Import/Export/Balance (Xuất Nhập Tồn)
  inbounds: StockInboundReceipt[];
  outbounds: StockOutboundReceipt[];
  stocktakes: StocktakeReport[];
  addInboundReceipt: (receipt: Omit<StockInboundReceipt, 'id' | 'code'>) => void;
  addOutboundReceipt: (receipt: Omit<StockOutboundReceipt, 'id' | 'code'>) => void;
  addStocktakeReport: (report: Omit<StocktakeReport, 'id' | 'code'>) => void;
  reconcileStocktake: (items: { productId: string; actualStock: number }[]) => void;

  // Returns & Refunds Management (Quản lý trả hàng)
  returns: ReturnReceipt[];
  addReturnReceipt: (receipt: Omit<ReturnReceipt, 'id' | 'code'>) => void;

  // POS & Multi-Tabs
  tabs: POSTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  addTab: () => void;
  closeTab: (tabId: string) => void;
  setTabCustomer: (tabId: string, customerId: string) => void;
  setTabTierPrice: (tabId: string, tier: TierPriceType) => void;
  addItemToTab: (tabId: string, product: Product, unitName?: string) => void;
  updateCartItemQty: (tabId: string, productId: string, unitName: string, quantity: number) => void;
  updateCartItemPrice: (tabId: string, productId: string, unitName: string, unitPrice: number, discountPercent: number) => void;
  updateCartItemUnit: (tabId: string, productId: string, oldUnitName: string, newUnitName: string) => void;
  removeItemFromTab: (tabId: string, productId: string, unitName: string) => void;
  setTabDiscount: (tabId: string, discount: number) => void;
  setTabShipping: (tabId: string, shipping: number) => void;
  setTabPaidAmount: (tabId: string, paid: number) => void;
  setTabNotes: (tabId: string, notes: string) => void;
  checkoutTab: (tabId: string, paymentMethod: PaymentMethod) => Order | null;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;

  // Shifts
  currentShift: CashShift;
  shifts: CashShift[];
  closeShift: (physicalCash: number, reason?: string) => void;
  openNewShift: (cashierName: string, openingCash: number) => void;
  addCashDrop: (amount: number, reason: string) => void;

  // Transactions
  transactions: CashTransaction[];
  addTransaction: (tx: Omit<CashTransaction, 'id' | 'code'>) => void;

  // Credit Approvals
  approvalRequests: CreditApprovalRequest[];
  createCreditApprovalRequest: (tabId: string, reason: string) => void;
  resolveCreditApproval: (requestId: string, approved: boolean, note?: string) => void;
  addApprovalMessage: (requestId: string, message: string) => void;

  // Modals & Tools
  printModal: PrintModalState;
  openPrintModal: (mode: 'k80' | 'a5' | 'a6', order: Order) => void;
  closePrintModal: () => void;

  vietQrModal: VietQRModalState;
  openVietQrModal: (amount: number, orderCode: string, customerName?: string, onSuccess?: () => void) => void;
  closeVietQrModal: () => void;

  pinModal: PinModalState;
  openPinModal: (reason: string, onSuccess: () => void) => void;
  closePinModal: () => void;
  verifyPin: (pin: string) => boolean;
  managerPin: string;
  setManagerPin: (pin: string) => void;

  scannerModal: ScannerModalState;
  openScannerModal: (onDetected: (code: string) => void) => void;
  closeScannerModal: () => void;

  // Telegram Alerts
  telegramAlerts: TelegramAlert[];
  dispatchTelegramAlert: (type: TelegramAlert['type'], title: string, message: string) => void;
  telegramConfig: { botToken: string; chatId: string; enabled: boolean };
  setTelegramConfig: React.Dispatch<React.SetStateAction<{ botToken: string; chatId: string; enabled: boolean }>>;

  // Bank Info for VietQR
  bankConfig: { bankId: string; accountNo: string; accountName: string };
  setBankConfig: React.Dispatch<React.SetStateAction<{ bankId: string; accountNo: string; accountName: string }>>;

  // System Helpers
  isLoadingBootstrap: boolean;
  refreshData: () => Promise<void>;
  resetAllData: () => void;
  activeToast: string | null;
  showToast: (msg: string) => void;
}

const ERPContext = createContext<ERPContextType | null>(null);

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch {}
  }
};

const localStorage = typeof window !== 'undefined' ? window.localStorage : (safeLocalStorage as unknown as Storage);

const STORAGE_PREFIX = 'nexus_erp_v3_';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: dark vs light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}theme`) as 'dark' | 'light';
    return saved || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Default Demo Users for NEXUS ERP
  const DEFAULT_ADMIN_USER: AuthUser = {
    id: 'usr_admin_01',
    name: 'Trần Hoàng Nam',
    email: 'admin@nexus-erp.vn',
    phone: '0918 234 889',
    role: 'admin',
    businessName: 'Tập Đoàn Bán Lẻ & Phân Phối NEXUS',
    businessScale: 'Chuỗi 10+ Chi Nhánh & Kho Tổng'
  };

  const DEFAULT_CASHIER_USER: AuthUser = {
    id: 'usr_cashier_02',
    name: 'Nguyễn Văn Hùng',
    email: 'thungan@nexus-erp.vn',
    phone: '0987 654 321',
    role: 'cashier',
    businessName: 'Tập Đoàn Bán Lẻ & Phân Phối NEXUS',
    businessScale: 'Chuỗi 10+ Chi Nhánh & Kho Tổng'
  };

  // Role
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(`${STORAGE_PREFIX}role`) as UserRole) || 'admin';
  });

  // Authentication & Current User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}auth_user`);
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}is_auth`);
    return saved !== null ? saved === 'true' : true;
  });

  const [managerPin, setManagerPin] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}manager_pin`) || '8888';
  });

  const [bankConfig, setBankConfig] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}bank_config`);
    return saved
      ? JSON.parse(saved)
      : { bankId: 'MB', accountNo: '0918234889', accountName: 'CONG TY CO PHAN NEXUS VIET NAM' };
  });

  const [telegramConfig, setTelegramConfig] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}telegram_config`);
    return saved
      ? JSON.parse(saved)
      : { botToken: '6892341029:AAH9f29103kLmNx', chatId: '-1001928472910', enabled: true };
  });

  // Data Stores with LocalStorage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [batches] = useState<ProductBatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}batches`);
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [serials, setSerials] = useState<SerialItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}serials`);
    return saved ? JSON.parse(saved) : INITIAL_SERIALS;
  });

  const [warranties, setWarranties] = useState<WarrantyTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}warranties`);
    return saved ? JSON.parse(saved) : INITIAL_WARRANTIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [shifts, setShifts] = useState<CashShift[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}shifts`);
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [telegramAlerts, setTelegramAlerts] = useState<TelegramAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [approvalRequests, setApprovalRequests] = useState<CreditApprovalRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}approvals`);
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  // Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Inventory Inbounds & Outbounds & Stocktakes
  const [inbounds, setInbounds] = useState<StockInboundReceipt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}inbounds`);
    return saved ? JSON.parse(saved) : INITIAL_INBOUNDS;
  });

  const [outbounds, setOutbounds] = useState<StockOutboundReceipt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}outbounds`);
    return saved ? JSON.parse(saved) : INITIAL_OUTBOUNDS;
  });

  const [stocktakes, setStocktakes] = useState<StocktakeReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}stocktakes`);
    return saved ? JSON.parse(saved) : [];
  });

  // Returns & Refunds State
  const [returns, setReturns] = useState<ReturnReceipt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}returns`);
    return saved ? JSON.parse(saved) : INITIAL_RETURNS;
  });

  // Active Toast
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 4000);
  };

  // Real database bootstrapping from Supabase PostgreSQL via /api/bootstrap
  const [isLoadingBootstrap, setIsLoadingBootstrap] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      setIsLoadingBootstrap(true);
      const res = await fetch('/api/bootstrap');
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.products && json.data.products.length > 0) setProducts(json.data.products);
        if (json.data.customers && json.data.customers.length > 0) setCustomers(json.data.customers);
        if (json.data.orders && json.data.orders.length > 0) setOrders(json.data.orders);
        if (json.data.shifts && json.data.shifts.length > 0) setShifts(json.data.shifts);
        if (json.data.transactions && json.data.transactions.length > 0) setTransactions(json.data.transactions);
        if (json.data.employees && json.data.employees.length > 0) setEmployees(json.data.employees);
        if (json.data.suppliers && json.data.suppliers.length > 0) setSuppliers(json.data.suppliers);
        if (json.data.inbounds && json.data.inbounds.length > 0) setInbounds(json.data.inbounds);
        if (json.data.outbounds && json.data.outbounds.length > 0) setOutbounds(json.data.outbounds);
        if (json.data.returns && json.data.returns.length > 0) setReturns(json.data.returns);
        if (json.data.warranties && json.data.warranties.length > 0) setWarranties(json.data.warranties);
        if (json.data.serials && json.data.serials.length > 0) setSerials(json.data.serials);
        if (json.data.approvalRequests && json.data.approvalRequests.length > 0) setApprovalRequests(json.data.approvalRequests);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ PostgreSQL Supabase:', err);
    } finally {
      setIsLoadingBootstrap(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}role`, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}manager_pin`, managerPin);
  }, [managerPin]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}bank_config`, JSON.stringify(bankConfig));
  }, [bankConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}telegram_config`, JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}shifts`, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}alerts`, JSON.stringify(telegramAlerts));
  }, [telegramAlerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}approvals`, JSON.stringify(approvalRequests));
  }, [approvalRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}inbounds`, JSON.stringify(inbounds));
  }, [inbounds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}outbounds`, JSON.stringify(outbounds));
  }, [outbounds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}stocktakes`, JSON.stringify(stocktakes));
  }, [stocktakes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}serials`, JSON.stringify(serials));
  }, [serials]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}warranties`, JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}returns`, JSON.stringify(returns));
  }, [returns]);

  // POS Multi-Tab Management
  const [tabs, setTabs] = useState<POSTab[]>([
    {
      id: 'tab-1',
      name: 'Đơn 1 (Anh Khang)',
      customerId: 'cust-2',
      tierPrice: 'wholesale',
      items: [
        {
          productId: 'prod-4',
          sku: 'HMP-SUNLIGHT-10KG',
          name: 'Nước Rửa Chén Sunlight Chanh Thiên Nhiên Can 10kg',
          category: 'Hóa Mỹ Phẩm',
          selectedUnit: 'Thùng (2 Can)',
          conversionRate: 2,
          quantity: 3,
          unitPrice: 400000,
          costPricePerUnit: 350000,
          totalPrice: 1200000,
          discountPercent: 0
        }
      ],
      discountAmount: 0,
      shippingFee: 30000,
      paidAmount: 1230000,
      notes: 'Giao giờ hành chính',
      requiresManagerPin: false,
      pinOverrideGranted: false,
      requiresCreditApproval: false,
      creditApprovalGranted: false
    },
    {
      id: 'tab-2',
      name: 'Đơn 2 (UBND Phường 4)',
      customerId: 'cust-4',
      tierPrice: 'vip',
      items: [
        {
          productId: 'prod-1',
          sku: 'DM-SAM-43CU8000',
          name: 'Smart Tivi Samsung 43 inch Crystal UHD 4K',
          category: 'Điện Máy',
          selectedUnit: 'Chiếc',
          conversionRate: 1,
          quantity: 2,
          unitPrice: 7650000,
          costPricePerUnit: 7200000,
          totalPrice: 15300000,
          discountPercent: 0
        }
      ],
      discountAmount: 300000,
      shippingFee: 0,
      paidAmount: 0,
      notes: 'Xuất hóa đơn VAT',
      requiresManagerPin: false,
      pinOverrideGranted: false,
      requiresCreditApproval: false,
      creditApprovalGranted: false
    }
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Modals state
  const [printModal, setPrintModal] = useState<PrintModalState>({
    isOpen: false,
    mode: 'k80',
    order: null
  });

  const [vietQrModal, setVietQrModal] = useState<VietQRModalState>({
    isOpen: false,
    amount: 0,
    orderCode: ''
  });

  const [pinModal, setPinModal] = useState<PinModalState>({
    isOpen: false,
    onSuccess: () => {},
    reason: ''
  });

  const [scannerModal, setScannerModal] = useState<ScannerModalState>({
    isOpen: false,
    onDetected: () => {}
  });

  const toggleRole = () => {
    setRoleState(prev => {
      const next = prev === 'admin' ? 'cashier' : 'admin';
      const updatedUser = next === 'admin' ? DEFAULT_ADMIN_USER : DEFAULT_CASHIER_USER;
      setCurrentUser(updatedUser);
      localStorage.setItem(`${STORAGE_PREFIX}auth_user`, JSON.stringify(updatedUser));
      showToast(next === 'admin' ? '🔓 Đã chuyển sang vai trò: QUẢN TRỊ VIÊN (Xem toàn bộ giá vốn & báo cáo)' : '🔒 Đã chuyển sang vai trò: THU NGÂN (Đã ẩn giá vốn & giới hạn xuất dữ liệu)');
      return next;
    });
  };

  // Auth Operations
  const login = (email: string, _pass: string, targetRole?: UserRole): boolean => {
    const resolvedRole: UserRole = targetRole || (email.toLowerCase().includes('thungan') || email.toLowerCase().includes('cashier') ? 'cashier' : 'admin');
    const baseUser = resolvedRole === 'cashier' ? DEFAULT_CASHIER_USER : DEFAULT_ADMIN_USER;
    const user: AuthUser = {
      ...baseUser,
      email: email || baseUser.email
    };
    setCurrentUser(user);
    setRoleState(resolvedRole);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_PREFIX}auth_user`, JSON.stringify(user));
    localStorage.setItem(`${STORAGE_PREFIX}is_auth`, 'true');
    localStorage.setItem(`${STORAGE_PREFIX}role`, resolvedRole);
    showToast(`Chào mừng ${user.name}! Đăng nhập thành công với vai trò ${resolvedRole === 'admin' ? 'Quản Trị Viên' : 'Thu Ngân'}.`);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(`${STORAGE_PREFIX}is_auth`, 'false');
    showToast('Đã đăng xuất an toàn khỏi hệ thống NEXUS ERP.');
  };

  const register = (data: { name: string; email: string; phone: string; businessName: string; password: string; businessScale: string; role?: UserRole }): boolean => {
    const userRole: UserRole = data.role || 'admin';
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: userRole,
      businessName: data.businessName,
      businessScale: data.businessScale
    };
    setCurrentUser(newUser);
    setRoleState(userRole);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_PREFIX}auth_user`, JSON.stringify(newUser));
    localStorage.setItem(`${STORAGE_PREFIX}is_auth`, 'true');
    localStorage.setItem(`${STORAGE_PREFIX}role`, userRole);
    showToast(`Khởi tạo tài khoản thành công! Chào mừng ${newUser.businessName} gia nhập hệ sinh thái NEXUS.`);
    return true;
  };

  const resetPassword = (email: string, _newPass: string): boolean => {
    showToast(`Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới cho tài khoản ${email}.`);
    return true;
  };

  const canViewCosts = role === 'admin';
  const canExportExcel = role === 'admin';

  // Telegram alert dispatcher
  const dispatchTelegramAlert = (type: TelegramAlert['type'], title: string, message: string) => {
    const newAlert: TelegramAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type,
      title,
      message,
      delivered: true
    };
    setTelegramAlerts(prev => [newAlert, ...prev]);
    showToast(`📢 Telegram Bot: ${title}`);
  };

  // Packaging representation helper
  const getConvertedStockText = (product: Product): string => {
    const higherUnits = product.units.filter(u => !u.isBase && u.conversionRate > 1);
    if (higherUnits.length === 0) {
      return `${product.stockBaseUnits.toLocaleString('vi-VN')} ${product.baseUnit}`;
    }

    const primaryHigher = higherUnits[0];
    const higherQty = Math.floor(product.stockBaseUnits / primaryHigher.conversionRate);
    const remainderBase = product.stockBaseUnits % primaryHigher.conversionRate;

    return `${higherQty} ${primaryHigher.name} ${remainderBase > 0 ? `${remainderBase} ${product.baseUnit}` : ''} (= ${product.stockBaseUnits.toLocaleString('vi-VN')} ${product.baseUnit})`;
  };

  // Add & update products
  const addProduct = async (product: Product) => {
    setProducts(prev => [product, ...prev]);
    showToast(`✅ Đã thêm sản phẩm: ${product.name}`);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => prev.map(p => (p.id === product.id ? data.data : p)));
      }
    } catch (err) {
      console.error('Error persisting product:', err);
    }
  };

  const updateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
    showToast(`✅ Đã cập nhật sản phẩm: ${product.sku}`);
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('🗑️ Đã xóa sản phẩm khỏi danh mục quản lý');
    try {
      await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const addCustomer = async (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
    showToast(`✅ Đã thêm khách hàng mới: ${customer.name}`);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCustomers(prev => prev.map(c => (c.id === customer.id ? data.data : c)));
      }
    } catch (err) {
      console.error('Error persisting customer:', err);
    }
  };

  const updateCustomer = async (customer: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === customer.id ? customer : c)));
    showToast(`✅ Đã cập nhật đối tác: ${customer.name}`);
    try {
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
    } catch (err) {
      console.error('Error updating customer:', err);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    showToast('🗑️ Đã xóa đối tác khách hàng');
    try {
      await fetch(`/api/customers?id=${customerId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  // Quick Customer Debt Payment
  const recordCustomerPayment = (customerId: string, amount: number, paymentMethod: string, notes: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newDebt = Math.max(0, customer.currentDebt - amount);
    // Reduce debt aging proportionally starting from oldest
    let remainingToReduce = amount;
    const newAging = { ...customer.debtAging };

    if (remainingToReduce > 0 && newAging.over90 > 0) {
      const reduce = Math.min(newAging.over90, remainingToReduce);
      newAging.over90 -= reduce;
      remainingToReduce -= reduce;
    }
    if (remainingToReduce > 0 && newAging.days61to90 > 0) {
      const reduce = Math.min(newAging.days61to90, remainingToReduce);
      newAging.days61to90 -= reduce;
      remainingToReduce -= reduce;
    }
    if (remainingToReduce > 0 && newAging.days31to60 > 0) {
      const reduce = Math.min(newAging.days31to60, remainingToReduce);
      newAging.days31to60 -= reduce;
      remainingToReduce -= reduce;
    }
    if (remainingToReduce > 0 && newAging.within30 > 0) {
      const reduce = Math.min(newAging.within30, remainingToReduce);
      newAging.within30 -= reduce;
      remainingToReduce -= reduce;
    }

    const updatedCustomer: Customer = {
      ...customer,
      currentDebt: newDebt,
      debtAging: newAging
    };

    updateCustomer(updatedCustomer);

    // Record cash transaction
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      code: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'thu',
      category: 'Thu nợ khách hàng',
      amount,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      person: customer.name,
      description: `Thu nợ (${paymentMethod}): ${notes || 'Thanh toán công nợ theo thỏa thuận'}`
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist cash transaction to DB
    fetch('/api/cashflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newTx.code,
        type: 'thu',
        category: 'Thu nợ khách hàng',
        amount,
        person: customer.name,
        description: newTx.description,
        partnerType: 'customer',
        partnerId: customer.id,
        partnerName: customer.name,
        paymentMethod: paymentMethod === 'cash' ? 'cash' : 'bank_transfer',
      }),
    }).catch(err => console.error('Error recording payment transaction in DB:', err));

    // Update current shift cashSales if cash payment
    if (paymentMethod === 'cash') {
      setShifts(prev => {
        return prev.map(s => {
          if (!s.isClosed) {
            return {
              ...s,
              cashSales: s.cashSales + amount,
              expectedCash: s.expectedCash + amount
            };
          }
          return s;
        });
      });
    }

    showToast(`💰 Đã thu ${amount.toLocaleString('vi-VN')} đ từ ${customer.name}`);
  };

  // Employee Management Functions
  const addEmployee = async (emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
    showToast(`👤 Đã thêm nhân viên: ${emp.name} (${emp.roleTitle})`);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEmployees(prev => prev.map(e => (e.id === emp.id ? data.data : e)));
      }
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const updateEmployee = async (emp: Employee) => {
    setEmployees(prev => prev.map(e => (e.id === emp.id ? emp : e)));
    showToast(`✅ Đã cập nhật thông tin nhân sự: ${emp.name}`);
    try {
      await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
    } catch (err) {
      console.error('Error updating employee:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast('🗑️ Đã xóa hồ sơ nhân viên');
    try {
      await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  // Supplier Management Functions
  const addSupplier = async (sup: Supplier) => {
    setSuppliers(prev => [sup, ...prev]);
    showToast(`🏢 Đã thêm nhà cung cấp: ${sup.name}`);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sup),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSuppliers(prev => prev.map(s => (s.id === sup.id ? data.data : s)));
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
    }
  };

  const updateSupplier = async (sup: Supplier) => {
    setSuppliers(prev => prev.map(s => (s.id === sup.id ? sup : s)));
    showToast(`✅ Đã cập nhật nhà cung cấp: ${sup.name}`);
    try {
      await fetch('/api/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sup),
      });
    } catch (err) {
      console.error('Error updating supplier:', err);
    }
  };

  const deleteSupplier = async (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    showToast('🗑️ Đã xóa nhà cung cấp');
    try {
      await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  const recordSupplierPayment = (supplierId: string, amount: number, paymentMethod: string, notes: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const newDebt = Math.max(0, supplier.currentDebt - amount);
    setSuppliers(prev => prev.map(s => (s.id === supplierId ? { ...s, currentDebt: newDebt } : s)));

    // Record cash payment transaction
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      code: `PC-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'chi',
      category: 'Chi trả tiền hàng nhà cung cấp',
      amount,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      person: supplier.name,
      description: `Chi trả nợ NCC (${paymentMethod}): ${notes || 'Thanh toán tiền hàng nhập'}`
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist supplier debt update & cash transaction
    fetch('/api/suppliers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: supplierId, currentDebt: newDebt }),
    }).catch(err => console.error('Error updating supplier debt in DB:', err));

    fetch('/api/cashflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newTx.code,
        type: 'chi',
        category: 'Chi trả tiền hàng nhà cung cấp',
        amount,
        person: supplier.name,
        description: newTx.description,
        partnerType: 'supplier',
        partnerId: supplier.id,
        partnerName: supplier.name,
        paymentMethod: paymentMethod === 'cash' ? 'cash' : 'bank_transfer',
      }),
    }).catch(err => console.error('Error recording supplier payment transaction in DB:', err));

    // Update current shift cash if paid in cash
    if (paymentMethod === 'cash') {
      setShifts(prev =>
        prev.map(s => {
          if (!s.isClosed) {
            return {
              ...s,
              expectedCash: Math.max(0, s.expectedCash - amount)
            };
          }
          return s;
        })
      );
    }

    showToast(`💸 Đã thanh toán ${amount.toLocaleString('vi-VN')} đ cho ${supplier.name}`);
  };

  // Inventory Inbound / Outbound / Stocktake Functions (Xuất Nhập Tồn)
  const addInboundReceipt = (receiptData: Omit<StockInboundReceipt, 'id' | 'code'>) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counter = Math.floor(100 + Math.random() * 900);
    const newReceipt: StockInboundReceipt = {
      ...receiptData,
      id: `inbound-${Date.now()}`,
      code: `PNK-${dateStr}-${counter}`
    };

    // Update product stocks
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const inboundItem = newReceipt.items.find(i => i.productId === prod.id);
        if (inboundItem) {
          const addedBaseQty = inboundItem.quantity * inboundItem.conversionRate;
          return {
            ...prod,
            stockBaseUnits: prod.stockBaseUnits + addedBaseQty
          };
        }
        return prod;
      })
    );

    // Update supplier debt & purchase volume
    if (newReceipt.supplierId) {
      setSuppliers(prevSuppliers =>
        prevSuppliers.map(s => {
          if (s.id === newReceipt.supplierId) {
            return {
              ...s,
              currentDebt: s.currentDebt + newReceipt.debtAmount,
              totalPurchased: s.totalPurchased + newReceipt.totalCost
            };
          }
          return s;
        })
      );
    }

    // Record cash payment transaction if paidAmount > 0
    if (newReceipt.paidAmount > 0) {
      const newTx: CashTransaction = {
        id: `tx-${Date.now()}`,
        code: `PC-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'chi',
        category: 'Chi tiền nhập kho hàng hóa',
        amount: newReceipt.paidAmount,
        date: newReceipt.date,
        person: newReceipt.supplierName,
        description: `Thanh toán phiếu nhập kho ${newReceipt.code}`
      };
      setTransactions(prev => [newTx, ...prev]);

      if (newReceipt.paymentMethod === 'cash') {
        setShifts(prev =>
          prev.map(s => {
            if (!s.isClosed) {
              return {
                ...s,
                expectedCash: Math.max(0, s.expectedCash - newReceipt.paidAmount)
              };
            }
            return s;
          })
        );
      }
    }

    setInbounds(prev => [newReceipt, ...prev]);

    // Persist to DB
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'inbound', ...receiptData }),
    }).catch(err => console.error('Error saving inbound to DB:', err));

    showToast(`📦 Đã tạo phiếu nhập kho ${newReceipt.code} thành công!`);
  };

  const addOutboundReceipt = (receiptData: Omit<StockOutboundReceipt, 'id' | 'code'>) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counter = Math.floor(100 + Math.random() * 900);
    const newReceipt: StockOutboundReceipt = {
      ...receiptData,
      id: `outbound-${Date.now()}`,
      code: `PXK-${dateStr}-${counter}`
    };

    // Decrease product stocks
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const outboundItem = newReceipt.items.find(i => i.productId === prod.id);
        if (outboundItem) {
          const removedBaseQty = outboundItem.quantity * outboundItem.conversionRate;
          return {
            ...prod,
            stockBaseUnits: Math.max(0, prod.stockBaseUnits - removedBaseQty)
          };
        }
        return prod;
      })
    );

    setOutbounds(prev => [newReceipt, ...prev]);

    // Persist to DB
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'outbound', ...receiptData }),
    }).catch(err => console.error('Error saving outbound to DB:', err));

    showToast(`📤 Đã tạo phiếu xuất kho ${newReceipt.code} thành công!`);
  };

  const addStocktakeReport = (reportData: Omit<StocktakeReport, 'id' | 'code'>) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counter = Math.floor(100 + Math.random() * 900);
    const newReport: StocktakeReport = {
      ...reportData,
      id: `stocktake-${Date.now()}`,
      code: `KK-${dateStr}-${counter}`
    };

    setStocktakes(prev => [newReport, ...prev]);
    showToast(`📋 Đã lưu biên bản kiểm kê kho ${newReport.code}`);
  };

  const reconcileStocktake = (items: { productId: string; actualStock: number }[]) => {
    setProducts(prev =>
      prev.map(p => {
        const matched = items.find(i => i.productId === p.id);
        if (matched) {
          return {
            ...p,
            stockBaseUnits: matched.actualStock
          };
        }
        return p;
      })
    );
    showToast('⚖️ Đã cân bằng số lượng tồn kho theo số liệu thực tế kiểm kê!');
  };

  // Return & Refund Management Functions (Quản lý đổi trả hàng)
  const addReturnReceipt = (receiptData: Omit<ReturnReceipt, 'id' | 'code'>) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counter = Math.floor(100 + Math.random() * 900);
    const newReceipt: ReturnReceipt = {
      ...receiptData,
      id: `ret-${Date.now()}`,
      code: `PTH-${dateStr}-${counter}`
    };

    if (newReceipt.type === 'customer_return') {
      // Return stock for restockable items
      setProducts(prev =>
        prev.map(prod => {
          const retItem = newReceipt.items.find(i => i.productId === prod.id);
          if (retItem && retItem.condition === 'restock') {
            const addQty = retItem.quantity * retItem.conversionRate;
            return {
              ...prod,
              stockBaseUnits: prod.stockBaseUnits + addQty
            };
          }
          return prod;
        })
      );

      // Handle refund method
      if (newReceipt.refundMethod === 'cash') {
        const newTx: CashTransaction = {
          id: `tx-${Date.now()}`,
          code: `PC-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'chi',
          category: 'Hoàn tiền trả hàng khách lẻ/sỉ',
          amount: newReceipt.totalRefundAmount,
          date: newReceipt.date,
          person: newReceipt.partnerName,
          description: `Hoàn tiền phiếu trả hàng ${newReceipt.code}`
        };
        setTransactions(prev => [newTx, ...prev]);

        setShifts(prev =>
          prev.map(s => {
            if (!s.isClosed) {
              return {
                ...s,
                expectedCash: Math.max(0, s.expectedCash - newReceipt.totalRefundAmount)
              };
            }
            return s;
          })
        );
      } else if (newReceipt.refundMethod === 'debt_deduction') {
        setCustomers(prev =>
          prev.map(c => {
            if (c.id === newReceipt.partnerId) {
              return {
                ...c,
                currentDebt: Math.max(0, c.currentDebt - newReceipt.totalRefundAmount)
              };
            }
            return c;
          })
        );
      }
    } else if (newReceipt.type === 'supplier_return') {
      // Deduct items returned to supplier from inventory
      setProducts(prev =>
        prev.map(prod => {
          const retItem = newReceipt.items.find(i => i.productId === prod.id);
          if (retItem) {
            const deductQty = retItem.quantity * retItem.conversionRate;
            return {
              ...prod,
              stockBaseUnits: Math.max(0, prod.stockBaseUnits - deductQty)
            };
          }
          return prod;
        })
      );

      // Reduce supplier debt by refund amount
      setSuppliers(prev =>
        prev.map(s => {
          if (s.id === newReceipt.partnerId) {
            return {
              ...s,
              currentDebt: Math.max(0, s.currentDebt - newReceipt.totalRefundAmount)
            };
          }
          return s;
        })
      );
    }

    setReturns(prev => [newReceipt, ...prev]);

    // Persist return receipt to DB
    fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData),
    }).catch(err => console.error('Error saving return receipt to DB:', err));

    showToast(`🔄 Đã lập phiếu trả hàng ${newReceipt.code} thành công!`);
  };

  // Serial / IMEI Management Functions
  const addSerial = (serial: SerialItem) => {
    if (serials.some(s => s.serialNumber.trim().toUpperCase() === serial.serialNumber.trim().toUpperCase())) {
      showToast(`⚠️ Mã Serial/IMEI [${serial.serialNumber}] đã tồn tại trong hệ thống!`);
      return;
    }
    const newSerialItem: SerialItem = {
      ...serial,
      serialNumber: serial.serialNumber.trim().toUpperCase(),
      timeline: serial.timeline || [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'imported',
          description: `Đăng ký Serial/IMEI mới vào kho vật tư`,
          actor: currentUser?.name || 'Thủ Kho'
        }
      ]
    };
    setSerials(prev => [newSerialItem, ...prev]);

    // Persist to DB
    fetch('/api/serials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSerialItem),
    }).catch(err => console.error('Error saving serial to DB:', err));

    showToast(`✅ Đã thêm mã Serial/IMEI: ${newSerialItem.serialNumber}`);
  };

  const updateSerial = (updated: SerialItem) => {
    setSerials(prev =>
      prev.map(s => {
        if (s.serialNumber === updated.serialNumber) {
          return {
            ...updated,
            timeline: updated.timeline || s.timeline || []
          };
        }
        return s;
      })
    );

    // Persist to DB
    fetch('/api/serials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('Error updating serial in DB:', err));

    showToast(`✅ Đã cập nhật Serial/IMEI: ${updated.serialNumber}`);
  };

  const deleteSerial = (serialNumber: string) => {
    setSerials(prev => prev.filter(s => s.serialNumber !== serialNumber));

    // Persist deletion to DB
    fetch(`/api/serials?serialNumber=${encodeURIComponent(serialNumber)}`, {
      method: 'DELETE',
    }).catch(err => console.error('Error deleting serial from DB:', err));

    showToast(`🗑️ Đã xóa Serial/IMEI: ${serialNumber}`);
  };

  const bulkAddSerials = (items: SerialItem[]) => {
    const existing = new Set(serials.map(s => s.serialNumber.toUpperCase()));
    const validItems: SerialItem[] = [];
    let duplicateCount = 0;

    for (const item of items) {
      const cleanSn = item.serialNumber.trim().toUpperCase();
      if (!cleanSn) continue;
      if (existing.has(cleanSn)) {
        duplicateCount++;
      } else {
        existing.add(cleanSn);
        validItems.push({
          ...item,
          serialNumber: cleanSn,
          timeline: item.timeline || [
            {
              id: `tl-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
              action: 'imported',
              description: `Nhập hàng loạt ${items.length} Serial/IMEI vào kho`,
              actor: currentUser?.name || 'Thủ Kho'
            }
          ]
        });
      }
    }

    if (validItems.length > 0) {
      setSerials(prev => [...validItems, ...prev]);

      // Bulk persist to DB
      fetch('/api/serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validItems),
      }).catch(err => console.error('Error bulk adding serials to DB:', err));
    }
    showToast(`✅ Đã thêm thành công ${validItems.length} mã Serial!${duplicateCount > 0 ? ` (Bỏ qua ${duplicateCount} mã trùng)` : ''}`);
  };

  // Warranty Management Functions
  const addWarranty = (ticketData: Omit<WarrantyTicket, 'id' | 'code'>) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const counter = Math.floor(100 + Math.random() * 900);
    const newTicket: WarrantyTicket = {
      ...ticketData,
      id: `war-${Date.now()}`,
      code: `PBH-${dateStr}-${counter}`
    };

    // If there is a serial number, update its status to 'rma' and add timeline
    if (newTicket.serialNumber) {
      setSerials(prev =>
        prev.map(s => {
          if (s.serialNumber.toUpperCase() === newTicket.serialNumber?.toUpperCase()) {
            return {
              ...s,
              status: 'rma',
              timeline: [
                ...(s.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  action: 'warranty_received',
                  description: `Tiếp nhận bảo hành sửa chữa theo phiếu ${newTicket.code}`,
                  referenceCode: newTicket.code,
                  actor: newTicket.technicianName
                }
              ]
            };
          }
          return s;
        })
      );
    }

    setWarranties(prev => [newTicket, ...prev]);

    // Persist to DB
    fetch('/api/warranties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    }).catch(err => console.error('Error saving warranty ticket to DB:', err));

    showToast(`🛡️ Đã tạo phiếu tiếp nhận bảo hành: ${newTicket.code}`);
  };

  const updateWarranty = (ticket: WarrantyTicket) => {
    setWarranties(prev =>
      prev.map(w => {
        if (w.id === ticket.id) {
          // If status changes to returned_to_customer and has serial, update serial status back
          if (ticket.status === 'returned_to_customer' && ticket.serialNumber) {
            setSerials(sp =>
              sp.map(s => {
                if (s.serialNumber.toUpperCase() === ticket.serialNumber?.toUpperCase()) {
                  return {
                    ...s,
                    status: s.customerName ? 'sold' : 'in_stock',
                    timeline: [
                      ...(s.timeline || []),
                      {
                        id: `tl-${Date.now()}`,
                        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                        action: 'warranty_returned',
                        description: `Hoàn tất bảo hành/sửa chữa và bàn giao trả khách theo phiếu ${ticket.code}`,
                        referenceCode: ticket.code,
                        actor: ticket.technicianName
                      }
                    ]
                  };
                }
                return s;
              })
            );
          }
          return ticket;
        }
        return w;
      })
    );

    // Persist update to DB
    fetch('/api/warranties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    }).catch(err => console.error('Error updating warranty ticket in DB:', err));

    showToast(`✅ Đã cập nhật phiếu bảo hành: ${ticket.code}`);
  };

  const deleteWarranty = (ticketId: string) => {
    setWarranties(prev => prev.filter(w => w.id !== ticketId));

    // Persist deletion to DB
    fetch(`/api/warranties?id=${ticketId}`, {
      method: 'DELETE',
    }).catch(err => console.error('Error deleting warranty ticket from DB:', err));

    showToast('🗑️ Đã xóa phiếu bảo hành khỏi hệ thống');
  };

  const addWarrantyServiceRecord = (ticketId: string, record: Omit<WarrantyServiceRecord, 'id'>) => {
    const newRecord: WarrantyServiceRecord = {
      ...record,
      id: `rec-${Date.now()}`
    };

    setWarranties(prev =>
      prev.map(w => {
        if (w.id === ticketId) {
          const updatedRecords = [...w.serviceRecords, newRecord];
          const newTotalCost = w.totalCost + (record.cost || 0);

          // Persist update to DB
          fetch('/api/warranties', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ticketId, serviceRecords: updatedRecords, totalCost: newTotalCost }),
          }).catch(err => console.error('Error updating warranty service record in DB:', err));

          return {
            ...w,
            serviceRecords: updatedRecords,
            totalCost: newTotalCost
          };
        }
        return w;
      })
    );
    showToast(`🔧 Đã ghi nhận lịch sử dịch vụ kỹ thuật cho phiếu bảo hành`);
  };

  // Multi-tab POS functions
  const addTab = () => {
    const newTabNumber = tabs.length + 1;
    const newTab: POSTab = {
      id: `tab-${Date.now()}`,
      name: `Đơn ${newTabNumber} (Mới)`,
      customerId: 'cust-5', // Khách lẻ mặc định
      tierPrice: 'retail',
      items: [],
      discountAmount: 0,
      shippingFee: 0,
      paidAmount: 0,
      notes: '',
      requiresManagerPin: false,
      pinOverrideGranted: false,
      requiresCreditApproval: false,
      creditApprovalGranted: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      // Don't close last tab, just reset it
      setTabs([
        {
          id: `tab-${Date.now()}`,
          name: 'Đơn 1 (Mới)',
          customerId: 'cust-5',
          tierPrice: 'retail',
          items: [],
          discountAmount: 0,
          shippingFee: 0,
          paidAmount: 0,
          notes: '',
          requiresManagerPin: false,
          pinOverrideGranted: false,
          requiresCreditApproval: false,
          creditApprovalGranted: false
        }
      ]);
      return;
    }

    const filtered = tabs.filter(t => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[0].id);
    }
  };

  const setTabCustomer = (tabId: string, customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    const tierMap: Record<string, TierPriceType> = {
      kim_cuong: 'vip',
      vang: 'vip',
      bac: 'wholesale',
      dong: 'retail'
    };
    const defaultTier = cust ? tierMap[cust.tier] || 'retail' : 'retail';

    setTabs(prev =>
      prev.map(t => {
        if (t.id === tabId) {
          const updated = {
            ...t,
            customerId,
            tierPrice: defaultTier,
            name: cust && cust.code !== 'KH-00508' ? `Đơn (${cust.name.split(' ')[0]} ${cust.name.split(' ')[1] || ''})` : t.name
          };
          // Recalculate item prices based on customer tier
          updated.items = updated.items.map(item => {
            const prod = products.find(p => p.id === item.productId);
            if (!prod) return item;
            const unit = prod.units.find(u => u.name === item.selectedUnit) || prod.units[0];
            const price = defaultTier === 'vip' ? unit.priceVip : defaultTier === 'wholesale' ? unit.priceWholesale : unit.priceRetail;
            return {
              ...item,
              unitPrice: price,
              totalPrice: price * item.quantity
            };
          });
          return checkTabRules(updated);
        }
        return t;
      })
    );
  };

  const setTabTierPrice = (tabId: string, tier: TierPriceType) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id === tabId) {
          const updated = { ...t, tierPrice: tier };
          updated.items = updated.items.map(item => {
            const prod = products.find(p => p.id === item.productId);
            if (!prod) return item;
            const unit = prod.units.find(u => u.name === item.selectedUnit) || prod.units[0];
            const price = tier === 'vip' ? unit.priceVip : tier === 'wholesale' ? unit.priceWholesale : unit.priceRetail;
            return {
              ...item,
              unitPrice: price,
              totalPrice: price * item.quantity
            };
          });
          return checkTabRules(updated);
        }
        return t;
      })
    );
  };

  // Rule checker for anti-loss and credit limit
  const checkTabRules = (tab: POSTab): POSTab => {
    // 1. Anti-fraud & Anti-Loss check
    let hasAntiLoss = false;
    for (const item of tab.items) {
      // If discount > 10% or selling price < cost price per selected unit
      if (item.discountPercent > 10 || item.unitPrice < item.costPricePerUnit) {
        hasAntiLoss = true;
        break;
      }
    }

    // 2. Credit limit check
    const cust = customers.find(c => c.id === tab.customerId);
    const subtotal = tab.items.reduce((sum, it) => sum + it.totalPrice, 0);
    const totalOrder = Math.max(0, subtotal - tab.discountAmount + tab.shippingFee);
    const debtIncurred = Math.max(0, totalOrder - tab.paidAmount);

    let exceedsCredit = false;
    if (cust && cust.creditLimit > 0 && debtIncurred > 0) {
      if (cust.currentDebt + debtIncurred > cust.creditLimit) {
        exceedsCredit = true;
      }
    }

    return {
      ...tab,
      requiresManagerPin: hasAntiLoss && !tab.pinOverrideGranted,
      requiresCreditApproval: exceedsCredit && !tab.creditApprovalGranted
    };
  };

  const addItemToTab = (tabId: string, product: Product, unitName?: string) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;

        const chosenUnit = unitName
          ? product.units.find(u => u.name === unitName) || product.units[0]
          : product.units[0];

        const unitPrice =
          t.tierPrice === 'vip'
            ? chosenUnit.priceVip
            : t.tierPrice === 'wholesale'
            ? chosenUnit.priceWholesale
            : chosenUnit.priceRetail;

        const costPricePerUnit = product.costPrice * chosenUnit.conversionRate;

        // Check if item already exists with the same unit
        const existingIdx = t.items.findIndex(
          it => it.productId === product.id && it.selectedUnit === chosenUnit.name
        );

        let newItems = [...t.items];
        if (existingIdx >= 0) {
          const existing = newItems[existingIdx];
          const newQty = existing.quantity + 1;
          newItems[existingIdx] = {
            ...existing,
            quantity: newQty,
            totalPrice: existing.unitPrice * newQty * (1 - existing.discountPercent / 100)
          };
        } else {
          newItems.push({
            productId: product.id,
            sku: product.sku,
            name: product.name,
            category: product.category,
            selectedUnit: chosenUnit.name,
            conversionRate: chosenUnit.conversionRate,
            quantity: 1,
            unitPrice,
            costPricePerUnit,
            totalPrice: unitPrice,
            discountPercent: 0
          });
        }

        const subtotal = newItems.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - t.discountAmount + t.shippingFee);

        return checkTabRules({
          ...t,
          items: newItems,
          paidAmount: total // default to full payment
        });
      })
    );
  };

  const updateCartItemQty = (tabId: string, productId: string, unitName: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromTab(tabId, productId, unitName);
      return;
    }

    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        const newItems = t.items.map(it => {
          if (it.productId === productId && it.selectedUnit === unitName) {
            const price = it.unitPrice * quantity * (1 - it.discountPercent / 100);
            return {
              ...it,
              quantity,
              totalPrice: price
            };
          }
          return it;
        });

        const subtotal = newItems.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - t.discountAmount + t.shippingFee);

        return checkTabRules({
          ...t,
          items: newItems,
          paidAmount: total
        });
      })
    );
  };

  const updateCartItemPrice = (
    tabId: string,
    productId: string,
    unitName: string,
    unitPrice: number,
    discountPercent: number
  ) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        const newItems = t.items.map(it => {
          if (it.productId === productId && it.selectedUnit === unitName) {
            const total = unitPrice * it.quantity * (1 - discountPercent / 100);
            return {
              ...it,
              unitPrice,
              discountPercent,
              totalPrice: total
            };
          }
          return it;
        });

        const subtotal = newItems.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - t.discountAmount + t.shippingFee);

        return checkTabRules({
          ...t,
          items: newItems,
          paidAmount: total
        });
      })
    );
  };

  const updateCartItemUnit = (tabId: string, productId: string, oldUnitName: string, newUnitName: string) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        const prod = products.find(p => p.id === productId);
        if (!prod) return t;
        const unit = prod.units.find(u => u.name === newUnitName) || prod.units[0];

        const price =
          t.tierPrice === 'vip'
            ? unit.priceVip
            : t.tierPrice === 'wholesale'
            ? unit.priceWholesale
            : unit.priceRetail;

        const newItems = t.items.map(it => {
          if (it.productId === productId && it.selectedUnit === oldUnitName) {
            return {
              ...it,
              selectedUnit: unit.name,
              conversionRate: unit.conversionRate,
              unitPrice: price,
              costPricePerUnit: prod.costPrice * unit.conversionRate,
              totalPrice: price * it.quantity * (1 - it.discountPercent / 100)
            };
          }
          return it;
        });

        const subtotal = newItems.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - t.discountAmount + t.shippingFee);

        return checkTabRules({
          ...t,
          items: newItems,
          paidAmount: total
        });
      })
    );
  };

  const removeItemFromTab = (tabId: string, productId: string, unitName: string) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        const newItems = t.items.filter(
          it => !(it.productId === productId && it.selectedUnit === unitName)
        );

        const subtotal = newItems.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - t.discountAmount + t.shippingFee);

        return checkTabRules({
          ...t,
          items: newItems,
          paidAmount: total
        });
      })
    );
  };

  const setTabDiscount = (tabId: string, discountAmount: number) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        const subtotal = t.items.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - discountAmount + t.shippingFee);
        return checkTabRules({
          ...t,
          discountAmount,
          paidAmount: total
        });
      })
    );
  };

  const setTabShipping = (tabId: string, shippingFee: number) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        const subtotal = t.items.reduce((s, it) => s + it.totalPrice, 0);
        const total = Math.max(0, subtotal - t.discountAmount + shippingFee);
        return checkTabRules({
          ...t,
          shippingFee,
          paidAmount: total
        });
      })
    );
  };

  const setTabPaidAmount = (tabId: string, paidAmount: number) => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id !== tabId) return t;
        return checkTabRules({
          ...t,
          paidAmount
        });
      })
    );
  };

  const setTabNotes = (tabId: string, notes: string) => {
    setTabs(prev => prev.map(t => (t.id === tabId ? { ...t, notes } : t)));
  };

  // Checkout order
  const checkoutTab = (tabId: string, paymentMethod: PaymentMethod): Order | null => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.items.length === 0) return null;

    if (tab.requiresManagerPin && !tab.pinOverrideGranted) {
      showToast('⚠️ Đơn hàng cần nhập Mã PIN Quản Trị chống bán lỗ trước khi thanh toán!');
      return null;
    }

    if (tab.requiresCreditApproval && !tab.creditApprovalGranted) {
      showToast('⚠️ Đơn hàng vượt hạn mức công nợ! Cần gửi yêu cầu duyệt nợ tới Quản trị viên.');
      return null;
    }

    const subtotal = tab.items.reduce((s, it) => s + it.totalPrice, 0);
    const totalAmount = Math.max(0, subtotal - tab.discountAmount + tab.shippingFee);
    const paidAmount = paymentMethod === 'debt' ? 0 : Math.min(totalAmount, tab.paidAmount);
    const debtAmount = Math.max(0, totalAmount - paidAmount);

    const cust = customers.find(c => c.id === tab.customerId);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `DH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      customerId: tab.customerId,
      customerName: cust ? cust.name : 'Khách lẻ trực tiếp',
      customerPhone: cust ? cust.phone : '0900.000.000',
      items: [...tab.items],
      subtotal,
      discountAmount: tab.discountAmount,
      shippingFee: tab.shippingFee,
      totalAmount,
      paidAmount,
      debtAmount,
      paymentMethod,
      status: 'completed',
      cashierName: role === 'admin' ? 'Quản Trị Viên' : 'Thu Ngân Ca Sáng',
      notes: tab.notes,
      hasPinOverride: tab.pinOverrideGranted
    };

    // Deduct stock in base units
    setProducts(prevProds => {
      return prevProds.map(p => {
        const itemDeduction = tab.items
          .filter(it => it.productId === p.id)
          .reduce((sum, it) => sum + it.quantity * it.conversionRate, 0);

        if (itemDeduction > 0) {
          const remaining = Math.max(0, p.stockBaseUnits - itemDeduction);
          if (remaining <= p.minStockAlert) {
            dispatchTelegramAlert(
              'low_stock',
              '🚨 CẢNH BÁO TỒN KHO AN TOÀN',
              `Sản phẩm: ${p.name} vừa xuất kho ${itemDeduction} ${p.baseUnit}. Tồn thực tế còn: ${remaining} ${p.baseUnit} (Chạm mức an toàn ${p.minStockAlert}).`
            );
          }
          return {
            ...p,
            stockBaseUnits: remaining
          };
        }
        return p;
      });
    });

    // Update customer debt if any
    if (cust && debtAmount > 0) {
      const updatedCust: Customer = {
        ...cust,
        currentDebt: cust.currentDebt + debtAmount,
        debtAging: {
          ...cust.debtAging,
          within30: cust.debtAging.within30 + debtAmount
        }
      };
      updateCustomer(updatedCust);

      if (updatedCust.currentDebt > updatedCust.creditLimit) {
        dispatchTelegramAlert(
          'credit_limit',
          '⚠️ CÔNG NỢ VƯỢT HẠN MỨC',
          `Khách hàng: ${cust.name} vừa ghi nợ thêm ${debtAmount.toLocaleString('vi-VN')} đ theo đơn ${newOrder.code}. Tổng dư nợ: ${updatedCust.currentDebt.toLocaleString('vi-VN')} đ (Vượt hạn mức ${updatedCust.creditLimit.toLocaleString('vi-VN')} đ).`
        );
      }
    }

    // Update shift cash totals
    setShifts(prevShifts => {
      return prevShifts.map(s => {
        if (!s.isClosed) {
          const cashAddition = paymentMethod === 'cash' ? paidAmount : 0;
          const qrAddition = paymentMethod === 'vietqr' ? paidAmount : 0;
          const debtAddition = debtAmount;
          return {
            ...s,
            cashSales: s.cashSales + cashAddition,
            vietQrSales: s.vietQrSales + qrAddition,
            debtSales: s.debtSales + debtAddition,
            expectedCash: s.expectedCash + cashAddition
          };
        }
        return s;
      });
    });

    // Add order to orders list
    setOrders(prev => [newOrder, ...prev]);

    // Persist order to PostgreSQL
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setOrders(prev =>
            prev.map(o => (o.id === newOrder.id ? { ...o, id: resData.data.id, code: resData.data.code } : o))
          );
        }
      })
      .catch(err => console.error('Error persisting order to DB:', err));

    // Reset current tab
    setTabs(prev =>
      prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            items: [],
            discountAmount: 0,
            shippingFee: 0,
            paidAmount: 0,
            notes: '',
            requiresManagerPin: false,
            pinOverrideGranted: false,
            requiresCreditApproval: false,
            creditApprovalGranted: false
          };
        }
        return t;
      })
    );

    showToast(`🎉 Đã xuất thành công đơn hàng: ${newOrder.code}`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status }),
    }).catch(err => console.error('Error updating order status in DB:', err));
    showToast(`✅ Đã cập nhật trạng thái đơn: ${status}`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    fetch(`/api/orders?id=${orderId}`, {
      method: 'DELETE',
    }).catch(err => console.error('Error deleting order from DB:', err));
    showToast('🗑️ Đã hủy và xóa hồ sơ đơn hàng');
  };

  // Shift reconciliation
  const currentShift = shifts.find(s => !s.isClosed) || {
    id: `shift-${Date.now()}`,
    cashierName: 'Nguyễn Văn Hùng',
    startedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    openingCash: 2000000,
    cashSales: 0,
    vietQrSales: 0,
    debtSales: 0,
    cashDrops: 0,
    expectedCash: 2000000,
    isClosed: false
  };

  const closeShift = (physicalCash: number, reason?: string) => {
    const variance = physicalCash - currentShift.expectedCash;

    setShifts(prev =>
      prev.map(s => {
        if (s.id === currentShift.id) {
          return {
            ...s,
            closedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            actualCash: physicalCash,
            variance,
            varianceReason: reason,
            isClosed: true,
            managerSignOff: role === 'admin' ? 'Quản Trị Viên (Ký điện tử)' : undefined
          };
        }
        return s;
      })
    );

    // Persist close shift to DB
    fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'close',
        shiftId: currentShift.id,
        actualCash: physicalCash,
        varianceReason: reason,
        managerSignOff: role === 'admin' ? 'Quản Trị Viên (Ký điện tử)' : undefined,
      }),
    }).catch(err => console.error('Error closing shift in DB:', err));

    if (variance !== 0) {
      dispatchTelegramAlert(
        'shift_variance',
        '⚠️ LỆCH KÉT TIỀN CHỐT CA',
        `Thu ngân: ${currentShift.cashierName} chốt ca ghi nhận chênh lệch ${variance > 0 ? '+' : ''}${variance.toLocaleString('vi-VN')} đ (Két hệ thống: ${currentShift.expectedCash.toLocaleString('vi-VN')} đ | Đếm thực tế: ${physicalCash.toLocaleString('vi-VN')} đ). Lý do giải trình: ${reason || 'Không có'}.`
      );
    }

    showToast('🏁 Đã chốt ca bán hàng thành công!');
  };

  const openNewShift = (cashierName: string, openingCash: number) => {
    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      cashierName,
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      openingCash,
      cashSales: 0,
      vietQrSales: 0,
      debtSales: 0,
      cashDrops: 0,
      expectedCash: openingCash,
      isClosed: false
    };

    setShifts(prev => [newShift, ...prev]);

    // Persist open shift to DB
    fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'open',
        cashierName,
        openingCash,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setShifts(prev => prev.map(s => (s.id === newShift.id ? data.data : s)));
        }
      })
      .catch(err => console.error('Error opening shift in DB:', err));

    showToast(`🟢 Đã mở ca mới cho thu ngân: ${cashierName}`);
  };

  const addCashDrop = (amount: number, reason: string) => {
    setShifts(prev =>
      prev.map(s => {
        if (!s.isClosed) {
          return {
            ...s,
            cashDrops: s.cashDrops + amount,
            expectedCash: s.expectedCash - amount
          };
        }
        return s;
      })
    );

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      code: `PC-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'chi',
      category: 'Rút tiền két nộp quỹ chính',
      amount,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      person: currentShift.cashierName,
      description: `Rút két giữa ca: ${reason || 'Giảm tiền mặt tại quầy'}`
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist cash drop to DB
    fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cash_drop',
        shiftId: currentShift.id,
        amount,
        reason,
      }),
    }).catch(err => console.error('Error adding cash drop in DB:', err));

    showToast(`💸 Đã rút ${amount.toLocaleString('vi-VN')} đ từ két nộp quỹ chính`);
  };

  const addTransaction = (tx: Omit<CashTransaction, 'id' | 'code'>) => {
    const newTx: CashTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      code: `${tx.type === 'thu' ? 'PT' : 'PC'}-${Math.floor(10000 + Math.random() * 90000)}`
    };

    // Auto deduct debt if linked to customer or supplier
    if (newTx.type === 'thu' && newTx.partnerType === 'customer' && newTx.partnerId) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === newTx.partnerId) {
            return {
              ...c,
              currentDebt: Math.max(0, c.currentDebt - newTx.amount)
            };
          }
          return c;
        })
      );
    } else if (newTx.type === 'chi' && newTx.partnerType === 'supplier' && newTx.partnerId) {
      setSuppliers(prev =>
        prev.map(s => {
          if (s.id === newTx.partnerId) {
            return {
              ...s,
              currentDebt: Math.max(0, s.currentDebt - newTx.amount)
            };
          }
          return s;
        })
      );
    }

    // Sync with shift cash register if paying cash
    if (newTx.fundType === 'cash') {
      setShifts(prev =>
        prev.map(s => {
          if (!s.isClosed) {
            return {
              ...s,
              expectedCash:
                newTx.type === 'thu'
                  ? s.expectedCash + newTx.amount
                  : Math.max(0, s.expectedCash - newTx.amount)
            };
          }
          return s;
        })
      );
    }

    setTransactions(prev => [newTx, ...prev]);

    // Persist transaction to DB
    fetch('/api/cashflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    }).catch(err => console.error('Error persisting transaction to DB:', err));

    showToast(`✅ Đã lập phiếu ${newTx.type === 'thu' ? 'Thu' : 'Chi'}: ${newTx.code}`);
  };

  // Credit approvals
  const createCreditApprovalRequest = (tabId: string, reason: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const cust = customers.find(c => c.id === tab.customerId);
    if (!cust) return;

    const subtotal = tab.items.reduce((s, it) => s + it.totalPrice, 0);
    const total = Math.max(0, subtotal - tab.discountAmount + tab.shippingFee);
    const debt = Math.max(0, total - tab.paidAmount);
    const excess = cust.currentDebt + debt - cust.creditLimit;

    const newReq: CreditApprovalRequest = {
      id: `appr-${Date.now()}`,
      orderCode: `ĐƠN TẠM (${tab.name})`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      orderTotal: total,
      currentDebt: cust.currentDebt,
      creditLimit: cust.creditLimit,
      excessAmount: Math.max(0, excess),
      requestedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      requestedBy: role === 'admin' ? 'Quản Trị Viên' : 'Thu Ngân Quầy POS',
      reason,
      status: 'pending',
      messages: [
        {
          sender: role === 'admin' ? 'Quản Trị Viên' : 'Thu Ngân',
          role: role === 'admin' ? 'Admin' : 'Thu Ngân',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: reason
        }
      ]
    };

    setApprovalRequests(prev => [newReq, ...prev]);

    setTabs(prev =>
      prev.map(t => (t.id === tabId ? { ...t, approvalRequestId: newReq.id } : t))
    );

    // Persist approval request to DB
    fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch(err => console.error('Error creating approval request in DB:', err));

    dispatchTelegramAlert(
      'credit_limit',
      '📢 YÊU CẦU DUYỆT CÔNG NỢ MỚI',
      `Khách hàng ${cust.name} xin vượt hạn mức nợ ${Math.max(0, excess).toLocaleString('vi-VN')} đ. Lý do: "${reason}". Vui lòng kiểm tra mục Thảo luận duyệt nợ.`
    );

    showToast('📨 Đã gửi yêu cầu phê duyệt nợ tới Quản Trị Viên!');
  };

  const resolveCreditApproval = (requestId: string, approved: boolean, note?: string) => {
    setApprovalRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: approved ? 'approved' : 'rejected',
            resolvedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            resolvedBy: 'Quản Trị Viên (Admin)',
            messages: [
              ...r.messages,
              {
                sender: 'Quản Trị Viên',
                role: 'Admin',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                text: approved
                  ? `[ĐÃ PHÊ DUYỆT ĐƠN 1 LẦN]: ${note || 'Cho phép xuất kho nợ đợt này.'}`
                  : `[ĐÃ TỪ CHỐI DUYỆT NỢ]: ${note || 'Yêu cầu khách thanh toán nợ cũ trước.'}`
              }
            ]
          };
        }
        return r;
      })
    );

    // Persist approval resolution to DB
    fetch('/api/approvals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: requestId,
        status: approved ? 'approved' : 'rejected',
        resolvedBy: 'Quản Trị Viên (Admin)',
        note,
      }),
    }).catch(err => console.error('Error updating approval resolution in DB:', err));

    if (approved) {
      // Grant credit approval to tabs referencing this request
      setTabs(prev =>
        prev.map(t => {
          if (t.approvalRequestId === requestId) {
            return {
              ...t,
              creditApprovalGranted: true,
              requiresCreditApproval: false
            };
          }
          return t;
        })
      );
      showToast('🟢 Quản trị viên đã phê duyệt cấp nợ 1 lần cho đơn hàng!');
    } else {
      showToast('🔴 Đã từ chối cấp nợ vượt trần.');
    }
  };

  const addApprovalMessage = (requestId: string, text: string) => {
    setApprovalRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            messages: [
              ...r.messages,
              {
                sender: role === 'admin' ? 'Quản Trị Viên' : 'Thu Ngân',
                role: role === 'admin' ? 'Admin' : 'Thu Ngân',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                text
              }
            ]
          };
        }
        return r;
      })
    );
  };

  // Modals helpers
  const openPrintModal = (mode: 'k80' | 'a5' | 'a6', order: Order) => {
    setPrintModal({ isOpen: true, mode, order });
  };

  const closePrintModal = () => {
    setPrintModal(prev => ({ ...prev, isOpen: false }));
  };

  const openVietQrModal = (amount: number, orderCode: string, customerName?: string, onSuccess?: () => void) => {
    setVietQrModal({ isOpen: true, amount, orderCode, customerName, onSuccess });
  };

  const closeVietQrModal = () => {
    setVietQrModal(prev => ({ ...prev, isOpen: false }));
  };

  const openPinModal = (reason: string, onSuccess: () => void) => {
    setPinModal({ isOpen: true, reason, onSuccess });
  };

  const closePinModal = () => {
    setPinModal(prev => ({ ...prev, isOpen: false }));
  };

  const verifyPin = (pin: string): boolean => {
    if (pin === managerPin) {
      // Unlock anti-loss on current active tab
      setTabs(prev =>
        prev.map(t => (t.id === activeTabId ? { ...t, pinOverrideGranted: true, requiresManagerPin: false } : t))
      );
      dispatchTelegramAlert(
        'pin_override',
        '🛡️ MÃ PIN QUẢN TRỊ ĐƯỢC XÁC THỰC',
        `Mã PIN quản trị vừa được nhập mở khóa chống bán lỗ/chiết khấu cho đơn hàng quầy POS.`
      );
      showToast('🔓 Mã PIN Quản Trị chính xác! Đã mở khóa bán lỗ.');
      return true;
    }
    return false;
  };

  const openScannerModal = (onDetected: (code: string) => void) => {
    setScannerModal({ isOpen: true, onDetected });
  };

  const closeScannerModal = () => {
    setScannerModal(prev => ({ ...prev, isOpen: false }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setShifts(INITIAL_SHIFTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setTelegramAlerts(INITIAL_ALERTS);
    setApprovalRequests(INITIAL_APPROVALS);
    setEmployees(INITIAL_EMPLOYEES);
    setSuppliers(INITIAL_SUPPLIERS);
    setInbounds(INITIAL_INBOUNDS);
    setOutbounds(INITIAL_OUTBOUNDS);
    setStocktakes([]);
    setReturns(INITIAL_RETURNS);
    setSerials(INITIAL_SERIALS);
    setWarranties(INITIAL_WARRANTIES);
    setRoleState('admin');
    refreshData();
    showToast('🔄 Đã làm mới và đồng bộ dữ liệu từ Cơ sở dữ liệu!');
  };

  return (
    <ERPContext.Provider
      value={{
        theme,
        toggleTheme,
        role,
        setRole: setRoleState,
        toggleRole,
        canViewCosts,
        canExportExcel,
        currentUser,
        isAuthenticated,
        login,
        logout,
        register,
        resetPassword,
        isLoadingBootstrap,
        refreshData,
        products,
        batches,
        serials,
        addProduct,
        updateProduct,
        deleteProduct,
        getConvertedStockText,
        addSerial,
        updateSerial,
        deleteSerial,
        bulkAddSerials,
        warranties,
        addWarranty,
        updateWarranty,
        deleteWarranty,
        addWarrantyServiceRecord,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordSupplierPayment,
        inbounds,
        outbounds,
        stocktakes,
        addInboundReceipt,
        addOutboundReceipt,
        addStocktakeReport,
        reconcileStocktake,
        returns,
        addReturnReceipt,
        tabs,
        activeTabId,
        setActiveTabId,
        addTab,
        closeTab,
        setTabCustomer,
        setTabTierPrice,
        addItemToTab,
        updateCartItemQty,
        updateCartItemPrice,
        updateCartItemUnit,
        removeItemFromTab,
        setTabDiscount,
        setTabShipping,
        setTabPaidAmount,
        setTabNotes,
        checkoutTab,
        orders,
        updateOrderStatus,
        deleteOrder,
        currentShift,
        shifts,
        closeShift,
        openNewShift,
        addCashDrop,
        transactions,
        addTransaction,
        approvalRequests,
        createCreditApprovalRequest,
        resolveCreditApproval,
        addApprovalMessage,
        printModal,
        openPrintModal,
        closePrintModal,
        vietQrModal,
        openVietQrModal,
        closeVietQrModal,
        pinModal,
        openPinModal,
        closePinModal,
        verifyPin,
        managerPin,
        setManagerPin,
        scannerModal,
        openScannerModal,
        closeScannerModal,
        telegramAlerts,
        dispatchTelegramAlert,
        telegramConfig,
        setTelegramConfig,
        bankConfig,
        setBankConfig,
        resetAllData,
        activeToast,
        showToast
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

