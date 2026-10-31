"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function Home() {
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [showTemplates, setShowTemplates] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleTemplateSelect = useCallback((template: ResumeTemplate) => {
    setLatex(template.content);
    setShowTemplates(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const ratio = (e.clientX / window.innerWidth) * 100;
      setSplitRatio(Math.min(Math.max(ratio, 25), 75));
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold tracking-tight">
            <span className="text-blue-400">LaTeX</span> Resume Editor
          </h1>
          <span className="text-xs text-neutral-500 hidden sm:inline">
            Write LaTeX, preview PDF in real time
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-300 hover:text-white transition-colors border border-neutral-700"
          >
            Templates
          </button>
          {baseUrl && <McpInfo baseUrl={baseUrl} />}
        </div>
      </header>

      {/* Editor + Preview split */}
      <div className="flex-1 flex overflow-hidden">
        <div style={{ width: `${splitRatio}%` }} className="h-full">
          <div className="h-full flex flex-col">
            <div className="flex items-center px-4 py-1.5 border-b border-neutral-800 bg-neutral-900">
              <span className="text-xs font-medium text-neutral-400">
                main.tex
              </span>
            </div>
            <div className="flex-1">
              <LaTeXEditor value={latex} onChange={setLatex} />
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-neutral-800 hover:bg-blue-500 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        />

        <div style={{ width: `${100 - splitRatio}%` }} className="h-full">
          <PdfPreview latex={latex} />
        </div>
      </div>

      {/* Template picker modal */}
      {showTemplates && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
