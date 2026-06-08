"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "searching" | "chatting" | "ended";
type ChatMode = "text" | "video";
interface Msg { id: string; from: "me" | "them" | "system"; text: string; }

const INTERESTS = ["Music","Gaming","Travel","Art","Tech","Movies","Sports","Books","Anime","Food","Science","Fitness"];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function CamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
}

function CamOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <polyline points="13 17 18 12 13 7"/>
      <polyline points="6 17 11 12 6 7"/>
    </svg>
  );
}

function EndIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PersonIcon({ size = 40, opacity = 0.25 }: { size?: number; opacity?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size} style={{ opacity }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function ChatApp() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") as ChatMode | null;
  const [mode, setMode] = useState<ChatMode>(modeParam === "video" ? "video" : "text");

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      setMsgs([sys("Connected to a stranger. Say hello!")]);
    }, 1800);
  };

  const stopSearch = () => {
    setStatus("idle");
    setElapsed(0);
    setMsgs([]);
  };

  const skip = () => { startSearch(); };

  const endCall = () => {
    setStatus("ended");
    setMsgs(m => [...m, sys("You disconnected.")]);
  };

  const send = () => {
    if (!draft.trim() || status !== "chatting") return;
    setMsgs(m => [...m, { id: crypto.randomUUID(), from: "me", text: draft.trim() }]);
    setDraft("");
    // mock reply
    setTimeout(() => {
      setMsgs(m => [...m, { id: crypto.randomUUID(), from: "them", text: "Oh, interesting! Tell me more." }]);
    }, 1200);
  };

  const switchMode = (m: ChatMode) => {
    setMode(m);
    if (status !== "idle") {
      setStatus("idle");
      setMsgs([]);
      setElapsed(0);
    }
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/" className="brand-logo" style={{ fontSize: "1.2rem" }}>
            Cone<span style={{ color: "var(--amber)" }}>x</span>ion
          </Link>

          {/* Mode toggle */}
          <div style={{
            display: "flex",
            background: "var(--surface)",
            borderRadius: "8px",
            padding: "3px",
            gap: "2px",
            border: "1.5px solid var(--border)"
          }}>
            <button
              id="switch-text-mode"
              onClick={() => switchMode("text")}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                border: "none",
                background: mode === "text" ? "var(--amber)" : "transparent",
                color: mode === "text" ? "#1c1400" : "var(--muted)",
                fontWeight: mode === "text" ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.18s",
                display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Text
            </button>
            <button
              id="switch-video-mode"
              onClick={() => switchMode("video")}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                border: "none",
                background: mode === "video" ? "var(--amber)" : "transparent",
                color: mode === "video" ? "#1c1400" : "var(--muted)",
                fontWeight: mode === "video" ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.18s",
                display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Video
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {status === "chatting" && (
            <div className="status-badge connected">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: "pulseGlow 2s infinite" }} />
              {fmt(elapsed)}
            </div>
          )}
          {status === "searching" && (
            <div className="status-badge searching">
              <div className="searching-spinner" />
              Searching…
            </div>
          )}
          <button
            id="interests-btn"
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
            onClick={() => setShowTags(true)}
          >
            Interests {tags.length > 0 && `(${tags.length})`}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {mode === "text" ? (
          /* ===== TEXT CHAT ===== */
          <div className="text-chat-layout">
            {status === "idle" || status === "ended" ? (
              <div className="idle-screen">
                <div style={{ fontSize: "2.5rem" }}>💬</div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {status === "ended" ? "Chat ended" : "Start a text chat"}
                </h2>
                <p style={{ color: "var(--muted)", maxWidth: 340, lineHeight: 1.6 }}>
                  {status === "ended"
                    ? "Ready for another conversation?"
                    : "You'll be connected to a random stranger. Type away!"}
                </p>
                <button id="start-text-search" className="btn-primary" onClick={startSearch}>
                  {status === "ended" ? "New Chat" : "Start Chatting"}
                </button>
              </div>
            ) : status === "searching" ? (
              <div className="idle-screen">
                <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--amber)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
                <p style={{ color: "var(--muted)" }}>Finding someone to talk to…</p>
                <button className="btn-secondary" onClick={stopSearch}>Cancel</button>
              </div>
            ) : (
              <>
                <div className="text-chat-messages">
                  {msgs.map(m =>
                    m.from === "system" ? (
                      <div key={m.id} className="sys-msg">{m.text}</div>
                    ) : (
                      <div key={m.id} className={`chat-bubble ${m.from}`}>{m.text}</div>
                    )
                  )}
                  <div ref={endRef} />
                </div>

                <div className="text-chat-input">
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button id="text-skip-btn" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.85rem" }} onClick={skip}>Skip</button>
                    <button id="text-end-btn" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.85rem", color: "var(--danger)", borderColor: "rgba(220,38,38,0.25)" }} onClick={endCall}>End Chat</button>
                  </div>
                  <div className="text-input-row">
                    <textarea
                      ref={textareaRef}
                      id="text-message-input"
                      className="text-input-field"
                      placeholder="Type a message…"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      rows={1}
                      disabled={status !== "chatting"}
                    />
                    <button id="text-send-btn" className="send-btn" onClick={send} disabled={!draft.trim() || status !== "chatting"}>
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ===== VIDEO CHAT ===== */
          <div className="video-chat-layout">
            {/* Side-by-side video panels */}
            <div className="video-stage">
              {/* LEFT: Current User (You) */}
              <div className="video-panel" id="video-panel-self">
                {camOn ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <PersonIcon size={48} opacity={0.2} />
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Camera preview</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" style={{ opacity: 0.2, color: "white" }}>
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Camera off</span>
                  </div>
                )}
                <div className="video-panel-label">You</div>
              </div>

              {/* RIGHT: Stranger */}
              <div className="video-panel" id="video-panel-stranger">
                {status === "searching" ? (
                  <div className="searching-overlay">
                    <div className="searching-overlay-spinner" />
                    <p>Finding a match…</p>
                  </div>
                ) : status === "chatting" ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <PersonIcon size={48} opacity={0.2} />
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Stranger's camera</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <PersonIcon size={48} opacity={0.15} />
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>
                      {status === "ended" ? "Disconnected" : "Waiting for match"}
                    </span>
                  </div>
                )}
                <div className="video-panel-label">Stranger</div>
              </div>
            </div>

            {/* Controls bar */}
            <div className="controls-bar">
              <button id="video-mic-btn" className={`ctrl-btn ${!micOn ? "danger" : ""}`} onClick={() => setMicOn(!micOn)} title={micOn ? "Mute" : "Unmute"}>
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </button>
              <button id="video-cam-btn" className={`ctrl-btn ${!camOn ? "danger" : ""}`} onClick={() => setCamOn(!camOn)} title={camOn ? "Camera off" : "Camera on"}>
                {camOn ? <CamIcon /> : <CamOffIcon />}
              </button>

              <div className="ctrl-divider" />

              {status === "idle" && (
                <button id="video-start-btn" className="ctrl-btn amber" onClick={startSearch} title="Start">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="10 8 16 12 10 16 10 8"/>
                  </svg>
                </button>
              )}
              {status === "searching" && (
                <button id="video-cancel-btn" className="ctrl-btn danger" onClick={stopSearch} title="Cancel">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
              {status === "chatting" && (
                <>
                  <button id="video-skip-btn" className="ctrl-btn" onClick={skip} title="Skip">
                    <SkipIcon />
                  </button>
                  <button id="video-end-btn" className="ctrl-btn danger" onClick={endCall} title="End Call">
                    <EndIcon />
                  </button>
                </>
              )}
              {status === "ended" && (
                <button id="video-new-btn" className="ctrl-btn amber" onClick={startSearch} title="New Connection">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                  </svg>
                </button>
              )}
            </div>

            {/* In-video text chat strip */}
            <div className="video-chat-text">
              <div className="video-chat-messages">
                {msgs.length === 0 && (
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: 8 }}>
                    {status === "idle" || status === "ended"
                      ? "Press start to connect"
                      : status === "searching"
                      ? "Connecting…"
                      : "Messages appear here"}
                  </div>
                )}
                {msgs.map(m =>
                  m.from === "system" ? (
                    <div key={m.id} className="sys-msg">{m.text}</div>
                  ) : (
                    <div key={m.id} className={`chat-bubble ${m.from}`} style={{ fontSize: "0.88rem", padding: "8px 12px" }}>{m.text}</div>
                  )
                )}
                <div ref={endRef} />
              </div>
              <div className="video-chat-input-row">
                <textarea
                  id="video-message-input"
                  className="text-input-field"
                  placeholder={status === "chatting" ? "Type a message…" : "Connect first…"}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  disabled={status !== "chatting"}
                  style={{ fontSize: "0.88rem", minHeight: 38 }}
                />
                <button id="video-send-btn" className="send-btn" onClick={send} disabled={!draft.trim() || status !== "chatting"} style={{ width: 38, height: 38 }}>
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interests Modal */}
      {showTags && (
        <div className="modal-overlay" id="interests-modal" onClick={e => e.target === e.currentTarget && setShowTags(false)}>
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Filter by Interests</h2>
              <button id="close-interests-modal" onClick={() => setShowTags(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
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
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn-secondary" onClick={() => setTags([])}>Clear All</button>
              <button className="btn-primary" onClick={() => setShowTags(false)}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatApp />
    </Suspense>
  );
}
