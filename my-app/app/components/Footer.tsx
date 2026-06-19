"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-warm-white)" }}>
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

          {/* Branding */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-charcoal)" }}>
              Cone<span style={{ color: "var(--color-peach)" }}>x</span>ion
            </Link>
            <p className="text-xs max-w-xs text-center md:text-left leading-relaxed"
              style={{ color: "var(--color-gray-light)" }}>
              Anonymous conversations, real connections.
              No sign-up, no traces, just talk.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--color-gray-brown)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-charcoal)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-brown)")}
            >
              Terms of Service
            </Link>
            <span style={{ color: "var(--color-border)", fontSize: 12 }}>•</span>
            <Link
              href="/privacy"
              className="text-sm font-medium transition-colors"
              style={{ color: "var(--color-gray-brown)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-charcoal)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-brown)")}
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="text-xs font-medium tracking-wide"
            style={{ color: "var(--color-gray-light)" }}>
            © {new Date().getFullYear()} Conexion. All rights reserved.
          </p>
          <p className="text-xs font-medium tracking-wide flex items-center gap-2"
            style={{ color: "var(--color-gray-light)" }}>
            <span className="status-dot" />
            Built for privacy-first communication
          </p>
        </div>
      </div>
    </footer>
  );
}
