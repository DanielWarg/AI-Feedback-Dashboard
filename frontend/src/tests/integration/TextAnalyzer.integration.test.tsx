import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextAnalyzer } from '@components/TextAnalyzer'
import * as apiModule from '@services/api'

vi.mock('@services/api')
vi.mock('@services/storage', () => ({
  storageService: {
    saveResult: vi.fn()
  }
}))

describe('TextAnalyzer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render textarea and button', () => {
    render(<TextAnalyzer />)
    expect(screen.getByLabelText(/Text att analysera/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Analysera text/i })).toBeInTheDocument()
  })

  it('should disable button when text is empty', () => {
    render(<TextAnalyzer />)
    const button = screen.getByRole('button', { name: /Analysera text/i })
    expect(button).toBeDisabled()
  })

  it('should enable button when text is entered', async () => {
    const user = userEvent.setup()
    render(<TextAnalyzer />)
    const textarea = screen.getByLabelText(/Text att analysera/i)
    await user.type(textarea, 'Test text')
    const button = screen.getByRole('button', { name: /Analysera text/i })
    expect(button).not.toBeDisabled()
  })

  it('should update character counter', async () => {
    const user = userEvent.setup()
    render(<TextAnalyzer />)
    const textarea = screen.getByLabelText(/Text att analysera/i)
    await user.type(textarea, 'Hello')
    expect(screen.getByText(/5 \/ 5000 tecken/)).toBeInTheDocument()
  })

  it('should display error when API fails', async () => {
    const user = userEvent.setup()
    vi.mocked(apiModule.apiClient.analyze).mockRejectedValueOnce(
      new Error('API error')
    )
    render(<TextAnalyzer />)
    const textarea = screen.getByLabelText(/Text att analysera/i)
    await user.type(textarea, 'Test')
    await user.click(screen.getByRole('button', { name: /Analysera text/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
