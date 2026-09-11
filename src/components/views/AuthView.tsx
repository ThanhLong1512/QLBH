"use client";
import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole, ROLE_CONFIG } from '../../types/erp';
import {
  ShieldCheck,
  Shield,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  QrCode,
  PackageCheck,
  CheckCircle2,
  RotateCcw,
  Sun,
  Moon,
  KeyRound,
  Layers,
  Store,
  Warehouse,
  Wallet,
  Loader2
} from 'lucide-react';

interface Props {
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
}

export const AuthView: React.FC<Props> = ({ initialMode = 'login', onSuccess }) => {
  const { theme, toggleTheme, login, register, resetPassword, showToast } = useERP();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('admin@nexus-erp.vn');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginRole, setLoginRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regScale, setRegScale] = useState('Chuỗi 3-10 Chi Nhánh');
  const [regRole, setRegRole] = useState<UserRole>('admin');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreed, setRegAgreed] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);

  // Quick fill demo credentials (All 5 Roles)
  const fillDemo = (roleType: UserRole) => {
    setLoginRole(roleType);
    if (roleType === 'admin') {
      setLoginEmail('admin@nexus-erp.vn');
      setLoginPassword('123456');
      showToast('⚡ Đã nạp tài khoản: Quản Trị Viên (Admin)');
    } else if (roleType === 'manager') {
      setLoginEmail('quanly@nexus-erp.vn');
      setLoginPassword('123456');
      showToast('⚡ Đã nạp tài khoản: Cửa Hàng Trưởng (Manager)');
    } else if (roleType === 'cashier') {
      setLoginEmail('thungan@nexus-erp.vn');
      setLoginPassword('123456');
      showToast('⚡ Đã nạp tài khoản: Thu Ngân (Cashier)');
    } else if (roleType === 'warehouse') {
      setLoginEmail('thukho@nexus-erp.vn');
      setLoginPassword('123456');
      showToast('⚡ Đã nạp tài khoản: Thủ Kho (Warehouse)');
    } else if (roleType === 'accountant') {
      setLoginEmail('ketoan@nexus-erp.vn');
      setLoginPassword('123456');
      showToast('⚡ Đã nạp tài khoản: Kế Toán Trưởng (Accountant)');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('⚠️ Vui lòng nhập Email hoặc Tên đăng nhập!');
      return;
    }
    if (!loginPassword) {
      showToast('⚠️ Vui lòng nhập Mật khẩu bảo mật!');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(loginEmail, loginPassword, loginRole);
      if (ok && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regBusinessName.trim() || !regEmail.trim() || !regPhone.trim()) {
      showToast('⚠️ Vui lòng điền đầy đủ các thông tin doanh nghiệp bắt buộc!');
      return;
    }
    if (regPassword.length < 6) {
      showToast('⚠️ Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('⚠️ Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    if (!regAgreed) {
      showToast('⚠️ Vui lòng đồng ý với điều khoản sử dụng ERP!');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await register({
        name: regName,
        businessName: regBusinessName,
        email: regEmail,
        phone: regPhone,
        businessScale: regScale,
        password: regPassword,
        role: regRole,
      });
      if (ok && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('⚠️ Vui lòng nhập Email hoặc Số điện thoại đăng ký!');
      return;
    }
    setForgotStep(2);
    setForgotOtp('888666'); // Demo pre-filled or hint
    showToast(`📩 Đã gửi mã xác thực 6 số đến ${forgotEmail}. Mã mẫu: 888666`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.trim() !== '888666' && forgotOtp.length < 4) {
      showToast('⚠️ Mã OTP không hợp lệ. Vui lòng nhập lại (Mã mẫu: 888666)');
      return;
    }
    setForgotStep(3);
    showToast('✅ Xác thực mã OTP thành công! Vui lòng đặt mật khẩu mới.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPass.length < 6) {
      showToast('⚠️ Mật khẩu mới cần tối thiểu 6 ký tự!');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      showToast('⚠️ Mật khẩu xác nhận không khớp!');
      return;
    }

    resetPassword(forgotEmail, forgotNewPass);
    setLoginEmail(forgotEmail);
    setLoginPassword(forgotNewPass);
    setMode('login');
    setForgotStep(1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 dark:bg-[#080B11] dark:text-slate-100 font-sans transition-colors duration-200">
      {/* LEFT COLUMN: Enterprise Value Showcase */}
      <div className="lg:w-5/12 bg-white dark:bg-[#0E1320] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Brand */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  NEXUS ERP
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  v3.4 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hệ thống Quản Trị Phân Phối & Bán Lẻ Đa Điểm
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Vận Hành Chuỗi Cửa Hàng & Tổng Kho Chuẩn Quốc Tế
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Giải pháp toàn diện kết nối Bàn POS bán lẻ, Quản lý kho FEFO cận hạn, Tra cứu Serial IMEI, Đối soát VietQR tự động và Bảo lãnh hạn mức nợ Credit Guard.
            </p>
          </div>

          {/* Core Highlights List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bàn POS Đa Đơn & 3 Cấp Giá</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Quy đổi Thùng/Hộp/Cái tức thì, chống bán lỗ dưới giá vốn và hỗ trợ mở đồng thời nhiều tab.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">VietQR Động Khớp Tiền 0đ</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tự động sinh mã QR động kèm số tiền và mã đơn, nhận biến động số dư và thông báo tức thời.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Credit Guard & Tuổi Nợ 4 Tầng</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Kiểm soát trần tín dụng đại lý, khoanh vùng nợ quá hạn và quy trình phê duyệt vượt trần.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Quote */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 mt-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
              NX
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Bảo chứng dữ liệu tài chính</p>
              <p className="text-[11px] text-slate-400">Mã hóa đa tầng, phân quyền Admin & Thu ngân độc lập</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Authentication Form */}
      <div className="lg:w-7/12 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        {/* Top Control Bar: Dark Mode & Help */}
        <div className="w-full max-w-md flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Máy chủ đám mây trực tuyến
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
            title="Chuyển chế độ Sáng / Tối"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Giao diện Sáng</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
                <span>Giao diện Tối</span>
              </>
            )}
          </button>
        </div>

        {/* Authentication Card */}
        <div className="w-full max-w-md bg-white dark:bg-[#111625] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Đăng Ký
            </button>
            <button
              onClick={() => setMode('forgot')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'forgot'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Quên Mật Khẩu
            </button>
          </div>

          {/* ================= MODE 1: LOGIN ================= */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Đăng Nhập Hệ Thống
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nhập thông tin xác thực để truy cập phiên làm việc ERP
                </p>
              </div>

              {/* Fast Demo Pill Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold">Nạp nhanh 5 tài khoản mẫu theo vai trò:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                      loginRole === 'admin'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="h-3 w-3 text-indigo-600" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo('manager')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                      loginRole === 'manager'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="h-3 w-3 text-purple-600" />
                    <span>Quản Lý</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo('cashier')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                      loginRole === 'cashier'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="h-3 w-3 text-emerald-600" />
                    <span>Thu Ngân</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo('warehouse')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                      loginRole === 'warehouse'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Warehouse className="h-3 w-3 text-amber-600" />
                    <span>Thủ Kho</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo('accountant')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all col-span-2 sm:col-span-1 ${
                      loginRole === 'accountant'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="h-3 w-3 text-blue-600" />
                    <span>Kế Toán</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                {/* Email / Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email / Tên tài khoản
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@nexus-erp.vn"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Ghi nhớ phiên</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang xác thực với hệ thống...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Hệ Thống</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom switch to register */}
              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                Chưa có tài khoản doanh nghiệp?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Đăng ký dùng thử ngay
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 2: REGISTER ================= */}
          {mode === 'register' && (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Đăng Ký Tài Khoản Doanh Nghiệp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Khởi tạo hệ thống quản trị phân phối cho công ty hoặc chuỗi cửa hàng
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full name & Business Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Họ và tên đại diện *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Trần Hoàng Nam"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tên Doanh Nghiệp *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="Tập Đoàn Phân Phối NEXUS"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email công việc *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nam.tran@congty.vn"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0918 234 889"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Scale selection & Initial Role Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Quy mô vận hành
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <select
                        value={regScale}
                        onChange={(e) => setRegScale(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="1-2 Cửa Hàng Bán Lẻ">1-2 Cửa Hàng Bán Lẻ</option>
                        <option value="Chuỗi 3-10 Chi Nhánh">Chuỗi 3-10 Chi Nhánh</option>
                        <option value="Chuỗi 10+ Chi Nhánh & Kho Tổng">Chuỗi 10+ Chi Nhánh & Kho Tổng</option>
                        <option value="Nhà Phân Phối B2B & Đại Lý Toàn Quốc">Nhà Phân Phối B2B & Đại Lý Toàn Quốc</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Vai trò / Phân quyền ban đầu *
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="admin">Quản Trị Viên (Admin)</option>
                        <option value="manager">Cửa Hàng Trưởng (Manager)</option>
                        <option value="cashier">Thu Ngân POS (Cashier)</option>
                        <option value="warehouse">Thủ Kho & Vận Hành (Warehouse)</option>
                        <option value="accountant">Kế Toán Trưởng (Accountant)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mật khẩu *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Xác nhận mật khẩu *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms agreement */}
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <input
                    type="checkbox"
                    checked={regAgreed}
                    onChange={(e) => setRegAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>
                    Tôi đồng ý với <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Điều khoản dịch vụ</span> & cam kết bảo mật thông tin bán hàng ERP.
                  </span>
                </label>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang lưu thông tin vào cơ sở dữ liệu...</span>
                    </>
                  ) : (
                    <>
                      <span>Khởi Tạo Tài Khoản & Lưu DB</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom switch to login */}
              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                Đã có tài khoản?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 3: FORGOT PASSWORD ================= */}
          {mode === 'forgot' && (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Khôi Phục Mật Khẩu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {forgotStep === 1 && 'Bước 1: Nhập email hoặc số điện thoại đăng ký'}
                  {forgotStep === 2 && 'Bước 2: Nhập mã xác thực OTP gửi về tài khoản'}
                  {forgotStep === 3 && 'Bước 3: Thiết lập mật khẩu bảo mật mới'}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        forgotStep >= step
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Input Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email hoặc Số điện thoại quản trị
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@nexus-erp.vn hoặc 0918 234 889"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Gửi Mã Xác Thực OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Step 2: Input OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Mã OTP thử nghiệm nhanh:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">888666</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mã đã được tự động điền sẵn để bạn kiểm thử luồng khôi phục nhanh chóng.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mã OTP (6 chữ số)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="888666"
                      className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-lg font-bold font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Thời hạn mã còn: 59s</span>
                    <button
                      type="button"
                      onClick={() => showToast('📩 Đã gửi lại mã OTP: 888666')}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Gửi lại mã
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Xác Thực & Tiếp Tục</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mật khẩu mới *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Xác nhận mật khẩu mới *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Lưu Mật Khẩu & Đăng Nhập</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Back to Login link */}
              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => {
                    setMode('login');
                    setForgotStep(1);
                  }}
                  className="font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Quay lại Đăng nhập
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

