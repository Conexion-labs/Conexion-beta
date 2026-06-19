"use client";

import Link from "next/link";
import ParticleBackground from "../components/ParticleBackground";
import Footer from "../components/Footer";

export default function TermsOfService() {
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
            Terms of <span style={{ color: "var(--color-gray-brown)", fontStyle: "italic" }}>Service</span>
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--color-gray-light)" }}>
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="w-full space-y-8">
          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">1. Acceptance of Terms</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              By accessing or using Conexion (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. Conexion is an anonymous text and video chat platform that connects users randomly with other users worldwide.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">2. Age Requirement</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              You must be at least <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>18 years of age</span> to use this Service. By using Conexion, you represent and warrant that you are at least 18 years old. We do not knowingly allow minors to use the platform, and any violation of this policy may result in immediate termination of access.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">3. Acceptable Use</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              You agree to use the Service only for lawful purposes and in accordance with these Terms. When using Conexion, you agree <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>not to</span>:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              <li>Engage in any activity that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Transmit, distribute, or share any content that exploits or harms minors in any way</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent yourself</li>
              <li>Upload, transmit, or distribute any viruses, malware, or other harmful software</li>
              <li>Attempt to gain unauthorized access to other users&apos; connections or data</li>
              <li>Use the Service for commercial solicitation, advertising, or spam</li>
              <li>Record, screenshot, or capture other users&apos; video or text conversations without their consent</li>
            </ul>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">4. No Harassment Policy</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion has a zero-tolerance policy for harassment of any kind. This includes, but is not limited to: sexual harassment, stalking, bullying, hate speech, threats of violence, and discrimination based on race, gender, sexual orientation, religion, or any other protected characteristic. Users who violate this policy may be immediately banned from the platform.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">5. NSFW Content Policy</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion employs client-side NSFW content detection to help maintain a safe environment. While the platform may allow adult content between consenting adult users, <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>the following is strictly prohibited</span>:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              <li>Any content involving minors or that appears to involve minors</li>
              <li>Non-consensual explicit content or behavior</li>
              <li>Content that violates the laws of your jurisdiction</li>
              <li>Broadcasting explicit content without clear mutual consent from both parties</li>
            </ul>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Our automated moderation systems may flag or restrict access based on detected content. These systems operate entirely on-device and do not transmit your media to external servers.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">6. No Illegal Content</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              You may not use Conexion to share, distribute, or transmit any content that is illegal under applicable law. This includes but is not limited to: child sexual abuse material (CSAM), content promoting terrorism, illegal drug distribution, trafficking of any kind, and content that infringes on intellectual property rights. Violations will be reported to the appropriate authorities.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">7. No Data Retention</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              Conexion does not store chat logs, video streams, or any content from your conversations. All communication occurs in real-time through peer-to-peer WebRTC connections and is ephemeral by design. Once a session ends, the conversation data is permanently lost and cannot be recovered by us or any third party.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">8. Disclaimer of Warranties</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              The Service is provided on an <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>&ldquo;as is&rdquo;</span> and <span style={{ color: "var(--color-charcoal)", fontWeight: 600 }}>&ldquo;as available&rdquo;</span> basis without any warranties of any kind, either express or implied. Conexion does not warrant that the Service will be uninterrupted, secure, or error-free. We do not guarantee the identity, intentions, or behavior of any user you may encounter on the platform.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">9. Limitation of Liability</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              To the maximum extent permitted by applicable law, Conexion and its operators, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service. This includes, without limitation, damages for loss of data, loss of goodwill, or any other intangible losses, even if we have been advised of the possibility of such damages. Our total liability for any claims arising under these terms shall not exceed the amount you have paid to us (if any) in the twelve months preceding the claim.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">10. Modifications to Terms</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the Service after any modification constitutes acceptance of the revised terms. We encourage you to review these terms periodically.
            </p>
          </section>

          <section className="warm-panel p-8 md:p-10 space-y-4">
            <h2 className="heading-serif text-2xl">11. Contact</h2>
            <p className="leading-relaxed" style={{ color: "var(--color-gray-brown)" }}>
              If you have any questions or concerns about these Terms of Service, please reach out through the contact methods available on our website.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
