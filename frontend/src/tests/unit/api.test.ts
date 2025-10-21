import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { apiClient } from '@services/api'

vi.mock('axios')

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse and return valid AnalyzeResponse', async () => {
    const mockResponse = {
      suggestions: ['Testa 1', 'Testa 2'],
      tone: 'neutral' as const
    }
    vi.mocked(axios.create).mockReturnValue({
      post: vi.fn().mockResolvedValue({ data: mockResponse })
    } as any)

    const result = await apiClient.analyze('Test text')
    expect(result.tone).toBe('neutral')
    expect(result.suggestions).toHaveLength(2)
  })

  it('should throw on invalid response structure', async () => {
    vi.mocked(axios.create).mockReturnValue({
      post: vi.fn().mockResolvedValue({ data: { invalid: 'data' } })
    } as any)

    await expect(apiClient.analyze('Test')).rejects.toThrow()
  })
})
