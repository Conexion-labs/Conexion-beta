"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "connecting" | "queued" | "chatting" | "ended";
type ChatMode = "text" | "video";
interface Msg { id: string; from: "me" | "them" | "system"; text: string; ts?: number; }

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";

const INTERESTS = [
  "Music","Gaming","Travel","Art","Tech","Movies",
  "Sports","Books","Anime","Food","Science","Fitness",
];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ── Icons ──────────────────────────────────── */
const MicIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const MicOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const CamIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="3" ry="3"/></svg>;
const CamOffIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const SendIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SkipIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>;
const EndCallIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 5a10.94 10.94 0 0 0-2.78 5.67 1 1 0 0 0 .93 1.11h2.6a1 1 0 0 0 1-.78 8 8 0 0 1 .53-1.73M10.68 6a7.07 7.07 0 0 1 5 5"/><path d="M14.61 14.61A3.11 3.11 0 0 1 12 16a3 3 0 0 1-2.68-1.68"/></svg>;
const NewIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

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
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [wsError, setWsError] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const connectWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;
    setWsError(false);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsError(false);
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onmessage = (ev) => {
      let msg: { type: string; [k: string]: unknown };
      try { msg = JSON.parse(ev.data); } catch { return; }

      switch (msg.type) {
        case "online_count":
          setOnlineCount(msg.count as number);
          break;
        case "queued":
          setStatus("queued");
          setQueuePosition(msg.position as number);
          break;
        case "matched": {
          const shared = (msg.sharedInterests as string[]) ?? [];
          setSharedInterests(shared);
          setStatus("chatting");
          setElapsed(0);
          setMsgs([{
            id: crypto.randomUUID(),
            from: "system",
            text: shared.length > 0
              ? `Matched! You both like: ${shared.join(", ")} 🎉`
              : "Connected to a stranger. Say hello! 👋",
          }]);
          break;
        }
        case "message":
          setMsgs(m => [...m, { id: crypto.randomUUID(), from: "them", text: msg.text as string, ts: msg.ts as number }]);
          break;
        case "partner_left":
          setStatus("ended");
          setMsgs(m => [...m, { id: crypto.randomUUID(), from: "system", text: "Stranger has disconnected." }]);
          break;
      }
    };
    ws.onerror = () => setWsError(true);
    ws.onclose = () => {
      if (pingRef.current) clearInterval(pingRef.current);
      setWsError(true);
    };
    return ws;
  }, []);

  useEffect(() => {
    const ws = connectWS();
    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
      ws?.close();
    };
  }, [connectWS]);

  const wsSend = (payload: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  };

  const sys = (text: string): Msg => ({ id: crypto.randomUUID(), from: "system", text });

  const startSearch = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      const ws = connectWS();
      ws?.addEventListener("open", () => {
        wsRef.current?.send(JSON.stringify({ type: "queue", interests: tags }));
      }, { once: true });
    } else {
      wsSend({ type: "queue", interests: tags });
    }
    setStatus("connecting");
    setElapsed(0);
    setMsgs([]);
    setSharedInterests([]);
    setQueuePosition(null);
  };

  const stopSearch = () => { wsSend({ type: "cancel" }); setStatus("idle"); setElapsed(0); setMsgs([]); setQueuePosition(null); };
  const skip = () => { wsSend({ type: "skip" }); setStatus("connecting"); setElapsed(0); setMsgs([]); setSharedInterests([]); setQueuePosition(null); };
  const endCall = () => { wsSend({ type: "end" }); setStatus("ended"); setMsgs(m => [...m, sys("You disconnected.")]); };

  const send = () => {
    if (!draft.trim() || status !== "chatting") return;
    wsSend({ type: "message", text: draft.trim() });
    setMsgs(m => [...m, { id: crypto.randomUUID(), from: "me", text: draft.trim() }]);
    setDraft("");
  };

  const switchMode = (m: ChatMode) => { setMode(m); if (status !== "idle") { setStatus("idle"); setMsgs([]); setElapsed(0); } };
  const isSearching = status === "connecting" || status === "queued";

  return (
    <div className="app-shell">
      <div className="premium-bg" style={{ opacity: 0.5 }}></div>

      {/* ── Nav ── */}
      <header className="nav-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <Link href="/" className="logo" style={{ fontSize: "1.3rem" }}>
            Cone<span className="accent">x</span>ion
          </Link>

          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 12, border: "1px solid var(--border-light)" }}>
            <button
              onClick={() => switchMode("text")}
              style={{
                padding: "6px 20px", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", border: "none",
                background: mode === "text" ? "linear-gradient(135deg, var(--accent-1), var(--accent-2))" : "transparent",
                color: mode === "text" ? "#fff" : "var(--fg-muted)",
                boxShadow: mode === "text" ? "0 4px 15px rgba(255,51,102,0.3)" : "none",
                transition: "all 0.3s"
              }}
            >Text</button>
            <button
              onClick={() => switchMode("video")}
              style={{
                padding: "6px 20px", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", border: "none",
                background: mode === "video" ? "linear-gradient(135deg, var(--accent-1), var(--accent-2))" : "transparent",
                color: mode === "video" ? "#fff" : "var(--fg-muted)",
                boxShadow: mode === "video" ? "0 4px 15px rgba(255,51,102,0.3)" : "none",
                transition: "all 0.3s"
              }}
            >Video</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {status === "chatting" && (
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", background: "rgba(255,51,102,0.2)", padding: "6px 16px", borderRadius: 99, border: "1px solid rgba(255,51,102,0.4)" }}>
              {fmt(elapsed)}
            </div>
          )}
          {onlineCount > 0 && (
            <div className="online-status">
              <span className="online-dot"></span>
              {onlineCount} Online
            </div>
          )}
          <button className="btn-glass" onClick={() => setShowTags(true)} style={{ padding: "6px 16px", fontSize: "0.85rem" }}>
            Interests {tags.length > 0 && <span style={{ color: "var(--accent-2)" }}>({tags.length})</span>}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">

        {/* ══ TEXT CHAT ══ */}
        {mode === "text" && (
          <div className="chat-window">
            
            {(status === "idle" || status === "ended") && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-1)", marginBottom: 24, boxShadow: "0 10px 30px rgba(255,51,102,0.2)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="36" height="36"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 12 }}>{status === "ended" ? "Chat Ended" : "Start a Chat"}</h2>
                <p style={{ color: "var(--fg-muted)", fontSize: "1.1rem", marginBottom: 30, maxWidth: 400 }}>
                  {tags.length > 0 ? `Matching by interests: ${tags.join(", ")}` : "Match with a random stranger globally. No traces left behind."}
                </p>
                <button className="btn-primary" onClick={startSearch} style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
                  {status === "ended" ? "New Chat" : "Start Chatting"}
                </button>
                {wsError && <p style={{ color: "#ef4444", marginTop: 16 }}>Server disconnected.</p>}
              </div>
            )}

            {isSearching && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div className="super-orb">
                  <div className="super-orb-ring super-orb-ring-1"></div>
                  <div className="super-orb-ring super-orb-ring-2"></div>
                  <div className="super-orb-core">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 10 }}>{status === "queued" ? `Queue Position: ${queuePosition}` : "Scanning..."}</h2>
                <p style={{ color: "var(--fg-muted)", marginBottom: 30 }}>Finding the perfect match for you.</p>
                <button className="btn-glass" onClick={stopSearch}>Cancel Search</button>
              </div>
            )}

            {status === "chatting" && (
              <>
                <div className="messages-area">
                  {msgs.map(m => 
                    m.from === "system" 
                      ? <div key={m.id} className="msg-sys">{m.text}</div>
                      : <div key={m.id} className={`msg-bubble ${m.from === "me" ? "msg-me" : "msg-them"}`}>{m.text}</div>
                  )}
                  <div ref={endRef} />
                </div>
                
                <div className="input-zone">
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <button className="btn-glass" onClick={skip} style={{ padding: "8px 16px" }}><SkipIcon /> Skip</button>
                    <button className="btn-glass" onClick={endCall} style={{ padding: "8px 16px", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}><CloseIcon /> End</button>
                  </div>
                  <div className="chat-input-wrapper">
                    <textarea
                      className="chat-input"
                      placeholder="Type a message..."
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      rows={1}
                    />
                    <button className="btn-icon active-accent" onClick={send} disabled={!draft.trim()}>
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
          <div className="video-layout">
            <div className="video-grid">
              
              <div className="video-feed self">
                {!camOn ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--fg-muted)" }}>
                    <CamOffIcon />
                    <p style={{ marginTop: 10, fontWeight: 600 }}>Camera Disabled</p>
                  </div>
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                )}
                <div className="video-tag">You</div>
              </div>

              <div className="video-feed">
                {isSearching ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="super-orb" style={{ transform: "scale(0.6)", marginBottom: 10 }}>
                      <div className="super-orb-ring super-orb-ring-1"></div>
                      <div className="super-orb-ring super-orb-ring-2"></div>
                      <div className="super-orb-core"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Searching...</p>
                  </div>
                ) : status === "chatting" ? (
                  <>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="video-tag" style={{ background: "rgba(255,51,102,0.8)" }}>Stranger</div>
                  </>
                ) : (
                  <p style={{ color: "var(--fg-muted)", fontWeight: 600 }}>{status === "ended" ? "Session Ended" : "Waiting to Connect"}</p>
                )}
              </div>
            </div>

            <div className="controls-dock">
              <button className={`btn-icon ${!micOn ? 'danger' : ''}`} onClick={() => setMicOn(!micOn)}>
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </button>
              <button className={`btn-icon ${!camOn ? 'danger' : ''}`} onClick={() => setCamOn(!camOn)}>
                {camOn ? <CamIcon /> : <CamOffIcon />}
              </button>
              
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }}></div>

              {status === "idle" && (
                <button className="btn-primary" onClick={startSearch} style={{ borderRadius: 99, padding: "0 24px" }}>Start</button>
              )}
              {isSearching && (
                <button className="btn-icon danger" onClick={stopSearch}><CloseIcon /></button>
              )}
              {status === "chatting" && (
                <>
                  <button className="btn-icon" onClick={skip} style={{ background: "rgba(255,153,51,0.2)", borderColor: "rgba(255,153,51,0.5)", color: "#ff9933" }}><SkipIcon /></button>
                  <button className="btn-icon danger" onClick={endCall}><EndCallIcon /></button>
                </>
              )}
              {status === "ended" && (
                <button className="btn-primary" onClick={startSearch} style={{ borderRadius: 99, padding: "0 24px" }}>New Chat</button>
              )}
            </div>

            {/* Quick Chat Overlay for Video Mode */}
            {status === "chatting" && (
              <div style={{ position: "absolute", bottom: 100, left: 20, width: 350, background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)", borderRadius: 24, border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", maxHeight: 300 }}>
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {msgs.map(m => 
                    m.from === "system" 
                      ? <div key={m.id} style={{ alignSelf: "center", fontSize: "0.75rem", color: "var(--fg-muted)" }}>{m.text}</div>
                      : <div key={m.id} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", background: m.from === "me" ? "var(--accent-1)" : "rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: 12, fontSize: "0.85rem", maxWidth: "85%" }}>{m.text}</div>
                  )}
                  <div ref={endRef} />
                </div>
                <div style={{ padding: 12, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                  <input type="text" placeholder="Send a message..." value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", outline: "none" }} />
                  <button onClick={send} disabled={!draft.trim()} style={{ background: "var(--accent-1)", border: "none", width: 36, height: 36, borderRadius: 12, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: draft.trim() ? 1 : 0.5 }}><SendIcon /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Interests Modal ── */}
      {showTags && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTags(false)}>
          <div className="super-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900 }}>Filter Interests</h2>
              <button onClick={() => setShowTags(false)} style={{ background: "transparent", border: "none", color: "var(--fg-muted)", cursor: "pointer" }}><CloseIcon /></button>
            </div>
            
            <p style={{ color: "var(--fg-muted)", marginBottom: 24, fontSize: "0.95rem", lineHeight: 1.6 }}>
              Select topics you enjoy. The system will prioritize matching you with strangers who share these interests.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
              {INTERESTS.map(t => {
                const isActive = tags.includes(t);
                return (
                  <button
                    key={t}
                    className={`tag-pill ${isActive ? "selected" : ""}`}
                    onClick={() => setTags(p => isActive ? p.filter(x => x !== t) : [...p, t])}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-glass" onClick={() => setTags([])}>Clear All</button>
              <button className="btn-primary" onClick={() => setShowTags(false)}>Save Filters</button>
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
