"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "LaTeX Editor",
    desc: "Full-featured Monaco editor with syntax highlighting, auto-completion, and bracket matching. For those who want pixel-perfect control.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: "Visual Builder",
    desc: "No LaTeX knowledge needed. Fill in a form with your details, pick a template, and get a professionally typeset resume instantly.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI-Powered via MCP",
    desc: "Connect your AI agents through the Model Context Protocol. Let Claude, GPT, or any MCP-compatible agent build your resume for you.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: "Live PDF Preview",
    desc: "See your resume compile in real time as you type. Client-side LaTeX engine means zero server costs and instant feedback.",
  },
];

const steps = [
  {
    num: "01",
    title: "Choose Your Path",
    desc: "Use the visual builder for a guided experience, or dive into the LaTeX editor for full control.",
  },
  {
    num: "02",
    title: "Craft Your Resume",
    desc: "Fill in your details, pick a template, customize the design. Or let an AI agent do it for you via MCP.",
  },
  {
    num: "03",
    title: "Download & Share",
    desc: "Get a beautifully typeset PDF ready for applications. Update it anytime from your dashboard.",
  },
];

const templatePreviews = [
  {
    name: "Classic",
    desc: "Traditional single-column layout. Clean, proven, ATS-friendly.",
    accent: "from-blue-600 to-blue-400",
  },
  {
    name: "Modern",
    desc: "Contemporary design with accent colors and icons. Stands out on screen.",
    accent: "from-violet-600 to-violet-400",
  },
  {
    name: "Minimal",
    desc: "Ultra-clean with generous whitespace. Lets your content speak.",
    accent: "from-emerald-600 to-emerald-400",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with the essentials",
    features: [
      "3 resumes",
      "All templates",
      "Visual builder",
      "LaTeX editor",
      "PDF export",
    ],
    cta: "Start Free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    desc: "For serious job seekers",
    features: [
      "Unlimited resumes",
      "Priority PDF compilation",
      "Custom templates",
      "Version history",
      "MCP API access",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    desc: "For career services & teams",
    features: [
      "Everything in Pro",
      "Admin panel",
      "Team collaboration",
      "Usage analytics",
      "Custom branding",
      "SSO integration",
    ],
    cta: "Contact Us",
    href: "/register",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-neutral-950 to-neutral-950" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Now with AI agent support via MCP
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
              Resumes that
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {" "}stand out.
              </span>
              <br />
              Built with precision.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Whether you write LaTeX or have never heard of it — Typeset gives
              you beautifully typeset resumes in minutes. Use our visual builder,
              code it yourself, or let AI do it for you.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/25"
              >
                Start Building — Free
              </Link>
              <Link
                href="/builder"
                className="w-full sm:w-auto px-8 py-3 text-base font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors border border-neutral-700"
              >
                Try Visual Builder
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-600">
              No credit card required. Free plan includes 3 resumes.
            </p>
          </div>

          {/* Editor preview mockup */}
          <div className="mt-16 mx-auto max-w-5xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/80">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-neutral-500 ml-2">
                main.tex — Typeset Editor
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-neutral-800">
              <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed text-neutral-400 min-h-[200px]">
                <div>
                  <span className="text-blue-400">{"\\documentclass"}</span>
                  <span className="text-yellow-400">[</span>
                  <span className="text-neutral-300">11pt,a4paper</span>
                  <span className="text-yellow-400">]</span>
                  <span className="text-yellow-400">{"{"}</span>
                  <span className="text-neutral-300">article</span>
                  <span className="text-yellow-400">{"}"}</span>
                </div>
                <div className="text-green-500/70">
                  {"% Your professional resume"}
                </div>
                <div className="mt-2">
                  <span className="text-blue-400">{"\\begin"}</span>
                  <span className="text-yellow-400">{"{"}</span>
                  <span className="text-neutral-300">document</span>
                  <span className="text-yellow-400">{"}"}</span>
                </div>
                <div className="ml-4 mt-1">
                  <span className="text-blue-400">{"\\section"}</span>
                  <span className="text-yellow-400">{"{"}</span>
                  <span className="text-neutral-300">Experience</span>
                  <span className="text-yellow-400">{"}"}</span>
                </div>
                <div className="ml-4 mt-1 text-neutral-500">
                  {"Senior Engineer at TechCorp..."}
                </div>
                <div className="mt-2">
                  <span className="text-blue-400">{"\\end"}</span>
                  <span className="text-yellow-400">{"{"}</span>
                  <span className="text-neutral-300">document</span>
                  <span className="text-yellow-400">{"}"}</span>
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-white min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-2 w-full max-w-xs">
                  <div className="h-3 w-32 mx-auto bg-neutral-900 rounded" />
                  <div className="h-1.5 w-48 mx-auto bg-neutral-300 rounded" />
                  <div className="mt-4 space-y-1.5">
                    <div className="h-2 w-16 bg-neutral-800 rounded" />
                    <div className="h-1.5 w-full bg-neutral-200 rounded" />
                    <div className="h-1.5 w-5/6 bg-neutral-200 rounded" />
                    <div className="h-1.5 w-4/6 bg-neutral-200 rounded" />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-14 bg-neutral-800 rounded" />
                    <div className="h-1.5 w-full bg-neutral-200 rounded" />
                    <div className="h-1.5 w-3/4 bg-neutral-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Two ways to build. One beautiful result.
            </h2>
            <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
              Power users get a LaTeX editor. Everyone else gets a visual
              builder. Both produce the same stunning output.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 border-t border-neutral-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three steps to your next opportunity
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center sm:text-left">
                <span className="text-4xl font-bold bg-gradient-to-b from-blue-400 to-blue-400/20 bg-clip-text text-transparent">
                  {s.num}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section
        id="templates"
        className="py-20 sm:py-28 border-t border-neutral-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Templates for every style
            </h2>
            <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
              Start with a professionally designed template and make it yours.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {templatePreviews.map((t) => (
              <div
                key={t.name}
                className="group rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-600 transition-colors"
              >
                <div
                  className={`h-48 bg-gradient-to-br ${t.accent} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                >
                  <div className="bg-white rounded-lg p-4 w-32 shadow-xl">
                    <div className="space-y-1.5">
                      <div className="h-2 w-16 mx-auto bg-neutral-800 rounded" />
                      <div className="h-1 w-20 mx-auto bg-neutral-300 rounded" />
                      <div className="mt-2 h-1 w-full bg-neutral-200 rounded" />
                      <div className="h-1 w-5/6 bg-neutral-200 rounded" />
                      <div className="h-1 w-4/6 bg-neutral-200 rounded" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white">{t.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI / MCP */}
      <section
        id="ai"
        className="py-20 sm:py-28 border-t border-neutral-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
                For Developers
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Let AI agents build resumes for your users
              </h2>
              <p className="mt-4 text-neutral-400 leading-relaxed">
                Typeset exposes a full MCP server. Connect Claude, GPT, or any
                MCP-compatible AI agent. They can browse templates, create
                resumes, update content, and return editor links — all
                programmatically.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "8 MCP tools for full resume CRUD",
                  "Streamable HTTP transport",
                  "Works with Claude Desktop & Claude Code",
                  "REST API also available",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-violet-400 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 font-mono text-xs sm:text-sm">
              <div className="text-neutral-500 mb-2">
                {"// Claude Desktop config"}
              </div>
              <pre className="text-green-400 leading-relaxed overflow-x-auto">
                {JSON.stringify(
                  {
                    mcpServers: {
                      typeset: {
                        command: "npx",
                        args: [
                          "-y",
                          "mcp-remote@latest",
                          "https://typeset.vercel.app/api/mcp",
                        ],
                      },
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-20 sm:py-28 border-t border-neutral-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-neutral-400">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                    : "border-neutral-800 bg-neutral-900/50"
                }`}
              >
                {plan.highlight && (
                  <span className="self-start px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium mb-3">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-400">{plan.desc}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-neutral-300"
                    >
                      <svg
                        className="w-4 h-4 text-blue-400 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-6 block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-neutral-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to build your resume?
          </h2>
          <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
            Join thousands of professionals who trust Typeset for their career
            documents.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/25"
            >
              Get Started — It&#39;s Free
            </Link>
            <Link
              href="/builder"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors border border-neutral-700"
            >
              Try Visual Builder
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
