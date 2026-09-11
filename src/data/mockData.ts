import {
  Product,
  Customer,
  ProductBatch,
  SerialItem,
  Order,
  CashShift,
  CashTransaction,
  TelegramAlert,
  Employee,
  Supplier,
  StockInboundReceipt,
  StockOutboundReceipt,
  ReturnReceipt,
  WarrantyTicket,
  WarehouseTransfer,
  StocktakeReport
} from '../types/erp';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'DM-SAM-43CU8000',
    name: 'Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)',
    category: 'Điện Máy',
    baseUnit: 'Chiếc',
    costPrice: 7200000,
    priceRetail: 8990000,
    priceWholesale: 7950000,
    priceVip: 7650000,
    stockBaseUnits: 28,
    minStockAlert: 10,
    hasSerial: true,
    hasExpiry: false,
    barcode: '8806091823719',
    units: [
      {
        name: 'Chiếc',
        conversionRate: 1,
        isBase: true,
        priceRetail: 8990000,
        priceWholesale: 7950000,
        priceVip: 7650000
      },
      {
        name: 'Kiện (5 Chiếc)',
        conversionRate: 5,
        isBase: false,
        priceRetail: 44000000,
        priceWholesale: 39200000,
        priceVip: 37800000
      }
    ]
  },
  {
    id: 'prod-2',
    sku: 'DM-PANA-NR-BA189',
    name: 'Tủ Lạnh Panasonic Inverter 180 Lít (NR-BA189PAVN)',
    category: 'Điện Máy',
    baseUnit: 'Chiếc',
    costPrice: 4600000,
    priceRetail: 5890000,
    priceWholesale: 5150000,
    priceVip: 4950000,
    stockBaseUnits: 15,
    minStockAlert: 5,
    hasSerial: true,
    hasExpiry: false,
    barcode: '8934822019284',
    units: [
      {
        name: 'Chiếc',
        conversionRate: 1,
        isBase: true,
        priceRetail: 5890000,
        priceWholesale: 5150000,
        priceVip: 4950000
      }
    ]
  },
  {
    id: 'prod-3',
    sku: 'HMP-OMO-MATIC-5L',
    name: 'Nước Giặt OMO Matic Chuyên Dụng Cửa Trước Can 5L',
    category: 'Hóa Mỹ Phẩm',
    baseUnit: 'Can',
    costPrice: 195000,
    priceRetail: 285000,
    priceWholesale: 235000,
    priceVip: 220000,
    stockBaseUnits: 184, // 184 can = 46 thùng (4 can/thùng)
    minStockAlert: 30,
    hasSerial: false,
    hasExpiry: true,
    barcode: '8934868128913',
    units: [
      {
        name: 'Can',
        conversionRate: 1,
        isBase: true,
        priceRetail: 285000,
        priceWholesale: 235000,
        priceVip: 220000
      },
      {
        name: 'Thùng (4 Can)',
        conversionRate: 4,
        isBase: false,
        priceRetail: 1120000,
        priceWholesale: 930000,
        priceVip: 865000
      }
    ]
  },
  {
    id: 'prod-4',
    sku: 'HMP-SUNLIGHT-10KG',
    name: 'Nước Rửa Chén Sunlight Chanh Thiên Nhiên Can 10kg',
    category: 'Hóa Mỹ Phẩm',
    baseUnit: 'Can',
    costPrice: 175000,
    priceRetail: 245000,
    priceWholesale: 205000,
    priceVip: 192000,
    stockBaseUnits: 62,
    minStockAlert: 20,
    hasSerial: false,
    hasExpiry: true,
    barcode: '8934868149182',
    units: [
      {
        name: 'Can',
        conversionRate: 1,
        isBase: true,
        priceRetail: 245000,
        priceWholesale: 205000,
        priceVip: 192000
      },
      {
        name: 'Thùng (2 Can)',
        conversionRate: 2,
        isBase: false,
        priceRetail: 480000,
        priceWholesale: 400000,
        priceVip: 380000
      }
    ]
  },
  {
    id: 'prod-5',
    sku: 'GD-SUNHOUSE-SHD300',
    name: 'Bộ Nồi Inox 5 Đáy Sunhouse Anod Cao Cấp SHD300',
    category: 'Gia Dụng',
    baseUnit: 'Bộ',
    costPrice: 580000,
    priceRetail: 890000,
    priceWholesale: 720000,
    priceVip: 660000,
    stockBaseUnits: 45,
    minStockAlert: 15,
    hasSerial: false,
    hasExpiry: false,
    barcode: '8936081020485',
    units: [
      {
        name: 'Bộ',
        conversionRate: 1,
        isBase: true,
        priceRetail: 890000,
        priceWholesale: 720000,
        priceVip: 660000
      },
      {
        name: 'Thùng (6 Bộ)',
        conversionRate: 6,
        isBase: false,
        priceRetail: 5200000,
        priceWholesale: 4200000,
        priceVip: 3900000
      }
    ]
  },
  {
    id: 'prod-6',
    sku: 'VL-HOLCIM-PCB40',
    name: 'Xi Măng Đa Dụng INSEE/Holcim Power-S PCB40 Bao 50kg',
    category: 'Vật Liệu',
    baseUnit: 'Bao',
    costPrice: 78000,
    priceRetail: 98000,
    priceWholesale: 88000,
    priceVip: 84000,
    stockBaseUnits: 420,
    minStockAlert: 100,
    hasSerial: false,
    hasExpiry: true,
    barcode: '8935049500018',
    units: [
      {
        name: 'Bao',
        conversionRate: 1,
        isBase: true,
        priceRetail: 98000,
        priceWholesale: 88000,
        priceVip: 84000
      },
      {
        name: 'Tấn (20 Bao)',
        conversionRate: 20,
        isBase: false,
        priceRetail: 1940000,
        priceWholesale: 1740000,
        priceVip: 1670000
      }
    ]
  },
  {
    id: 'prod-7',
    sku: 'DM-SONY-WF1000XM5',
    name: 'Tai Nghe Bluetooth True Wireless Sony WF-1000XM5 Chống Ồn',
    category: 'Điện Máy',
    baseUnit: 'Cái',
    costPrice: 4200000,
    priceRetail: 5490000,
    priceWholesale: 4850000,
    priceVip: 4550000,
    stockBaseUnits: 8,
    minStockAlert: 12,
    hasSerial: true,
    hasExpiry: false,
    barcode: '4548736143494',
    units: [
      {
        name: 'Cái',
        conversionRate: 1,
        isBase: true,
        priceRetail: 5490000,
        priceWholesale: 4850000,
        priceVip: 4550000
      },
      {
        name: 'Hộp (5 Cái)',
        conversionRate: 5,
        isBase: false,
        priceRetail: 26900000,
        priceWholesale: 23900000,
        priceVip: 22500000
      }
    ]
  },
  {
    id: 'prod-8',
    sku: 'GD-PHICH-RANGDONG-2L',
    name: 'Phích Nước Nóng Rạng Đông RD 2035 N1 Inox 2.0 Lít',
    category: 'Gia Dụng',
    baseUnit: 'Cái',
    costPrice: 110000,
    priceRetail: 165000,
    priceWholesale: 135000,
    priceVip: 125000,
    stockBaseUnits: 140,
    minStockAlert: 30,
    hasSerial: false,
    hasExpiry: false,
    barcode: '8934563127812',
    units: [
      {
        name: 'Cái',
        conversionRate: 1,
        isBase: true,
        priceRetail: 165000,
        priceWholesale: 135000,
        priceVip: 125000
      },
      {
        name: 'Thùng (12 Cái)',
        conversionRate: 12,
        isBase: false,
        priceRetail: 1920000,
        priceWholesale: 1580000,
        priceVip: 1470000
      }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'KH-00192',
    name: 'Đại Lý Điện Máy Toàn Phát (Anh Tuấn)',
    phone: '0918.234.889',
    address: '142 Quốc Lộ 1A, P. Linh Trung, TP. Thủ Đức, TP. HCM',
    tier: 'kim_cuong',
    creditLimit: 150000000, // 150 triệu
    currentDebt: 98500000,
    taxId: '0315482910',
    debtAging: {
      within30: 65000000,
      days31to60: 25500000,
      days61to90: 8000000,
      over90: 0
    }
  },
  {
    id: 'cust-2',
    code: 'KH-00204',
    name: 'Gara Ô Tô & Phụ Tùng Thành Đạt (Anh Khang)',
    phone: '0903.882.114',
    address: '88 Lê Văn Lương, P. Tân Phong, Quận 7, TP. HCM',
    tier: 'vang',
    creditLimit: 80000000,
    currentDebt: 76800000, // Gần chạm trần nợ (96%)
    taxId: '0316789421',
    debtAging: {
      within30: 32000000,
      days31to60: 28800000,
      days61to90: 16000000,
      over90: 0
    }
  },
  {
    id: 'cust-3',
    code: 'KH-00311',
    name: 'Chuỗi Tạp Hóa & NPP Cô Bảy Long An',
    phone: '0977.412.589',
    address: 'Ấp 2, Xã Đức Hòa Hạ, Huyện Đức Hòa, Tỉnh Long An',
    tier: 'bac',
    creditLimit: 50000000,
    currentDebt: 58500000, // Vượt trần nợ (+8.5 triệu)
    taxId: '1101928374',
    debtAging: {
      within30: 12000000,
      days31to60: 18500000,
      days61to90: 16000000,
      over90: 12000000 // Nợ xấu > 90 ngày
    }
  },
  {
    id: 'cust-4',
    code: 'KH-00455',
    name: 'Công Ty Cổ Phần Xây Dựng An Bình Phát',
    phone: '0989.551.233',
    address: 'Tầng 4 Tòa nhà HUD, P. Hoàng Liệt, Quận Hoàng Mai, Hà Nội',
    tier: 'kim_cuong',
    creditLimit: 300000000,
    currentDebt: 120400000,
    taxId: '0108923412',
    debtAging: {
      within30: 95400000,
      days31to60: 25000000,
      days61to90: 0,
      over90: 0
    }
  },
  {
    id: 'cust-5',
    code: 'KH-00508',
    name: 'Khách Lẻ Mua Trực Tiếp / Vãng Lai',
    phone: '0900.000.000',
    address: 'Bán tại quầy thanh toán ngay',
    tier: 'dong',
    creditLimit: 0,
    currentDebt: 0,
    debtAging: {
      within30: 0,
      days31to60: 0,
      days61to90: 0,
      over90: 0
    }
  }
];

