import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="text-2xl font-black tracking-tight text-white hover:opacity-80 transition-opacity">
              Cone<span className="text-amber-500">x</span>ion
            </Link>
            <p className="text-xs text-white/30 font-medium max-w-xs text-center md:text-left leading-relaxed">
              Anonymous conversations, real connections. No sign-up, no traces, just talk.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-white/40 hover:text-amber-400 transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <span className="text-white/15 text-xs">•</span>
            <Link
              href="/privacy"
              className="text-sm text-white/40 hover:text-amber-400 transition-colors font-medium"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/25 font-medium tracking-wide">
            © {new Date().getFullYear()} Conexion. All rights reserved.
          </p>
          <p className="text-[11px] text-white/20 font-medium tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.4)]"></span>
            Built for privacy-first communication
          </p>
        </div>
      </div>
    </footer>
  );
}
