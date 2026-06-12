import Link from "next/link";
import ParticleBackground from "../components/ParticleBackground";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#07070e] overflow-hidden">
      <ParticleBackground />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[120px] mix-blend-screen z-0"></div>
      <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-500/5 blur-[140px] mix-blend-screen z-0"></div>

      <main className="flex-1 flex flex-col items-center w-full px-6 pt-32 pb-20 relative z-10 max-w-4xl mx-auto">
        {/* Back link */}
        <div className="w-full mb-10">
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-amber-400 transition-colors font-medium flex items-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="w-full mb-12">
          <div className="glass-panel px-5 py-2 rounded-full mb-6 inline-flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
              Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-white mb-4">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="w-full space-y-8">
          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">1. Our Privacy Commitment</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion is built with privacy as its foundation. We believe in minimal data collection and maximum anonymity. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. <span className="text-amber-400 font-bold">The short version: we collect almost nothing.</span>
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">2. No Accounts, No Personal Data</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion does not require user registration or accounts. We do not collect your name, email address, phone number, or any other personally identifiable information. You use the Service anonymously without creating any profile or providing any credentials.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">3. What Data We Collect</h2>
            <p className="text-white/50 leading-relaxed">
              We collect only the minimal technical data necessary to operate the Service:
            </p>
            <ul className="list-disc list-inside text-white/50 space-y-2 pl-2 leading-relaxed">
              <li><span className="text-white/70 font-semibold">Connection metadata:</span> Temporary signaling data required to establish WebRTC peer-to-peer connections (ICE candidates, session descriptions). This data is transient and not persisted.</li>
              <li><span className="text-white/70 font-semibold">Interest tags:</span> Tags you optionally enter for matchmaking purposes. These are held in memory during your session only and are discarded when you disconnect.</li>
              <li><span className="text-white/70 font-semibold">Basic analytics:</span> Anonymous, aggregated usage statistics such as online user count. No individual user tracking is performed.</li>
            </ul>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">4. WebRTC Peer Connections</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion uses WebRTC (Web Real-Time Communication) to facilitate direct peer-to-peer connections between users. This means your video, audio, and text messages travel directly between your browser and your chat partner&apos;s browser — <span className="text-white/70 font-semibold">our servers never see, process, or store your conversation content</span>.
            </p>
            <p className="text-white/50 leading-relaxed">
              Please be aware that WebRTC connections may expose your IP address to the other party in the connection. This is inherent to how peer-to-peer technology works. If you wish to mask your IP address, consider using a VPN service.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">5. No Chat Logs Stored</h2>
            <p className="text-white/50 leading-relaxed">
              We do <span className="text-amber-400 font-bold">not</span> store, record, log, or archive any text messages, video streams, or audio from your conversations. All communication is ephemeral and exists only during the active session. Once you disconnect or skip to a new partner, the conversation is permanently gone with no possibility of retrieval.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">6. Cookies &amp; Local Storage</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion may use minimal cookies or browser local storage for the following purposes:
            </p>
            <ul className="list-disc list-inside text-white/50 space-y-2 pl-2 leading-relaxed">
              <li><span className="text-white/70 font-semibold">Session preferences:</span> Remembering your selected chat mode (text/video) or interest tags during your browsing session</li>
              <li><span className="text-white/70 font-semibold">Technical functionality:</span> Essential cookies required for the application to function correctly</li>
            </ul>
            <p className="text-white/50 leading-relaxed">
              We do not use tracking cookies, advertising cookies, or any third-party analytics cookies that identify individual users.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">7. Third-Party Services &amp; NSFW Detection</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion uses NSFW content detection to help maintain community safety. This detection runs <span className="text-amber-400 font-bold">entirely client-side in your browser</span> using machine learning models. Your video frames are analyzed locally on your device and are never transmitted to our servers or any third-party service for content analysis.
            </p>
            <p className="text-white/50 leading-relaxed">
              We do not integrate with any third-party advertising networks, social media trackers, or data brokers.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">8. Data Retention</h2>
            <p className="text-white/50 leading-relaxed">
              Our data retention policy is simple: <span className="text-amber-400 font-bold">we retain nothing</span>. Since we do not collect personal data or store conversations, there is no user data to retain. Temporary signaling data used to establish connections is purged from server memory as soon as the connection is established or the session ends.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">9. Data Security</h2>
            <p className="text-white/50 leading-relaxed">
              While we implement reasonable security measures to protect the minimal data we do handle, no internet transmission or electronic storage method is 100% secure. WebRTC connections are encrypted using DTLS-SRTP by default, providing end-to-end encryption for your media streams.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">10. Your Rights</h2>
            <p className="text-white/50 leading-relaxed">
              Since we do not collect or store personal data, traditional data subject rights (access, deletion, portability) are inherently fulfilled — there is simply no data to access, delete, or port. If you have any questions about your privacy while using Conexion, please contact us through the methods available on our website.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">11. Changes to This Policy</h2>
            <p className="text-white/50 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Your continued use of Conexion after any changes constitutes acceptance of the revised policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