export const INITIAL_BATCHES: ProductBatch[] = [
  {
    batchId: 'LOT-OMO-2026-08',
    sku: 'HMP-OMO-MATIC-5L',
    productionDate: '2025-08-15',
    expiryDate: '2026-08-15',
    quantityBaseUnits: 48,
    warehouseLocation: 'Kệ A3-02 (Kho Tân Bình)',
    daysRemaining: -26 // FEFO cảnh báo cận date
  },
  {
    batchId: 'LOT-OMO-2027-02',
    sku: 'HMP-OMO-MATIC-5L',
    productionDate: '2026-02-10',
    expiryDate: '2027-02-10',
    quantityBaseUnits: 136,
    warehouseLocation: 'Kệ A3-03 (Kho Tân Bình)',
    daysRemaining: 153
  },
  {
    batchId: 'LOT-SUNLIGHT-2026-10',
    sku: 'HMP-SUNLIGHT-10KG',
    productionDate: '2025-10-01',
    expiryDate: '2026-10-01',
    quantityBaseUnits: 22,
    warehouseLocation: 'Kệ B1-01 (Kho Tân Bình)',
    daysRemaining: 21 // Cận date < 30 ngày!
  },
  {
    batchId: 'LOT-HOLCIM-2026-09',
    sku: 'VL-HOLCIM-PCB40',
    productionDate: '2026-08-01',
    expiryDate: '2026-11-01',
    quantityBaseUnits: 420,
    warehouseLocation: 'Kho Bãi 1 (Kho Long An)',
    daysRemaining: 52
  }
];

