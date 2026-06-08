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

/* ── Icons ──────────────────────────────────── */
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const MicOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const CamIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const CamOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const SkipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <polyline points="13 17 18 12 13 7"/>
    <polyline points="6 17 11 12 6 7"/>
  </svg>
);

const EndCallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 5a10.94 10.94 0 0 0-2.78 5.67 1 1 0 0 0 .93 1.11h2.6a1 1 0 0 0 1-.78 8 8 0 0 1 .53-1.73M10.68 6a7.07 7.07 0 0 1 5 5"/>
    <path d="M14.61 14.61A3.11 3.11 0 0 1 12 16a3 3 0 0 1-2.68-1.68"/>
  </svg>
);

const NewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ── Main App ───────────────────────────────── */
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

  const stopSearch = () => { setStatus("idle"); setElapsed(0); setMsgs([]); };
  const skip = () => { startSearch(); };
  const endCall = () => {
    setStatus("ended");
    setMsgs(m => [...m, sys("You disconnected.")]);
  };

  const send = () => {
    if (!draft.trim() || status !== "chatting") return;
    setMsgs(m => [...m, { id: crypto.randomUUID(), from: "me", text: draft.trim() }]);
    setDraft("");
    setTimeout(() => {
      setMsgs(m => [...m, { id: crypto.randomUUID(), from: "them", text: "Oh interesting! Tell me more." }]);
    }, 1200);
  };

  const switchMode = (m: ChatMode) => {
    setMode(m);
    if (status !== "idle") { setStatus("idle"); setMsgs([]); setElapsed(0); }
  };

  return (
    <div className="app-layout">

      {/* ── Header ── */}
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" className="brand-logo" style={{ fontSize: "1.15rem" }}>
            Cone<span className="accent">x</span>ion
          </Link>

          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              id="switch-text-mode"
              className={`mode-toggle-btn ${mode === "text" ? "active" : "inactive"}`}
              onClick={() => switchMode("text")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Text
            </button>
            <button
              id="switch-video-mode"
              className={`mode-toggle-btn ${mode === "video" ? "active" : "inactive"}`}
              onClick={() => switchMode("video")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Video
            </button>
          </div>
        </div>

        {/* Right side: status + interests */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {status === "chatting" && (
            <div className="status-badge connected">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: "pulse 2s infinite" }} />
              {fmt(elapsed)}
            </div>
          )}
          {status === "searching" && (
            <div className="status-badge searching">
              <div className="search-spinner" />
              Searching…
            </div>
          )}
          <button
            id="interests-btn"
            className="btn-secondary"
            style={{ padding: "5px 12px", fontSize: "0.82rem" }}
            onClick={() => setShowTags(true)}
          >
            Interests {tags.length > 0 && <span style={{ color: "var(--amber)", fontWeight: 700 }}>({tags.length})</span>}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">

        {/* ══ TEXT CHAT ══ */}
        {mode === "text" && (
          <div className="text-chat-layout">

            {/* Idle */}
            {(status === "idle" || status === "ended") && (
              <div className="idle-screen">
                <div className="idle-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="idle-title">{status === "ended" ? "Chat ended" : "Start a text chat"}</p>
                <p className="idle-desc">
                  {status === "ended"
                    ? "Ready for another conversation?"
                    : "You'll be matched with a random stranger. No accounts, no traces."}
                </p>
                <button id="start-text-search" className="btn-primary" onClick={startSearch}>
                  {status === "ended" ? "New Chat" : "Start Chatting"}
                </button>
              </div>
            )}

            {/* Searching */}
            {status === "searching" && (
              <div className="idle-screen">
                <div className="big-spinner" />
                <p className="idle-title" style={{ fontSize: "1rem" }}>Finding someone…</p>
                <p className="idle-desc">Searching the globe for a match</p>
                <button className="btn-secondary" onClick={stopSearch}>Cancel</button>
              </div>
            )}

            {/* Chatting */}
            {status === "chatting" && (
              <>
                <div className="text-chat-messages">
                  {msgs.map(m =>
                    m.from === "system"
                      ? <div key={m.id} className="sys-msg">{m.text}</div>
                      : <div key={m.id} className={`chat-bubble ${m.from}`}>{m.text}</div>
                  )}
                  <div ref={endRef} />
                </div>

                <div className="text-chat-input-area">
                  <div className="action-row">
                    <button id="text-skip-btn" className="btn-secondary" style={{ padding: "5px 14px", fontSize: "0.82rem" }} onClick={skip}>
                      Skip
                    </button>
                    <button
                      id="text-end-btn"
                      className="btn-secondary"
                      style={{ padding: "5px 14px", fontSize: "0.82rem", color: "var(--danger)", borderColor: "rgba(239,68,68,0.2)" }}
                      onClick={endCall}
                    >
                      End Chat
                    </button>
                  </div>
                  <div className="input-row">
                    <textarea
                      id="text-message-input"
                      className="chat-textarea"
                      placeholder="Type a message…"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      rows={1}
                    />
                    <button id="text-send-btn" className="send-btn" onClick={send} disabled={!draft.trim()}>
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* ══ VIDEO CHAT ══ */}
        {mode === "video" && (
          <div className="video-chat-layout">

            {/* Side-by-side panels */}
            <div className="video-stage">

              {/* LEFT — You */}
              <div className="video-panel" id="video-panel-self">
                <div className="video-placeholder">
                  <div className="video-avatar">
                    {camOn
                      ? <PersonIcon />
                      : <CamOffIcon />
                    }
                  </div>
                  <p>{camOn ? "Your camera" : "Camera off"}</p>
                </div>
                <div className="video-panel-label">You</div>
              </div>

              {/* RIGHT — Stranger */}
              <div className="video-panel" id="video-panel-stranger">
                {status === "searching" ? (
                  <div className="searching-overlay">
                    <div className="searching-overlay-spinner" />
                    <p>Finding a match…</p>
                  </div>
                ) : status === "chatting" ? (
                  <div className="video-placeholder">
                    <div className="video-avatar">
                      <PersonIcon />
                    </div>
                    <p>Stranger&apos;s camera</p>
                  </div>
                ) : (
                  <div className="video-placeholder">
                    <div className="video-avatar" style={{ opacity: 0.4 }}>
                      <PersonIcon />
                    </div>
                    <p>{status === "ended" ? "Disconnected" : "Waiting for match"}</p>
                  </div>
                )}
                <div className="video-panel-label">Stranger</div>
              </div>

            </div>

            {/* Controls */}
            <div className="controls-bar">
              <button
                id="video-mic-btn"
                className={`ctrl-btn ${!micOn ? "muted" : ""}`}
                onClick={() => setMicOn(!micOn)}
                title={micOn ? "Mute mic" : "Unmute mic"}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </button>

              <button
                id="video-cam-btn"
                className={`ctrl-btn ${!camOn ? "muted" : ""}`}
                onClick={() => setCamOn(!camOn)}
                title={camOn ? "Turn off camera" : "Turn on camera"}
              >
                {camOn ? <CamIcon /> : <CamOffIcon />}
              </button>

              <div className="ctrl-divider" />

              {status === "idle" && (
                <button id="video-start-btn" className="ctrl-btn start-btn" onClick={startSearch} title="Start">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="10 8 16 12 10 16 10 8"/>
                  </svg>
                </button>
              )}

              {status === "searching" && (
                <button id="video-cancel-btn" className="ctrl-btn danger" onClick={stopSearch} title="Cancel">
                  <CloseIcon />
                </button>
              )}

              {status === "chatting" && (
                <>
                  <button id="video-skip-btn" className="ctrl-btn amber-btn" onClick={skip} title="Skip to next">
                    <SkipIcon />
                  </button>
                  <button id="video-end-btn" className="ctrl-btn danger" onClick={endCall} title="End call">
                    <EndCallIcon />
                  </button>
                </>
              )}

              {status === "ended" && (
                <button id="video-new-btn" className="ctrl-btn amber-btn" onClick={startSearch} title="New connection">
                  <NewIcon />
                </button>
              )}
            </div>

            {/* Inline text strip */}
            <div className="video-text-strip">
              <div className="strip-messages">
                {msgs.length === 0 ? (
                  <p style={{ color: "var(--muted-2)", fontSize: "0.8rem", textAlign: "center", marginTop: 8 }}>
                    {status === "idle" ? "Press start to connect" :
                     status === "searching" ? "Connecting…" :
                     status === "ended" ? "Session ended" : "Chat with your stranger"}
                  </p>
                ) : msgs.map(m =>
                  m.from === "system"
                    ? <div key={m.id} className="sys-msg">{m.text}</div>
                    : (
                      <div
                        key={m.id}
                        className={`chat-bubble ${m.from}`}
                        style={{ fontSize: "0.85rem", padding: "7px 12px" }}
                      >
                        {m.text}
                      </div>
                    )
                )}
                <div ref={endRef} />
              </div>

              <div className="strip-input-row">
                <textarea
                  id="video-message-input"
                  className="chat-textarea"
                  placeholder={status === "chatting" ? "Type a message…" : "Connect first…"}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  disabled={status !== "chatting"}
                  style={{ fontSize: "0.85rem", minHeight: "36px" }}
                />
                <button
                  id="video-send-btn"
                  className="send-btn"
                  onClick={send}
                  disabled={!draft.trim() || status !== "chatting"}
                  style={{ width: "36px", height: "36px" }}
                >
                  <SendIcon />
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── Interests Modal ── */}
      {showTags && (
        <div
          className="modal-overlay"
          id="interests-modal"
          onClick={e => e.target === e.currentTarget && setShowTags(false)}
        >
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Filter by Interests</h2>
              <button
                id="close-interests-modal"
                onClick={() => setShowTags(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, display: "flex" }}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="tag-wrap">
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

            <div className="modal-actions">
              <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={() => setTags([])}>Clear All</button>
              <button className="btn-primary" style={{ padding: "8px 16px" }} onClick={() => setShowTags(false)}>Apply</button>
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
