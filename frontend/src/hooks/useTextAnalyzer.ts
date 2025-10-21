import { useState } from 'react'
import { apiClient } from '@services/api'
import type { AnalyzeResponse } from '@types/api'

interface UseTextAnalyzerState {
  text: string
  loading: boolean
  error: string | null
  result: AnalyzeResponse | null
}

export const useTextAnalyzer = () => {
  const [state, setState] = useState<UseTextAnalyzerState>({
    text: '',
    loading: false,
    error: null,
    result: null
  })

  const setText = (text: string) => {
    setState((s) => ({ ...s, text, error: null }))
  }

  const analyze = async (text: string, temperature: number = 0.7): Promise<AnalyzeResponse | null> => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const result = await apiClient.analyze(text, temperature)
      setState((s) => ({ ...s, result, loading: false }))
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setState((s) => ({ ...s, error: message, loading: false }))
      return null
    }
  }

  const clearResult = () => {
    setState((s) => ({ ...s, result: null, error: null }))
  }

  return {
    ...state,
    setText,
    analyze,
    clearResult
  }
}