export const INITIAL_SERIALS: SerialItem[] = [
  {
    serialNumber: 'SN-SAM43-88219401',
    sku: 'DM-SAM-43CU8000',
    productName: 'Smart Tivi Samsung 43 inch (43CU8000)',
    importDate: '2026-08-10',
    supplier: 'Samsung Electronics VN Distribution',
    warrantyUntil: '2028-08-10',
    status: 'in_stock',
    batchNumber: 'LOT-SAM-202608',
    notes: 'Hàng nguyên seal kho Tân Bình Kệ A1-02',
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-08-10 09:30',
        action: 'imported',
        description: 'Nhập kho theo phiếu PNK-20260810-001 từ Samsung Vina',
        referenceCode: 'PNK-20260810-001',
        actor: 'Lê Minh Tuấn'
      }
    ]
  },
  {
    serialNumber: 'SN-SAM43-88219402',
    sku: 'DM-SAM-43CU8000',
    productName: 'Smart Tivi Samsung 43 inch (43CU8000)',
    importDate: '2026-08-10',
    supplier: 'Samsung Electronics VN Distribution',
    orderCode: 'DH-20260908-001',
    customerName: 'Đại Lý Điện Máy Toàn Phát (Anh Tuấn)',
    customerPhone: '0918.234.889',
    warrantyUntil: '2028-08-10',
    status: 'sold',
    batchNumber: 'LOT-SAM-202608',
    timeline: [
      {
        id: 'tl-2',
        timestamp: '2026-08-10 09:30',
        action: 'imported',
        description: 'Nhập kho theo phiếu PNK-20260810-001',
        referenceCode: 'PNK-20260810-001',
        actor: 'Lê Minh Tuấn'
      },
      {
        id: 'tl-3',
        timestamp: '2026-09-08 14:20',
        action: 'sold',
        description: 'Xuất bán cho khách hàng Đại Lý Toàn Phát theo đơn hàng DH-20260908-001',
        referenceCode: 'DH-20260908-001',
        actor: 'Nguyễn Văn Hùng'
      }
    ]
  },
  {
    serialNumber: 'SN-PANA-77310492',
    sku: 'DM-PANA-NR-BA189',
    productName: 'Tủ Lạnh Panasonic Inverter 180 Lít (NR-BA189PAVN)',
    importDate: '2026-07-20',
    supplier: 'Panasonic Appliances Vietnam',
    warrantyUntil: '2028-07-20',
    status: 'in_stock',
    notes: 'Kệ B2-01 Kho Tân Bình',
    timeline: [
      {
        id: 'tl-4',
        timestamp: '2026-07-20 10:15',
        action: 'imported',
        description: 'Nhập kho từ nhà cung cấp Panasonic',
        referenceCode: 'PNK-20260720-003',
        actor: 'Lê Minh Tuấn'
      }
    ]
  },
  {
    serialNumber: 'SN-SONY-WF5-99210',
    sku: 'DM-SONY-WF1000XM5',
    productName: 'Tai Nghe Bluetooth Sony WF-1000XM5',
    importDate: '2026-08-25',
    supplier: 'Sony Vietnam Co., Ltd',
    orderCode: 'DH-20260907-004',
    customerName: 'Gara Ô Tô & Phụ Tùng Thành Đạt (Anh Khang)',
    customerPhone: '0903.882.114',
    warrantyUntil: '2027-08-25',
    status: 'sold',
    timeline: [
      {
        id: 'tl-5',
        timestamp: '2026-08-25 11:00',
        action: 'imported',
        description: 'Nhập kho chính hãng Sony',
        referenceCode: 'PNK-20260825-002',
        actor: 'Lê Minh Tuấn'
      },
      {
        id: 'tl-6',
        timestamp: '2026-09-07 16:30',
        action: 'sold',
        description: 'Bán lẻ quầy POS cho Anh Khang',
        referenceCode: 'DH-20260907-004',
        actor: 'Lê Thị Mai'
      }
    ]
  },
  {
    serialNumber: 'SN-SAM43-88219405',
    sku: 'DM-SAM-43CU8000',
    productName: 'Smart Tivi Samsung 43 inch (43CU8000)',
    importDate: '2026-08-10',
    supplier: 'Samsung Electronics VN Distribution',
    warrantyUntil: '2028-08-10',
    customerName: 'Chuỗi Tạp Hóa & NPP Cô Bảy Long An',
    customerPhone: '0977.412.589',
    status: 'rma',
    notes: 'Khách báo lỗi sọc ngang màn hình, đã tiếp nhận gửi hãng bảo hành',
    timeline: [
      {
        id: 'tl-7',
        timestamp: '2026-08-10 09:30',
        action: 'imported',
        description: 'Nhập kho',
        actor: 'Lê Minh Tuấn'
      },
      {
        id: 'tl-8',
        timestamp: '2026-08-20 15:00',
        action: 'sold',
        description: 'Xuất bán đơn hàng DH-20260820-008',
        referenceCode: 'DH-20260820-008',
        actor: 'Nguyễn Văn Hùng'
      },
      {
        id: 'tl-9',
        timestamp: '2026-09-09 10:20',
        action: 'warranty_received',
        description: 'Tiếp nhận bảo hành theo phiếu PBH-20260909-001',
        referenceCode: 'PBH-20260909-001',
        actor: 'Đặng Quốc Huy (Kỹ thuật)'
      }
    ]
  },
  {
    serialNumber: 'SN-PANA-77310499',
    sku: 'DM-PANA-NR-BA189',
    productName: 'Tủ Lạnh Panasonic Inverter 180 Lít',
    importDate: '2026-07-20',
    supplier: 'Panasonic Appliances Vietnam',
    warrantyUntil: '2028-07-20',
    status: 'defective',
    notes: 'Hàng móp lốc máy trong quá trình vận chuyển bốc dỡ nội bộ',
    timeline: [
      {
        id: 'tl-10',
        timestamp: '2026-07-20 10:15',
        action: 'imported',
        description: 'Nhập kho',
        actor: 'Lê Minh Tuấn'
      },
      {
        id: 'tl-11',
        timestamp: '2026-09-05 14:00',
        action: 'status_changed',
        description: 'Chuyển sang hàng lỗi hỏng chờ xuất hủy/đổi trả linh kiện',
        actor: 'Lê Minh Tuấn'
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    code: 'DH-20260910-001',
    createdAt: '2026-09-10 09:15',
    customerId: 'cust-1',
    customerName: 'Đại Lý Điện Máy Toàn Phát (Anh Tuấn)',
    customerPhone: '0918.234.889',
    items: [
      {
        productId: 'prod-1',
        sku: 'DM-SAM-43CU8000',
        name: 'Smart Tivi Samsung 43 inch Crystal UHD 4K',
        category: 'Điện Máy',
        selectedUnit: 'Chiếc',
        conversionRate: 1,
        quantity: 3,
        unitPrice: 7650000,
        costPricePerUnit: 7200000,
        totalPrice: 22950000,
        discountPercent: 0,
        serialNumbers: ['SN-SAM43-88219402']
      },
      {
        productId: 'prod-3',
        sku: 'HMP-OMO-MATIC-5L',
        name: 'Nước Giặt OMO Matic Can 5L',
        category: 'Hóa Mỹ Phẩm',
        selectedUnit: 'Thùng (4 Can)',
        conversionRate: 4,
        quantity: 10,
        unitPrice: 865000,
        costPricePerUnit: 780000,
        totalPrice: 8650000,
        discountPercent: 0
      }
    ],
    subtotal: 31600000,
    discountAmount: 600000,
    shippingFee: 0,
    totalAmount: 31000000,
    paidAmount: 31000000,
    debtAmount: 0,
    paymentMethod: 'vietqr',
    status: 'completed',
    cashierName: 'Nguyễn Văn Hùng',
    salesChannel: 'b2b',
    vatRate: 8,
    vatAmount: 2480000,
    invoiceNumber: 'HD-202609-001',
    customerTaxId: '0314589211'
  },
  {
    id: 'ord-2',
    code: 'DH-20260910-002',
    createdAt: '2026-09-10 10:30',
    customerId: 'cust-2',
    customerName: 'Gara Ô Tô & Phụ Tùng Thành Đạt (Anh Khang)',
    customerPhone: '0903.882.114',
    items: [
      {
        productId: 'prod-4',
        sku: 'HMP-SUNLIGHT-10KG',
        name: 'Nước Rửa Chén Sunlight Chanh 10kg',
        category: 'Hóa Mỹ Phẩm',
        selectedUnit: 'Thùng (2 Can)',
        conversionRate: 2,
        quantity: 8,
        unitPrice: 400000,
        costPricePerUnit: 350000,
        totalPrice: 3200000,
        discountPercent: 0
      },
      {
        productId: 'prod-5',
        sku: 'GD-SUNHOUSE-SHD300',
        name: 'Bộ Nồi Inox 5 Đáy Sunhouse SHD300',
        category: 'Gia Dụng',
        selectedUnit: 'Bộ',
        conversionRate: 1,
        quantity: 5,
        unitPrice: 720000,
        costPricePerUnit: 580000,
        totalPrice: 3600000,
        discountPercent: 0
      }
    ],
    subtotal: 6800000,
    discountAmount: 0,
    shippingFee: 50000,
    totalAmount: 6850000,
    paidAmount: 2000000,
    debtAmount: 4850000,
    paymentMethod: 'debt',
    status: 'shipping',
    cashierName: 'Lê Thị Mai',
    salesChannel: 'pos',
    vatRate: 8,
    vatAmount: 544000,
    invoiceNumber: 'HD-202609-002',
    customerTaxId: '0316789123'
  },
  {
    id: 'ord-3',
    code: 'DH-20260910-003',
    createdAt: '2026-09-10 11:45',
    customerId: 'cust-3',
    customerName: 'Chuỗi Tạp Hóa & NPP Cô Bảy Long An',
    customerPhone: '0977.412.589',
    items: [
      {
        productId: 'prod-3',
        sku: 'HMP-OMO-MATIC-5L',
        name: 'Nước Giặt OMO Matic Can 5L',
        category: 'Hóa Mỹ Phẩm',
        selectedUnit: 'Thùng (4 Can)',
        conversionRate: 4,
        quantity: 20,
        unitPrice: 930000,
        costPricePerUnit: 780000,
        totalPrice: 18600000,
        discountPercent: 0
      }
    ],
    subtotal: 18600000,
    discountAmount: 0,
    shippingFee: 200000,
    totalAmount: 18800000,
    paidAmount: 0,
    debtAmount: 18800000,
    paymentMethod: 'debt',
    status: 'pending_approval',
    cashierName: 'Nguyễn Văn Hùng',
    salesChannel: 'b2b',
    vatRate: 8,
    vatAmount: 1488000,
    invoiceNumber: 'HD-202609-003',
    customerTaxId: '1201594820',
    notes: 'Khách yêu cầu nợ đơn hàng vì đang chờ giải ngân cuối tuần'
  },
  {
    id: 'ord-4',
    code: 'DH-20260909-001',
    createdAt: '2026-09-09 14:20',
    customerId: 'cust-1',
    customerName: 'Đại Lý Điện Máy Toàn Phát (Anh Tuấn)',
    customerPhone: '0918.234.889',
    items: [
      {
        productId: 'prod-7',
        sku: 'DM-SONY-WF1000XM5',
        name: 'Tai Nghe Bluetooth True Wireless Sony WF-1000XM5',
        category: 'Điện Máy',
        selectedUnit: 'Cái',
        conversionRate: 1,
        quantity: 4,
        unitPrice: 4850000,
        costPricePerUnit: 4200000,
        totalPrice: 19400000,
        discountPercent: 0,
        serialNumbers: ['SN-SONY-09823411', 'SN-SONY-09823412']
      }
    ],
    subtotal: 19400000,
    discountAmount: 400000,
    shippingFee: 0,
    totalAmount: 19000000,
    paidAmount: 19000000,
    debtAmount: 0,
    paymentMethod: 'vietqr',
    status: 'completed',
    cashierName: 'Trần Văn Nam',
    salesChannel: 'b2b',
    vatRate: 10,
    vatAmount: 1900000,
    invoiceNumber: 'HD-202609-004',
    customerTaxId: '0314589211'
  },
  {
    id: 'ord-5',
    code: 'DH-20260909-002',
    createdAt: '2026-09-09 16:45',
    customerId: 'cust-4',
    customerName: 'Khách Lẻ Mua Quầy POS (Chị Lan)',
    customerPhone: '0934.567.890',
    items: [
      {
        productId: 'prod-5',
        sku: 'GD-SUNHOUSE-SHD300',
        name: 'Bộ Nồi Inox 5 Đáy Sunhouse SHD300',
        category: 'Gia Dụng',
        selectedUnit: 'Bộ',
        conversionRate: 1,
        quantity: 2,
        unitPrice: 850000,
        costPricePerUnit: 580000,
        totalPrice: 1700000,
        discountPercent: 0
      },
      {
        productId: 'prod-4',
        sku: 'HMP-SUNLIGHT-10KG',
        name: 'Nước Rửa Chén Sunlight Chanh 10kg',
        category: 'Hóa Mỹ Phẩm',
        selectedUnit: 'Can',
        conversionRate: 1,
        quantity: 3,
        unitPrice: 220000,
        costPricePerUnit: 175000,
        totalPrice: 660000,
        discountPercent: 0
      }
    ],
    subtotal: 2360000,
    discountAmount: 60000,
    shippingFee: 0,
    totalAmount: 2300000,
    paidAmount: 2300000,
    debtAmount: 0,
    paymentMethod: 'cash',
    status: 'completed',
    cashierName: 'Lê Thị Mai',
    salesChannel: 'pos',
    vatRate: 8,
    vatAmount: 184000,
    invoiceNumber: 'HD-202609-005'
  },
  {
    id: 'ord-6',
    code: 'DH-20260908-001',
    createdAt: '2026-09-08 10:10',
    customerId: 'cust-5',
    customerName: 'Siêu Thị Tiện Lợi VinMart+ Cần Thơ',
    customerPhone: '0909.123.456',
    items: [
      {
        productId: 'prod-3',
        sku: 'HMP-OMO-MATIC-5L',
        name: 'Nước Giặt OMO Matic Can 5L',
        category: 'Hóa Mỹ Phẩm',
        selectedUnit: 'Thùng (4 Can)',
        conversionRate: 4,
        quantity: 35,
        unitPrice: 850000,
        costPricePerUnit: 780000,
        totalPrice: 29750000,
        discountPercent: 0
      },
      {
        productId: 'prod-6',
        sku: 'VL-HOLCIM-PCB40',
        name: 'Xi Măng Đa Dụng INSEE/Holcim Power-S PCB40 Bao 50kg',
        category: 'Vật Liệu',
        selectedUnit: 'Bao',
        conversionRate: 1,
        quantity: 50,
        unitPrice: 92000,
        costPricePerUnit: 78000,
        totalPrice: 4600000,
        discountPercent: 0
      }
    ],
    subtotal: 34350000,
    discountAmount: 350000,
    shippingFee: 150000,
    totalAmount: 34150000,
    paidAmount: 34150000,
    debtAmount: 0,
    paymentMethod: 'vietqr',
    status: 'completed',
    cashierName: 'Nguyễn Văn Hùng',
    salesChannel: 'b2b',
    vatRate: 8,
    vatAmount: 2720000,
    invoiceNumber: 'HD-202609-006',
    customerTaxId: '0104918234'
  },
  {
    id: 'ord-7',
    code: 'DH-20260907-001',
    createdAt: '2026-09-07 15:30',
    customerId: 'cust-6',
    customerName: 'Khách Đặt Hàng Website / Zalo OA (Anh Hoàng)',
    customerPhone: '0988.765.432',
    items: [
      {
        productId: 'prod-1',
        sku: 'DM-SAM-43CU8000',
        name: 'Smart Tivi Samsung 43 inch Crystal UHD 4K',
        category: 'Điện Máy',
        selectedUnit: 'Chiếc',
        conversionRate: 1,
        quantity: 1,
        unitPrice: 8200000,
        costPricePerUnit: 7200000,
        totalPrice: 8200000,
        discountPercent: 0,
        serialNumbers: ['SN-SAM43-88219401']
      }
    ],
    subtotal: 8200000,
    discountAmount: 200000,
    shippingFee: 100000,
    totalAmount: 8100000,
    paidAmount: 8100000,
    debtAmount: 0,
    paymentMethod: 'vietqr',
    status: 'completed',
    cashierName: 'Trần Văn Nam',
    salesChannel: 'online',
    vatRate: 10,
    vatAmount: 810000,
    invoiceNumber: 'HD-202609-007'
  }
];

export const INITIAL_SHIFTS: CashShift[] = [
  {
    id: 'shift-current',
    cashierName: 'Nguyễn Văn Hùng (Mã NV: NV-88)',
    startedAt: '2026-09-10 07:30',
    openingCash: 2500000, // 2.500.000đ tiền mặt đầu ca
    cashSales: 18450000,
    vietQrSales: 42500000,
    debtSales: 23650000,
    cashDrops: 5000000, // Rút nộp két chính 5tr giữa ca
    expectedCash: 15950000, // 2.5tr + 18.45tr - 5tr = 15.95tr
    isClosed: false
  }
];

export const INITIAL_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'tx-1',
    code: 'PT-00128',
    type: 'thu',
    category: 'Thu tiền bán hàng',
    amount: 18450000,
    date: '2026-09-10 11:30',
    person: 'Khách hàng lẻ quầy POS',
    description: 'Doanh số tiền mặt ghi nhận ca sáng quầy POS 01',
    fundType: 'cash',
    partnerType: 'other',
    paymentMethod: 'cash'
  },
  {
    id: 'tx-2',
    code: 'PT-00129',
    type: 'thu',
    category: 'Thu nợ khách hàng',
    amount: 45000000,
    date: '2026-09-10 10:15',
    person: 'Anh Tuấn (Đại Lý Toàn Phát)',
    description: 'Thu thanh toán công nợ đơn hàng đợt 1 qua chuyển khoản VietQR',
    fundType: 'bank',
    partnerType: 'customer',
    partnerId: 'cust-1',
    partnerName: 'Đại Lý Điện Máy Toàn Phát (Anh Tuấn)',
    referenceCode: 'DH-20260908-001',
    paymentMethod: 'vietqr'
  },
  {
    id: 'tx-3',
    code: 'PC-00045',
    type: 'chi',
    category: 'Chi trả nợ nhà cung cấp',
    amount: 25000000,
    date: '2026-09-10 09:40',
    person: 'Kế toán Samsung Vina',
    description: 'Thanh toán đợt 1 lô hàng Tivi Samsung Crystal 43CU8000',
    fundType: 'bank',
    partnerType: 'supplier',
    partnerId: 'sup-1',
    partnerName: 'Công Ty TNHH Điện Tử Samsung Vina',
    referenceCode: 'PNK-20260810-001',
    paymentMethod: 'bank_transfer'
  },
  {
    id: 'tx-4',
    code: 'PC-00046',
    type: 'chi',
    category: 'Nộp tiền két chính',
    amount: 5000000,
    date: '2026-09-10 10:00',
    person: 'Kế toán trưởng Phan Thị Hà',
    description: 'Rút tiền mặt định kỳ giảm rủi ro két quầy POS',
    fundType: 'cash',
    partnerType: 'employee',
    partnerName: 'Phan Thị Hà',
    paymentMethod: 'cash'
  },
  {
    id: 'tx-5',
    code: 'PC-00047',
    type: 'chi',
    category: 'Chi phí văn phòng & nước uống',
    amount: 320000,
    date: '2026-09-10 08:30',
    person: 'Lavie Drinking Water',
    description: 'Mua 4 bình nước 19L phục vụ khách hàng & nhân viên',
    fundType: 'cash',
    partnerType: 'other',
    paymentMethod: 'cash'
  },
  {
    id: 'tx-6',
    code: 'PT-00130',
    type: 'thu',
    category: 'Thu tiền bán hàng',
    amount: 32500000,
    date: '2026-09-09 16:45',
    person: 'Công Ty Cổ Phần Xây Dựng An Bình Phát',
    description: 'Thanh toán chuyển khoản ngân hàng qua mã VietQR',
    fundType: 'bank',
    partnerType: 'customer',
    partnerId: 'cust-4',
    partnerName: 'Công Ty Cổ Phần Xây Dựng An Bình Phát',
    paymentMethod: 'vietqr'
  }
];

