"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="glass-nav">
        <div className="brand-logo">Cone<span>x</span>ion</div>
        <Link href="/chat" className="btn-secondary" style={{ fontSize: "0.875rem", padding: "7px 16px" }}>
          Launch App
        </Link>
      </nav>

      <main className="hero">
        <div className="hero-pill animate-slide-up">
          <span className="dot" />
          Live &middot; Anonymous &middot; Instant
        </div>

        <h1 className="hero-title animate-slide-up delay-100">
          Talk to someone<br />
          <span>new, right now.</span>
        </h1>

        <p className="hero-desc animate-slide-up delay-200">
          No sign-up. No waiting. Pick how you want to connect — text or video — and start talking to a stranger in seconds.
        </p>

        {/* Mode selection */}
        <div className="mode-selector animate-slide-up delay-300">
          <Link href="/chat?mode=text" className="mode-card" id="mode-text-chat">
            <div className="mode-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className="mode-card-label">Text Chat</div>
              <div className="mode-card-sub">Type &amp; connect</div>
            </div>
          </Link>

          <Link href="/chat?mode=video" className="mode-card" id="mode-video-chat">
            <div className="mode-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div>
              <div className="mode-card-label">Video Chat</div>
              <div className="mode-card-sub">Face to face</div>
            </div>
          </Link>
        </div>
      </main>

      <section className="bento-grid">
        <div className="bento-card animate-slide-up delay-100">
          <div className="bento-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h3 className="bento-title">HD Video &amp; Audio</h3>
          <p className="bento-desc">Peer-to-peer WebRTC streaming. No servers storing your data — just a direct line to your conversation partner.</p>
        </div>

        <div className="bento-card animate-slide-up delay-200">
          <div className="bento-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="bento-title">Interest Matching</h3>
          <p className="bento-desc">Filter by topics you care about — gaming, music, travel, tech — and find people who share your passions.</p>
        </div>

        <div className="bento-card animate-slide-up delay-300">
          <div className="bento-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="bento-title">Absolute Privacy</h3>
          <p className="bento-desc">Every session is ephemeral. Once you skip or close the tab, the connection is gone forever.</p>
        </div>
      </section>
    </>
  );
}
