"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <span className="text-base font-semibold text-white">
                Typeset
              </span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              Professional resumes with the precision of LaTeX and the
              simplicity your career deserves.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#templates"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Developers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/api/mcp"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  MCP API
                </Link>
              </li>
              <li>
                <Link
                  href="/#ai"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  AI Integration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Sign up
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            &copy; {year} Typeset. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