export const INITIAL_ALERTS: TelegramAlert[] = [
  {
    id: 'alert-1',
    timestamp: '2026-09-10 11:45',
    type: 'credit_limit',
    title: '⚠️ CẢNH BÁO CHẠM TRẦN CÔNG NỢ',
    message: 'Khách hàng: Chuỗi Tạp Hóa & NPP Cô Bảy Long An (KH-00311) vượt hạn mức tín dụng 50.000.000đ (Dư nợ hiện tại 58.500.000đ + Đơn mới 18.800.000đ). Cần Giám đốc phê duyệt.',
    delivered: true
  },
  {
    id: 'alert-2',
    timestamp: '2026-09-10 09:20',
    type: 'low_stock',
    title: '🚨 CẢNH BÁO TỒN KHO AN TOÀN',
    message: 'Mặt hàng: Tai Nghe Sony WF-1000XM5 chỉ còn 8 Cái trong kho (Mức cảnh báo tối thiểu: 12 Cái). Đề xuất nhập thêm 20 Cái.',
    delivered: true
  },
  {
    id: 'alert-3',
    timestamp: '2026-09-09 16:40',
    type: 'pin_override',
    title: '🛡️ MÃ PIN QUẢN TRỊ ĐƯỢC KÍCH HOẠT',
    message: 'Quản lý duyệt giảm giá 12% cho Đơn hàng DH-20260909-012 bởi Quản lý Ca: Trần Đình Trọng.',
    delivered: true
  }
];

