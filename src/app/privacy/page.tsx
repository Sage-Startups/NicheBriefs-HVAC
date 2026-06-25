import Link from "next/link";
import { Wind } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — NicheBriefs HVAC",
  description: "Privacy Policy for NicheBriefs HVAC SEO Brief Generator.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-[#2563EB]" />
            <span className="font-semibold text-[#0F172A]">
              NicheBriefs <span className="text-[#2563EB]">HVAC</span>
            </span>
          </Link>
          <Link href="/sign-in" className="text-sm text-[#2563EB] hover:underline">Sign in</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[#334155]">
          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed mb-2">We collect information you provide directly to us:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
              <li>Account information: name and email address when you sign up</li>
              <li>Brief inputs: keywords, target city, service type, competitor references, and client notes you enter into the brief generator</li>
              <li>Usage data: brief generation history, project names, and account activity</li>
              <li>Payment information: processed and stored by Stripe — we do not store card details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">2. How We Use Your Information</h2>
            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
              <li>To provide and operate the NicheBriefs HVAC service</li>
              <li>To generate AI-powered SEO briefs based on your inputs</li>
              <li>To manage your subscription and process payments via Stripe</li>
              <li>To send transactional emails related to your account</li>
              <li>To improve the product and monitor usage patterns (aggregated, not individually targeted)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">3. AI Processing</h2>
            <p className="text-sm leading-relaxed">
              Brief inputs you provide — including keywords, city, service type, notes, and competitor references — are sent to OpenAI's API to generate SEO brief content. This data is subject to{" "}
              <a href="https://openai.com/policies/privacy-policy" className="text-[#2563EB] hover:underline" target="_blank" rel="noopener noreferrer">OpenAI's privacy policy</a>.
              We do not send your personal account information (name, email, billing details) to OpenAI. Competitor URLs you enter are treated as reference labels only — they are not crawled or fetched.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">4. Data Storage and Security</h2>
            <p className="text-sm leading-relaxed">
              Your data is stored in a PostgreSQL database hosted on Neon (neon.tech). All data is scoped to your workspace and is not shared with other users or organizations. We use industry-standard encryption in transit (TLS) and apply access controls to prevent unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">5. Third-Party Services</h2>
            <p className="text-sm leading-relaxed mb-2">We use the following third-party services to operate NicheBriefs HVAC:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
              <li><strong>Stripe</strong> — payment processing and subscription management</li>
              <li><strong>OpenAI</strong> — AI brief generation (your brief inputs only)</li>
              <li><strong>Neon</strong> — hosted PostgreSQL database</li>
              <li><strong>Vercel</strong> — hosting and deployment infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">6. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              Generated briefs and projects are retained as long as your account is active. If you delete a brief or project, it is soft-archived and may be permanently deleted within 30 days. If you close your account, your data will be deleted within 60 days unless retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">7. Cookies</h2>
            <p className="text-sm leading-relaxed">
              We use a session cookie to keep you signed in. No third-party advertising or tracking cookies are used. We do not run ad networks or cross-site tracking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">8. Your Rights</h2>
            <p className="text-sm leading-relaxed">
              You may request access to, correction of, or deletion of your personal data at any time by emailing{" "}
              <a href="mailto:hello@nichebriefs.com" className="text-[#2563EB] hover:underline">hello@nichebriefs.com</a>.
              You may also cancel your subscription and close your account at any time via Settings → Billing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">9. Children's Privacy</h2>
            <p className="text-sm leading-relaxed">
              NicheBriefs HVAC is intended for business use by adults. We do not knowingly collect personal information from anyone under the age of 16.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">10. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify users of material changes via email or a notice in the app. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">11. Contact</h2>
            <p className="text-sm leading-relaxed">
              For privacy questions or data requests, contact us at{" "}
              <a href="mailto:hello@nichebriefs.com" className="text-[#2563EB] hover:underline">hello@nichebriefs.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white py-6 mt-12">
        <div className="mx-auto max-w-3xl px-6 flex items-center justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-[#2563EB] transition-colors">← Back to home</Link>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#2563EB] transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[#2563EB]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
