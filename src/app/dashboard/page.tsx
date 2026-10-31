"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { useAuth } from "@/components/auth-provider";

interface Resume {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then(setResumes)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Manage your resumes and create new ones
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/builder"
              className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
            >
              Visual Builder
            </Link>
            <Link
              href="/editor"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              New Resume
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Resumes", value: resumes.length },
            {
              label: "This Month",
              value: resumes.filter(
                (r) =>
                  new Date(r.createdAt).getMonth() === new Date().getMonth()
              ).length,
            },
            { label: "Templates Used", value: "3" },
            { label: "Plan", value: "Free" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
            >
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push("/builder")}
            className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3 group-hover:bg-violet-500/20 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-white">Visual Builder</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Fill in a form — no LaTeX needed
            </p>
          </button>
          <button
            onClick={() => router.push("/editor")}
            className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3 className="font-medium text-white">LaTeX Editor</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Write LaTeX with live PDF preview
            </p>
          </button>
        </div>

        {/* Resume list */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Resumes
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-neutral-900 animate-pulse"
                />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-neutral-800">
              <svg
                className="w-10 h-10 text-neutral-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-neutral-500 text-sm">No resumes yet</p>
              <p className="text-neutral-600 text-xs mt-1">
                Create one with the visual builder or LaTeX editor
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {resume.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Updated{" "}
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/editor?id=${resume.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-950/50 hover:bg-red-950 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
