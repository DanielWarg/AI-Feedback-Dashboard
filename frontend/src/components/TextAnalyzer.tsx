import { useState } from 'react'
import { useTextAnalyzer } from '@hooks/useTextAnalyzer'
import type { AnalyzeResponse } from '@types/api'
import { storageService } from '@services/storage'
import { TemperatureControl } from './TemperatureControl'
import { DEFAULT_TEMPERATURE, TEXT_MAX_LENGTH } from '@constants'
import { formatApiError } from '@utils/errorFormatter'

interface TextAnalyzerProps {
  onResultReceived?: (result: AnalyzeResponse) => void
  onOriginalTextChange?: (text: string) => void
  onTemperatureChange?: (temp: number) => void
}

export function TextAnalyzer({ onResultReceived, onOriginalTextChange, onTemperatureChange }: TextAnalyzerProps) {
  const { text, loading, error, setText, analyze, clearResult } = useTextAnalyzer()
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE)
  const maxChars = TEXT_MAX_LENGTH
  const charCount = text.length

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxChars) {
      setText(value)
    }
  }

  const handleAnalyze = async () => {
    onOriginalTextChange?.(text)
    const result = await analyze(text, temperature)
    if (result) {
      storageService.saveResult(text, result)
      onResultReceived?.(result)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const handleTemperatureChange = (temp: number) => {
    setTemperature(temp)
    onTemperatureChange?.(temp)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="text-input" className="block text-sm font-medium mb-2">
          Din text
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Klistra in eller skriv din text här... (Cmd/Ctrl+Enter för att analysera)"
          disabled={loading}
          className="w-full min-h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50"
          aria-label="Text att analysera"
          aria-describedby="char-count"
        />
        <div id="char-count" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {charCount} / {maxChars} tecken
        </div>
      </div>

      <TemperatureControl temperature={temperature} onChange={handleTemperatureChange} />

      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Analyserar...</span>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!text.trim() || loading}
        className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        aria-busy={loading}
      >
        {loading ? 'Analyserar...' : 'Analysera text'}
      </button>
    </div>
  )
}
