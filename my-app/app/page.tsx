"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import { RiMessage3Line, RiVideoChatLine, RiLockPasswordLine, RiUserSmileLine, RiFlashlightLine } from "react-icons/ri";
import ParticleBackground from "./components/ParticleBackground";
import Footer from "./components/Footer";

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`glass-panel p-6 ${className || ""}`}
    >
      <div style={{ transform: "translateZ(30px)" }}>
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
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-[#07070e] overflow-hidden">
      <ParticleBackground />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[120px] mix-blend-screen z-0"></div>
      <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-500/5 blur-[140px] mix-blend-screen z-0"></div>

      <nav className="nav-bar">
        <div className="text-2xl font-black tracking-tight text-white hover:opacity-80 transition-opacity cursor-pointer">
          Cone<span className="text-amber-500">x</span>ion
        </div>
        <div className="flex items-center gap-8">
          {onlineCount !== null && (
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              {onlineCount} Online
            </div>
          )}
          <Link href="/chat" className="btn-primary text-sm px-6 py-3">
            Enter App
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-32 pb-20 relative z-10 max-w-7xl mx-auto">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center max-w-4xl"
        >
          <motion.div variants={itemVariants} className="glass-panel px-5 py-2 rounded-full mb-8 flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span> Live
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Anonymous</span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Instant</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white mb-6">
            Talk to someone<br />
            <span className="text-gradient">new, right now.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
            No sign-up. No waiting. Connect with strangers globally based on your interests in seconds. 
            Experience a new way to socialize securely and anonymously.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl justify-center">
            
            <Link href="/chat?mode=text" className="group relative w-full sm:w-auto perspective-1000">
              <TiltCard className="flex items-center gap-5 hover:bg-white/[0.04] transition-colors w-full cursor-pointer hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <RiMessage3Line className="text-3xl" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">Text Chat</h3>
                  <p className="text-sm text-white/40 font-medium">Type & connect anonymously</p>
                </div>
              </TiltCard>
            </Link>

            <Link href="/chat?mode=video" className="group relative w-full sm:w-auto perspective-1000">
              <TiltCard className="flex items-center gap-5 hover:bg-white/[0.04] transition-colors w-full cursor-pointer hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <RiVideoChatLine className="text-3xl" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">Video Chat</h3>
                  <p className="text-sm text-white/40 font-medium">Face to face, instantly</p>
                </div>
              </TiltCard>
            </Link>

          </motion.div>
        </motion.div>

        {/* Bento Grid Features */}
        <motion.section 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="w-full mt-32 grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          <motion.div variants={itemVariants} className="md:col-span-7 glass-panel p-10 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
            <RiFlashlightLine className="text-5xl text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h4 className="text-3xl font-black mb-4">Direct WebRTC</h4>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">Your video and audio streams are strictly peer-to-peer. We do not intermediate or touch your data, guaranteeing lowest latency.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-5 glass-panel p-10 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-violet-500/10 transition-colors"></div>
            <RiUserSmileLine className="text-5xl text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h4 className="text-3xl font-black mb-4">Smart Matchmaking</h4>
            <p className="text-white/50 text-lg leading-relaxed">Filter by tags to find people who actually share your interests, increasing the quality of your connections.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-12 glass-panel p-10 group hover:bg-white/[0.04] transition-colors flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/5 rounded-full blur-[100px] group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
             <div className="flex-1">
                <RiLockPasswordLine className="text-5xl text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <h4 className="text-3xl font-black mb-4">Absolute Privacy</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-2xl">Connections vanish the moment you skip or disconnect. No history is stored, no traces are left behind. Just raw, unfiltered, and ephemeral human connection.</p>
             </div>
             <div className="hidden md:flex flex-1 justify-end">
                <div className="w-full max-w-sm h-40 bg-white/[0.02] rounded-3xl flex items-center justify-center backdrop-blur-2xl relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                   {/* Simulated waveform animation */}
                   <div className="flex items-center gap-1.5">
                     {[...Array(24)].map((_, i) => (
                       <motion.div 
                         key={i} 
                         animate={{ height: ["12px", `${Math.random() * 50 + 20}px`, "12px"] }}
                         transition={{ duration: 0.8 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }}
                         className="w-2 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
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
