"use client";

import Link from "next/link";
import ParticleBackground from "../components/ParticleBackground";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-ivory)", color: "var(--color-charcoal)" }}>
      <ParticleBackground />

      {/* Subtle warm blobs */}
      <div className="pointer-events-none fixed top-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full blur-[130px] z-0"
        style={{ backgroundColor: "rgba(212, 145, 106, 0.07)" }} />
      <div className="pointer-events-none fixed bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full blur-[150px] z-0"
        style={{ backgroundColor: "rgba(107, 135, 160, 0.06)" }} />

      <main className="flex-1 flex flex-col items-center w-full px-6 pt-32 pb-20 relative z-10 max-w-4xl mx-auto">
        {/* Back link */}
        <div className="w-full mb-10">
          <Link
            href="/"
            className="text-sm font-medium transition-colors flex items-center gap-2"
            style={{ color: "var(--color-gray-brown)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-charcoal)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-brown)")}
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="w-full mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border mb-6"
            style={{ backgroundColor: "var(--color-parchment)", borderColor: "var(--color-border)" }}>
            <span className="status-dot" />
            <span className="label-xs">Legal</span>
          </div>
          <h1 className="heading-serif text-4xl md:text-6xl mb-4" style={{ lineHeight: 1.05 }}>
            Privacy <span style={{ color: "var(--color-gray-brown)", fontStyle: "italic" }}>Policy</span>
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--color-gray-light)" }}>
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="w-full space-y-8">
          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">1. Our Privacy Commitment</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion is built with privacy as its foundation. We believe in minimal data collection and maximum anonymity. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>The short version: we collect almost nothing.</span>
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">2. No Accounts, No Personal Data</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion does not require user registration or accounts. We do not collect your name, email address, phone number, or any other personally identifiable information. You use the Service anonymously without creating any profile or providing any credentials.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">3. What Data We Collect</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              We collect only the minimal technical data necessary to operate the Service:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              <li><span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>Connection metadata:</span> Temporary signaling data required to establish WebRTC peer-to-peer connections (ICE candidates, session descriptions). This data is transient and not persisted.</li>
              <li><span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>Interest tags:</span> Tags you optionally enter for matchmaking purposes. These are held in memory during your session only and are discarded when you disconnect.</li>
              <li><span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>Basic analytics:</span> Anonymous, aggregated usage statistics such as online user count. No individual user tracking is performed.</li>
            </ul>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">4. WebRTC Peer Connections</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion uses WebRTC (Web Real-Time Communication) to facilitate direct peer-to-peer connections between users. This means your video, audio, and text messages travel directly between your browser and your chat partner&apos;s browser — <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>our servers never see, process, or store your conversation content</span>.
            </p>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Please be aware that WebRTC connections may expose your IP address to the other party in the connection. This is inherent to how peer-to-peer technology works. If you wish to mask your IP address, consider using a VPN service.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">5. No Chat Logs Stored</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              We do <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>not</span> store, record, log, or archive any text messages, video streams, or audio from your conversations. All communication is ephemeral and exists only during the active session. Once you disconnect or skip to a new partner, the conversation is permanently gone with no possibility of retrieval.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">6. Cookies &amp; Local Storage</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion may use minimal cookies or browser local storage for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              <li><span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>Session preferences:</span> Remembering your selected chat mode (text/video) or interest tags during your browsing session</li>
              <li><span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>Technical functionality:</span> Essential cookies required for the application to function correctly</li>
            </ul>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              We do not use tracking cookies, advertising cookies, or any third-party analytics cookies that identify individual users.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">7. Third-Party Services &amp; NSFW Detection</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion uses NSFW content detection to help maintain community safety. This detection runs <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>entirely client-side in your browser</span> using machine learning models. Your video frames are analyzed locally on your device and are never transmitted to our servers or any third-party service for content analysis.
            </p>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              We do not integrate with any third-party advertising networks, social media trackers, or data brokers.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">8. Data Retention</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Our data retention policy is simple: <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>we retain nothing</span>. Since we do not collect personal data or store conversations, there is no user data to retain. Temporary signaling data used to establish connections is purged from server memory as soon as the connection is established or the session ends.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">9. Data Security</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              While we implement reasonable security measures to protect the minimal data we do handle, no internet transmission or electronic storage method is 100% secure. WebRTC connections are encrypted using DTLS-SRTP by default, providing end-to-end encryption for your media streams.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">10. Your Rights</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Since we do not collect or store personal data, traditional data subject rights (access, deletion, portability) are inherently fulfilled — there is simply no data to access, delete, or port. If you have any questions about your privacy while using Conexion, please contact us through the methods available on our website.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">11. Changes to This Policy</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Your continued use of Conexion after any changes constitutes acceptance of the revised policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
