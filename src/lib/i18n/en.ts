const en = {
  // Brand
  brand: {
    name: "Typeset",
    tagline: "Beautiful Resumes, Effortlessly",
    description:
      "Create professional LaTeX resumes with a visual builder, code editor, or AI agents via MCP. Free to use, deploy on Vercel.",
    copyright: "Typeset. All rights reserved.",
  },

  // Navigation
  nav: {
    features: "Features",
    templates: "Templates",
    pricing: "Pricing",
    login: "Log in",
    signup: "Sign up",
    dashboard: "Dashboard",
    admin: "Admin",
    logout: "Log out",
  },

  // Landing page
  landing: {
    badge: "Now with AI agent support via MCP",
    heroTitle1: "Resumes that",
    heroTitle2: " stand out.",
    heroTitle3: "Built with precision.",
    heroSubtitle:
      "Whether you write LaTeX or have never heard of it — Typeset gives you beautifully typeset resumes in minutes. Use our visual builder, code it yourself, or let AI do it for you.",
    ctaPrimary: "Start Building — Free",
    ctaSecondary: "Try Visual Builder",
    ctaNote: "No credit card required. Free plan includes 3 resumes.",
    ctaBottom: "Get Started — It's Free",
    ctaBottomSubtitle:
      "Join thousands of professionals who trust Typeset for their career documents.",
    readyTitle: "Ready to build your resume?",
  },

  // Features
  features: {
    sectionTitle: "Two ways to build. One beautiful result.",
    sectionSubtitle:
      "Power users get a LaTeX editor. Everyone else gets a visual builder. Both produce the same stunning output.",
    latexEditor: "LaTeX Editor",
    latexEditorDesc:
      "Full-featured Monaco editor with syntax highlighting, auto-completion, and bracket matching. For those who want pixel-perfect control.",
    visualBuilder: "Visual Builder",
    visualBuilderDesc:
      "No LaTeX knowledge needed. Fill in a form with your details, pick a template, and get a professionally typeset resume instantly.",
    aiPowered: "AI-Powered via MCP",
    aiPoweredDesc:
      "Connect your AI agents through the Model Context Protocol. Let Claude, GPT, or any MCP-compatible agent build your resume for you.",
    livePdf: "Live PDF Preview",
    livePdfDesc:
      "See your resume compile in real time as you type. Client-side LaTeX engine means zero server costs and instant feedback.",
  },

  // How it works
  steps: {
    sectionTitle: "Three steps to your next opportunity",
    step1Title: "Choose Your Path",
    step1Desc:
      "Use the visual builder for a guided experience, or dive into the LaTeX editor for full control.",
    step2Title: "Craft Your Resume",
    step2Desc:
      "Fill in your details, pick a template, customize the design. Or let an AI agent do it for you via MCP.",
    step3Title: "Download & Share",
    step3Desc:
      "Get a beautifully typeset PDF ready for applications. Update it anytime from your dashboard.",
  },

  // Templates
  templates: {
    sectionTitle: "Templates for every style",
    sectionSubtitle:
      "Start with a professionally designed template and make it yours.",
    classic: "Classic",
    classicDesc: "Traditional single-column layout. Clean, proven, ATS-friendly.",
    modern: "Modern",
    modernDesc:
      "Contemporary design with accent colors and icons. Stands out on screen.",
    minimal: "Minimal",
    minimalDesc: "Ultra-clean with generous whitespace. Lets your content speak.",
  },

  // AI / MCP section
  ai: {
    badge: "For Developers",
    title: "Let AI agents build resumes for your users",
    subtitle:
      "Typeset exposes a full MCP server. Connect Claude, GPT, or any MCP-compatible AI agent. They can browse templates, create resumes, update content, and return editor links — all programmatically.",
    features: [
      "8 MCP tools for full resume CRUD",
      "Streamable HTTP transport",
      "Works with Claude Desktop & Claude Code",
      "REST API also available",
    ],
  },

  // Pricing
  pricing: {
    sectionTitle: "Simple, transparent pricing",
    sectionSubtitle: "Start free. Upgrade when you need more.",
    popular: "Popular",
    free: "Free",
    freePrice: "$0",
    freePeriod: "forever",
    freeDesc: "Get started with the essentials",
    freeFeatures: [
      "3 resumes",
      "All templates",
      "Visual builder",
      "LaTeX editor",
      "PDF export",
    ],
    freeCta: "Start Free",
    pro: "Pro",
    proPrice: "$9",
    proPeriod: "/month",
    proDesc: "For serious job seekers",
    proFeatures: [
      "Unlimited resumes",
      "Priority PDF compilation",
      "Custom templates",
      "Version history",
      "MCP API access",
      "Priority support",
    ],
    proCta: "Go Pro",
    team: "Team",
    teamPrice: "$29",
    teamPeriod: "/month",
    teamDesc: "For career services & teams",
    teamFeatures: [
      "Everything in Pro",
      "Admin panel",
      "Team collaboration",
      "Usage analytics",
      "Custom branding",
      "SSO integration",
    ],
    teamCta: "Contact Us",
  },

  // Auth
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your Typeset account",
    registerTitle: "Create your account",
    registerSubtitle: "Start building beautiful resumes",
    email: "Email",
    password: "Password",
    name: "Full name",
    loginButton: "Sign in",
    registerButton: "Create account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signUp: "Sign up",
    signIn: "Sign in",
    demoCredentials: "Demo admin credentials",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    myResumes: "My Resumes",
    totalResumes: "Total Resumes",
    recentlyEdited: "Recently Edited",
    quickActions: "Quick Actions",
    newResume: "New Resume",
    visualBuilder: "Visual Builder",
    latexEditor: "LaTeX Editor",
    edit: "Edit",
    delete: "Delete",
    noResumes: "No resumes yet. Create your first one!",
    confirmDelete: "Are you sure you want to delete this resume?",
  },

  // Editor
  editor: {
    untitled: "Untitled Resume",
    save: "Save",
    saving: "Saving...",
    saved: "Saved",
    compile: "Compile",
    download: "Download PDF",
    template: "Template",
    editorTab: "Editor",
    previewTab: "Preview",
  },

  // Builder
  builder: {
    title: "Resume Builder",
    subtitle: "Fill in your details and we'll generate a beautiful LaTeX resume",
    personalInfo: "Personal Information",
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    addExperience: "Add Experience",
    addEducation: "Add Education",
    addBullet: "Add Bullet Point",
    removeBullet: "Remove",
    generate: "Generate Resume",
    chooseTemplate: "Choose a Template",
  },

  // Admin
  admin: {
    title: "Admin Panel",
    overview: "Overview",
    users: "Users",
    totalUsers: "Total Users",
    totalResumes: "Total Resumes",
    admins: "Admins",
    recentSignups: "Recent Sign-ups",
    mcpStatus: "MCP Server",
    mcpActive: "Active",
    manageUsers: "Manage Users",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",
    deleteUser: "Delete User",
    noUsers: "No users found.",
  },

  // MCP Info
  mcp: {
    title: "MCP Connection",
    description:
      "Connect your AI agent to Typeset using the Model Context Protocol.",
    endpoint: "Endpoint",
    transport: "Transport",
    authHeader: "Authentication",
    authDesc: "Include your API key in the Authorization header",
    tools: "Available Tools",
  },

  // Footer
  footer: {
    product: "Product",
    developers: "Developers",
    account: "Account",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    mcpApi: "MCP API",
    aiIntegration: "AI Integration",
  },

  // Legal
  legal: {
    termsTitle: "Terms of Service",
    privacyTitle: "Privacy Policy",
    lastUpdated: "Last updated",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    close: "Close",
  },

  // Errors
  errors: {
    unauthorized: "Unauthorized",
    notFound: "Not found",
    invalidCredentials: "Invalid email or password",
    emailTaken: "Email already registered",
    invalidInput: "Invalid input",
    serverError: "Internal server error",
    mcpAuthRequired: "MCP authentication required. Include a Bearer token in the Authorization header.",
    mcpAuthInvalid: "Invalid MCP API key.",
  },
} as const;

export type I18nKeys = typeof en;
export default en;
