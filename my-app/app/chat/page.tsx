"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "../components/ParticleBackground";
import { RiMessage3Line, RiVideoChatLine, RiMicLine, RiMicOffLine, RiCameraLine, RiCameraOffLine, RiSendPlaneFill, RiSkipForwardLine, RiCloseCircleLine, RiSearchEyeLine, RiAlertFill, RiShieldCheckLine, RiFlag2Line, RiChat1Line } from "react-icons/ri";
import { useNsfwDetection, useNsfwVideoAnalysis } from "../hooks/useNsfwDetection";

const REPORT_REASONS = [
  "Inappropriate content",
  "Harassment",
  "Spam",
  "Underage user",
  "Other",
];

type Status = "idle" | "connecting" | "queued" | "chatting" | "ended";
type ChatMode = "text" | "video";
interface Msg { id: string; from: "me" | "them" | "system"; text: string; ts?: number; }

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/stats', '') || "http://localhost:3001";

const INTERESTS = [
  "Music","Gaming","Travel","Art","Tech","Movies",
  "Sports","Books","Anime","Food","Science","Fitness",
];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ─────────────────────────────── ChatApp ─────────────────────────────── */
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
  const [showReport, setShowReport] = useState(false);
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ]);
  const [camError, setCamError] = useState<string | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReconnectAttempts = 10;
  const intentionalCloseRef = useRef(false);
  const pipContainerRef = useRef<HTMLDivElement>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const { modelLoaded: nsfwReady, modelLoading: nsfwLoading, classifyElement } = useNsfwDetection({ enabled: mode === "video" });
  const isRemoteNsfw = useNsfwVideoAnalysis(remoteVideoRef, classifyElement, { enabled: mode === "video" && status === "chatting" && nsfwReady });
  const isLocalNsfw = useNsfwVideoAnalysis(localVideoRef, classifyElement, { enabled: mode === "video" && camOn && nsfwReady });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, mode]);

  useEffect(() => {
    if (status === "chatting") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const localStreamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    if (mode === "video") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStreamRef.current = stream;
          setLocalStream(stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.warn("Camera permissions denied or not available:", err);
          setCamOn(false); setMicOn(false);
          setCamError(
            err.name === "NotAllowedError" ? "Camera access was denied. Please allow camera permissions in your browser settings."
            : err.name === "NotFoundError" ? "No camera or microphone found on this device."
            : "Could not access camera. Please check your device settings."
          );
        });
    } else {
      setCamError(null);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
    }
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [mode]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = camOn);
      localStream.getAudioTracks().forEach(t => t.enabled = micOn);
    }
  }, [camOn, micOn, localStream]);

  useEffect(() => {
    fetch(`${API_BASE}/api/turn-credentials`)
      .then(res => res.json())
      .then(data => { if (data.iceServers?.length) setIceServers(data.iceServers); })
      .catch(() => {});
  }, []);

  const wsSend = (payload: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  };

  const setupWebRTC = useCallback((role: "caller" | "callee") => {
    if (pcRef.current) pcRef.current.close();
    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;
    if (localStream) localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    pc.ontrack = event => { if (remoteVideoRef.current && event.streams[0]) remoteVideoRef.current.srcObject = event.streams[0]; };
    pc.onicecandidate = event => { if (event.candidate) wsSend({ type: "rtc_signal", payload: { candidate: event.candidate } }); };
    if (role === "caller") {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => wsSend({ type: "rtc_signal", payload: { offer: pc.localDescription } }))
        .catch(console.error);
    }
  }, [localStream, iceServers]);

  const scheduleReconnect = useCallback(() => {
    if (intentionalCloseRef.current) return;
    if (reconnectAttemptRef.current >= maxReconnectAttempts) { setIsReconnecting(false); setWsError(true); return; }
    setIsReconnecting(true);
    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000) + Math.random() * 1000 * 0.3;
    reconnectTimerRef.current = setTimeout(() => { reconnectAttemptRef.current++; connectWS(); }, delay);
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return wsRef.current;
    setWsError(false);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      setWsError(false); setIsReconnecting(false); reconnectAttemptRef.current = 0;
      pingRef.current = setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" })); }, 25000);
    };
    ws.onmessage = async (ev) => {
      let msg: { type: string; [k: string]: unknown };
      try { msg = JSON.parse(ev.data); } catch { return; }
      switch (msg.type) {
        case "online_count": setOnlineCount(msg.count as number); break;
        case "queued": setStatus("queued"); setQueuePosition(msg.position as number); break;
        case "matched": {
          const shared = (msg.sharedInterests as string[]) ?? [];
          setSharedInterests(shared); setStatus("chatting"); setElapsed(0);
          setMsgs([{ id: crypto.randomUUID(), from: "system", text: shared.length > 0 ? `Matched! You both like: ${shared.join(", ")} 🎉` : "Connected to a stranger. Say hello! 👋" }]);
          if (mode === "video") setupWebRTC(msg.role as "caller" | "callee");
          break;
        }
        case "message": setMsgs(m => [...m, { id: crypto.randomUUID(), from: "them", text: msg.text as string, ts: msg.ts as number }]); break;
        case "rtc_signal": {
          const pc = pcRef.current;
          if (!pc) break;
          const { offer, answer, candidate } = msg.payload as { offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
          try {
            if (offer) { await pc.setRemoteDescription(new RTCSessionDescription(offer)); const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); wsSend({ type: "rtc_signal", payload: { answer: pc.localDescription } }); }
            else if (answer) { await pc.setRemoteDescription(new RTCSessionDescription(answer)); }
            else if (candidate) { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          } catch (err) { console.error("RTC Error", err); }
          break;
        }
        case "partner_left":
          setStatus("ended");
          if (pcRef.current) pcRef.current.close();
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          setMsgs(m => [...m, { id: crypto.randomUUID(), from: "system", text: "Stranger has disconnected." }]);
          break;
      }
    };
    ws.onerror = () => setWsError(true);
    ws.onclose = () => {
      if (pingRef.current) clearInterval(pingRef.current);
      if (!intentionalCloseRef.current) { setWsError(true); scheduleReconnect(); }
    };
    return ws;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, setupWebRTC, scheduleReconnect]);

  useEffect(() => {
    intentionalCloseRef.current = false;
    const ws = connectWS();
    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingRef.current) clearInterval(pingRef.current);
      if (pcRef.current) pcRef.current.close();
      ws?.close();
    };
  }, [connectWS]);

  const sys = (text: string): Msg => ({ id: crypto.randomUUID(), from: "system", text });

  const startSearch = () => {
    let ws = wsRef.current;
    if (!ws || ws.readyState > WebSocket.OPEN) ws = connectWS();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "queue", interests: tags }));
    } else {
      ws.addEventListener("open", () => { ws.send(JSON.stringify({ type: "queue", interests: tags })); }, { once: true });
    }
    setStatus("connecting"); setElapsed(0); setMsgs([]); setSharedInterests([]); setQueuePosition(null);
  };

  const stopSearch = () => { wsSend({ type: "cancel" }); setStatus("idle"); setElapsed(0); setMsgs([]); setQueuePosition(null); };
  const skip = () => { wsSend({ type: "skip" }); setStatus("connecting"); setElapsed(0); setMsgs([]); setSharedInterests([]); setQueuePosition(null); setShowReport(false); };
  const endCall = () => { wsSend({ type: "end" }); setStatus("ended"); setMsgs(m => [...m, sys("You disconnected.")]); setShowReport(false); };

  const reportUser = (reason: string) => {
    wsSend({ type: "report", reason });
    setMsgs(m => [...m, sys("User reported. Finding new match...")]);
    setShowReport(false);
    setTimeout(() => { setStatus("connecting"); setElapsed(0); setMsgs([]); setSharedInterests([]); setQueuePosition(null); }, 800);
  };

  const send = () => {
    if (!draft.trim() || status !== "chatting") return;
    wsSend({ type: "message", text: draft.trim() });
    setMsgs(m => [...m, { id: crypto.randomUUID(), from: "me", text: draft.trim() }]);
    setDraft("");
  };

  const switchMode = (m: ChatMode) => {
    if (status === "chatting" || isSearching) return;
    setMode(m);
    if (status !== "idle") { setStatus("idle"); setMsgs([]); setElapsed(0); }
  };
  const isSearching = status === "connecting" || status === "queued";

  /* ─────────────── JSX ─────────────── */
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: "var(--color-ivory)", color: "var(--color-charcoal)" }}>
      <ParticleBackground />

      {/* Subtle warm blobs */}
      <div className="pointer-events-none fixed top-[-15%] right-[-5%] w-[40vw] h-[40vw] rounded-full blur-[120px] z-0"
        style={{ backgroundColor: "rgba(212, 145, 106, 0.06)" }} />
      <div className="pointer-events-none fixed bottom-[-15%] left-[-5%] w-[45vw] h-[45vw] rounded-full blur-[130px] z-0"
        style={{ backgroundColor: "rgba(107, 135, 160, 0.05)" }} />

      {/* ── Reconnection Banner ── */}
      <AnimatePresence>
        {isReconnecting && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 py-3 text-sm font-semibold"
            style={{ backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)" }}>
            <motion.div
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Reconnecting... (attempt {reconnectAttemptRef.current + 1}/{maxReconnectAttempts})
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav ── */}
      <nav className="nav-bar">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-charcoal)" }}>
            Cone<span style={{ color: "var(--color-peach)" }}>x</span>ion
          </Link>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-xl border gap-1"
            style={{ backgroundColor: "var(--color-parchment)", borderColor: "var(--color-border)" }}>
            <button
              onClick={() => switchMode("text")}
              disabled={status === "chatting" || isSearching}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${(status === "chatting" || isSearching) ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              style={mode === "text"
                ? { backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)", boxShadow: "0 2px 8px rgba(46,39,36,0.2)" }
                : { color: "var(--color-gray-brown)" }}>
              <RiMessage3Line /> Text
            </button>
            <button
              onClick={() => switchMode("video")}
              disabled={status === "chatting" || isSearching}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${(status === "chatting" || isSearching) ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              style={mode === "video"
                ? { backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)", boxShadow: "0 2px 8px rgba(46,39,36,0.2)" }
                : { color: "var(--color-gray-brown)" }}>
              <RiVideoChatLine /> Video
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* NSFW shield badge */}
          {mode === "video" && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              nsfwReady ? "" : nsfwLoading ? "animate-pulse" : ""
            }`}
              style={nsfwReady
                ? { color: "var(--color-olive)", backgroundColor: "rgba(124,140,101,0.1)", borderColor: "rgba(124,140,101,0.25)" }
                : nsfwLoading
                  ? { color: "var(--color-gray-brown)", backgroundColor: "var(--color-parchment)", borderColor: "var(--color-border)" }
                  : { color: "var(--color-gray-light)", backgroundColor: "var(--color-parchment)", borderColor: "var(--color-border)" }
              }>
              <RiShieldCheckLine />
              {nsfwReady ? "Protected" : nsfwLoading ? "Loading..." : "Shield"}
            </div>
          )}

          {/* Timer */}
          {status === "chatting" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border label-xs"
              style={{ color: "var(--color-gray-brown)", backgroundColor: "var(--color-parchment)", borderColor: "var(--color-border)" }}>
              {fmt(elapsed)}
            </motion.div>
          )}

          {/* Online count */}
          {onlineCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="status-dot" />
              <span className="label-xs">{onlineCount} Online</span>
            </div>
          )}

          {/* Interests */}
          <button className="btn-secondary text-xs px-4 py-2" onClick={() => setShowTags(true)}>
            Interests{tags.length > 0 && <span style={{ color: "var(--color-peach)" }}> ({tags.length})</span>}
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className={`flex-1 flex w-full h-full relative z-10 transition-all duration-700 ease-in-out ${mode === "text" ? "max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-8" : "max-w-none px-0 pt-0 pb-0"}`}>

        {/* ────────── TEXT CHAT ────────── */}
        {mode === "text" && (
          <div className="flex-1 flex flex-col max-w-3xl w-full min-h-[500px] h-full mx-auto warm-panel relative overflow-hidden">

            <AnimatePresence mode="wait">
              {/* Idle / Ended */}
              {(status === "idle" || status === "ended") && (
                <motion.div key="idle"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: "var(--color-beige)", color: "var(--color-charcoal-80)" }}>
                    <RiMessage3Line className="text-4xl" />
                  </div>
                  <h2 className="heading-serif text-4xl mb-3">
                    {status === "ended" ? "Chat Ended" : "Start a Text Chat"}
                  </h2>
                  <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
                    {tags.length > 0
                      ? `Matching by interests: ${tags.join(", ")}`
                      : "Connect with a random stranger globally. Absolutely no traces left behind."}
                  </p>
                  <button className="btn-primary flex items-center gap-2" onClick={startSearch}>
                    <RiSearchEyeLine className="text-lg" />
                    {status === "ended" ? "Find New Chat" : "Start Searching"}
                  </button>
                  {wsError && (
                    <p className="mt-6 text-sm font-medium" style={{ color: "var(--color-peach)" }}>
                      Server connection lost. Retrying...
                    </p>
                  )}
                </motion.div>
              )}

              {/* Searching */}
              {isSearching && (
                <motion.div key="searching"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="relative w-36 h-36 flex items-center justify-center mb-10">
                    <motion.div
                      animate={{ scale: [1, 2.6], opacity: [0.4, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: "rgba(110, 103, 98, 0.12)" }}
                    />
                    <motion.div
                      animate={{ scale: [1, 2.6], opacity: [0.4, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: "rgba(110, 103, 98, 0.08)" }}
                    />
                    <div className="relative w-18 h-18 w-[72px] h-[72px] rounded-full flex items-center justify-center z-10"
                      style={{ backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)" }}>
                      <RiSearchEyeLine className="text-3xl" />
                    </div>
                  </div>
                  <h2 className="heading-serif text-3xl mb-3">
                    {status === "queued" ? `Queue Position: ${queuePosition}` : "Scanning the globe..."}
                  </h2>
                  <p className="text-lg mb-10" style={{ color: "var(--color-gray-brown)" }}>
                    Finding the perfect match for you.
                  </p>
                  <button className="btn-secondary" onClick={stopSearch}>Cancel Search</button>
                </motion.div>
              )}

              {/* Chatting */}
              {status === "chatting" && (
                <motion.div key="chatting"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {msgs.map(m => (
                        <motion.div key={m.id}
                          initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`max-w-[78%] px-5 py-3 text-[15px] leading-relaxed ${
                            m.from === "system" ? "bubble-system self-center px-5 py-2"
                            : m.from === "me" ? "bubble-me self-end"
                            : "bubble-them self-start"
                          }`}>
                          {m.text}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={endRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-4 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-warm-white)" }}>
                    <div className="flex items-center gap-4 mb-4 px-1">
                      <button className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide transition-colors"
                        style={{ color: "var(--color-gray-light)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-charcoal)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-light)")}
                        onClick={skip}>
                        <RiSkipForwardLine className="text-base" /> Skip
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide transition-colors"
                        style={{ color: "var(--color-gray-light)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#b85c5c")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-light)")}
                        onClick={endCall}>
                        <RiCloseCircleLine className="text-base" /> End
                      </button>
                      <div className="relative">
                        <button className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide transition-colors"
                          style={{ color: "var(--color-gray-light)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-peach)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-light)")}
                          onClick={() => setShowReport(r => !r)}>
                          <RiFlag2Line className="text-base" /> Report
                        </button>
                        <AnimatePresence>
                          {showReport && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                              className="absolute bottom-full left-0 mb-2 w-52 warm-panel overflow-hidden z-50"
                              style={{ borderRadius: 14 }}>
                              <div className="p-3 label-xs border-b" style={{ borderColor: "var(--color-border)" }}>Report Reason</div>
                              {REPORT_REASONS.map(reason => (
                                <button key={reason} onClick={() => reportUser(reason)}
                                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                  style={{ color: "var(--color-gray-brown)" }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--color-beige)"; e.currentTarget.style.color = "var(--color-charcoal)"; }}
                                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-gray-brown)"; }}>
                                  {reason}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 warm-input p-2 pl-5 rounded-2xl"
                      style={{ borderRadius: 16 }}>
                      <input
                        className="flex-1 bg-transparent border-none outline-none text-[15px]"
                        style={{ color: "var(--color-charcoal)" }}
                        placeholder="Type a message..."
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      />
                      <button
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={draft.trim()
                          ? { backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)" }
                          : { backgroundColor: "var(--color-beige)", color: "var(--color-gray-light)", cursor: "not-allowed" }}
                        onClick={send} disabled={!draft.trim()}>
                        <RiSendPlaneFill className="text-base ml-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ────────── VIDEO CHAT ────────── */}
        {mode === "video" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full overflow-hidden flex flex-col"
            style={{ backgroundColor: "var(--color-charcoal)" }}>

            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-0 pointer-events-none" />

            {/* Main remote feed */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div key="searching-video"
                    initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(46,39,36,0.7)" }}>
                    <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
                      <motion.div animate={{ scale: [1, 2.2], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 border-2 rounded-full" style={{ borderColor: "rgba(242,237,230,0.25)" }} />
                      <motion.div animate={{ scale: [1, 2.2], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                        className="absolute inset-0 border-2 rounded-full" style={{ borderColor: "rgba(242,237,230,0.15)" }} />
                      <motion.div animate={{ scale: [1, 2.2], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                        className="absolute inset-0 border-2 rounded-full" style={{ borderColor: "rgba(242,237,230,0.10)" }} />
                      <div className="relative w-24 h-24 rounded-full flex items-center justify-center z-10"
                        style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-charcoal)" }}>
                        <RiSearchEyeLine className="text-4xl" />
                      </div>
                    </div>
                    <h2 className="heading-serif text-5xl mb-3" style={{ color: "var(--color-ivory)" }}>Searching the grid...</h2>
                    <p className="text-xl" style={{ color: "rgba(242,237,230,0.6)" }}>Connecting you to the perfect match.</p>
                    {camError && (
                      <p className="text-sm mt-5 max-w-md rounded-xl px-5 py-3 border"
                        style={{ color: "#d4826a", backgroundColor: "rgba(212,130,106,0.1)", borderColor: "rgba(212,130,106,0.2)" }}>
                        {camError}
                      </p>
                    )}
                  </motion.div>
                ) : status === "chatting" ? (
                  <motion.div key="chatting-video"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center w-full h-full relative overflow-hidden">
                    <video ref={remoteVideoRef} autoPlay playsInline
                      className={`w-full h-full object-cover transition-all duration-700 ${isRemoteNsfw ? "blur-[60px] grayscale scale-105" : ""}`}
                    />
                    <AnimatePresence>
                      {isRemoteNsfw && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm"
                          style={{ backgroundColor: "rgba(46,39,36,0.6)" }}>
                          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                            style={{ backgroundColor: "rgba(212,130,106,0.15)" }}>
                            <RiAlertFill className="text-5xl" style={{ color: "#d4826a" }} />
                          </div>
                          <h3 className="heading-serif text-3xl mb-2" style={{ color: "var(--color-ivory)" }}>Explicit Content Hidden</h3>
                          <p className="text-lg max-w-md" style={{ color: "rgba(242,237,230,0.6)" }}>
                            We've automatically blurred this video feed to protect you.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="waiting-video" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center">
                    <div className="w-28 h-28 rounded-2xl flex items-center justify-center mb-8"
                      style={{ backgroundColor: "rgba(242,237,230,0.06)", border: "1px solid rgba(242,237,230,0.10)" }}>
                      <RiVideoChatLine className="text-5xl" style={{ color: "rgba(242,237,230,0.3)" }} />
                    </div>
                    <h2 className="heading-serif text-4xl mb-2" style={{ color: "rgba(242,237,230,0.8)" }}>
                      {status === "ended" ? "Session Terminated" : "System Ready"}
                    </h2>
                    <p className="label-xs" style={{ color: "rgba(242,237,230,0.4)", letterSpacing: "0.12em" }}>Awaiting connection</p>
                    {camError && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center gap-3 rounded-2xl px-6 py-4 max-w-md"
                        style={{ backgroundColor: "rgba(212,130,106,0.1)", border: "1px solid rgba(212,130,106,0.2)" }}>
                        <RiAlertFill className="text-xl shrink-0" style={{ color: "#d4826a" }} />
                        <p className="text-sm text-left" style={{ color: "#d4826a" }}>{camError}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Draggable PiP local feed */}
            <motion.div ref={pipContainerRef} drag dragElastic={0.1}
              dragConstraints={pipContainerRef.current
                ? { left: -(pipContainerRef.current.offsetLeft - 20), right: 20, top: -(pipContainerRef.current.offsetTop - 100), bottom: 120 }
                : { left: -200, right: 20, top: -200, bottom: 120 }}
              className="absolute top-24 right-4 sm:right-6 w-28 h-40 sm:w-56 sm:h-72 rounded-2xl overflow-hidden z-30 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
              style={{ border: "1px solid rgba(242,237,230,0.12)", boxShadow: "0 16px 40px rgba(0,0,0,0.7)", backgroundColor: "var(--color-charcoal)" }}>
              <video ref={localVideoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover transition-all duration-300 pointer-events-none ${(camOn && !isLocalNsfw) ? "opacity-100" : "opacity-0"} ${isLocalNsfw ? "blur-xl" : ""}`}
              />
              {(!camOn || isLocalNsfw) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2 z-10"
                  style={{ backgroundColor: "var(--color-charcoal)" }}>
                  {isLocalNsfw ? (
                    <>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: "rgba(212,130,106,0.1)" }}>
                        <RiAlertFill className="text-xl" style={{ color: "#d4826a" }} />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#d4826a" }}>NSFW</span>
                    </>
                  ) : (
                    <>
                      <RiCameraOffLine className="text-3xl sm:text-4xl mb-2 opacity-40" style={{ color: "var(--color-gray-light)" }} />
                      <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-light)" }}>Cam Off</span>
                    </>
                  )}
                </div>
              )}
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest pointer-events-none z-20"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "rgba(242,237,230,0.7)", backdropFilter: "blur(8px)" }}>
                You
              </div>
            </motion.div>

            {/* Mobile chat toggle */}
            {status === "chatting" && (
              <button onClick={() => setShowVideoChat(v => !v)}
                className="absolute top-24 left-4 z-30 md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: "rgba(46,39,36,0.7)", border: "1px solid rgba(242,237,230,0.12)", color: "var(--color-warm-white)", backdropFilter: "blur(10px)" }}>
                <RiChat1Line className="text-base" />
              </button>
            )}

            {/* Chat sidebar */}
            <AnimatePresence>
              {status === "chatting" && (
                <motion.div
                  initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  className={`absolute left-4 sm:left-6 top-24 bottom-28 w-[calc(100vw-2rem)] sm:w-68 md:w-76 flex flex-col overflow-hidden z-20 transition-transform duration-300 ${showVideoChat ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"}`}
                  style={{
                    borderRadius: 24,
                    backgroundColor: "rgba(46,39,36,0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(242,237,230,0.10)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                    width: "288px",
                  }}>
                  <div className="p-4 sm:p-5 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(242,237,230,0.08)" }}>
                    <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: "var(--color-warm-white)" }}>
                      <RiMessage3Line style={{ color: "var(--color-sand)" }} /> Live Chat
                    </h3>
                    <button onClick={() => setShowVideoChat(false)} className="md:hidden transition-colors"
                      style={{ color: "rgba(242,237,230,0.4)" }}>
                      <RiCloseCircleLine className="text-xl" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
                    {msgs.map(m => (
                      <div key={m.id}
                        className={`text-sm px-4 py-2.5 max-w-[88%] ${
                          m.from === "system"
                            ? "self-center text-[10px] font-semibold uppercase tracking-wide rounded-full px-4 py-2"
                            : m.from === "me" ? "self-end rounded-[14px_14px_4px_14px]"
                            : "self-start rounded-[14px_14px_14px_4px]"
                        }`}
                        style={m.from === "system"
                          ? { color: "rgba(242,237,230,0.5)", backgroundColor: "rgba(242,237,230,0.06)", border: "1px solid rgba(242,237,230,0.1)" }
                          : m.from === "me"
                            ? { backgroundColor: "var(--color-warm-white)", color: "var(--color-charcoal)" }
                            : { backgroundColor: "rgba(242,237,230,0.1)", color: "var(--color-warm-white)", border: "1px solid rgba(242,237,230,0.08)" }
                        }>
                        {m.text}
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>
                  <div className="p-3 sm:p-4" style={{ borderTop: "1px solid rgba(242,237,230,0.08)" }}>
                    <div className="flex items-center gap-2 p-1.5 pl-4 rounded-2xl"
                      style={{ backgroundColor: "rgba(242,237,230,0.07)", border: "1px solid rgba(242,237,230,0.08)" }}>
                      <input className="flex-1 bg-transparent border-none outline-none text-sm w-full"
                        style={{ color: "var(--color-warm-white)" }}
                        placeholder="Type message..."
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      />
                      <button className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl transition-all"
                        style={draft.trim()
                          ? { backgroundColor: "var(--color-warm-white)", color: "var(--color-charcoal)" }
                          : { backgroundColor: "rgba(242,237,230,0.08)", color: "rgba(242,237,230,0.3)", cursor: "not-allowed" }}
                        onClick={send} disabled={!draft.trim()}>
                        <RiSendPlaneFill className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Control dock */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-full z-40 w-max max-w-[96vw] overflow-x-auto"
              style={{
                backgroundColor: "rgba(30,25,23,0.88)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(242,237,230,0.12)",
                boxShadow: "0 24px 50px rgba(0,0,0,0.7)",
              }}>
              <button
                className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all"
                style={micOn
                  ? { backgroundColor: "rgba(242,237,230,0.08)", color: "rgba(242,237,230,0.8)" }
                  : { backgroundColor: "rgba(184,92,92,0.2)", color: "#c47676" }}
                onClick={() => setMicOn(!micOn)}>
                {micOn ? <RiMicLine /> : <RiMicOffLine />}
              </button>
              <button
                className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all"
                style={camOn
                  ? { backgroundColor: "rgba(242,237,230,0.08)", color: "rgba(242,237,230,0.8)" }
                  : { backgroundColor: "rgba(184,92,92,0.2)", color: "#c47676" }}
                onClick={() => setCamOn(!camOn)}>
                {camOn ? <RiCameraLine /> : <RiCameraOffLine />}
              </button>

              <div className="w-px h-6 sm:h-7 mx-1 shrink-0" style={{ backgroundColor: "rgba(242,237,230,0.15)" }} />

              {status === "idle" && (
                <button className="btn-primary py-2.5 px-5 sm:py-3 sm:px-7 rounded-full text-sm whitespace-nowrap" onClick={startSearch}>
                  Start Video Chat
                </button>
              )}
              {isSearching && (
                <button className="py-2.5 px-5 sm:py-3 sm:px-7 rounded-full flex items-center gap-2 font-semibold text-sm whitespace-nowrap transition-colors"
                  style={{ backgroundColor: "rgba(184,92,92,0.2)", color: "#c47676", border: "1px solid rgba(184,92,92,0.2)" }}
                  onClick={stopSearch}>
                  <RiCloseCircleLine className="text-lg" /> Cancel
                </button>
              )}
              {status === "chatting" && (
                <>
                  <button className="py-2.5 px-4 sm:py-3 sm:px-6 rounded-full flex items-center gap-2 font-semibold text-sm whitespace-nowrap transition-colors"
                    style={{ backgroundColor: "rgba(242,237,230,0.08)", color: "rgba(242,237,230,0.7)" }}
                    onClick={skip}>
                    <RiSkipForwardLine className="text-lg" /> Skip
                  </button>
                  <div className="relative">
                    <button className="py-2.5 px-4 sm:py-3 sm:px-6 rounded-full flex items-center gap-2 font-semibold text-sm whitespace-nowrap transition-colors"
                      style={{ backgroundColor: "rgba(212,145,106,0.12)", color: "#d4916a" }}
                      onClick={() => setShowReport(r => !r)}>
                      <RiFlag2Line className="text-lg" /> Report
                    </button>
                    <AnimatePresence>
                      {showReport && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 overflow-hidden z-50"
                          style={{
                            borderRadius: 14,
                            backgroundColor: "rgba(30,25,23,0.97)",
                            border: "1px solid rgba(242,237,230,0.1)",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                          }}>
                          <div className="p-3 label-xs border-b" style={{ borderColor: "rgba(242,237,230,0.08)", color: "rgba(242,237,230,0.4)" }}>
                            Report Reason
                          </div>
                          {REPORT_REASONS.map(reason => (
                            <button key={reason} onClick={() => reportUser(reason)}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                              style={{ color: "rgba(242,237,230,0.7)" }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(242,237,230,0.06)"; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                              {reason}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button className="py-2.5 px-4 sm:py-3 sm:px-6 rounded-full flex items-center gap-2 font-semibold text-sm whitespace-nowrap transition-colors"
                    style={{ backgroundColor: "rgba(184,92,92,0.15)", color: "#c47676" }}
                    onClick={endCall}>
                    <RiCloseCircleLine className="text-lg" /> End
                  </button>
                </>
              )}
              {status === "ended" && (
                <button className="btn-primary py-2.5 px-5 sm:py-3 sm:px-7 rounded-full text-sm whitespace-nowrap" onClick={startSearch}>
                  New Call
                </button>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Interests Modal ── */}
      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ backgroundColor: "rgba(46,39,36,0.55)", backdropFilter: "blur(8px)" }}
            onClick={e => e.target === e.currentTarget && setShowTags(false)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 24 }}
              className="warm-panel p-8 sm:p-10 w-full max-w-xl relative overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
                style={{ backgroundColor: "rgba(107,135,160,0.06)", marginRight: -40, marginTop: -40 }} />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="heading-serif text-3xl">Filter Interests</h2>
                <button className="transition-colors" style={{ color: "var(--color-gray-light)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--color-charcoal)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-light)")}
                  onClick={() => setShowTags(false)}>
                  <RiCloseCircleLine className="text-3xl" />
                </button>
              </div>

              <p className="text-lg leading-relaxed mb-8 relative z-10" style={{ color: "var(--color-gray-brown)" }}>
                Select topics you enjoy. We'll prioritize connecting you with strangers who share your interests.
              </p>

              <div className="flex flex-wrap gap-3 mb-10 relative z-10">
                {INTERESTS.map(t => {
                  const isActive = tags.includes(t);
                  return (
                    <button key={t}
                      onClick={() => setTags(p => isActive ? p.filter(x => x !== t) : [...p, t])}
                      className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
                      style={isActive
                        ? { backgroundColor: "var(--color-charcoal)", color: "var(--color-ivory)", transform: "scale(1.03)" }
                        : { backgroundColor: "var(--color-beige)", color: "var(--color-gray-brown)", border: "1px solid var(--color-border)" }}>
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-4 relative z-10">
                <button className="btn-secondary" onClick={() => setTags([])}>Clear All</button>
                <button className="btn-primary" onClick={() => setShowTags(false)}>Save Filters</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Loading fallback ── */
function ChatLoadingFallback() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-ivory)" }}>
      <div className="flex flex-col items-center gap-8">
        <div className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-charcoal)" }}>
          Cone<span style={{ color: "var(--color-peach)" }}>x</span>ion
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{ borderColor: "rgba(110,103,98,0.2)", animationDuration: "2s" }} />
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-sand)", borderTopColor: "var(--color-charcoal)" }} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest animate-pulse"
            style={{ color: "var(--color-gray-light)" }}>Loading</p>
          <div className="flex gap-1.5">
            {[0, 0.15, 0.3].map((delay, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--color-sand)", animationDelay: `${delay}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatApp />
    </Suspense>
  );
}
