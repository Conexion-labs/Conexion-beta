"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/stats")
      .then(res => res.json())
      .then(data => setOnlineCount(data.online))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="premium-bg"></div>
      
      <nav className="nav-bar reveal-up">
        <div className="logo">
          Cone<span className="accent">x</span>ion
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {onlineCount !== null && (
            <div className="online-status">
              <span className="online-dot"></span>
              {onlineCount} Online Now
            </div>
          )}
          <Link href="/chat" className="btn-glass">
            Enter App
          </Link>
        </div>
      </nav>

      <main className="hero-wrapper">
        <div className="hero-pill reveal-up delay-1">
          Live · Anonymous · Instant
        </div>

        <h1 className="hero-h1 reveal-up delay-2">
          Talk to someone<br />
          <span className="text-gradient-accent">new, right now.</span>
        </h1>

        <p className="hero-p reveal-up delay-3">
          No sign-up. No waiting. Dive into deep conversations with strangers across the globe in seconds.
        </p>

        <div className="mode-grid reveal-up delay-4">
          <Link href="/chat?mode=text" className="glass-card">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="card-title">Text Chat</h3>
            <p className="card-desc">Type &amp; connect anonymously in a secure, ephemeral space.</p>
          </Link>

          <Link href="/chat?mode=video" className="glass-card">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="4" ry="4" />
              </svg>
            </div>
            <h3 className="card-title">Video Chat</h3>
            <p className="card-desc">Face to face, instantly. High-definition peer-to-peer streaming.</p>
          </Link>
        </div>
      </main>

      <section className="features-container reveal-up delay-4">
        <div className="feature-item">
          <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "10px", color: "var(--fg)" }}>Direct WebRTC</h4>
          <p style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}>Your video and audio streams are peer-to-peer. We don&apos;t touch your data.</p>
        </div>
        <div className="feature-item">
          <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "10px", color: "var(--fg)" }}>Smart Matchmaking</h4>
          <p style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}>Filter by topics to find people who actually share your interests.</p>
        </div>
        <div className="feature-item">
          <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "10px", color: "var(--fg)" }}>Absolute Privacy</h4>
          <p style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}>Connections vanish the moment you skip. No traces left behind.</p>
        </div>
      </section>
    </>
  );
}
