import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập Hệ Thống - NEXUS ERP Enterprise",
  description: "Cổng đăng nhập an toàn hệ thống quản lý bán hàng & quản trị doanh nghiệp NEXUS ERP.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
