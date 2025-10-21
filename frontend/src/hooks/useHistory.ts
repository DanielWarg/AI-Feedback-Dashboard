import { useState, useEffect } from 'react'
import { storageService, type SavedResult } from '@services/storage'

export const useHistory = (refreshTrigger?: number) => {
  const [results, setResults] = useState<SavedResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const loadResults = () => {
      setResults(storageService.getResults())
      setLoading(false)
    }
    // Simulera async load för konsistent UX
    const timer = setTimeout(loadResults, 50)
    return () => clearTimeout(timer)
  }, [refreshTrigger])

  const deleteResult = (id: string) => {
    storageService.deleteResult(id)
    setResults(storageService.getResults())
  }

  const clearResults = () => {
    storageService.clearResults()
    setResults([])
  }

  return {
    results,
    loading,
    deleteResult,
    clearResults
  }
}
