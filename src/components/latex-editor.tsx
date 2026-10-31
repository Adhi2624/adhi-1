"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor";

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LaTeXEditor({ value, onChange }: LaTeXEditorProps) {
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(
    null
  );

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.register({ id: "latex" });
    monaco.languages.setMonarchTokensProvider("latex", {
      tokenizer: {
        root: [
          [/\\[a-zA-Z@]+/, "keyword"],
          [/\{/, "delimiter.curly"],
          [/\}/, "delimiter.curly"],
          [/\[/, "delimiter.square"],
          [/\]/, "delimiter.square"],
          [/%.*$/, "comment"],
          [/\$\$?/, "string"],
          [/\\\\/, "keyword"],
          [/&/, "operator"],
        ],
      },
    });

    monaco.editor.defineTheme("latex-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "string", foreground: "ce9178" },
        { token: "delimiter.curly", foreground: "ffd700" },
        { token: "delimiter.square", foreground: "da70d6" },
        { token: "operator", foreground: "d4d4d4" },
      ],
      colors: {
        "editor.background": "#0a0a0a",
      },
    });

    monaco.editor.setTheme("latex-dark");

    const defaultCompletions = [
      "\\begin{",
      "\\end{",
      "\\section{",
      "\\subsection{",
      "\\textbf{",
      "\\textit{",
      "\\href{",
      "\\item",
      "\\hfill",
      "\\vspace{",
      "\\documentclass",
      "\\usepackage",
      "\\begin{itemize}",
      "\\begin{enumerate}",
      "\\begin{document}",
      "\\end{document}",
    ];

    monaco.languages.registerCompletionItemProvider("latex", {
      triggerCharacters: ["\\"],
      provideCompletionItems: (
        model: monacoType.editor.ITextModel,
        position: monacoType.Position
      ) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn - 1,
          endColumn: word.endColumn,
        };
        return {
          suggestions: defaultCompletions.map((cmd) => ({
            label: cmd,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: cmd,
            range,
          })),
        };
      },
    });
  }, []);

  return (
    <Editor
      height="100%"
      language="latex"
      theme="latex-dark"
      value={value}
      onChange={(v) => onChange(v || "")}
      onMount={handleMount}
      options={{
        fontSize: 14,
        lineHeight: 22,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        tabSize: 2,
      }}
    />
  );
}
