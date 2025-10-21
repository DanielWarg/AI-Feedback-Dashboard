import { useState } from 'react'
import type { AnalyzeResponse, GenerateResponse } from '@types/api'
import { apiClient } from '@services/api'
import { formatApiError } from '@utils/errorFormatter'

interface ResultsCardProps {
  result: AnalyzeResponse
  originalText: string
  temperature: number
  onGeneratedText?: (text: GenerateResponse) => void
}

const toneConfig = {
  positive: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  },
  neutral: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
  },
  negative: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  }
}

const toneLabels = {
  positive: 'Positiv',
  neutral: 'Neutral',
  negative: 'Negativ'
}

export function ResultsCard({ result, originalText, temperature, onGeneratedText }: ResultsCardProps) {
  const config = toneConfig[result.tone]
  const label = toneLabels[result.tone]
  const [selected, setSelected] = useState<boolean[]>(result.suggestions.map(() => true))
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = (idx: number) => {
    const newSelected = [...selected]
    newSelected[idx] = !newSelected[idx]
    setSelected(newSelected)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const response = await apiClient.generate(
        originalText,
        result.suggestions,
        selected,
        temperature
      )
      onGeneratedText?.(response)
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className={`