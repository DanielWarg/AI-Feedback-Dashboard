import { useState } from 'react'
import { TextAnalyzer } from '@components/TextAnalyzer'
import { ResultsCard } from '@components/ResultsCard'
import { HistoryPanel } from '@components/HistoryPanel'
import { Toast, useToast } from '@components/Toast'
import { ConfirmModal } from '@components/ConfirmModal'
import { useTextAnalyzer } from '@hooks/useTextAnalyzer'
import { storageService } from '@services/storage'
import type { AnalyzeResponse } from '@types/api'

export default function App() {
  const [dark, setDark] = useState(false)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const { toasts, success, error } = useToast()

  const handleResultsReceived = (analysisResult: AnalyzeResponse) => {
    setResult(analysisResult)
    setGeneratedText(null)  // Rensa tidigare generated text
    setRefreshHistory((t) => t + 1)
    success('Resultat sparat!')
  }

  const handleTemperatureChange = (temp: number) => {
    setTemperature(temp)
  }

  const handleGeneratedText = (response: any) => {
    setGeneratedText(response.generated_text)
    success('Ny text genererad!')
  }

  const handleClearHistory = () => {
    setShowClearConfirm(true)
  }

  const handleResultDeleted = () => {
    setRefreshHistory((t) => t + 1)
  }

  const confirmClear = () => {
    storageService.clearResults()
    setShowClearConfirm(false)
    setRefreshHistory((t) => t + 1)
    success('Historik rensad')
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI Feedback Dashboard</h1>
            <button
              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setDark((d) => !d)}
              aria-label="Växla dark mode"
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-4">Analysera din text</h2>
                <TextAnalyzer 
                  onResultReceived={handleResultsReceived}
                  onTemperatureChange={handleTemperatureChange}
                />
              </section>

              {result && (
                <section>
                  <ResultsCard 
                    result={result} 
                    temperature={temperature}
                    onGeneratedText={handleGeneratedText}
                  />
                  {generatedText && (
                    <div className="mt-4 p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">✨ Genererad text</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed whitespace-pre-wrap">
                        {generatedText}
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>

            <aside className="lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">Tidigare resultat</h2>
              <HistoryPanel 
                refreshTrigger={refreshHistory}
                onClearRequest={handleClearHistory}
                onResultDeleted={handleResultDeleted}
              />
            </aside>
          </div>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-4">
          <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>AI Feedback Dashboard © 2024</p>
          </div>
        </footer>

        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => {}}
          />
        ))}

        {showClearConfirm && (
          <ConfirmModal
            title="Rensa all historik"
            message="Är du säker? Det går inte att ångra."
            confirmText="Rensa"
            cancelText="Avbryt"
            isDangerous
            onConfirm={confirmClear}
            onCancel={() => setShowClearConfirm(false)}
          />
        )}
      </div>
    </div>
  )
}
