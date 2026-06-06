"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Status = "idle" | "searching" | "chatting" | "ended";
interface Msg { id: string; from: "me" | "them" | "system"; text: string; }

const INTERESTS = ["Music","Gaming","Travel","Art","Tech","Movies","Sports","Books","Anime","Food","Science","Fitness"];

export default function ChatApp() {
  const [status, setStatus] = useState<Status>("idle");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);
  
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (status === "chatting") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const sys = (text: string): Msg => ({ id: crypto.randomUUID(), from: "system", text });

  const startSearch = () => {
    setStatus("searching");
    setElapsed(0);
    setMsgs([]);
    setTimeout(() => {
      setStatus("chatting");
      setMsgs([sys("Connected to a new stranger.")]);
    }, 1500);
  };

  const stopSearch = () => {
    setStatus("idle");
    setElapsed(0);
    setMsgs([]);
  };

  const skip = () => {
    startSearch();
  };

  const endCall = () => {
    setStatus("ended");
    setMsgs(m => [...m, sys("You have disconnected.")]);
  };

  const send = () => {
    if (!draft.trim() || status !== "chatting") return;
    setMsgs(m => [...m, { id: crypto.randomUUID(), from: "me", text: draft.trim() }]);
    setDraft("");
    // mock reply
    setTimeout(() => {
      setMsgs(m => [...m, { id: crypto.randomUUID(), from: "them", text: "Oh, neat! Tell me more." }]);
    }, 1000);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <Link href="/" className="brand-logo f-display" style={{fontSize: "1.25rem"}}>Conexion</Link>
        <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
          {status === "chatting" && (
            <div className="status-badge" style={{color: "#22c55e", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)"}}>
              <span style={{width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: "pulseGlow 2s infinite"}} />
              {fmt(elapsed)}
            </div>
          )}
          <button className="btn-secondary" style={{padding: "6px 12px", fontSize: "0.85rem"}} onClick={() => setShowTags(true)}>
            Interests {tags.length > 0 && `(${tags.length})`}
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="app-main">
        {/* Left: Video Stage */}
        <section className="video-stage">
          {/* Main Video (Stranger) */}
          {status === "chatting" ? (
             <div className="video-overlay" style={{background: "transparent"}}>
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64" style={{opacity: 0.2, color: "white"}}>
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                 <circle cx="12" cy="7" r="4" />
               </svg>
             </div>
          ) : status === "searching" ? (
             <div className="video-overlay">
               <div style={{width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spinSlow 1s linear infinite"}} />
               <p style={{marginTop: 24, fontSize: "1.1rem", fontWeight: 600, color: "white"}}>Searching the globe...</p>
             </div>
          ) : (
             <div className="video-overlay">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color: "var(--muted)", marginBottom: 16}}>
                 <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z"></path>
                 <rect x="3" y="6" width="12" height="12" rx="2" ry="2"></rect>
               </svg>
               <h2 className="f-display" style={{fontSize: "1.5rem", color: "white", marginBottom: 8}}>Ready to connect</h2>
               <p style={{color: "var(--muted)"}}>Start the engine to find a match.</p>
               {status === "idle" && (
                 <button className="btn-primary" style={{marginTop: 24}} onClick={startSearch}>Start Search</button>
               )}
               {status === "ended" && (
                 <button className="btn-primary" style={{marginTop: 24}} onClick={startSearch}>New Connection</button>
               )}
             </div>
          )}

          {/* PIP Video (Me) */}
          <div className="video-small-container">
            {camOn ? (
              <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#222"}}>
                <span style={{color: "var(--muted)", fontSize: "0.85rem"}}>You</span>
              </div>
            ) : (
              <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" style={{color: "var(--muted)"}}>
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
            )}
          </div>

          {/* Controls Dock */}
          <div className="controls-dock">
            <button className={`ctrl-btn ${!micOn ? "danger" : ""}`} onClick={() => setMicOn(!micOn)}>
              {micOn ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
            <button className={`ctrl-btn ${!camOn ? "danger" : ""}`} onClick={() => setCamOn(!camOn)}>
              {camOn ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>

            <div style={{width: 1, background: "rgba(255,255,255,0.2)", margin: "0 8px"}} />

            {status === "chatting" ? (
              <>
                <button className="ctrl-btn" onClick={skip} title="Skip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
                </button>
                <button className="ctrl-btn danger" onClick={endCall} title="End Call">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
                </button>
              </>
            ) : status === "searching" ? (
              <button className="ctrl-btn danger" onClick={stopSearch} title="Cancel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            ) : null}
          </div>
        </section>

        {/* Right: Text Chat */}
        <aside className="chat-sidebar">
          <div className="chat-messages">
            {msgs.map(m => (
              m.from === "system" ? (
                <div key={m.id} style={{textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", margin: "8px 0", textTransform: "uppercase", letterSpacing: "0.05em"}}>{m.text}</div>
              ) : (
                <div key={m.id} className={`chat-bubble ${m.from}`}>{m.text}</div>
              )
            ))}
            <div ref={endRef} />
          </div>
          
          <div className="chat-input-area">
            <div className="chat-input-box">
              <textarea 
                className="chat-input"
                placeholder="Type a message..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
                rows={1}
                disabled={status !== "chatting"}
              />
              <button className="chat-send-btn" onClick={send} disabled={!draft.trim() || status !== "chatting"}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Interests Modal */}
      {showTags && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTags(false)}>
          <div className="modal-box">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24}}>
              <h2 className="f-display" style={{fontSize: "1.5rem", fontWeight: 700}}>Filter Interests</h2>
              <button onClick={() => setShowTags(false)} style={{background: "transparent", border: "none", color: "var(--fg)", cursor: "pointer"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px"}}>
              {INTERESTS.map(t => {
                const isActive = tags.includes(t);
                return (
                  <button 
                    key={t} 
                    className={`tag-btn ${isActive ? "active" : ""}`}
                    onClick={() => setTags(p => isActive ? p.filter(x => x !== t) : [...p, t])}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <div style={{display: "flex", justifyContent: "flex-end", gap: "12px"}}>
              <button className="btn-secondary" onClick={() => setTags([])}>Clear All</button>
              <button className="btn-primary" onClick={() => setShowTags(false)}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
