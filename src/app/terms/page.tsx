import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Terms of Service — Typeset",
  description: "Terms of Service for Typeset, the LaTeX resume editor.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: October 31, 2026
        </p>

        <div className="mt-10 space-y-8 text-neutral-300 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Typeset (&ldquo;the Service&rdquo;), you agree to be
              bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to
              these Terms, do not use the Service. We reserve the right to update
              these Terms at any time, and your continued use of the Service
              constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Description of Service
            </h2>
            <p>
              Typeset is a web-based platform that allows users to create, edit,
              and manage professional resumes using LaTeX or a visual builder
              interface. The Service includes a code editor, visual form builder,
              client-side PDF compilation, template library, file storage, and an
              MCP (Model Context Protocol) server for AI agent integration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Accounts and Registration
            </h2>
            <p>
              To access certain features, you must create an account. You agree
              to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and account</li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p className="mt-2">
              We reserve the right to suspend or terminate accounts that violate
              these Terms or are inactive for an extended period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. User Content
            </h2>
            <p>
              You retain ownership of all content you create using the Service,
              including resume text, LaTeX source code, and uploaded files
              (&ldquo;User Content&rdquo;). By using the Service, you grant us a limited,
              non-exclusive license to store, process, and display your User
              Content solely for the purpose of providing the Service to you.
            </p>
            <p className="mt-2">You represent and warrant that:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>You own or have the right to use all content you submit</li>
              <li>
                Your content does not infringe on any third party&apos;s intellectual
                property rights
              </li>
              <li>
                Your content does not contain malicious code or content that
                violates any law
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. MCP and API Usage
            </h2>
            <p>
              The Service provides an MCP server endpoint for programmatic access
              by AI agents. By using the MCP API, you agree to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Authenticate all API requests using a valid API key
              </li>
              <li>
                Not abuse the API with excessive requests or automated scraping
              </li>
              <li>
                Not use the API to create content that violates these Terms
              </li>
              <li>
                Keep your API keys confidential and rotate them if compromised
              </li>
            </ul>
            <p className="mt-2">
              We may impose rate limits, usage quotas, or revoke API access at
              our discretion to protect the integrity of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Use the Service for any unlawful purpose or to promote illegal
                activities
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service
              </li>
              <li>
                Interfere with or disrupt the Service or servers connected to it
              </li>
              <li>
                Upload malicious files, viruses, or harmful code
              </li>
              <li>
                Impersonate any person or entity or misrepresent your affiliation
              </li>
              <li>
                Use the Service to generate false, misleading, or fraudulent
                resumes
              </li>
              <li>
                Reverse engineer, decompile, or disassemble any part of the
                Service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Pricing and Payments
            </h2>
            <p>
              The Service offers both free and paid plans. Paid plans are billed
              on a recurring basis. You agree to pay all applicable fees and
              authorize us to charge your payment method. Prices are subject to
              change with reasonable notice. Refunds are handled on a
              case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Intellectual Property
            </h2>
            <p>
              The Service, including its design, code, templates, and branding,
              is owned by Typeset and protected by intellectual property laws.
              LaTeX templates provided by the Service are licensed for your
              personal and professional use in creating resumes. You may not
              redistribute, sell, or sublicense the templates themselves.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, either express or implied. We do not
              guarantee that the Service will be uninterrupted, error-free, or
              secure. Client-side LaTeX compilation depends on WebAssembly
              support in your browser, which we do not control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Typeset shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including loss of profits, data, or business
              opportunities, arising out of or related to your use of the
              Service, even if we have been advised of the possibility of such
              damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Termination
            </h2>
            <p>
              We may terminate or suspend your access to the Service immediately,
              without prior notice, for any reason, including breach of these
              Terms. Upon termination, your right to use the Service ceases
              immediately. You may export your data before termination. We may
              delete your data after a reasonable period following account
              termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              12. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              applicable laws, without regard to conflict of law principles. Any
              disputes arising under these Terms shall be resolved through good
              faith negotiation, and if necessary, binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              13. Contact
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@typeset.app"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                legal@typeset.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
