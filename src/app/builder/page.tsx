"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

interface Experience {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

interface Education {
  degree: string;
  school: string;
  year: string;
  gpa: string;
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}~^]/g, (m) => `\\${m}`)
    .replace(/\textbackslash\{\}/g, "\\textbackslash{}");
}

function generateLatex(data: {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  template: string;
}): string {
  const esc = escapeLatex;

  const expSections = data.experience
    .filter((e) => e.title)
    .map(
      (e) =>
        `\\textbf{${esc(e.title)}} \\hfill \\textit{${esc(e.start)}${e.end ? ` -- ${esc(e.end)}` : " -- Present"}} \\\\
\\textit{${esc(e.company)}${e.location ? `, ${esc(e.location)}` : ""}}
\\begin{itemize}[leftmargin=*, nosep]
${e.bullets
  .filter((b) => b.trim())
  .map((b) => `  \\item ${esc(b)}`)
  .join("\n")}
\\end{itemize}`
    )
    .join("\n\n\\vspace{4pt}\n");

  const eduSections = data.education
    .filter((e) => e.degree)
    .map(
      (e) =>
        `\\textbf{${esc(e.degree)}} \\hfill \\textit{${esc(e.year)}} \\\\
\\textit{${esc(e.school)}}${e.gpa ? ` \\hfill GPA: ${esc(e.gpa)}` : ""}`
    )
    .join("\n\n");

  const contactParts = [
    data.location,
    data.phone,
    data.email,
  ].filter(Boolean);

  const linkParts = [
    data.linkedin
      ? `\\href{https://${data.linkedin}}{${esc(data.linkedin)}}`
      : "",
    data.github
      ? `\\href{https://${data.github}}{${esc(data.github)}}`
      : "",
  ].filter(Boolean);

  if (data.template === "modern") {
    return String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=0.7in]{geometry}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{hyperref}

\definecolor{accent}{HTML}{2563EB}
\pagestyle{empty}
\titleformat{\section}{\color{accent}\large\bfseries}{}{0em}{}[\color{accent}\titlerule]
\titlespacing{\section}{0pt}{12pt}{6pt}
\hypersetup{colorlinks=true, urlcolor=accent}

\begin{document}

\begin{center}
  {\Huge\bfseries\color{accent} ${esc(data.name)}} \\[6pt]
  {\small ${contactParts.map(esc).join(" \\quad ")}${linkParts.length ? " \\\\\n    " + linkParts.join(" \\quad ") : ""}}
\end{center}

${data.summary ? `\\section{About Me}\n${esc(data.summary)}` : ""}

${expSections ? `\\section{Experience}\n\n${expSections}` : ""}

${eduSections ? `\\section{Education}\n\n${eduSections}` : ""}

${data.skills ? `\\section{Technical Skills}\n\n${esc(data.skills)}` : ""}

\\end{document}`;
  }

  if (data.template === "minimal") {
    return String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}

\pagestyle{empty}
\setlength{\parindent}{0pt}

\newcommand{\sectitle}[1]{%
  \vspace{12pt}{\large\bfseries #1}\vspace{2pt}\hrule\vspace{6pt}%
}

\begin{document}

{\LARGE\bfseries ${esc(data.name)}} \\[4pt]
${contactParts.map(esc).join(" \\textbar{} ")}${linkParts.length ? " \\\\\n" + linkParts.join(" \\textbar{} ") : ""}

${data.summary ? `\\sectitle{Summary}\n${esc(data.summary)}` : ""}

${expSections ? `\\sectitle{Experience}\n\n${expSections}` : ""}

${eduSections ? `\\sectitle{Education}\n\n${eduSections}` : ""}

${data.skills ? `\\sectitle{Skills}\n\n${esc(data.skills)}` : ""}

\\end{document}`;
  }

  return String.raw`\documentclass[11pt,a4paper]{article}
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
  {\LARGE\bfseries ${esc(data.name)}} \\[4pt]
  ${contactParts.map(esc).join(" \\textbar{} ")}${linkParts.length ? " \\\\\n  " + linkParts.join(" \\textbar{} ") : ""}
\end{center}

${data.summary ? `\\section{Summary}\n${esc(data.summary)}` : ""}

${expSections ? `\\section{Experience}\n\n${expSections}` : ""}

${eduSections ? `\\section{Education}\n\n${eduSections}` : ""}

${data.skills ? `\\section{Skills}\n\n${esc(data.skills)}` : ""}

\\end{document}`;
}

