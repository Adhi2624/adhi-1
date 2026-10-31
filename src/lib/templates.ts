export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const templates: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional single-column resume layout",
    content: String.raw`\documentclass[11pt,a4paper]{article}
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
  {\LARGE\bfseries John Doe} \\[4pt]
  San Francisco, CA \textbar{} (555) 123-4567 \textbar{} john.doe@email.com \\
  \href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe} \textbar{}
  \href{https://github.com/johndoe}{github.com/johndoe}
\end{center}

\section{Summary}
Experienced software engineer with 5+ years of expertise in full-stack development,
specializing in React, Node.js, and cloud infrastructure. Passionate about building
scalable applications and mentoring junior developers.

\section{Experience}

\textbf{Senior Software Engineer} \hfill \textit{Jan 2022 -- Present} \\
\textit{Tech Corp, San Francisco, CA}
\begin{itemize}[leftmargin=*, nosep]
  \item Led migration of monolithic application to microservices, reducing deploy time by 70\%
  \item Designed and implemented real-time notification system serving 1M+ daily active users
  \item Mentored team of 4 junior engineers through code reviews and pair programming sessions
\end{itemize}

\vspace{4pt}
\textbf{Software Engineer} \hfill \textit{Jun 2019 -- Dec 2021} \\
\textit{StartupXYZ, San Francisco, CA}
\begin{itemize}[leftmargin=*, nosep]
  \item Built customer-facing dashboard using React and TypeScript, improving user engagement by 40\%
  \item Implemented CI/CD pipeline with GitHub Actions, reducing release cycle from 2 weeks to 2 days
  \item Optimized PostgreSQL queries resulting in 3x improvement in API response times
\end{itemize}

\section{Education}

\textbf{Bachelor of Science in Computer Science} \hfill \textit{2015 -- 2019} \\
\textit{University of California, Berkeley} \hfill GPA: 3.8/4.0

\section{Skills}

\textbf{Languages:} TypeScript, JavaScript, Python, Go, SQL \\
\textbf{Frameworks:} React, Next.js, Node.js, Express, FastAPI \\
\textbf{Tools:} Docker, Kubernetes, AWS, GCP, PostgreSQL, Redis, Git

\section{Projects}

\textbf{Open Source Contribution -- React Query} \\
Contributed performance optimization patches reducing bundle size by 15\%.

\end{document}`,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean modern layout with accent colors",
    content: String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=0.7in]{geometry}
\usepackage{xcolor}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{hyperref}
\usepackage{fontawesome5}

\definecolor{accent}{HTML}{2563EB}
\pagestyle{empty}

\titleformat{\section}{\color{accent}\large\bfseries}{}{0em}{}[\color{accent}\titlerule]
\titlespacing{\section}{0pt}{12pt}{6pt}

\hypersetup{colorlinks=true, urlcolor=accent}

\begin{document}

\begin{center}
  {\Huge\bfseries\color{accent} Jane Smith} \\[6pt]
  {\small
    \faMapMarker*~New York, NY \quad
    \faPhone*~(555) 987-6543 \quad
    \faEnvelope~jane.smith@email.com \\[2pt]
    \faLinkedin~\href{https://linkedin.com/in/janesmith}{janesmith} \quad
    \faGithub~\href{https://github.com/janesmith}{janesmith} \quad
    \faGlobe~\href{https://janesmith.dev}{janesmith.dev}
  }
\end{center}

\section{About Me}
Full-stack developer with a passion for clean architecture and user experience.
6 years of experience building web applications at scale with modern JavaScript
frameworks and cloud-native technologies.

\section{Experience}

\textbf{\color{accent}Lead Frontend Engineer} \hfill \textbf{Mar 2023 -- Present} \\
\textit{DesignTech Inc., New York, NY}
\begin{itemize}[leftmargin=*, nosep, topsep=3pt]
  \item Architected component library used across 12 product teams, ensuring design consistency
  \item Reduced page load times by 60\% through code splitting and lazy loading strategies
  \item Introduced automated visual regression testing, catching 95\% of UI bugs before production
\end{itemize}

\vspace{6pt}
\textbf{\color{accent}Frontend Engineer} \hfill \textbf{Jul 2020 -- Feb 2023} \\
\textit{WebScale Solutions, New York, NY}
\begin{itemize}[leftmargin=*, nosep, topsep=3pt]
  \item Developed real-time collaborative editing feature using WebSockets and CRDTs
  \item Built accessible UI components following WCAG 2.1 AA standards
  \item Improved test coverage from 45\% to 92\% across the frontend codebase
\end{itemize}

\vspace{6pt}
\textbf{\color{accent}Junior Developer} \hfill \textbf{Jun 2018 -- Jun 2020} \\
\textit{Digital Agency Co., Boston, MA}
\begin{itemize}[leftmargin=*, nosep, topsep=3pt]
  \item Built responsive websites for 20+ clients using React and Vue.js
  \item Implemented SEO optimizations resulting in 150\% increase in organic traffic
\end{itemize}

\section{Education}

\textbf{M.S. Computer Science} \hfill \textit{2016 -- 2018} \\
Columbia University, New York, NY

\textbf{B.S. Computer Science} \hfill \textit{2012 -- 2016} \\
Boston University, Boston, MA

\section{Technical Skills}

\textbf{Frontend:} React, Next.js, Vue.js, TypeScript, Tailwind CSS, Storybook \\
\textbf{Backend:} Node.js, Python, GraphQL, REST APIs, PostgreSQL, MongoDB \\
\textbf{DevOps:} Docker, AWS (Lambda, S3, CloudFront), Vercel, GitHub Actions \\
\textbf{Testing:} Jest, Cypress, Playwright, React Testing Library

\end{document}`,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean minimalist design",
    content: String.raw`\documentclass[11pt,a4paper]{article}
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

{\LARGE\bfseries Alex Johnson} \\[4pt]
alex@example.com \textbar{} (555) 000-1234 \textbar{} Chicago, IL \\
\href{https://github.com/alexj}{github.com/alexj}

\sectitle{Experience}

\textbf{Software Engineer} at \textbf{CloudCo} \hfill 2021 -- Present
\begin{itemize}[leftmargin=1.5em, nosep]
  \item Built event-driven data pipeline processing 10M+ events daily
  \item Reduced infrastructure costs by 35\% through resource optimization
\end{itemize}

\vspace{4pt}
\textbf{Backend Developer} at \textbf{DataFlow} \hfill 2019 -- 2021
\begin{itemize}[leftmargin=1.5em, nosep]
  \item Designed RESTful APIs serving 500+ enterprise clients
  \item Implemented rate limiting and caching layers for high-availability services
\end{itemize}

\sectitle{Education}

\textbf{B.S. Computer Science}, University of Illinois \hfill 2015 -- 2019

\sectitle{Skills}

Go, Python, TypeScript, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS, Terraform

\end{document}`,
  },
];

export function getTemplate(id: string): ResumeTemplate | undefined {
  return templates.find((t) => t.id === id);
}
