import { useState } from 'react'
import { useHistory } from '@hooks/useHistory'

interface HistoryPanelProps {
  refreshTrigger?: number
  onClearRequest?: () => void
  onResultDeleted?: () => void
}

export function HistoryPanel({ refreshTrigger, onClearRequest, onResultDeleted }: HistoryPanelProps) {
  const { results, loading, deleteResult } = useHistory(refreshTrigger)
  const [expanded, setExpanded] = useState(false)

  const handleDelete = (id: string) => {
    deleteResult(id)
    onResultDeleted?.()
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
        aria-expanded={expanded}
      >
        <span>Historik ({results.length})</span>
        <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-pulse text-sm text-gray-500">Laddar...</div>
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingen historik än.</p>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(r.timestamp)}
                      </span>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        aria-label={`Radera resultat från ${formatDate(r.timestamp)}`}
                      >
                        Radera
                      </button>
                    </div>
                    <p className="text-sm truncate text-gray-700 dark:text-gray-300">{r.text}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                        {r.result.tone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onClearRequest}
                className="w-full mt-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                Rensa alla
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