export default function BuilderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [template, setTemplate] = useState("classic");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");

  const [experience, setExperience] = useState<Experience[]>([
    { title: "", company: "", location: "", start: "", end: "", bullets: ["", ""] },
  ]);

  const [education, setEducation] = useState<Education[]>([
    { degree: "", school: "", year: "", gpa: "" },
  ]);

  const addExperience = () =>
    setExperience([
      ...experience,
      { title: "", company: "", location: "", start: "", end: "", bullets: ["", ""] },
    ]);

  const addEducation = () =>
    setEducation([...education, { degree: "", school: "", year: "", gpa: "" }]);

  const updateExp = (idx: number, field: keyof Experience, value: string | string[]) => {
    const updated = [...experience];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[idx] as any)[field] = value;
    setExperience(updated);
  };

  const updateEdu = (idx: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[idx][field] = value;
    setEducation(updated);
  };

  const handleGenerate = useCallback(async () => {
    const latex = generateLatex({
      name,
      email,
      phone,
      location,
      linkedin,
      github,
      summary,
      experience,
      education,
      skills,
      template,
    });

    setSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${name || "My"} Resume`, latex }),
      });
      const data = await res.json();
      router.push(`/editor?id=${data.id}`);
    } finally {
      setSaving(false);
    }
  }, [name, email, phone, location, linkedin, github, summary, experience, education, skills, template, router]);

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors";

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Visual Resume Builder</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Fill in your details — we&#39;ll generate professional LaTeX for you
          </p>
        </div>

        <div className="space-y-8">
          {/* Template */}
          <section>
            <h2 className="text-sm font-medium text-neutral-300 mb-3">Template Style</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "classic", label: "Classic", color: "blue" },
                { id: "modern", label: "Modern", color: "violet" },
                { id: "minimal", label: "Minimal", color: "emerald" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    template === t.id
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* Personal */}
          <section>
            <h2 className="text-sm font-medium text-neutral-300 mb-3">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={inputClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={inputClass} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className={inputClass} placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} />
              <input className={inputClass} placeholder="linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              <input className={inputClass} placeholder="github.com/..." value={github} onChange={(e) => setGithub(e.target.value)} />
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="text-sm font-medium text-neutral-300 mb-3">
              Professional Summary <span className="text-neutral-600">(optional)</span>
            </h2>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="Brief overview of your experience and strengths..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </section>

          {/* Experience */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-neutral-300">Experience</h2>
              <button
                onClick={addExperience}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Add Position
              </button>
            </div>
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Position {i + 1}</span>
                    {experience.length > 1 && (
                      <button
                        onClick={() => setExperience(experience.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="Job Title" value={exp.title} onChange={(e) => updateExp(i, "title", e.target.value)} />
                    <input className={inputClass} placeholder="Company" value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} />
                    <input className={inputClass} placeholder="Location" value={exp.location} onChange={(e) => updateExp(i, "location", e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} placeholder="Start" value={exp.start} onChange={(e) => updateExp(i, "start", e.target.value)} />
                      <input className={inputClass} placeholder="End (or empty)" value={exp.end} onChange={(e) => updateExp(i, "end", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1.5 block">Key achievements (one per line)</label>
                    {exp.bullets.map((bullet, j) => (
                      <div key={j} className="flex gap-2 mb-2">
                        <input
                          className={inputClass}
                          placeholder={`Achievement ${j + 1}`}
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...exp.bullets];
                            newBullets[j] = e.target.value;
                            updateExp(i, "bullets", newBullets);
                          }}
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            onClick={() => {
                              const newBullets = exp.bullets.filter((_, k) => k !== j);
                              updateExp(i, "bullets", newBullets);
                            }}
                            className="text-neutral-600 hover:text-red-400 shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateExp(i, "bullets", [...exp.bullets, ""])}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-neutral-300">Education</h2>
              <button onClick={addEducation} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + Add Education
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Education {i + 1}</span>
                    {education.length > 1 && (
                      <button onClick={() => setEducation(education.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-300">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="Degree (e.g., B.S. Computer Science)" value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} />
                    <input className={inputClass} placeholder="School" value={edu.school} onChange={(e) => updateEdu(i, "school", e.target.value)} />
                    <input className={inputClass} placeholder="Year (e.g., 2019 -- 2023)" value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} />
                    <input className={inputClass} placeholder="GPA (optional)" value={edu.gpa} onChange={(e) => updateEdu(i, "gpa", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-sm font-medium text-neutral-300 mb-3">Skills</h2>
            <textarea
              className={`${inputClass} min-h-[60px] resize-y`}
              placeholder="e.g., JavaScript, React, Node.js, Python, SQL, Docker, AWS"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </section>

          {/* Generate */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleGenerate}
              disabled={saving || !name}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Generating..." : "Generate Resume & Open Editor"}
            </button>
          </div>
          <p className="text-xs text-neutral-600 text-center">
            Your details are converted to LaTeX and opened in the editor where you can preview the PDF and make further edits.
          </p>
        </div>
      </main>
    </div>
  );
}
