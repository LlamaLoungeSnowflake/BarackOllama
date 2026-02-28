'use client'

import { useCallback } from 'react'
import { dbGet, dbSet, dbClear } from '@/lib/indexeddb'

const LINKEDIN_KEY = 'linkedin'
const GITHUB_KEY = 'github'

export function useIndexedDB() {
  const saveLinkedInData = useCallback(async (data: object) => {
    await dbSet(LINKEDIN_KEY, data)
  }, [])

  const saveGithubData = useCallback(async (data: string) => {
    await dbSet(GITHUB_KEY, data)
  }, [])

  const loadCachedData = useCallback(async (): Promise<{
    linkedin: object | null
    github: string | null
  }> => {
    const [linkedin, github] = await Promise.all([
      dbGet<object>(LINKEDIN_KEY),
      dbGet<string>(GITHUB_KEY),
    ])
    return {
      linkedin: linkedin ?? null,
      github: github ?? null,
    }
  }, [])

  const clearCache = useCallback(async () => {
    await dbClear()
  }, [])

  const hasCachedData = useCallback(async (): Promise<boolean> => {
    const data = await loadCachedData()
    return !!(data.linkedin || data.github)
  }, [loadCachedData])

  return { saveLinkedInData, saveGithubData, loadCachedData, clearCache, hasCachedData }
}
