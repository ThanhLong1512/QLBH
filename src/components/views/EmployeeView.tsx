"use client";
import React, { useState, useMemo, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { Employee, EmployeeRole } from '../../types/erp';
import { Pagination } from '../common/Pagination';
import { RowActionMenu } from '../common/RowActionMenu';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Shield,
  Phone,
  Mail,
  Building,
  Award,
  DollarSign,
  Briefcase,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Upload,
  FolderOpen,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export const EmployeeView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    canExportExcel,
    showToast,
    branches,
    warehouses
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    role: 'cashier' as EmployeeRole,
    roleTitle: 'Thu Ngân Ca Sáng',
    branch: 'Chi nhánh Quận 1 (Trần Hưng Đạo)',
    branchId: '',
    warehouseId: '',
    status: 'active' as 'active' | 'inactive',
    hireDate: new Date().toISOString().slice(0, 10),
    baseSalary: 10000000,
    commissionRate: 1.0,
    avatar: '',
    notes: ''
  });

  // Local file browser avatar handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  const PRESET_AVATARS = [
    { label: 'Nữ Thu Ngân', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    { label: 'Nam Quản Lý', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
    { label: 'Nữ Kế Toán', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
    { label: 'Nam Thủ Kho', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  ];

  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Dung lượng ảnh tối đa 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, avatar: result }));
        showToast('📷 Đã tải ảnh nhân viên từ thư mục máy tính thành công!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleDropAvatar = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  // Paginated employees
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const cashiers = employees.filter(e => e.role === 'cashier').length;
    const managers = employees.filter(e => e.role === 'admin' || e.role === 'manager').length;
    const totalSalary = employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);
    return { total, active, cashiers, managers, totalSalary };
  }, [employees]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    const defaultBranch = branches[0];
    setFormData({
      code: `NV-${String(employees.length + 1).padStart(3, '0')}`,
      name: '',
      phone: '',
      email: '',
      role: 'cashier',
      roleTitle: 'Nhân Viên Thu Ngân',
      branch: defaultBranch?.name || 'Trụ sở chính & Kho Tổng',
      branchId: defaultBranch?.id || '',
      warehouseId: '',
      status: 'active',
      hireDate: new Date().toISOString().slice(0, 10),
      baseSalary: 10000000,
      commissionRate: 1.0,
      avatar: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      code: emp.code,
      name: emp.name,
      phone: emp.phone,
      email: emp.email,
      role: emp.role,
      roleTitle: emp.roleTitle,
      branch: emp.branch,
      branchId: emp.branchId || '',
      warehouseId: emp.warehouseId || '',
      status: emp.status,
      hireDate: emp.hireDate,
      baseSalary: emp.baseSalary,
      commissionRate: emp.commissionRate,
      avatar: emp.avatar || '',
      notes: emp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('⚠️ Vui lòng nhập tên và mã nhân viên');
      return;
    }

    const payload: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      role: formData.role,
      roleTitle: formData.roleTitle.trim(),
      branch: formData.branch.trim(),
      branchId: formData.branchId || null,
      warehouseId: formData.warehouseId || null,
      userId: editingEmployee ? editingEmployee.userId : null,
      status: formData.status,
      hireDate: formData.hireDate,
      baseSalary: Number(formData.baseSalary) || 0,
      commissionRate: Number(formData.commissionRate) || 0,
      avatar: formData.avatar,
      notes: formData.notes.trim(),
      totalOrdersHandled: editingEmployee ? editingEmployee.totalOrdersHandled : 0,
      totalRevenueGenerated: editingEmployee ? editingEmployee.totalRevenueGenerated : 0
    };

    if (editingEmployee) {
      updateEmployee(payload);
    } else {
      addEmployee(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa hồ sơ nhân viên "${name}"?`)) {
      deleteEmployee(id);
    }
  };

  const exportExcel = () => {
    const csvContent = [
      ['Mã NV', 'Họ Tên', 'Số Điện Thoại', 'Email', 'Vai Trò', 'Chức Danh', 'Chi Nhánh', 'Lương Cơ Bản', 'Hoa Hồng %', 'Trạng Thái'].join(','),
      ...employees.map(e =>
        [
          `"${e.code}"`,
          `"${e.name}"`,
          `"${e.phone}"`,
          `"${e.email}"`,
          `"${e.role}"`,
          `"${e.roleTitle}"`,
          `"${e.branch}"`,
          e.baseSalary,
          e.commissionRate,
          e.status === 'active' ? 'Đang làm việc' : 'Nghỉ việc'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Nhan_Vien_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📥 Đã xuất file danh sách nhân sự thành công!');
  };

  const getRoleBadge = (role: EmployeeRole) => {
    switch (role) {
      case 'admin':
        return { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', label: 'Quản Trị Tối Cao' };
      case 'manager':
        return { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', label: 'Cửa Hàng Trưởng' };
      case 'cashier':
        return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Thu Ngân POS' };
      case 'warehouse':
        return { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', label: 'Thủ Kho' };
      case 'accountant':
        return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'Kế Toán' };
      default:
        return { bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20', label: role };
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Nhân Sự & Phân Quyền Vai Trò
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hồ sơ nhân viên, phân quyền truy cập hệ thống, mức lương cơ bản, hoa hồng doanh số & đánh giá hiệu quả
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canExportExcel && (
            <button
              id="export-employees-btn"
              onClick={exportExcel}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Danh Sách
            </button>
          )}

          <button
            id="create-employee-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Thêm Nhân Viên Mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Nhân Sự</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-emerald-600 font-medium">{stats.active} đang làm</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Thu Ngân / POS</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.cashiers}</span>
            <span className="text-xs text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">Trực quầy</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Quản Lý & Admin</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.managers}</span>
            <span className="text-xs text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium">Duyệt nợ / Két</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Chi Nhánh Hoạt Động</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
            <span className="text-xs text-slate-400">Q.1 & Bình Tân</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-500 font-medium">Tổng Quỹ Lương Cơ Bản</span>
          <div className="mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.totalSalary.toLocaleString('vi-VN')} đ
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Chưa gồm thưởng hoa hồng</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV, số điện thoại, chức danh..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Vai trò:</span>
          </div>
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="manager">Cửa hàng trưởng</option>
            <option value="cashier">Thu ngân (POS)</option>
            <option value="warehouse">Thủ kho</option>
            <option value="accountant">Kế toán trưởng</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang làm việc</option>
            <option value="inactive">Đã nghỉ việc</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4">Vai Trò & Chức Danh</th>
                <th className="py-3 px-4">Chi Nhánh Làm Việc</th>
                <th className="py-3 px-4">Liên Hệ (SĐT / Email)</th>
                <th className="py-3 px-4 text-right">Lương & Hoa Hồng</th>
                <th className="py-3 px-4 text-center">Hiệu Suất (Đơn / Dthu)</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    Không tìm thấy nhân viên nào phù hợp
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => {
                  const roleBadge = getRoleBadge(emp.role);

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">
                              {emp.name}
                            </span>
                            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {emp.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.bg}`}
                          >
                            {roleBadge.label}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            {emp.roleTitle}
                          </p>
                        </div>
                      </td>

                      {/* Branch & User Account */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 font-medium">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {emp.branch}
                          </span>
                          {emp.userId ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                              <Shield className="w-2.5 h-2.5" />
                              Tài khoản đăng nhập
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] text-slate-400">
                              Chưa cấp tài khoản
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {emp.phone}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {emp.email}
                          </span>
                        </div>
                      </td>

                      {/* Salary & Commission */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {emp.baseSalary.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                            Hoa hồng: +{emp.commissionRate}%
                          </span>
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="py-3 px-4 text-center">
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {emp.totalOrdersHandled} đơn
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {emp.totalRevenueGenerated > 0
                              ? `${(emp.totalRevenueGenerated / 1000000).toFixed(1)} tr đ`
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            emp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {emp.status === 'active' ? 'Đang làm' : 'Đã nghỉ'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <RowActionMenu
                          items={[
                            {
                              id: `edit-employee-${emp.id}`,
                              label: 'Chỉnh sửa hồ sơ',
                              icon: Edit2,
                              variant: 'indigo',
                              onClick: () => handleOpenEdit(emp),
                            },
                            {
                              id: `delete-employee-${emp.id}`,
                              label: 'Xóa nhân viên',
                              icon: Trash2,
                              variant: 'danger',
                              divider: true,
                              onClick: () => handleDelete(emp.id, emp.name),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEmployees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="nhân viên"
          className="border-t border-slate-200 dark:border-slate-800"
        />
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingEmployee ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Nhân Viên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase"
                    placeholder="VD: NV-007"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ Và Tên Nhân Viên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Lê Thị Kim Oanh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Điện Thoại Di Động *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: 0908.123.456"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Doanh Nghiệp
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: oanh.le@nexus-erp.vn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phân Quyền Vai Trò Hệ Thống *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="admin">Quản Trị Viên Tối Cao (Admin)</option>
                    <option value="manager">Cửa Hàng Trưởng (Manager)</option>
                    <option value="cashier">Nhân Viên Thu Ngân (Cashier)</option>
                    <option value="warehouse">Thủ Kho (Warehouse)</option>
                    <option value="accountant">Kế Toán Trưởng (Accountant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chức Danh Hiển Thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Trưởng Ca Thu Ngân Sáng"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chi Nhánh Trực Thuộc *
                  </label>
                  <select
                    value={formData.branchId || ''}
                    onChange={e => {
                      const selectedBr = branches.find(b => b.id === e.target.value);
                      setFormData({
                        ...formData,
                        branchId: e.target.value,
                        branch: selectedBr ? selectedBr.name : formData.branch
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">-- Chọn Chi Nhánh --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kho Hàng Trực Thuộc
                  </label>
                  <select
                    value={formData.warehouseId || ''}
                    onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">-- Tất cả kho hoặc không cố định --</option>
                    {warehouses
                      .filter(w => !formData.branchId || w.branchId === formData.branchId)
                      .map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng Thái Hoạt Động
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Tạm ngưng / Nghỉ việc</option>
                </select>
              </div>

              {/* Compensation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Chính Sách Lương & Hoa Hồng
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Lương Cơ Bản Tháng (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.baseSalary}
                      onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Tỷ Lệ Hoa Hồng Doanh Số (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={formData.commissionRate}
                      onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Local Folder Avatar Picker (Chọn từ thư mục máy tính) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Ảnh Đại Diện Nhân Viên (Chọn Từ Thư Mục Máy Tính)
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '' })}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Hidden input for local file browser */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />

                {/* Dropzone & Preview Box */}
                {formData.avatar ? (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={formData.avatar}
                      alt="Xem trước ảnh đại diện nhân viên"
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm shrink-0"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã chọn ảnh chân dung nhân viên
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ảnh đã tải trực tiếp từ máy tính và sẵn sàng lưu vào hồ sơ nhân sự.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Đổi Ảnh Khác Từ Máy Tính
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDraggingAvatar(true);
                    }}
                    onDragLeave={() => setIsDraggingAvatar(false)}
                    onDrop={handleDropAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDraggingAvatar
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Nhấn vào đây để chọn ảnh từ thư mục máy tính
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      hoặc kéo thả tệp hình ảnh vào khung này (Hỗ trợ PNG, JPG, WEBP, tối đa 5MB)
                    </span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Hoặc chọn nhanh ảnh mẫu:</span>
                  {PRESET_AVATARS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: p.url })}
                      className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-600 dark:text-slate-300"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Phụ Trách & Chuyên Môn
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="VD: Giữ mã PIN quản trị, phụ trách kiểm soát ca sáng..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {editingEmployee ? 'Cập Nhật Hồ Sơ' : 'Lưu Nhân Viên Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

