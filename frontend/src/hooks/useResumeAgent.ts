'use client'

import { useState, useCallback } from 'react'
import type { ResumeOutput, AgentStep } from '@/types/resume'

interface RunAgentParams {
  githubUrl: string
  linkedinUrl: string
  jobUrl: string
  cachedLinkedin?: object | null
  cachedGithub?: string | null
}

const MOCK_OUTPUT: ResumeOutput = {
  latex: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Jane Developer}} \\\\[4pt]
  \\href{mailto:jane@example.com}{jane@example.com} \\quad
  \\href{https://github.com/janedev}{github.com/janedev} \\quad
  \\href{https://linkedin.com/in/janedev}{linkedin.com/in/janedev}
\\end{center}

\\section*{Summary}
Full-stack engineer with 5 years of experience building scalable web applications
using React, Next.js, TypeScript, and Python.

\\section*{Experience}
\\textbf{Senior Software Engineer} — Acme Corp \\hfill 2021--Present \\\\
\\begin{itemize}
  \\item Led migration of monolith to microservices, reducing deploy times by 60\\%
  \\item Built real-time dashboard used by 10k+ users
\\end{itemize}

\\section*{Education}
\\textbf{B.S. Computer Science} — State University \\hfill 2019

\\section*{Skills}
TypeScript, React, Next.js, Python, FastAPI, PostgreSQL, Docker, AWS

\\end{document}`,
  pdfUrl: undefined,
  markdown: `# Jane Developer

> Full-stack engineer passionate about building great user experiences.

## 🚀 About Me
- 🔭 Currently working on AI-powered developer tools
- 🌱 Learning Rust and WebAssembly
- 💬 Ask me about React, Next.js, TypeScript, Python

## 🛠️ Tech Stack
\`\`\`
Frontend:  React · Next.js · TypeScript · Tailwind CSS
Backend:   Python · FastAPI · Node.js
Database:  PostgreSQL · Redis · MongoDB
DevOps:    Docker · AWS · GitHub Actions
\`\`\`

## 📊 GitHub Stats
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=janedev&show_icons=true&theme=dark)

## 📫 How to reach me
- Email: jane@example.com
- LinkedIn: [linkedin.com/in/janedev](https://linkedin.com/in/janedev)
`,
  webpageHtml: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Jane Developer — Portfolio</title>
<style>
  body { font-family: system-ui,sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
  header { background: #1e293b; padding: 2rem; text-align: center; }
  h1 { margin: 0; font-size: 2.5rem; color: #60a5fa; }
  .subtitle { color: #94a3b8; margin-top: .5rem; }
  main { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
  section { margin-bottom: 2rem; }
  h2 { color: #60a5fa; border-bottom: 1px solid #334155; padding-bottom: .5rem; }
  .skills { display: flex; flex-wrap: wrap; gap: .5rem; }
  .pill { background: #1e40af; padding: .25rem .75rem; border-radius: 9999px; font-size: .875rem; }
</style>
</head>
<body>
<header>
  <h1>Jane Developer</h1>
  <p class="subtitle">Full-Stack Engineer · Open Source Contributor</p>
</header>
<main>
  <section>
    <h2>About</h2>
    <p>5+ years building scalable web applications. Passionate about developer experience and open source.</p>
  </section>
  <section>
    <h2>Skills</h2>
    <div class="skills">
      <span class="pill">TypeScript</span><span class="pill">React</span>
      <span class="pill">Next.js</span><span class="pill">Python</span>
      <span class="pill">FastAPI</span><span class="pill">PostgreSQL</span>
      <span class="pill">Docker</span><span class="pill">AWS</span>
    </div>
  </section>
  <section>
    <h2>Contact</h2>
    <p>Email: jane@example.com · GitHub: janedev · LinkedIn: janedev</p>
  </section>
</main>
</body>
</html>`,
  jobSuggestions: [
    {
      title: 'Senior Frontend Engineer',
      company: 'Stripe',
      matchPercent: 92,
      whyItFits: 'Strong match on React, TypeScript and system design experience',
      requiredSkills: ['React', 'TypeScript', 'GraphQL'],
      applyUrl: 'https://stripe.com/jobs',
    },
    {
      title: 'Full-Stack Engineer',
      company: 'Vercel',
      matchPercent: 88,
      whyItFits: 'Next.js expertise aligns perfectly with Vercel\'s product stack',
      requiredSkills: ['Next.js', 'Node.js', 'TypeScript'],
      applyUrl: 'https://vercel.com/careers',
    },
    {
      title: 'Software Engineer, Platform',
      company: 'GitHub',
      matchPercent: 75,
      whyItFits: 'Open source background and Python experience are a great fit',
      requiredSkills: ['Ruby', 'Go', 'Kubernetes'],
      applyUrl: 'https://github.com/careers',
    },
    {
      title: 'Backend Engineer',
      company: 'PlanetScale',
      matchPercent: 68,
      whyItFits: 'Database experience and API design skills transfer well',
      requiredSkills: ['Go', 'MySQL', 'Kubernetes'],
    },
    {
      title: 'AI Engineer',
      company: 'Anthropic',
      matchPercent: 55,
      whyItFits: 'Python skills are relevant; ML/AI experience would strengthen candidacy',
      requiredSkills: ['Python', 'PyTorch', 'CUDA'],
      applyUrl: 'https://anthropic.com/careers',
    },
  ],
  skillsMatch: [
    { skill: 'TypeScript', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'React', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'Next.js', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'Python', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'GraphQL', inProfile: false, requiredByJob: true, type: 'gap' },
    { skill: 'Kubernetes', inProfile: false, requiredByJob: true, type: 'gap' },
    { skill: 'Docker', inProfile: true, requiredByJob: false, type: 'bonus' },
    { skill: 'AWS', inProfile: true, requiredByJob: false, type: 'bonus' },
  ],
}

const MOCK_STEPS: AgentStep[] = [
  { id: '1', tool: 'brightdata_linkedin', status: 'done', message: 'Successfully scraped LinkedIn profile', timestamp: Date.now() },
  { id: '2', tool: 'composio_github', status: 'done', message: 'Read 12 GitHub repositories', timestamp: Date.now() + 2000 },
  { id: '3', tool: 'crewai_extract', status: 'done', message: 'Extracted skills, experience and education', timestamp: Date.now() + 4000 },
  { id: '4', tool: 'pydantic_validate', status: 'done', message: 'All data validated successfully', timestamp: Date.now() + 5000 },
  { id: '5', tool: 'latex_generate', status: 'done', message: 'LaTeX resume generated', timestamp: Date.now() + 7000 },
  { id: '6', tool: 'pdf_compile', status: 'done', message: 'PDF compiled successfully', timestamp: Date.now() + 9000 },
  { id: '7', tool: 'portfolio_generate', status: 'done', message: 'Portfolio page built', timestamp: Date.now() + 11000 },
  { id: '8', tool: 'job_search', status: 'done', message: 'Found 5 matching job opportunities', timestamp: Date.now() + 13000 },
]

export function useResumeAgent() {
  const [isRunning, setIsRunning] = useState(false)
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([])
  const [output, setOutput] = useState<ResumeOutput | null>(null)

  const run = useCallback(async (_params: RunAgentParams) => {
    setIsRunning(true)
    setAgentSteps([])
    setOutput(null)

    // Simulate agent steps with delays (mock mode — replace with real CopilotKit integration)
    for (let i = 0; i < MOCK_STEPS.length; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))
      setAgentSteps((prev) => [
        ...prev,
        { ...MOCK_STEPS[i], status: 'done', timestamp: Date.now() },
      ])
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 500))
    setOutput(MOCK_OUTPUT)
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setAgentSteps([])
    setOutput(null)
  }, [])

  return { run, isRunning, agentSteps, output, reset }
}
