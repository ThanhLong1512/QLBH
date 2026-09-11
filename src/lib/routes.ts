// Route definitions and mapping between internal ERP view IDs and clean URL paths/slugs

export const VIEW_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  pos: '/pos',
  orders: '/don-hang',
  returns: '/tra-hang',
  shift: '/chot-ca',
  products: '/san-pham',
  categories: '/nhom-san-pham',
  units: '/don-vi-tinh',
  inventory: '/xuat-nhap-ton',
  warehouse: '/kho-hang',
  serials: '/serial',
  warranty: '/bao-hanh',
  customers: '/khach-hang',
  suppliers: '/nha-cung-cap',
  employees: '/nhan-vien',
  debt_aging: '/tuoi-no',
  cashflow: '/so-quy',
  approvals: '/phe-duyet',
  reports: '/bao-cao',
  settings: '/cai-dat',
  auth: '/dang-nhap',
  internal_chat: '/chat',
  chat: '/chat',
};

// Map URL slugs (with & without diacritics, English aliases) to ERP view IDs
export const SLUG_TO_VIEW: Record<string, string> = {
  // Empty or root
  '': 'dashboard',
  'dashboard': 'dashboard',

  // Products
  'san-pham': 'products',
  'san-phẩm': 'products',
  'sanpham': 'products',
  'products': 'products',
  'product': 'products',

  // Categories (Nhóm sản phẩm)
  'nhom-san-pham': 'categories',
  'nhóm-sản-phẩm': 'categories',
  'nhomsanpham': 'categories',
  'categories': 'categories',
  'category': 'categories',

  // Units of Measure (Đơn vị tính)
  'don-vi-tinh': 'units',
  'đơn-vị-tính': 'units',
  'donvitinh': 'units',
  'dvt': 'units',
  'units': 'units',
  'unit': 'units',

  // POS
  'pos': 'pos',
  'ban-hang': 'pos',
  'bán-hàng': 'pos',

  // Orders
  'don-hang': 'orders',
  'don-hàng': 'orders',
  'donhang': 'orders',
  'orders': 'orders',
  'order': 'orders',

  // Returns
  'tra-hang': 'returns',
  'trả-hàng': 'returns',
  'trahang': 'returns',
  'returns': 'returns',

  // Shift
  'chot-ca': 'shift',
  'chốt-ca': 'shift',
  'chotca': 'shift',
  'shift': 'shift',

  // Inventory
  'xuat-nhap-ton': 'inventory',
  'xuất-nhập-tồn': 'inventory',
  'xnt': 'inventory',
  'inventory': 'inventory',
  'kiem-ke': 'inventory',

  // Warehouse
  'kho-hang': 'warehouse',
  'kho-hàng': 'warehouse',
  'kho': 'warehouse',
  'warehouse': 'warehouse',

  // Serials
  'serial': 'serials',
  'serials': 'serials',
  'imei': 'serials',

  // Warranty
  'bao-hanh': 'warranty',
  'bảo-hành': 'warranty',
  'warranty': 'warranty',
  'rma': 'warranty',

  // Customers
  'khach-hang': 'customers',
  'khách-hàng': 'customers',
  'khachhang': 'customers',
  'customers': 'customers',

  // Suppliers
  'nha-cung-cap': 'suppliers',
  'nhà-cung-cấp': 'suppliers',
  'ncc': 'suppliers',
  'suppliers': 'suppliers',

  // Employees
  'nhan-vien': 'employees',
  'nhân-viên': 'employees',
  'nhanvien': 'employees',
  'employees': 'employees',

  // Debt Aging
  'tuoi-no': 'debt_aging',
  'tuổi-nợ': 'debt_aging',
  'cong-no': 'debt_aging',
  'debt_aging': 'debt_aging',
  'debt-aging': 'debt_aging',

  // Cashflow
  'so-quy': 'cashflow',
  'sổ-quỹ': 'cashflow',
  'soquy': 'cashflow',
  'cashflow': 'cashflow',
  'thu-chi': 'cashflow',

  // Approvals
  'phe-duyet': 'approvals',
  'phê-duyệt': 'approvals',
  'pheduyet': 'approvals',
  'approvals': 'approvals',

  // Reports
  'bao-cao': 'reports',
  'báo-cáo': 'reports',
  'baocao': 'reports',
  'reports': 'reports',
  'analytics': 'reports',

  // Settings
  'cai-dat': 'settings',
  'cài-đặt': 'settings',
  'caidat': 'settings',
  'settings': 'settings',
  'config': 'settings',

  // Auth
  'dang-nhap': 'auth',
  'đăng-nhập': 'auth',
  'dangnhap': 'auth',
  'auth': 'auth',
  'login': 'auth',

  // Internal Chat
  'chat': 'internal_chat',
  'chat-noi-bo': 'internal_chat',
  'chat-nội-bộ': 'internal_chat',
  'tin-nhan': 'internal_chat',
  'tin-nhắn': 'internal_chat',
  'noi-bo': 'internal_chat',
  'internal-chat': 'internal_chat',
};

/**
 * Returns the ERP view identifier corresponding to a URL slug or path.
 */
export function getViewFromSlug(slug: string): string {
  if (!slug) return 'dashboard';
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  return SLUG_TO_VIEW[cleanSlug] || 'dashboard';
}

/**
 * Returns the browser URL path corresponding to an ERP view ID.
 */
export function getPathFromView(view: string): string {
  return VIEW_ROUTES[view] || '/dashboard';
}
