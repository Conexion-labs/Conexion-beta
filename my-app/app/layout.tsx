import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conexion — Talk to Strangers Instantly",
  description: "Connect anonymously with random people via text or video chat. No sign-up required.",
  keywords: ["random chat", "video chat", "text chat", "strangers", "conexion", "anonymous"],
  openGraph: {
    title: "Conexion — Talk to Strangers Instantly",
    description: "Connect anonymously with random people via text or video chat.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: "100%" }} className={inter.variable}>
      <body style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </body>
    </html>
  );
}
