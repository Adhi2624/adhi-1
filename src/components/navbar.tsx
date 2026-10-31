"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth-provider";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">
              Typeset
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/#features"
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors rounded-md"
            >
              Features
            </Link>
            <Link
              href="/#templates"
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors rounded-md"
            >
              Templates
            </Link>
            <Link
              href="/#pricing"
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors rounded-md"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-20 rounded-lg bg-neutral-800 animate-pulse" />
            ) : user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-neutral-800">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user.name[0].toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-neutral-500 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 text-neutral-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-neutral-800 py-3 space-y-1">
            <Link
              href="/#features"
              className="block px-3 py-2 text-sm text-neutral-300 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#templates"
              className="block px-3 py-2 text-sm text-neutral-300 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Templates
            </Link>
            <Link
              href="/#pricing"
              className="block px-3 py-2 text-sm text-neutral-300 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-2 border-t border-neutral-800 mt-2 space-y-1">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-sm text-neutral-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-sm text-amber-400"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-neutral-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-sm text-neutral-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-sm font-medium text-blue-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
