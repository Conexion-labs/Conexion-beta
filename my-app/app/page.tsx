"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="glass-nav">
        <div className="brand-logo f-display">Conexion</div>
        <div>
          <Link href="/chat" className="btn-secondary" style={{ fontSize: "0.875rem", padding: "8px 16px" }}>
            Launch App
          </Link>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-pill animate-slide-up">
          <span className="dot"></span>
          Systems operational &middot; High-quality video & audio
        </div>

        <h1 className="hero-title f-display animate-slide-up delay-100">
          The new standard for <br />
          <span>spontaneous connection.</span>
        </h1>

        <p className="hero-desc animate-slide-up delay-200">
          Drop the friction. No accounts, no tracing, no waiting. Instantly connect with people worldwide in beautiful high-definition video, crystal clear audio, and real-time chat.
        </p>

        <div className="animate-slide-up delay-300" style={{ display: "flex", gap: "16px" }}>
          <Link href="/chat" className="btn-primary">
            Start a Connection
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </main>

      <section className="bento-grid">
        <div className="bento-card animate-slide-up delay-100">
          <div className="bento-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"></path>
              <rect x="3" y="6" width="12" height="12" rx="2" ry="2"></rect>
            </svg>
          </div>
          <h3 className="bento-title f-display">HD Video & Audio</h3>
          <p className="bento-desc">Experience latency-free, peer-to-peer WebRTC streaming. No servers storing your data, just a direct line to your conversation partner.</p>
        </div>

        <div className="bento-card animate-slide-up delay-200">
          <div className="bento-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 className="bento-title f-display">Interest Matching</h3>
          <p className="bento-desc">Add tags to filter your match queue. Find people who share your passions for music, gaming, tech, or whatever keeps you going.</p>
        </div>

        <div className="bento-card animate-slide-up delay-300">
          <div className="bento-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3 className="bento-title f-display">Absolute Privacy</h3>
          <p className="bento-desc">Your privacy is our core principle. Every session is ephemeral. Once you skip or close the tab, the connection vanishes forever.</p>
        </div>
      </section>
    </>
  );
}
