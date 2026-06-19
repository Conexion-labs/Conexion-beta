"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import { RiMessage3Line, RiVideoChatLine, RiLockPasswordLine, RiUserSmileLine, RiFlashlightLine } from "react-icons/ri";
import ParticleBackground from "./components/ParticleBackground";
import Footer from "./components/Footer";

/* ── Tilt card (preserved interaction, reskinned) ── */
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX / rect.width - rect.left / rect.width - 0.5);
    y.set(e.clientY / rect.height - rect.top / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`warm-panel p-6 cursor-pointer ${className || ""}`}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/stats";
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setOnlineCount(data.online))
      .catch(() => {});
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: "var(--color-ivory)" }}>
      <ParticleBackground />

      {/* Subtle warm vignette blobs */}
      <div className="pointer-events-none fixed top-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full blur-[130px] z-0"
        style={{ backgroundColor: "rgba(212, 145, 106, 0.07)" }} />
      <div className="pointer-events-none fixed bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full blur-[150px] z-0"
        style={{ backgroundColor: "rgba(107, 135, 160, 0.06)" }} />

      {/* ── Navbar ── */}
      <nav className="nav-bar">
        <Link href="/" className="text-xl font-bold tracking-tight transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-charcoal)" }}>
          Cone<span style={{ color: "var(--color-peach)" }}>x</span>ion
        </Link>

        <div className="flex items-center gap-6">
          {onlineCount !== null && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="status-dot" />
              <span className="label-xs">{onlineCount} Online</span>
            </div>
          )}
          <Link href="/chat" className="btn-primary text-sm">
            Enter App
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-36 pb-20 relative z-10 max-w-7xl mx-auto">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center max-w-4xl"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants}
            className="inline-flex items-center gap-3 mb-10 px-5 py-2.5 rounded-full border"
            style={{
              backgroundColor: "var(--color-parchment)",
              borderColor: "var(--color-border)",
            }}>
            <span className="status-dot" />
            <span className="label-xs" style={{ color: "var(--color-gray-brown)" }}>Live</span>
            <span style={{ color: "var(--color-border)" }}>·</span>
            <span className="label-xs" style={{ color: "var(--color-gray-brown)" }}>Anonymous</span>
            <span style={{ color: "var(--color-border)" }}>·</span>
            <span className="label-xs" style={{ color: "var(--color-gray-brown)" }}>Instant</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={itemVariants}
            className="heading-serif text-6xl md:text-8xl mb-6"
            style={{ lineHeight: 1.0 }}>
            Talk to someone<br />
            <span style={{ color: "var(--color-gray-brown)", fontStyle: "italic" }}>new, right now.</span>
          </motion.h1>

          <motion.p variants={itemVariants}
            className="text-lg md:text-xl max-w-2xl mb-14 leading-relaxed"
            style={{ color: "var(--color-gray-brown)" }}>
            No sign-up. No waiting. Connect with strangers globally based on your
            interests in seconds. Experience a new way to socialise, securely and anonymously.
          </motion.p>

          {/* CTA cards */}
          <motion.div variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch gap-5 w-full max-w-2xl justify-center">

            <Link href="/chat?mode=text" className="group relative w-full sm:w-auto flex-1">
              <TiltCard className="flex items-center gap-5 w-full transition-all duration-200
                hover:shadow-[0_8px_32px_rgba(46,39,36,0.12)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                  group-hover:scale-105"
                  style={{ backgroundColor: "var(--color-beige)", color: "var(--color-charcoal-80)" }}>
                  <RiMessage3Line className="text-2xl" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-0.5 transition-colors"
                    style={{ color: "var(--color-charcoal)" }}>Text Chat</h3>
                  <p className="text-sm" style={{ color: "var(--color-gray-light)" }}>
                    Type &amp; connect anonymously
                  </p>
                </div>
              </TiltCard>
            </Link>

            <Link href="/chat?mode=video" className="group relative w-full sm:w-auto flex-1">
              <TiltCard className="flex items-center gap-5 w-full transition-all duration-200
                hover:shadow-[0_8px_32px_rgba(46,39,36,0.12)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                  group-hover:scale-105"
                  style={{ backgroundColor: "var(--color-beige)", color: "var(--color-charcoal-80)" }}>
                  <RiVideoChatLine className="text-2xl" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-0.5 transition-colors"
                    style={{ color: "var(--color-charcoal)" }}>Video Chat</h3>
                  <p className="text-sm" style={{ color: "var(--color-gray-light)" }}>
                    Face to face, instantly
                  </p>
                </div>
              </TiltCard>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Thin editorial divider ── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-xs mt-24 mb-20 divider origin-center"
        />

        {/* ── Feature Bento Grid ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="w-full grid grid-cols-1 md:grid-cols-12 gap-5"
        >
          {/* Feature 1 — Wide */}
          <motion.div variants={itemVariants}
            className="md:col-span-7 warm-panel p-10 group relative overflow-hidden transition-all duration-300
              hover:shadow-[0_12px_40px_rgba(46,39,36,0.10)]">
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-[80px] pointer-events-none
              opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundColor: "rgba(124, 140, 101, 0.08)", marginRight: -40, marginTop: -40 }} />
            <div className="w-11 h-11 rounded-xl mb-6 flex items-center justify-center"
              style={{ backgroundColor: "var(--color-beige)", color: "var(--color-charcoal-80)" }}>
              <RiFlashlightLine className="text-2xl" />
            </div>
            <h4 className="heading-serif text-3xl mb-4">Direct WebRTC</h4>
            <p className="text-lg leading-relaxed max-w-md" style={{ color: "var(--color-gray-brown)" }}>
              Your video and audio streams are strictly peer-to-peer. We do not intermediate or touch
              your data, guaranteeing the lowest possible latency.
            </p>
          </motion.div>

          {/* Feature 2 — Narrow */}
          <motion.div variants={itemVariants}
            className="md:col-span-5 warm-panel p-10 group relative overflow-hidden transition-all duration-300
              hover:shadow-[0_12px_40px_rgba(46,39,36,0.10)]">
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none
              opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundColor: "rgba(107, 135, 160, 0.08)", marginLeft: -30, marginBottom: -30 }} />
            <div className="w-11 h-11 rounded-xl mb-6 flex items-center justify-center"
              style={{ backgroundColor: "var(--color-beige)", color: "var(--color-charcoal-80)" }}>
              <RiUserSmileLine className="text-2xl" />
            </div>
            <h4 className="heading-serif text-3xl mb-4">Smart Matchmaking</h4>
            <p className="text-lg leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Filter by tags to find people who actually share your interests, increasing the quality of
              every connection.
            </p>
          </motion.div>

          {/* Feature 3 — Full Width */}
          <motion.div variants={itemVariants}
            className="md:col-span-12 warm-panel p-10 group flex flex-col md:flex-row items-center gap-10
              relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(46,39,36,0.10)]">
            <div className="flex-1">
              <div className="w-11 h-11 rounded-xl mb-6 flex items-center justify-center"
                style={{ backgroundColor: "var(--color-beige)", color: "var(--color-charcoal-80)" }}>
                <RiLockPasswordLine className="text-2xl" />
              </div>
              <h4 className="heading-serif text-3xl mb-4">Absolute Privacy</h4>
              <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "var(--color-gray-brown)" }}>
                Connections vanish the moment you skip or disconnect. No history is stored, no traces are
                left behind. Just raw, ephemeral human connection.
              </p>
            </div>

            {/* Animated waveform illustration */}
            <div className="hidden md:flex flex-1 justify-end">
              <div className="w-full max-w-sm h-40 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: "var(--color-parchment)",
                  border: "1px solid var(--color-border)",
                }}>
                <div className="flex items-center gap-1.5">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["10px", `${Math.random() * 44 + 14}px`, "10px"] }}
                      transition={{ duration: 0.9 + Math.random() * 0.6, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1.5 rounded-full"
                      style={{ backgroundColor: i % 3 === 0
                        ? "var(--color-gray-brown)"
                        : i % 3 === 1
                          ? "var(--color-sand)"
                          : "var(--color-gray-light)",
                        opacity: 0.7 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
