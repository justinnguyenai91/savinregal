import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LayoutShell } from "@/components/layout/LayoutShell";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Savin Regal | Sâm Ngọc Linh Chính Hãng - Dược Liệu Quý Từ Núi Rừng",
  description:
    "Savin Regal — chuyên cung cấp Sâm Ngọc Linh chính hãng từ Kon Tum, dược liệu quý hiếm từ núi rừng Tây Nguyên. Cam kết 100% tự nhiên, kiểm định chất lượng. Liên hệ: 0901690470.",
  keywords: "savin regal, sâm ngọc linh, sam ngoc linh, dược liệu, sức khỏe, kon tum, sâm việt nam, savin.vn",
  openGraph: {
    title: "Savin Regal | Sâm Ngọc Linh Chính Hãng",
    description: "Dược liệu quý từ núi rừng — Sâm Ngọc Linh chính hãng từ Kon Tum. Cam kết 100% tự nhiên.",
    type: "website",
    locale: "vi_VN",
    url: "https://savin.vn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <LayoutShell>{children}</LayoutShell>
        </CartProvider>
      </body>
    </html>
  );
}