export const INITIAL_APPROVALS = [
  {
    id: 'appr-1',
    orderCode: 'DH-20260910-003',
    customerId: 'cust-3',
    customerName: 'Chuỗi Tạp Hóa & NPP Cô Bảy Long An',
    customerPhone: '0977.412.589',
    orderTotal: 18800000,
    currentDebt: 58500000,
    creditLimit: 50000000,
    excessAmount: 27300000,
    requestedAt: '2026-09-10 11:45',
    requestedBy: 'Nguyễn Văn Hùng (Thu Ngân)',
    reason: 'Cô Bảy xin nợ bổ sung lô OMO Can 5L để phân phối hội chợ nông sản cuối tuần, cam kết chuyển khoản thanh toán toàn bộ 50tr cũ vào sáng thứ 2 tuần sau.',
    status: 'pending' as const,
    messages: [
      {
        sender: 'Nguyễn Văn Hùng',
        role: 'Thu Ngân',
        timestamp: '11:46',
        text: 'Đại lý Cô Bảy vừa ký biên nhận cam kết, xin Giám đốc duyệt xuất kho gấp để xe tải kịp chuyến 12h30 đi Long An.'
      },
      {
        sender: 'Phan Thị Hà',
        role: 'Kế Toán Trưởng',
        timestamp: '11:49',
        text: 'Lịch sử thanh toán của Cô Bảy 6 tháng qua rất uy tín, nhưng hiện có 12tr nợ chạm mốc 90 ngày. Đề xuất yêu cầu thanh toán trước 10tr tiền mặt rồi cho nợ phần còn lại.'
      }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    code: 'NV-001',
    name: 'Trần Hoàng Nam',
    phone: '0918.234.889',
    email: 'nam.tran@nexus-erp.vn',
    role: 'admin',
    roleTitle: 'Tổng Quản Trị Hệ Thống',
    branch: 'Trụ sở & Kho Tổng Bình Tân',
    status: 'active',
    hireDate: '2023-01-15',
    baseSalary: 28000000,
    commissionRate: 0.5,
    totalOrdersHandled: 420,
    totalRevenueGenerated: 1850000000,
    notes: 'Toàn quyền kiểm soát tài chính, kho & phê duyệt nợ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-2',
    code: 'NV-002',
    name: 'Nguyễn Văn Hùng',
    phone: '0903.112.334',
    email: 'hung.nguyen@nexus-erp.vn',
    role: 'cashier',
    roleTitle: 'Trưởng Ca Thu Ngân',
    branch: 'Chi nhánh Quận 1 (Trần Hưng Đạo)',
    status: 'active',
    hireDate: '2024-03-01',
    baseSalary: 11500000,
    commissionRate: 1.2,
    totalOrdersHandled: 318,
    totalRevenueGenerated: 642000000,
    notes: 'Phụ trách bàn POS chính ca sáng, kiểm soát lệch két tiền mặt',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-3',
    code: 'NV-003',
    name: 'Lê Minh Tuấn',
    phone: '0938.556.778',
    email: 'tuan.le@nexus-erp.vn',
    role: 'warehouse',
    roleTitle: 'Thủ Kho Trưởng',
    branch: 'Kho Tổng Trung Tâm (KCN Tân Bình)',
    status: 'active',
    hireDate: '2023-06-10',
    baseSalary: 14000000,
    commissionRate: 0.3,
    totalOrdersHandled: 185,
    totalRevenueGenerated: 420000000,
    notes: 'Chịu trách nhiệm nhập xuất tồn, quét mã IMEI/Serial và kiểm kê định kỳ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-4',
    code: 'NV-004',
    name: 'Phan Thị Hà',
    phone: '0982.667.890',
    email: 'ha.phan@nexus-erp.vn',
    role: 'accountant',
    roleTitle: 'Kế Toán Trưởng & Công Nợ',
    branch: 'Trụ sở & Kho Tổng Bình Tân',
    status: 'active',
    hireDate: '2023-08-20',
    baseSalary: 19000000,
    commissionRate: 0.4,
    totalOrdersHandled: 140,
    totalRevenueGenerated: 350000000,
    notes: 'Quản lý thu chi sổ quỹ, hạn mức tín dụng khách hàng và đối soát NCC',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-5',
    code: 'NV-005',
    name: 'Trần Đình Trọng',
    phone: '0966.334.455',
    email: 'trong.tran@nexus-erp.vn',
    role: 'manager',
    roleTitle: 'Cửa Hàng Trưởng',
    branch: 'Chi nhánh Quận 1 (Trần Hưng Đạo)',
    status: 'active',
    hireDate: '2023-11-01',
    baseSalary: 18500000,
    commissionRate: 1.5,
    totalOrdersHandled: 275,
    totalRevenueGenerated: 890000000,
    notes: 'Giữ mã PIN quản trị 8888, duyệt đơn chiết khấu lớn & hỗ trợ đổi trả',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-6',
    code: 'NV-006',
    name: 'Võ Mai Phương',
    phone: '0971.889.900',
    email: 'phuong.vo@nexus-erp.vn',
    role: 'cashier',
    roleTitle: 'Nhân Viên Thu Ngân Ca Tối',
    branch: 'Chi nhánh Quận 1 (Trần Hưng Đạo)',
    status: 'active',
    hireDate: '2024-07-15',
    baseSalary: 8500000,
    commissionRate: 1.0,
    totalOrdersHandled: 120,
    totalRevenueGenerated: 195000000,
    notes: 'Thu ngân ca chiều tối, thao tác POS nhanh, nhiệt tình',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'NCC-001',
    name: 'Công Ty TNHH Điện Tử Samsung Vina',
    contactPerson: 'Phạm Minh Toàn (GĐ Bán Hàng)',
    phone: '028.3821.1111',
    email: 'b2b.order@samsung.com.vn',
    address: 'Tầng 25, Bitexco Financial Tower, Số 2 Hải Triều, Q.1, TP.HCM',
    taxId: '0301111928',
    category: 'Điện Máy',
    currentDebt: 85000000,
    paymentTermsDays: 45,
    totalPurchased: 1450000000,
    bankName: 'Vietcombank - CN TP.HCM',
    bankAccount: '0071000889988',
    bankAccountName: 'CONG TY TNHH DIEN TU SAMSUNG VINA',
    status: 'active',
    notes: 'Nhà phân phối chính hãng Smart Tivi, màn hình & thiết bị nghe nhìn'
  },
  {
    id: 'sup-2',
    code: 'NCC-002',
    name: 'Công Ty TNHH Quốc Tế Unilever Việt Nam',
    contactPerson: 'Đặng Thảo Quyên',
    phone: '028.5413.5686',
    email: 'orders.vn@unilever.com',
    address: 'Lô A2-3 KCN Tây Bắc Củ Chi, TP. Hồ Chí Minh',
    taxId: '0303615027',
    category: 'Hóa Mỹ Phẩm',
    currentDebt: 42500000,
    paymentTermsDays: 30,
    totalPurchased: 890000000,
    bankName: 'BIDV - CN Sở Giao Dịch 2',
    bankAccount: '13010000891234',
    bankAccountName: 'UNILEVER VIETNAM INTERNATIONAL CO LTD',
    status: 'active',
    notes: 'Cung ứng nước giặt OMO, Sunlight, Comfort giá sỉ cấp 1'
  },
  {
    id: 'sup-3',
    code: 'NCC-003',
    name: 'Công Ty Cổ Phần Tập Đoàn Sunhouse',
    contactPerson: 'Nguyễn Quốc Cường',
    phone: '024.3736.6676',
    email: 'b2b@sunhouse.com.vn',
    address: 'Tầng 12, Tòa nhà Richy, Số 35 Mạc Thái Tổ, Cầu Giấy, Hà Nội',
    taxId: '0101899120',
    category: 'Gia Dụng',
    currentDebt: 28000000,
    paymentTermsDays: 30,
    totalPurchased: 640000000,
    bankName: 'Techcombank - CN Thăng Long',
    bankAccount: '19028912345678',
    bankAccountName: 'CONG TY CP TAP DOAN SUNHOUSE',
    status: 'active',
    notes: 'Sản xuất đồ gia dụng nhà bếp, chảo chống dính, nồi cơm điện, ấm siêu tốc'
  },
  {
    id: 'sup-4',
    code: 'NCC-004',
    name: 'Công Ty CP Bóng Đèn Phích Nước Rạng Đông',
    contactPerson: 'Vũ Đức Thịnh',
    phone: '024.3858.4310',
    email: 'kinhdoanh@rangdong.com.vn',
    address: 'Số 87-89 Phố Hạ Đình, Thanh Xuân Trung, Thanh Xuân, Hà Nội',
    taxId: '0100108963',
    category: 'Vật Liệu & Thiết Bị Điện',
    currentDebt: 15400000,
    paymentTermsDays: 20,
    totalPurchased: 380000000,
    bankName: 'VietinBank - CN Đống Đa',
    bankAccount: '110000092837',
    bankAccountName: 'CTY CP BONG DEN PHICH NUOC RANG DONG',
    status: 'active',
    notes: 'Cung cấp đèn LED búp, phích nước nóng, thiết bị chiếu sáng thông minh'
  },
  {
    id: 'sup-5',
    code: 'NCC-005',
    name: 'Công Ty TNHH Panasonic Appliances Việt Nam',
    contactPerson: 'Hoàng Nhật Minh',
    phone: '028.3842.2288',
    email: 'panasonic.distribution@vn.panasonic.com',
    address: 'Lô G1-G2, KCN Thăng Long, Đông Anh, Hà Nội',
    taxId: '0101348821',
    category: 'Điện Máy',
    currentDebt: 65000000,
    paymentTermsDays: 45,
    totalPurchased: 1120000000,
    bankName: 'Vietcombank - CN Thăng Long',
    bankAccount: '0011002345678',
    bankAccountName: 'PANASONIC APPLIANCES VIETNAM CO LTD',
    status: 'active',
    notes: 'Tủ lạnh Inverter, máy giặt lồng ngang & điều hòa không khí cao cấp'
  }
];

export const INITIAL_INBOUNDS: StockInboundReceipt[] = [
  {
    id: 'inbound-1',
    code: 'PNK-20260908-001',
    date: '2026-09-08 09:30',
    supplierId: 'sup-1',
    supplierName: 'Công Ty TNHH Điện Tử Samsung Vina',
    creatorName: 'Lê Minh Tuấn (Thủ Kho)',
    items: [
      {
        productId: 'prod-1',
        productName: 'Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)',
        sku: 'DM-SAM-43CU8000',
        unitName: 'Chiếc',
        conversionRate: 1,
        quantity: 15,
        unitCost: 7200000,
        totalCost: 108000000,
        batchNumber: 'LÔ-SAM-2026-09A'
      }
    ],
    totalCost: 108000000,
    paidAmount: 58000000,
    debtAmount: 50000000,
    paymentMethod: 'bank_transfer',
    notes: 'Nhập lô hàng tivi đợt đầu tháng 9, có đính kèm chứng từ CO/CQ hãng',
    status: 'completed'
  },
  {
    id: 'inbound-2',
    code: 'PNK-20260909-002',
    date: '2026-09-09 14:15',
    supplierId: 'sup-2',
    supplierName: 'Công Ty TNHH Quốc Tế Unilever Việt Nam',
    creatorName: 'Lê Minh Tuấn (Thủ Kho)',
    items: [
      {
        productId: 'prod-3',
        productName: 'Nước Giặt OMO Matic Chuyên Dụng Cửa Trước Can 5L',
        sku: 'HMP-OMO-MATIC-5L',
        unitName: 'Thùng (4 Can)',
        conversionRate: 4,
        quantity: 30,
        unitCost: 780000,
        totalCost: 23400000,
        batchNumber: 'LOT-OMO-2026-09',
        expiryDate: '2028-09-01'
      },
      {
        productId: 'prod-4',
        productName: 'Nước Rửa Chén Sunlight Chanh Can 10kg',
        sku: 'HMP-SUNLIGHT-10KG',
        unitName: 'Can',
        conversionRate: 1,
        quantity: 40,
        unitCost: 165000,
        totalCost: 6600000,
        batchNumber: 'LOT-SUN-2026-09',
        expiryDate: '2028-08-15'
      }
    ],
    totalCost: 30000000,
    paidAmount: 30000000,
    debtAmount: 0,
    paymentMethod: 'bank_transfer',
    notes: 'Nhập bổ sung nước giặt OMO & Sunlight phục vụ khách sỉ chuỗi tạp hóa',
    status: 'completed'
  },
  {
    id: 'inbound-3',
    code: 'PNK-20260910-003',
    date: '2026-09-10 10:00',
    supplierId: 'sup-3',
    supplierName: 'Công Ty Cổ Phần Tập Đoàn Sunhouse',
    creatorName: 'Lê Minh Tuấn (Thủ Kho)',
    items: [
      {
        productId: 'prod-5',
        productName: 'Chảo Chống Dính Sunhouse Ultra Titanium 26cm',
        sku: 'GD-SUN-CHAO26',
        unitName: 'Cái',
        conversionRate: 1,
        quantity: 50,
        unitCost: 145000,
        totalCost: 7250000,
        batchNumber: 'SH-2026-Q3'
      }
    ],
    totalCost: 7250000,
    paidAmount: 0,
    debtAmount: 7250000,
    paymentMethod: 'debt',
    notes: 'Nhập gối đầu công nợ 30 ngày theo hợp đồng nguyên tắc năm',
    status: 'completed'
  }
];

export const INITIAL_OUTBOUNDS: StockOutboundReceipt[] = [
  {
    id: 'outbound-1',
    code: 'PXK-20260907-001',
    date: '2026-09-07 16:30',
    reason: 'damaged',
    reasonLabel: 'Xuất hủy hàng lỗi bể vỡ do vận chuyển',
    creatorName: 'Lê Minh Tuấn (Thủ Kho)',
    items: [
      {
        productId: 'prod-5',
        productName: 'Chảo Chống Dính Sunhouse Ultra Titanium 26cm',
        sku: 'GD-SUN-CHAO26',
        unitName: 'Cái',
        conversionRate: 1,
        quantity: 2,
        unitCost: 145000,
        totalCost: 290000
      }
    ],
    totalCost: 290000,
    notes: 'Hàng bị móp méo đáy chảo trong quá trình bốc dỡ xe container',
    status: 'completed'
  },
  {
    id: 'outbound-2',
    code: 'PXK-20260909-002',
    date: '2026-09-09 11:00',
    reason: 'internal_use',
    reasonLabel: 'Xuất sử dụng nội bộ vệ sinh showroom',
    creatorName: 'Trần Đình Trọng (Quản Lý)',
    destination: 'Bộ phận Tạp vụ Showroom Quận 1',
    items: [
      {
        productId: 'prod-4',
        productName: 'Nước Rửa Chén Sunlight Chanh Can 10kg',
        sku: 'HMP-SUNLIGHT-10KG',
        unitName: 'Can',
        conversionRate: 1,
        quantity: 1,
        unitCost: 165000,
        totalCost: 165000
      }
    ],
    totalCost: 165000,
    notes: 'Cấp phát cho tạp vụ lau dọn quầy kệ & nhà vệ sinh chi nhánh',
    status: 'completed'
  }
];

export const INITIAL_RETURNS: ReturnReceipt[] = [
  {
    id: 'ret-1',
    code: 'PTH-20260909-001',
    type: 'customer_return',
    date: '2026-09-09 15:40',
    referenceOrderCode: 'DH-20260908-002',
    partnerId: 'cust-1',
    partnerName: 'Nguyễn Thị Bích Phượng',
    partnerPhone: '0908.123.456',
    creatorName: 'Trần Đình Trọng (Quản Lý)',
    items: [
      {
        productId: 'prod-5',
        productName: 'Chảo Chống Dính Sunhouse Ultra Titanium 26cm',
        sku: 'GD-SUN-CHAO26',
        unitName: 'Cái',
        conversionRate: 1,
        quantity: 1,
        unitPrice: 220000,
        totalRefund: 220000,
        condition: 'restock',
        reason: 'Khách mua nhầm kích thước 26cm (muốn đổi lấy size 28cm)'
      }
    ],
    totalRefundAmount: 220000,
    refundMethod: 'cash',
    status: 'completed',
    notes: 'Hàng còn nguyên hộp và tem niêm phong, đã nhập hoàn kho'
  },
  {
    id: 'ret-2',
    code: 'PTH-20260910-002',
    type: 'supplier_return',
    date: '2026-09-10 11:15',
    referenceOrderCode: 'PNK-20260908-001',
    partnerId: 'sup-1',
    partnerName: 'Công Ty TNHH Điện Tử Samsung Vina',
    partnerPhone: '028.3821.1111',
    creatorName: 'Lê Minh Tuấn (Thủ Kho)',
    items: [
      {
        productId: 'prod-1',
        productName: 'Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)',
        sku: 'DM-SAM-43CU8000',
        unitName: 'Chiếc',
        conversionRate: 1,
        quantity: 1,
        unitPrice: 7200000,
        totalRefund: 7200000,
        condition: 'damaged',
        reason: 'Hàng lỗi sọc màn hình khi khui kiểm (Serial SAM8823719001)'
      }
    ],
    totalRefundAmount: 7200000,
    refundMethod: 'debt_deduction',
    status: 'completed',
    notes: 'Đã lập biên bản trả hàng bảo hành kỹ thuật, giảm trừ công nợ phải trả Samsung'
  }
];

export const INITIAL_WARRANTIES: WarrantyTicket[] = [
  {
    id: 'war-1',
    code: 'PBH-20260909-001',
    customerName: 'Chuỗi Tạp Hóa & NPP Cô Bảy Long An',
    customerPhone: '0977.412.589',
    customerId: 'cust-3',
    productId: 'prod-1',
    productName: 'Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)',
    sku: 'DM-SAM-43CU8000',
    serialNumber: 'SN-SAM43-88219405',
    orderCode: 'DH-20260820-008',
    receivedDate: '2026-09-09 10:20',
    estimatedReturnDate: '2026-09-15',
    status: 'repairing',
    issueDescription: 'Màn hình xuất hiện sọc chỉ ngang màu xanh, chớp nháy sau 15 phút mở',
    accessoriesAttached: 'Dây nguồn, Điều khiển từ xa (Remote)',
    technicianName: 'Đặng Quốc Huy',
    isUnderWarranty: true,
    warrantyExpiryDate: '2028-08-10',
    repairCost: 0,
    sparePartsCost: 0,
    totalCost: 0,
    serviceRecords: [
      {
        id: 'rec-1',
        date: '2026-09-09 10:30',
        technicianName: 'Đặng Quốc Huy',
        action: 'Tiếp nhận máy, kiểm tra ngoại quan và xác nhận lỗi sọc panel',
        cost: 0,
        notes: 'Máy còn nguyên tem bảo hành chính hãng'
      },
      {
        id: 'rec-2',
        date: '2026-09-10 09:00',
        technicianName: 'Đặng Quốc Huy',
        action: 'Gửi linh kiện panel sang TTBH Samsung Vina xử lý theo chính sách hãng',
        spareParts: 'T-Con board & Cáp LVDS',
        cost: 0,
        notes: 'Hãng tiếp nhận bảo hành đổi linh kiện miễn phí'
      }
    ],
    notes: 'Ưu tiên hỗ trợ đại lý Cô Bảy'
  },
  {
    id: 'war-2',
    code: 'PBH-20260908-002',
    customerName: 'Đại Lý Điện Máy Toàn Phát (Anh Tuấn)',
    customerPhone: '0918.234.889',
    customerId: 'cust-1',
    productId: 'prod-2',
    productName: 'Tủ Lạnh Panasonic Inverter 180 Lít (NR-BA189PAVN)',
    sku: 'DM-PANA-NR-BA189',
    serialNumber: 'SN-PANA-77310492',
    orderCode: 'DH-20260725-001',
    receivedDate: '2026-09-08 14:00',
    estimatedReturnDate: '2026-09-11',
    status: 'completed',
    issueDescription: 'Ngăn đông không đông đá, quạt gió kêu to bất thường',
    accessoriesAttached: 'Khay đá, sách HDSD',
    technicianName: 'Trần Văn Cường',
    isUnderWarranty: true,
    warrantyExpiryDate: '2028-07-20',
    repairCost: 0,
    sparePartsCost: 0,
    totalCost: 0,
    serviceRecords: [
      {
        id: 'rec-3',
        date: '2026-09-08 15:30',
        technicianName: 'Trần Văn Cường',
        action: 'Kiểm tra motor quạt dàn lạnh và cảm biến xả đá defrost',
        cost: 0
      },
      {
        id: 'rec-4',
        date: '2026-09-09 16:00',
        technicianName: 'Trần Văn Cường',
        action: 'Thay thế cảm biến rơ-le nhiệt và tra dầu bôi trơn motor quạt',
        spareParts: 'Cảm biến nhiệt Panasonic Defrost Sensor',
        cost: 0,
        notes: 'Đã test chạy thử 12h, độ lạnh ngăn đông đạt -18 độ C'
      }
    ],
    notes: 'Đã gọi báo khách hẹn chiều qua nhận lại máy'
  },
  {
    id: 'war-3',
    code: 'PBH-20260905-003',
    customerName: 'Gara Ô Tô & Phụ Tùng Thành Đạt',
    customerPhone: '0903.882.114',
    customerId: 'cust-2',
    productId: 'prod-7',
    productName: 'Tai Nghe Bluetooth Sony WF-1000XM5',
    sku: 'DM-SONY-WF1000XM5',
    serialNumber: 'SN-SONY-WF5-99210',
    orderCode: 'DH-20260825-002',
    receivedDate: '2026-09-05 09:15',
    estimatedReturnDate: '2026-09-07',
    returnedDate: '2026-09-07 17:00',
    status: 'returned_to_customer',
    issueDescription: 'Tai bên phải pin tụt nhanh, chỉ nghe được 45 phút',
    accessoriesAttached: 'Hộp sạc (Charging Case), nút tai size M',
    technicianName: 'Đặng Quốc Huy',
    isUnderWarranty: true,
    warrantyExpiryDate: '2027-08-25',
    repairCost: 0,
    sparePartsCost: 0,
    totalCost: 0,
    serviceRecords: [
      {
        id: 'rec-5',
        date: '2026-09-06 10:00',
        technicianName: 'Đặng Quốc Huy',
        action: 'Reset firmware và cân chỉnh dung lượng cell pin lithium',
        cost: 0
      }
    ],
    notes: 'Khách hàng đã nhận máy và ký biên bản hài lòng'
  }
];

export const INITIAL_STOCKTAKES: StocktakeReport[] = [
  {
    id: 'st-1',
    code: 'PKK-20260908-001',
    date: '2026-09-08 17:30',
    warehouseLocation: 'Kho Tổng',
    creatorName: 'Trần Văn Cường (Thủ Kho)',
    totalDiscrepancyAmount: 4600000,
    status: 'balanced',
    balancedAt: '2026-09-08 18:00',
    balancedBy: 'Nguyễn Thanh Long (Quản Lý)',
    notes: 'Kiểm kê định kỳ tháng 9 ngành hàng Điện Máy & Gia Dụng. Chênh lệch do hàng mẫu trưng bày.',
    items: [
      {
        productId: 'prod-1',
        sku: 'DM-SAM-43CU8000',
        productName: 'Smart Tivi Samsung 43 inch Crystal UHD 4K (43CU8000)',
        unitName: 'Chiếc',
        systemStock: 29,
        actualStock: 28,
        difference: -1,
        unitCost: 7200000,
        differenceValue: -7200000,
        note: '01 chiếc chuyển làm hàng mẫu tại quầy'
      },
      {
        productId: 'prod-2',
        sku: 'DM-PANA-NR-BA189',
        productName: 'Tủ Lạnh Panasonic Inverter 180 Lít (NR-BA189PAVN)',
        unitName: 'Chiếc',
        systemStock: 14,
        actualStock: 15,
        difference: 1,
        unitCost: 4600000,
        differenceValue: 4600000,
        note: 'Thừa 1 chiếc do đơn trả hàng chưa kịp cập nhật số sách'
      },
      {
        productId: 'prod-3',
        sku: 'GD-SHARP-KS181',
        productName: 'Nồi Cơm Điện Nắp Gài Sharp 1.8 Lít (KS-181TJV)',
        unitName: 'Chiếc',
        systemStock: 42,
        actualStock: 42,
        difference: 0,
        unitCost: 480000,
        differenceValue: 0,
        note: 'Khớp số liệu'
      }
    ]
  }
];

export const INITIAL_TRANSFERS: WarehouseTransfer[] = [
  {
    id: 'tr-1',
    code: 'CK-20260910-001',
    date: '2026-09-10 09:30',
    sourceWarehouse: 'Kho Tổng',
    targetWarehouse: 'Chi nhánh Bình Tân',
    creatorName: 'Trần Văn Cường (Thủ Kho)',
    receiverName: 'Lê Minh Tuấn',
    status: 'in_transit',
    totalQuantity: 25,
    totalCost: 18500000,
    notes: 'Điều chuyển hàng bổ sung tồn kho bán lẻ cuối tuần cho chi nhánh Bình Tân',
    shippedAt: '2026-09-10 10:15',
    items: [
      {
        productId: 'prod-4',
        productName: 'Nước Rửa Chén Sunlight Chanh Thiên Nhiên Can 10kg',
        sku: 'HMP-SUNLIGHT-10KG',
        unitName: 'Can',
        conversionRate: 1,
        quantity: 15,
        unitCost: 175000,
        totalCost: 2625000,
        batchNumber: 'LOT-2026-004'
      },
      {
        productId: 'prod-2',
        productName: 'Tủ Lạnh Panasonic Inverter 180 Lít (NR-BA189PAVN)',
        sku: 'DM-PANA-NR-BA189',
        unitName: 'Chiếc',
        conversionRate: 1,
        quantity: 3,
        unitCost: 4600000,
        totalCost: 13800000
      },
      {
        productId: 'prod-6',
        productName: 'Máy Giặt Cửa Trên Toshiba 8.2 kg (AW-K900DV)',
        sku: 'DM-TOSHIBA-82KG',
        unitName: 'Chiếc',
        conversionRate: 1,
        quantity: 2,
        unitCost: 3800000,
        totalCost: 7600000
      }
    ]
  },
  {
    id: 'tr-2',
    code: 'CK-20260907-002',
    date: '2026-09-07 14:00',
    sourceWarehouse: 'Kho Tổng',
    targetWarehouse: 'Chi nhánh Quận 1 (Trần Hưng Đạo)',
    creatorName: 'Trần Văn Cường (Thủ Kho)',
    receiverName: 'Phạm Thị Thùy Dung',
    status: 'completed',
    totalQuantity: 50,
    totalCost: 35600000,
    notes: 'Cấp hàng dầu nhớt và phụ gia động cơ theo yêu cầu đơn đặt trước',
    shippedAt: '2026-09-07 14:30',
    receivedAt: '2026-09-07 16:45',
    items: [
      {
        productId: 'prod-5',
        productName: 'Dầu Động Cơ Xe Máy Castrol Power 1 10W-40 4T (Thùng 24 Lon 0.8L)',
        sku: 'DN-CASTROL-10W40',
        unitName: 'Thùng (24 Lon)',
        conversionRate: 24,
        quantity: 10,
        unitCost: 2450000,
        totalCost: 24500000,
        batchNumber: 'LOT-2026-003'
      }
    ]
  }
];



