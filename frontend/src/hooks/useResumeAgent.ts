'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ResumeOutput, AgentStep } from '@/types/resume'

export type ConversationState =
  | 'greeting'
  | 'waiting_github'
  | 'waiting_linkedin'
  | 'waiting_job'
  | 'generating'
  | 'done'
  | 'error'

export type ChatMessage = {
  id: string
  role: 'user' | 'bot'
  type: 'text' | 'progress' | 'output' | 'typing'
  content?: string
  steps?: AgentStep[]
  isRunning?: boolean
  output?: ResumeOutput
  timestamp: number
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
      whyItFits: "Next.js expertise aligns perfectly with Vercel's product stack",
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

const MOCK_STEP_DEFS = [
  { tool: 'brightdata_linkedin', message: 'Successfully scraped LinkedIn profile' },
  { tool: 'composio_github', message: 'Read 12 GitHub repositories' },
  { tool: 'crewai_extract', message: 'Extracted skills, experience and education' },
  { tool: 'pydantic_validate', message: 'All data validated successfully' },
  { tool: 'latex_generate', message: 'LaTeX resume generated' },
  { tool: 'pdf_compile', message: 'PDF compiled successfully' },
  { tool: 'portfolio_generate', message: 'Portfolio page built' },
  { tool: 'job_search', message: 'Found 5 matching job opportunities' },
  { tool: 'keyword_hitl', message: 'Keywords confirmed' },
]

let _msgCounter = 0
function nextId() {
  return `msg-${++_msgCounter}-${Date.now()}`
}

function botText(content: string): ChatMessage {
  return { id: nextId(), role: 'bot', type: 'text', content, timestamp: Date.now() }
}

function isGithubUrl(url: string) {
  return /^https?:\/\/(www\.)?github\.com\/.+/i.test(url.trim())
}

function isLinkedinUrl(url: string) {
  return /^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(url.trim())
}

function isUrl(url: string) {
  try {
    new URL(url.trim())
    return true
  } catch {
    return false
  }
}

export function useResumeAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationState, setConversationState] = useState<ConversationState>('greeting')
  const [isTyping, setIsTyping] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // Greeting on mount
  useEffect(() => {
    const greeting: ChatMessage = {
      id: nextId(),
      role: 'bot',
      type: 'text',
      content:
        "👋 Hi! I'm Barack Ollama. I'll generate a tailored resume for you.\nLet's start — what's your GitHub profile URL?",
      timestamp: Date.now(),
    }
    setMessages([greeting])
    setConversationState('waiting_github')
  }, [])

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const runAgent = useCallback(
    async (github: string, linkedin: string, job: string) => {
      setConversationState('generating')

      // Show "Starting generation..." text bubble
      const startMsg = botText('Great! Starting resume generation now…')
      addMessage(startMsg)

      await new Promise<void>((r) => setTimeout(r, 600))

      // Add a progress bubble
      const progressId = nextId()
      const progressMsg: ChatMessage = {
        id: progressId,
        role: 'bot',
        type: 'progress',
        steps: [],
        isRunning: true,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, progressMsg])

      // Simulate steps
      const accSteps: AgentStep[] = []
      for (let i = 0; i < MOCK_STEP_DEFS.length; i++) {
        await new Promise<void>((r) => setTimeout(r, 800))
        accSteps.push({
          id: String(i + 1),
          tool: MOCK_STEP_DEFS[i].tool,
          status: 'done',
          message: MOCK_STEP_DEFS[i].message,
          timestamp: Date.now(),
        })
        const updatedSteps = [...accSteps]
        setMessages((prev) =>
          prev.map((m) =>
            m.id === progressId ? { ...m, steps: updatedSteps } : m,
          ),
        )
      }

      // Mark progress bubble complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === progressId ? { ...m, isRunning: false } : m,
        ),
      )

      await new Promise<void>((r) => setTimeout(r, 500))

      // Add output bubble
      const outputMsg: ChatMessage = {
        id: nextId(),
        role: 'bot',
        type: 'output',
        output: MOCK_OUTPUT,
        timestamp: Date.now(),
      }
      addMessage(outputMsg)
      setConversationState('done')

      // suppress unused var warnings — these would be used in real API calls
      void github
      void linkedin
      void job
    },
    [addMessage],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        type: 'text',
        content: text.trim(),
        timestamp: Date.now(),
      }
      addMessage(userMsg)

      if (conversationState === 'waiting_github') {
        if (!isGithubUrl(text)) {
          setIsTyping(true)
          await new Promise<void>((r) => setTimeout(r, 600))
          setIsTyping(false)
          addMessage(botText("Hmm, that doesn't look like a GitHub URL. Can you double-check the URL?"))
          return
        }
        setGithubUrl(text.trim())
        setIsTyping(true)
        await new Promise<void>((r) => setTimeout(r, 600))
        setIsTyping(false)
        addMessage(botText('Got it! Now your LinkedIn profile URL?'))
        setConversationState('waiting_linkedin')
        return
      }

      if (conversationState === 'waiting_linkedin') {
        if (!isLinkedinUrl(text)) {
          setIsTyping(true)
          await new Promise<void>((r) => setTimeout(r, 600))
          setIsTyping(false)
          addMessage(botText("Hmm, that doesn't look like a LinkedIn URL. Can you double-check the URL?"))
          return
        }
        setLinkedinUrl(text.trim())
        setIsTyping(true)
        await new Promise<void>((r) => setTimeout(r, 600))
        setIsTyping(false)
        addMessage(botText('Perfect. Finally, paste the job posting URL you\'re targeting.'))
        setConversationState('waiting_job')
        return
      }

      if (conversationState === 'waiting_job') {
        if (!isUrl(text)) {
          setIsTyping(true)
          await new Promise<void>((r) => setTimeout(r, 600))
          setIsTyping(false)
          addMessage(botText("Hmm, that doesn't look like a valid URL. Can you double-check the URL?"))
          return
        }
        await runAgent(githubUrl, linkedinUrl, text.trim())
        return
      }
    },
    [conversationState, githubUrl, linkedinUrl, addMessage, runAgent],
  )

  const reset = useCallback(() => {
    _msgCounter = 0
    setMessages([])
    setConversationState('greeting')
    setIsTyping(false)
    setGithubUrl('')
    setLinkedinUrl('')
    const greeting: ChatMessage = {
      id: nextId(),
      role: 'bot',
      type: 'text',
      content:
        "👋 Hi! I'm Barack Ollama. I'll generate a tailored resume for you.\nLet's start — what's your GitHub profile URL?",
      timestamp: Date.now(),
    }
    setMessages([greeting])
    setConversationState('waiting_github')
  }, [])

  return { messages, conversationState, sendMessage, isTyping, reset }
}

