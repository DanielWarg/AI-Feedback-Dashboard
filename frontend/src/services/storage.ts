import type { AnalyzeResponse } from '@types/api'

export interface SavedResult {
  id: string
  text: string
  result: AnalyzeResponse
  timestamp: number
}

const STORAGE_KEY = 'ai_feedback_results'

export const storageService = {
  saveResult: (text: string, result: AnalyzeResponse): SavedResult => {
    const saved: SavedResult = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      result,
      timestamp: Date.now()
    }
    const existing = storageService.getResults()
    existing.unshift(saved)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
    return saved
  },

  getResults: (): SavedResult[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return []
    }
  },

  deleteResult: (id: string): void => {
    const existing = storageService.getResults()
    const filtered = existing.filter((r) => r.id !== id)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to delete from localStorage:', error)
    }
  },

  clearResults: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }
}
