import { UserRole, PermissionKey, ROLE_PERMISSIONS } from "@/types/erp";

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  initials: string;
  badgeColor: string;
  description: string;
  permissions: PermissionKey[];
  restrictedHighlights: string[];
  allowedHighlights: string[];
}

export const DEMO_PERSONAS: Record<UserRole, DemoPersona> = {
  admin: {
    id: "usr-demo-admin",
    name: "Trần Hoàng Nam",
    email: "admin@nexus-erp.vn",
    phone: "0909123456",
    role: "admin",
    roleTitle: "Tổng Giám Đốc (Admin)",
    avatar: "👑",
    initials: "AD",
    badgeColor: "bg-indigo-600 text-white",
    description: "Toàn quyền quản trị doanh nghiệp, cấu hình ngân hàng, tài chính & phân quyền.",
    permissions: ROLE_PERMISSIONS.admin,
    allowedHighlights: [
      "Toàn quyền truy cập mọi phân hệ",
      "Xem giá vốn COGS & lãi gộp",
      "Cấu hình hệ thống & webhook Telegram",
      "Duyệt vượt trần công nợ tín dụng"
    ],
    restrictedHighlights: [],
  },
  manager: {
    id: "usr-demo-manager",
    name: "Lê Thị Mai",
    email: "mai.le@nexus-erp.vn",
    phone: "0912345678",
    role: "manager",
    roleTitle: "Cửa Hàng Trưởng (Manager)",
    avatar: "👔",
    initials: "MN",
    badgeColor: "bg-purple-600 text-white",
    description: "Điều phối vận hành chi nhánh, duyệt nợ tín dụng, giám sát đơn hàng & xuất nhập kho.",
    permissions: ROLE_PERMISSIONS.manager,
    allowedHighlights: [
      "Duyệt công nợ khách hàng",
      "Xem báo cáo kinh doanh chi nhánh",
      "Quản lý tồn kho & bảo hành RMA"
    ],
    restrictedHighlights: [
      "Không được sửa thông tin ngân hàng",
      "Không được xóa hồ sơ nhân sự"
    ],
  },
  cashier: {
    id: "usr-demo-cashier",
    name: "Nguyễn Văn Hùng",
    email: "hung.nguyen@nexus-erp.vn",
    phone: "0987654321",
    role: "cashier",
    roleTitle: "Thu Ngân Bán Hàng (Cashier)",
    avatar: "🛒",
    initials: "TN",
    badgeColor: "bg-emerald-600 text-white",
    description: "Bán hàng POS tốc độ cao, in hóa đơn K80, mở/chốt ca thu ngân & nhận bảo hành.",
    permissions: ROLE_PERMISSIONS.cashier,
    allowedHighlights: [
      "Bàn POS bán hàng đa đơn",
      "Thanh toán VietQR Napas 0đ",
      "Chốt ca & đối soát két tiền mặt"
    ],
    restrictedHighlights: [
      "BỊ ẨN GIÁ VỐN & LÃI GỘP",
      "KHÔNG XEM BÁO CÁO KINH DOANH",
      "KHÔNG TỰ DUYỆT VƯỢT HẠN MỨC NỢ"
    ],
  },
  warehouse: {
    id: "usr-demo-warehouse",
    name: "Phạm Minh Tuấn",
    email: "tuan.pham@nexus-erp.vn",
    phone: "0977889900",
    role: "warehouse",
    roleTitle: "Thủ Kho Trưởng (Warehouse)",
    avatar: "📦",
    initials: "TK",
    badgeColor: "bg-amber-600 text-white",
    description: "Quản lý kho tổng, nhập hàng từ NCC, kiểm kê cân bằng, điều chuyển kho & lô FEFO.",
    permissions: ROLE_PERMISSIONS.warehouse,
    allowedHighlights: [
      "Quản lý xuất nhập tồn kho",
      "Kiểm kê & cân bằng số liệu thực tế",
      "Quy đổi ĐVT & kiểm tra Serial/IMEI"
    ],
    restrictedHighlights: [
      "KHÔNG BÁN HÀNG TẠI QUẦY POS",
      "KHÔNG TRUY CẬP SỔ QUỸ TIỀN TỆ",
      "KHÔNG THAY ĐỔI BẢNG GIÁ BÁN"
    ],
  },
  accountant: {
    id: "usr-demo-accountant",
    name: "Võ Thu Hà",
    email: "ha.vo@nexus-erp.vn",
    phone: "0933445566",
    role: "accountant",
    roleTitle: "Kế Toán Trưởng (Accountant)",
    avatar: "📑",
    initials: "KT",
    badgeColor: "bg-blue-600 text-white",
    description: "Quản lý dòng tiền, sổ quỹ thu chi, báo cáo tuổi nợ, trích xuất dữ liệu & đối soát.",
    permissions: ROLE_PERMISSIONS.accountant,
    allowedHighlights: [
      "Quản lý sổ quỹ tiền mặt/ngân hàng",
      "Báo cáo phân tích tuổi nợ (Aging)",
      "Xem giá vốn & lãi lỗ tài chính",
      "Xuất báo cáo Excel/CSV"
    ],
    restrictedHighlights: [
      "KHÔNG TẠO SẢN PHẨM MỚI",
      "KHÔNG THAY ĐỔI CẤU HÌNH HỆ THỐNG"
    ],
  },
};
