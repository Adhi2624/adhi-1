"use client";

import { templates, ResumeTemplate } from "@/lib/templates";

interface TemplatePickerProps {
  onSelect: (template: ResumeTemplate) => void;
  onClose: () => void;
}

export default function TemplatePicker({
  onSelect,
  onClose,
}: TemplatePickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">
            Choose a Template
          </h2>
          <button
            onClick={onClose}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 grid gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="text-left p-4 rounded-lg border border-neutral-700 hover:border-blue-500 hover:bg-neutral-800/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {template.description}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400 font-mono">
                  {template.id}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">
            Templates provide a starting point — you can customize everything in
            the editor.
          </p>
        </div>
      </div>
    </div>
  );
}
