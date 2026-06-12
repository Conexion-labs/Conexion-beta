import Link from "next/link";
import ParticleBackground from "../components/ParticleBackground";
import Footer from "../components/Footer";

export default function TermsOfService() {
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
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div className="w-full space-y-8">
          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">1. Acceptance of Terms</h2>
            <p className="text-white/50 leading-relaxed">
              By accessing or using Conexion (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. Conexion is an anonymous text and video chat platform that connects users randomly with other users worldwide.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">2. Age Requirement</h2>
            <p className="text-white/50 leading-relaxed">
              You must be at least <span className="text-amber-400 font-bold">18 years of age</span> to use this Service. By using Conexion, you represent and warrant that you are at least 18 years old. We do not knowingly allow minors to use the platform, and any violation of this policy may result in immediate termination of access.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">3. Acceptable Use</h2>
            <p className="text-white/50 leading-relaxed">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. When using Conexion, you agree <span className="text-white/70 font-semibold">not to</span>:
            </p>
            <ul className="list-disc list-inside text-white/50 space-y-2 pl-2 leading-relaxed">
              <li>Engage in any activity that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Transmit, distribute, or share any content that exploits or harms minors in any way</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent yourself</li>
              <li>Upload, transmit, or distribute any viruses, malware, or other harmful software</li>
              <li>Attempt to gain unauthorized access to other users&apos; connections or data</li>
              <li>Use the Service for commercial solicitation, advertising, or spam</li>
              <li>Record, screenshot, or capture other users&apos; video or text conversations without their consent</li>
            </ul>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">4. No Harassment Policy</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion has a zero-tolerance policy for harassment of any kind. This includes, but is not limited to: sexual harassment, stalking, bullying, hate speech, threats of violence, and discrimination based on race, gender, sexual orientation, religion, or any other protected characteristic. Users who violate this policy may be immediately banned from the platform.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">5. NSFW Content Policy</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion employs client-side NSFW content detection to help maintain a safe environment. While the platform may allow adult content between consenting adult users, <span className="text-white/70 font-semibold">the following is strictly prohibited</span>:
            </p>
            <ul className="list-disc list-inside text-white/50 space-y-2 pl-2 leading-relaxed">
              <li>Any content involving minors or that appears to involve minors</li>
              <li>Non-consensual explicit content or behavior</li>
              <li>Content that violates the laws of your jurisdiction</li>
              <li>Broadcasting explicit content without clear mutual consent from both parties</li>
            </ul>
            <p className="text-white/50 leading-relaxed">
              Our automated moderation systems may flag or restrict access based on detected content. These systems operate entirely on-device and do not transmit your media to external servers.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">6. No Illegal Content</h2>
            <p className="text-white/50 leading-relaxed">
              You may not use Conexion to share, distribute, or transmit any content that is illegal under applicable law. This includes but is not limited to: child sexual abuse material (CSAM), content promoting terrorism, illegal drug distribution, trafficking of any kind, and content that infringes on intellectual property rights. Violations will be reported to the appropriate authorities.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">7. No Data Retention</h2>
            <p className="text-white/50 leading-relaxed">
              Conexion does not store chat logs, video streams, or any content from your conversations. All communication occurs in real-time through peer-to-peer WebRTC connections and is ephemeral by design. Once a session ends, the conversation data is permanently lost and cannot be recovered by us or any third party.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">8. Disclaimer of Warranties</h2>
            <p className="text-white/50 leading-relaxed">
              The Service is provided on an <span className="text-white/70 font-semibold">&ldquo;as is&rdquo;</span> and <span className="text-white/70 font-semibold">&ldquo;as available&rdquo;</span> basis without any warranties of any kind, either express or implied. Conexion does not warrant that the Service will be uninterrupted, secure, or error-free. We do not guarantee the identity, intentions, or behavior of any user you may encounter on the platform.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">9. Limitation of Liability</h2>
            <p className="text-white/50 leading-relaxed">
              To the maximum extent permitted by applicable law, Conexion and its operators, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service. This includes, without limitation, damages for loss of data, loss of goodwill, or any other intangible losses, even if we have been advised of the possibility of such damages. Our total liability for any claims arising under these terms shall not exceed the amount you have paid to us (if any) in the twelve months preceding the claim.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">10. Modifications to Terms</h2>
            <p className="text-white/50 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the Service after any modification constitutes acceptance of the revised terms. We encourage you to review these terms periodically.
            </p>
          </section>

          <section className="glass-panel p-8 md:p-10 space-y-4">
            <h2 className="text-xl font-black text-white">11. Contact</h2>
            <p className="text-white/50 leading-relaxed">
              If you have any questions or concerns about these Terms of Service, please reach out through the contact methods available on our website.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
