import type { Metadata, Viewport } from "next";
import { Inter, Protest_Strike } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const protest = Protest_Strike({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-protest",
});

export const metadata: Metadata = { title: "Lost & Found" };

// penting untuk HP: lebar layar asli + area aman notch/home bar
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#132441",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${protest.variable}`}>
      <body>{children}</body>
    </html>
  );
}