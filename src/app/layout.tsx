import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "NEXUS ERP - Hệ Thống Quản Lý Bán Lẻ & Chuỗi Phân Phối Chuyên Nghiệp",
  description: "Giải pháp ERP toàn diện: POS đa quầy, quản trị công nợ & tuổi nợ B2B, quản lý kho đa đơn vị tính, chống thất thoát hàng hóa.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
