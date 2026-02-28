'use client'

import { useState } from 'react'
import type { ResumeOutput } from '@/types/resume'
import { useIndexedDB } from './useIndexedDB'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export type ConversationState = 'waiting_github' | 'waiting_linkedin' | 'waiting_job' | 'generating' | 'done' | 'error'

export type ProgressStep = {
  tool: string
  status: 'running' | 'done' | 'error'
  message: string
}

export type ChatMsg = {
  id: string
  role: 'user' | 'bot'
  type: 'text' | 'progress' | 'output' | 'typing'
  content?: string
  steps?: ProgressStep[]
  output?: ResumeOutput
}

export const AGENT_TOOL_LABELS: Record<string, string> = {
  brightdata_linkedin: 'Scraping LinkedIn profile',
  composio_github: 'Reading GitHub repositories',
  crewai_extract: 'Extracting relevant data',
  pydantic_validate: 'Validating structured data',
  latex_generate: 'Generating LaTeX resume',
  pdf_compile: 'Compiling PDF',
  keyword_hitl: 'HITL: Confirming keywords',
  portfolio_generate: 'Building portfolio page',
  job_search: 'Finding similar jobs',
}

const AGENT_TOOLS = [
  'brightdata_linkedin',
  'composio_github',
  'crewai_extract',
  'pydantic_validate',
  'latex_generate',
  'pdf_compile',
  'keyword_hitl',
  'portfolio_generate',
  'job_search',
]

// Number of tools handled by preprocessing steps (linkedin + github)
const PREPROCESS_TOOLS_COUNT = 2
// Delay between animating each generation step while the API call is in-flight
const STEP_ANIMATION_DELAY_MS = 2000



