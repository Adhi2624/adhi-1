"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PdfPreviewProps {
  latex: string;
}

type CompileStatus = "idle" | "loading" | "ready" | "error";

export default function PdfPreview({ latex }: PdfPreviewProps) {
  const [status, setStatus] = useState<CompileStatus>("idle");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const engineRef = useRef<unknown>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEngine() {
      try {
        // @ts-expect-error - swiftlatex loaded via CDN
        const PdfTeXEngine = window.PdfTeXEngine;
        if (!PdfTeXEngine) {
          setError(
            "LaTeX engine not loaded. Ensure SwiftLaTeX script is included."
          );
          return;
        }
        const engine = new PdfTeXEngine();
        await engine.loadEngine();
        if (!cancelled) {
          engineRef.current = engine;
          setEngineReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(`Failed to load LaTeX engine: ${e}`);
        }
      }
    }

    loadEngine();
    return () => {
      cancelled = true;
    };
  }, []);

  const compile = useCallback(
    async (source: string) => {
      if (!engineReady || !engineRef.current) return;

      setStatus("loading");
      setError(null);

      try {
        const engine = engineRef.current as {
          writeMemFSFile: (name: string, content: string) => void;
          setEngineMainFile: (name: string) => void;
          compileLaTeX: () => Promise<{
            pdf: ArrayBuffer | undefined;
            status: number;
            log: string;
          }>;
        };

        engine.writeMemFSFile("main.tex", source);
        engine.setEngineMainFile("main.tex");
        const result = await engine.compileLaTeX();

        if (result.pdf && result.pdf.byteLength > 0) {
          if (pdfUrl) URL.revokeObjectURL(pdfUrl);
          const blob = new Blob([result.pdf], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setStatus("ready");
        } else {
          const logLines = result.log.split("\n");
          const errorLines = logLines
            .filter((l: string) => l.startsWith("!") || l.includes("Error"))
            .slice(0, 5);
          setError(
            errorLines.length > 0
              ? errorLines.join("\n")
              : "Compilation failed. Check your LaTeX syntax."
          );
          setStatus("error");
        }
      } catch (e) {
        setError(`Compilation error: ${e}`);
        setStatus("error");
      }
    },
    [engineReady, pdfUrl]
  );

  useEffect(() => {
    if (!engineReady || !latex.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => compile(latex), 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [latex, engineReady, compile]);

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900">
        <span className="text-sm font-medium text-neutral-300">
          PDF Preview
        </span>
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <span className="text-xs text-blue-400 flex items-center gap-1.5">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Compiling...
            </span>
          )}
          {status === "ready" && (
            <span className="text-xs text-green-400">Compiled</span>
          )}
          {status === "error" && (
            <span className="text-xs text-red-400">Error</span>
          )}
          {!engineReady && (
            <span className="text-xs text-yellow-400">
              Loading LaTeX engine...
            </span>
          )}
          <button
            onClick={() => compile(latex)}
            disabled={!engineReady || status === "loading"}
            className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            Compile
          </button>
          {pdfUrl && (
            <a
              href={pdfUrl}
              download="resume.pdf"
              className="text-xs px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
            >
              Download PDF
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {error && (
          <div className="m-4 p-3 rounded bg-red-950 border border-red-800 text-red-300 text-xs font-mono whitespace-pre-wrap">
            {error}
          </div>
        )}

        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
            {engineReady
              ? "Type LaTeX in the editor to see a live preview"
              : "Initializing LaTeX compiler..."}
          </div>
        )}
      </div>
    </div>
  );
}
