import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitorPing from "@/components/layout/VisitorPing";

export const metadata: Metadata = {
  metadataBase: new URL("https://nhadatgiatot247.com"),
  title: {
    default: "Nhà đất giá tốt 24h — Mua bán & cho thuê bất động sản",
    template: "%s | Nhà đất giá tốt 24h",
  },
  description:
    "Mua bán & cho thuê nhà phố, căn hộ, đất nền, mặt bằng kinh doanh trên toàn quốc. Giá tốt nhất 24h — nhadatgiatot247.com",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Nhà đất giá tốt 24h",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <VisitorPing />
      </body>
    </html>
  );
}
