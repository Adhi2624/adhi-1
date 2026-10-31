import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Privacy Policy — Typeset",
  description: "Privacy Policy for Typeset, the LaTeX resume editor.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: October 31, 2026
        </p>

        <div className="mt-10 space-y-8 text-neutral-300 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Introduction
            </h2>
            <p>
              Typeset (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              store, and share your information when you use our web-based resume
              editor and related services (the &ldquo;Service&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Information We Collect
            </h2>

            <h3 className="text-base font-medium text-neutral-200 mt-4 mb-2">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                <strong className="text-white">Account information:</strong>{" "}
                Name, email address, and password when you create an account
              </li>
              <li>
                <strong className="text-white">Resume content:</strong> LaTeX
                source code, personal details, work history, education, skills,
                and other information you include in your resumes
              </li>
              <li>
                <strong className="text-white">Uploaded files:</strong> Any files
                you upload through our file storage feature
              </li>
            </ul>

            <h3 className="text-base font-medium text-neutral-200 mt-4 mb-2">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                <strong className="text-white">Usage data:</strong> Pages
                visited, features used, actions taken within the Service
              </li>
              <li>
                <strong className="text-white">Device information:</strong>{" "}
                Browser type, operating system, screen resolution
              </li>
              <li>
                <strong className="text-white">Log data:</strong> IP address,
                access times, referring URLs
              </li>
            </ul>

            <h3 className="text-base font-medium text-neutral-200 mt-4 mb-2">
              2.3 Information from API Usage
            </h3>
            <p>
              When AI agents interact with our MCP server, we log the API key
              used, request timestamps, and the operations performed. We do not
              share this data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Create and manage your account</li>
              <li>Store and display your resumes and uploaded files</li>
              <li>Process your requests and transactions</li>
              <li>
                Send service-related communications (account verification,
                security alerts, support)
              </li>
              <li>Monitor and analyze usage patterns to improve the Service</li>
              <li>Detect, prevent, and address technical issues and abuse</li>
              <li>Enforce our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Data Storage and Security
            </h2>
            <p>
              Your data is stored using the storage backend configured for the
              Service instance (which may include MongoDB, Cloudflare D1, or
              in-memory storage for development). Files are stored using the
              configured storage adapter (local filesystem, AWS S3, or
              Cloudflare R2).
            </p>
            <p className="mt-2">We implement security measures including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Password hashing using bcrypt with appropriate salt rounds</li>
              <li>JWT-based session tokens with expiration</li>
              <li>HTTP-only, secure cookies for session management</li>
              <li>User-scoped file storage to prevent cross-account access</li>
              <li>API key authentication for MCP endpoints</li>
              <li>Input validation and sanitization on all endpoints</li>
            </ul>
            <p className="mt-2">
              While we implement reasonable security measures, no method of
              electronic transmission or storage is 100% secure. We cannot
              guarantee absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Data Sharing
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong className="text-white">Service providers:</strong> With
                infrastructure providers (hosting, database, storage) solely to
                operate the Service
              </li>
              <li>
                <strong className="text-white">Legal requirements:</strong> When
                required by law, legal process, or government request
              </li>
              <li>
                <strong className="text-white">Safety:</strong> To protect the
                rights, property, or safety of Typeset, our users, or the public
              </li>
              <li>
                <strong className="text-white">Business transfers:</strong> In
                connection with a merger, acquisition, or sale of assets, with
                notice to affected users
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Client-Side Processing
            </h2>
            <p>
              LaTeX compilation in Typeset is performed entirely in your browser
              using WebAssembly (SwiftLaTeX). Your resume source code is not sent
              to our servers for compilation. The PDF is generated locally on
              your device. This means your resume content stays on your machine
              during the compilation process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Cookies
            </h2>
            <p>
              We use a single essential cookie ({`"typeset-session"`}) to
              maintain your authenticated session. This cookie is:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>HTTP-only (not accessible to JavaScript)</li>
              <li>Secure in production (transmitted only over HTTPS)</li>
              <li>SameSite: Lax (provides CSRF protection)</li>
              <li>Expires after 7 days</li>
            </ul>
            <p className="mt-2">
              We do not use tracking cookies, advertising cookies, or
              third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong className="text-white">Access:</strong> Request a copy of
                the personal data we hold about you
              </li>
              <li>
                <strong className="text-white">Correction:</strong> Request
                correction of inaccurate personal data
              </li>
              <li>
                <strong className="text-white">Deletion:</strong> Request
                deletion of your account and associated data
              </li>
              <li>
                <strong className="text-white">Export:</strong> Download your
                resume data in LaTeX format at any time through the editor
              </li>
              <li>
                <strong className="text-white">Restriction:</strong> Request
                restriction of processing of your data
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@typeset.app"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                privacy@typeset.app
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active or as
              needed to provide the Service. If you delete your account, we will
              delete your personal data and resume content within 30 days, except
              where we are required to retain it for legal obligations. Anonymous
              usage statistics may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you believe we have collected information from a child under
              13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Self-Hosted Instances
            </h2>
            <p>
              Typeset can be self-hosted. If you use a self-hosted instance
              operated by a third party, that operator is responsible for the
              privacy practices of their instance. This Privacy Policy applies
              only to instances operated by us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of significant changes by posting the new policy on this page
              and updating the &ldquo;Last updated&rdquo; date. Your continued use of the
              Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              13. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices, please contact us at{" "}
              <a
                href="mailto:privacy@typeset.app"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                privacy@typeset.app
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
