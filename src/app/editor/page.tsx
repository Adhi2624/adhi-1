"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import TemplatePicker from "@/components/template-picker";
import McpInfo from "@/components/mcp-info";
import type { ResumeTemplate } from "@/lib/templates";

const LaTeXEditor = dynamic(() => import("@/components/latex-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-neutral-950 text-neutral-500 text-sm">
      Loading editor...
    </div>
  ),
});

const PdfPreview = dynamic(() => import("@/components/pdf-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-neutral-950 text-neutral-500 text-sm">
      Loading preview...
    </div>
  ),
});

const DEFAULT_LATEX = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{hyperref}

\pagestyle{empty}
\titleformat{\section}{\large\bfseries\uppercase}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{10pt}{6pt}

\begin{document}

\begin{center}
  {\LARGE\bfseries Your Name} \\[4pt]
  City, State \textbar{} (555) 000-0000 \textbar{} your.email@example.com
\end{center}

\section{Experience}

\textbf{Job Title} \hfill \textit{Start -- End} \\
\textit{Company Name, Location}
\begin{itemize}[leftmargin=*, nosep]
  \item Accomplishment or responsibility
  \item Another key achievement
\end{itemize}

\section{Education}

\textbf{Degree} \hfill \textit{Year} \\
\textit{University Name}

\section{Skills}

Skill 1, Skill 2, Skill 3, Skill 4

\end{document}`;

function EditorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get("id");
  const templateId = searchParams.get("template");

  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [resumeName, setResumeName] = useState("Untitled Resume");
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (resumeId) {
      fetch(`/api/resumes/${resumeId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.latex) {
            setLatex(data.latex);
            setResumeName(data.name || "Untitled Resume");
            setLoadedId(data.id);
          }
        });
    } else if (templateId) {
      fetch("/api/templates")
        .then((r) => r.json())
        .then((templates: ResumeTemplate[]) => {
          const t = templates.find((t: ResumeTemplate) => t.id === templateId);
          if (t) {
            setLatex(t.content);
            setResumeName(`${t.name} Resume`);
          }
        });
    }
  }, [resumeId, templateId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (loadedId) {
        await fetch(`/api/resumes/${loadedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: resumeName, latex }),
        });
      } else {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: resumeName, latex }),
        });
        const data = await res.json();
        setLoadedId(data.id);
        router.replace(`/editor?id=${data.id}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [latex, resumeName, loadedId, router]);

  const handleTemplateSelect = useCallback((template: ResumeTemplate) => {
    setLatex(template.content);
    setResumeName(`${template.name} Resume`);
    setShowTemplates(false);
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setSplitRatio(
        Math.min(Math.max((e.clientX / window.innerWidth) * 100, 25), 75)
      );
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <input
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 -ml-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors border border-neutral-700"
          >
            Templates
          </button>
          {baseUrl && <McpInfo baseUrl={baseUrl} />}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              saved
                ? "bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            } disabled:opacity-50`}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div style={{ width: `${splitRatio}%` }} className="h-full">
          <div className="h-full flex flex-col">
            <div className="flex items-center px-4 py-1.5 border-b border-neutral-800 bg-neutral-900">
              <span className="text-xs font-medium text-neutral-400">
                main.tex
              </span>
              <span className="ml-2 text-xs text-neutral-600">
                Ctrl+S to save
              </span>
            </div>
            <div className="flex-1">
              <LaTeXEditor value={latex} onChange={setLatex} />
            </div>
          </div>
        </div>

        <div
          className="w-1 bg-neutral-800 hover:bg-blue-500 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        />

        <div style={{ width: `${100 - splitRatio}%` }} className="h-full">
          <PdfPreview latex={latex} />
        </div>
      </div>

      {showTemplates && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-500">
          Loading editor...
        </div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
