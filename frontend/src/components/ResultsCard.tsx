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
    <div className={`p-4 border rounded-lg ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${config.text}`}>Resultat</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.badge}`}>
          {label}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className={`text-sm font-medium ${config.text} mb-2`}>Förbättringsförslag</h3>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 p-2 rounded transition-colors ${
                  selected[idx]
                    ? 'bg-white dark:bg-gray-800/50'
                    : 'bg-gray-100 dark:bg-gray-800/20 opacity-50'
                }`}
              >
                <div className="flex gap-2 items-start flex-1">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                    {idx + 1}
                  </span>
                  <span className="text-sm flex-1">{suggestion}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(idx)}
                    className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                      selected[idx]
                        ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {selected[idx] ? '✓ Ja' : '✗ Nej'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !selected.some(s => s)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            generating || !selected.some(s => s)
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white'
          }`}
        >
          {generating ? 'Genererar...' : '✨ Generera ny text'}
        </button>
      </div>
    </div>
  )
}