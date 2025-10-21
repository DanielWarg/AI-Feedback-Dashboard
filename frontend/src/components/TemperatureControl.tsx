import { MIN_TEMPERATURE, MAX_TEMPERATURE, DEFAULT_TEMPERATURE } from '@constants'

interface TemperatureControlProps {
  temperature: number
  onChange: (temp: number) => void
}

const presets = [
  { label: 'Conservative', value: 0.3, description: 'Mer fokuserad och faktisk' },
  { label: 'Balanced', value: DEFAULT_TEMPERATURE, description: 'Balanserat' },
  { label: 'Creative', value: 1.2, description: 'Mer kreativ och extremare' }
]

export function TemperatureControl({ temperature, onChange }: TemperatureControlProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        AI Creativitet: {temperature.toFixed(1)}
      </label>

      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              Math.abs(temperature - preset.value) < 0.01
                ? 'bg-primary-600 text-white dark:bg-primary-700'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min={MIN_TEMPERATURE}
        max={MAX_TEMPERATURE}
        step="0.1"
        value={temperature}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />

      <p className="text-xs text-gray-600 dark:text-gray-400">
        {temperature <= 0.3 && 'Fokuserad feedback, mindre kreativ'}
        {temperature > 0.3 && temperature < 1.0 && 'Balanserad mix av fokus och kreativitet'}
        {temperature >= 1.0 && 'Mer kreativ, extremare förslag'}
      </p>
    </div>
  )
}