const MOCK_OUTPUT: ResumeOutput = {
  latex: `\\documentclass{article}
\\begin{document}
\\title{John Doe — Software Engineer}
\\maketitle
\\section{Summary}
Experienced software engineer with expertise in Python, React, and distributed systems.
\\section{Experience}
\\textbf{Senior Engineer} at TechCorp (2022--Present)
\\begin{itemize}
  \\item Led migration of monolith to microservices, reducing latency by 40\\%
  \\item Built real-time data pipeline processing 1M events/day
\\end{itemize}
\\section{Projects}
\\textbf{BarackOllama} -- AI-powered resume generator using CrewAI and Next.js
\\end{document}`,
  markdown: `# John Doe\n## Software Engineer\n\n> Building intelligent systems that scale.\n\n### 🚀 Featured Projects\n- **BarackOllama** — AI resume generator (CrewAI + Next.js)\n- **RewindOS** — Intelligent life scheduler (Fetch.ai uAgents)\n\n### 🛠 Skills\nPython · TypeScript · React · FastAPI · Redis · CrewAI · Next.js`,
  webpageHtml: `<!DOCTYPE html><html><head><title>John Doe</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:2rem;background:#f9fafb}h1{color:#111}h2{color:#374151}.tag{background:#e5e7eb;padding:4px 10px;border-radius:999px;font-size:14px;display:inline-block;margin:2px}</style></head><body><h1>John Doe</h1><p>Software Engineer · San Francisco, CA</p><h2>Skills</h2><span class="tag">Python</span><span class="tag">TypeScript</span><span class="tag">React</span><span class="tag">FastAPI</span><span class="tag">Redis</span><h2>Projects</h2><h3>BarackOllama</h3><p>AI-powered resume generator using CrewAI, Next.js, and CopilotKit AG-UI</p></body></html>`,
  jobSuggestions: [
    { title: 'Senior Software Engineer', company: 'Stripe', matchPercent: 94, whyItFits: 'Strong Python + distributed systems match', requiredSkills: ['Python', 'TypeScript', 'APIs'], applyUrl: '#' },
    { title: 'Full Stack Engineer', company: 'Vercel', matchPercent: 88, whyItFits: 'Next.js expertise is core requirement', requiredSkills: ['Next.js', 'React', 'TypeScript'], applyUrl: '#' },
    { title: 'AI Engineer', company: 'Anthropic', matchPercent: 82, whyItFits: 'CrewAI + LLM experience aligns well', requiredSkills: ['Python', 'LLMs', 'CrewAI'], applyUrl: '#' },
    { title: 'Backend Engineer', company: 'Notion', matchPercent: 79, whyItFits: 'FastAPI + Redis + data pipeline experience', requiredSkills: ['Python', 'FastAPI', 'Redis'], applyUrl: '#' },
    { title: 'Platform Engineer', company: 'Datadog', matchPercent: 71, whyItFits: 'Distributed systems and observability background', requiredSkills: ['Python', 'Kubernetes', 'Go'], applyUrl: '#' },
  ],
  skillsMatch: [
    { skill: 'Python', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'TypeScript', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'React', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'Kubernetes', inProfile: false, requiredByJob: true, type: 'gap' },
    { skill: 'CrewAI', inProfile: true, requiredByJob: false, type: 'bonus' },
    { skill: 'Next.js', inProfile: true, requiredByJob: true, type: 'match' },
    { skill: 'Redis', inProfile: true, requiredByJob: false, type: 'bonus' },
    { skill: 'Go', inProfile: false, requiredByJob: true, type: 'gap' },
  ],
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function isUrlWithHost(text: string, requiredHost: string): boolean {
  try {
    const url = new URL(text.trim())
    return url.hostname.includes(requiredHost)
  } catch {
    return false
  }
}

export function useResumeAgent() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init',
      role: 'bot',
      type: 'text',
      content:
        "👋 Hi! I'm Barack Ollama — your AI resume generator. Let's build a tailored resume. What's your **GitHub profile URL**? (e.g. https://github.com/username)",
    },
  ])
  const [conversationState, setConversationState] = useState<ConversationState>('waiting_github')
  const [isTyping, setIsTyping] = useState(false)
  const [urls, setUrls] = useState({ github: '', linkedin: '', job: '' })
  const { saveLinkedInData, saveGithubData } = useIndexedDB()

  async function botSay(msg: Omit<ChatMsg, 'id' | 'role'>) {
    setIsTyping(true)
    await delay(600)
    setIsTyping(false)
    setMessages((prev) => [...prev, { ...msg, id: uid(), role: 'bot' }])
  }

  async function runMockAgentDev() {
    const progressId = uid()
    setMessages((prev) => [
      ...prev,
      { id: progressId, role: 'bot', type: 'progress', steps: [] },
    ])

    for (const tool of AGENT_TOOLS) {
      await delay(800)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === progressId
            ? {
                ...msg,
                steps: [
                  ...(msg.steps ?? []),
                  { tool, status: 'running' as const, message: AGENT_TOOL_LABELS[tool] ?? tool },
                ],
              }
            : msg,
        ),
      )
      await delay(400)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === progressId
            ? {
                ...msg,
                steps: (msg.steps ?? []).map((s) =>
                  s.tool === tool ? { ...s, status: 'done' as const } : s,
                ),
              }
            : msg,
        ),
      )
    }

    await delay(500)
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'bot', type: 'output', output: MOCK_OUTPUT },
    ])
    setConversationState('done')
  }

  async function runRealAgent(githubUrl: string, linkedinUrl: string, jobUrl: string) {
    const progressId = uid()
    setMessages((prev) => [
      ...prev,
      { id: progressId, role: 'bot', type: 'progress', steps: [] },
    ])

    const addStep = (tool: string, status: ProgressStep['status']) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === progressId
            ? {
                ...msg,
                steps: [
                  ...(msg.steps ?? []),
                  { tool, status, message: AGENT_TOOL_LABELS[tool] ?? tool },
                ],
              }
            : msg,
        ),
      )
    }

    const updateStep = (tool: string, status: ProgressStep['status']) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === progressId
            ? {
                ...msg,
                steps: (msg.steps ?? []).map((s) =>
                  s.tool === tool ? { ...s, status } : s,
                ),
              }
            : msg,
        ),
      )
    }

    try {
      const githubHandle = new URL(githubUrl).pathname.replace(/^\//, '').split('/')[0]

      // Step 1: LinkedIn preprocessing
      addStep('brightdata_linkedin', 'running')
      const linkedinRes = await fetch(`${API_BASE}/api/preprocess/linkedin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin_url: linkedinUrl }),
      })
      if (!linkedinRes.ok) throw new Error(`LinkedIn preprocess failed: ${linkedinRes.statusText}`)
      const { profile_json } = await linkedinRes.json()
      await saveLinkedInData(profile_json)
      updateStep('brightdata_linkedin', 'done')

      // Step 2: GitHub preprocessing
      addStep('composio_github', 'running')
      const githubRes = await fetch(`${API_BASE}/api/preprocess/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_handle: githubHandle }),
      })
      if (!githubRes.ok) throw new Error(`GitHub preprocess failed: ${githubRes.statusText}`)
      const { repos_markdown } = await githubRes.json()
      await saveGithubData(repos_markdown)
      updateStep('composio_github', 'done')

      // Step 3: Generation — show remaining steps one by one while waiting
      const remainingTools = AGENT_TOOLS.slice(PREPROCESS_TOOLS_COUNT) // crewai_extract onwards
      addStep('crewai_extract', 'running')

      const generatePromise = fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin_json: profile_json, repos_markdown, job_url: jobUrl, github_handle: githubHandle }),
      })

      // Show remaining steps with delays while generation runs
      for (let i = 1; i < remainingTools.length; i++) {
        await delay(STEP_ANIMATION_DELAY_MS)
        updateStep(remainingTools[i - 1], 'done')
        addStep(remainingTools[i], 'running')
      }

      const generateRes = await generatePromise
      if (!generateRes.ok) throw new Error(`Generation failed: ${generateRes.statusText}`)
      const genData = await generateRes.json()

      // Mark last step as done
      updateStep(remainingTools[remainingTools.length - 1], 'done')

      const output: ResumeOutput = {
        latex: genData.resume_html ?? '',
        markdown: genData.github_profile_markdown ?? '',
        webpageHtml: genData.portfolio_website_code ?? '',
        jobSuggestions: [],
        skillsMatch: [],
      }

      await delay(500)
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'bot', type: 'output', output },
      ])
      setConversationState('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          type: 'text',
          content: `❌ Something went wrong: ${message}. Please try again.`,
        },
      ])
      setConversationState('error')
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', type: 'text', content: text.trim() },
    ])

    if (conversationState === 'waiting_github') {
      if (!isUrlWithHost(text, 'github.com')) {
        await botSay({
          type: 'text',
          content:
            "Hmm, that doesn't look like a GitHub URL. Please paste a URL like https://github.com/username",
        })
      } else {
        setUrls((prev) => ({ ...prev, github: text.trim() }))
        await botSay({ type: 'text', content: 'Got it! 📦 Now your **LinkedIn profile URL**?' })
        setConversationState('waiting_linkedin')
      }
    } else if (conversationState === 'waiting_linkedin') {
      if (!isUrlWithHost(text, 'linkedin.com')) {
        await botSay({
          type: 'text',
          content:
            "That doesn't look like a LinkedIn URL. Try https://linkedin.com/in/yourname",
        })
      } else {
        setUrls((prev) => ({ ...prev, linkedin: text.trim() }))
        await botSay({
          type: 'text',
          content: 'Perfect! 🎯 Last one — paste the **job posting URL** you want to target.',
        })
        setConversationState('waiting_job')
      }
    } else if (conversationState === 'waiting_job') {
      setUrls((prev) => ({ ...prev, job: text.trim() }))
      setConversationState('generating')
      await botSay({ type: 'text', content: '🚀 Got everything! Starting resume generation...' })
      if (USE_MOCK) {
        await runMockAgentDev()
      } else {
        await runRealAgent(urls.github, urls.linkedin, text.trim())
      }
    }
  }

  return { messages, conversationState, isTyping, sendMessage, urls }
}
