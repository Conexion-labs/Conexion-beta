import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-[#07070e] text-white min-h-screen flex flex-col font-sans relative overflow-x-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none fixed top-0 left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/10 blur-[120px] mix-blend-screen z-0"></div>
        <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-500/10 blur-[140px] mix-blend-screen z-0"></div>
        <div className="pointer-events-none fixed top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[100px] mix-blend-screen z-0"></div>
        
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
