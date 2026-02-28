export type AgentStep = {
  id: string
  tool: string
  status: 'pending' | 'running' | 'done' | 'error'
  message: string
  timestamp: number
}

export type JobSuggestion = {
  title: string
  company: string
  matchPercent: number
  whyItFits: string
  requiredSkills: string[]
  applyUrl?: string
}

export type SkillMatch = {
  skill: string
  inProfile: boolean
  requiredByJob: boolean
  type: 'match' | 'gap' | 'bonus'
}

export type ResumeOutput = {
  latex: string
  pdfUrl?: string
  markdown: string
  webpageHtml: string
  jobSuggestions: JobSuggestion[]
  skillsMatch: SkillMatch[]
}
