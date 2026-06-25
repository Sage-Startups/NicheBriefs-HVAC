import Link from "next/link";
import { Wind } from "lucide-react";

export const metadata = {
  title: "Terms of Service — NicheBriefs HVAC",
  description: "Terms of Service for NicheBriefs HVAC SEO Brief Generator.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[#334155]">
          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using NicheBriefs HVAC ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. We reserve the right to update these terms at any time, and continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">2. Description of Service</h2>
            <p className="text-sm leading-relaxed">
              NicheBriefs HVAC is a software-as-a-service (SaaS) tool that generates structured SEO content briefs for HVAC-related pages using AI. Generated briefs are intended as working documents for content writers and SEO professionals. All generated content should be reviewed, verified, and edited before publication.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">3. User Accounts</h2>
            <p className="text-sm leading-relaxed">
              You are responsible for maintaining the security of your account credentials. You may not share your account or use the Service for unauthorized commercial redistribution of generated content. One account per user in the MVP; multi-user workspaces are not currently supported.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">4. Acceptable Use</h2>
            <p className="text-sm leading-relaxed mb-2">You agree not to:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer or extract the underlying AI prompts or models</li>
              <li>Abuse generation limits or attempt to circumvent subscription gating</li>
              <li>Use the Service to generate content that is knowingly false, defamatory, or harmful</li>
              <li>Resell or sublicense raw generated brief output as a standalone product</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">5. Content and Intellectual Property</h2>
            <p className="text-sm leading-relaxed">
              You retain ownership of the inputs you provide (keywords, notes, competitor references). Generated brief output is provided for your use. NicheBriefs HVAC retains no claim on your published content derived from generated briefs. We make no guarantees about the uniqueness, accuracy, or SEO effectiveness of generated content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">6. Competitor Data Handling</h2>
            <p className="text-sm leading-relaxed">
              NicheBriefs HVAC does not crawl, scrape, or automatically analyze competitor websites. Any competitor URLs entered into the brief form are treated as reference labels only. If you paste competitor page content manually, that content is included in the AI prompt on your behalf and is subject to the same terms as any other user input.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">7. Billing and Subscriptions</h2>
            <p className="text-sm leading-relaxed">
              Billing is handled by Stripe. By subscribing to a paid plan, you agree to Stripe's terms of service. Subscriptions auto-renew unless canceled. Refunds are not guaranteed but may be considered on a case-by-case basis. Trial accounts have no obligation to upgrade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">8. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              The Service is provided "as is" without warranties of any kind. NicheBriefs HVAC is not liable for any indirect, incidental, or consequential damages arising from use of the Service or reliance on generated content. You are solely responsible for reviewing and verifying generated content before publishing or acting on it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">9. Termination</h2>
            <p className="text-sm leading-relaxed">
              We may suspend or terminate your account for violation of these terms. You may cancel your account at any time via the billing settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-3">10. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:hello@nichebriefs.com" className="text-[#2563EB] hover:underline">hello@nichebriefs.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white py-6 mt-12">
        <div className="mx-auto max-w-3xl px-6 flex items-center justify-between text-xs text-slate-400">
          <Link href="/" className="hover:text-[#2563EB] transition-colors">← Back to home</Link>
          <div className="flex gap-4">
            <Link href="/terms" className="text-[#2563EB]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#2563EB] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
