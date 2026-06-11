"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RiMessage3Line, RiVideoChatLine, RiLockPasswordLine, RiUserSmileLine, RiFlashlightLine } from "react-icons/ri";
import ParticleBackground from "./components/ParticleBackground";

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
    fetch("http://localhost:3001/api/stats")
      .then(res => res.json())
      .then(data => setOnlineCount(data.online))
      .catch(() => {});
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center">
      <ParticleBackground />

      <nav className="nav-bar w-full max-w-7xl mx-auto top-4 rounded-2xl">
        <div className="text-xl font-bold tracking-tight text-white">
          Cone<span className="text-amber-500">x</span>ion
        </div>
        <div className="flex items-center gap-6">
          {onlineCount !== null && (
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {onlineCount} Online
            </div>
          )}
          <Link href="/chat" className="btn-primary text-sm px-5 py-2">
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
          <motion.div variants={itemVariants} className="glass-panel px-4 py-1.5 rounded-full mb-8 flex items-center gap-2 border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Live
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
              <TiltCard className="flex items-center gap-4 hover:border-amber-500/50 transition-colors w-full cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 group-hover:scale-110 transition-all">
                  <RiMessage3Line className="text-2xl" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Text Chat</h3>
                  <p className="text-sm text-white/40">Type & connect anonymously</p>
                </div>
              </TiltCard>
            </Link>

            <Link href="/chat?mode=video" className="group relative w-full sm:w-auto perspective-1000">
              <TiltCard className="flex items-center gap-4 hover:border-amber-500/50 transition-colors w-full cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 group-hover:scale-110 transition-all">
                  <RiVideoChatLine className="text-2xl" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Video Chat</h3>
                  <p className="text-sm text-white/40">Face to face, instantly</p>
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
          className="w-full mt-32 grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          <motion.div variants={itemVariants} className="md:col-span-7 glass-panel p-8 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
            <RiFlashlightLine className="text-4xl text-amber-500 mb-6" />
            <h4 className="text-2xl font-bold mb-3">Direct WebRTC</h4>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">Your video and audio streams are strictly peer-to-peer. We do not intermediate or touch your data, guaranteeing lowest latency.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-5 glass-panel p-8 group hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-violet-500/10 transition-colors"></div>
            <RiUserSmileLine className="text-4xl text-amber-500 mb-6" />
            <h4 className="text-2xl font-bold mb-3">Smart Matchmaking</h4>
            <p className="text-white/50 text-lg leading-relaxed">Filter by tags to find people who actually share your interests, increasing the quality of your connections.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-12 glass-panel p-8 group hover:bg-white/[0.04] transition-colors flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/5 rounded-full blur-[100px] group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
             <div className="flex-1">
                <RiLockPasswordLine className="text-4xl text-amber-500 mb-6" />
                <h4 className="text-2xl font-bold mb-3">Absolute Privacy</h4>
                <p className="text-white/50 text-lg leading-relaxed max-w-2xl">Connections vanish the moment you skip or disconnect. No history is stored, no traces are left behind. Just raw, unfiltered, and ephemeral human connection.</p>
             </div>
             <div className="hidden md:flex flex-1 justify-end">
                <div className="w-full max-w-sm h-32 border border-white/10 rounded-xl bg-black/40 flex items-center justify-center backdrop-blur-md relative overflow-hidden">
                   {/* Simulated waveform animation */}
                   <div className="flex items-center gap-1">
                     {[...Array(20)].map((_, i) => (
                       <motion.div 
                         key={i} 
                         animate={{ height: ["10px", `${Math.random() * 40 + 20}px`, "10px"] }}
                         transition={{ duration: 0.8 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }}
                         className="w-1.5 bg-amber-500/60 rounded-full"
                       />
                     ))}
                   </div>
                </div>
             </div>
          </motion.div>
        </motion.section>

      </main>
    </div>
  );
}
