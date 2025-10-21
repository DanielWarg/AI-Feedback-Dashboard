import { describe, it, expect, beforeEach } from 'vitest'
import { storageService } from '@services/storage'

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and retrieve results', () => {
    const result = {
      suggestions: ['Test 1', 'Test 2'],
      tone: 'positive' as const
    }
    const saved = storageService.saveResult('Test text', result)
    expect(saved.id).toBeDefined()
    expect(saved.text).toBe('Test text')

    const retrieved = storageService.getResults()
    expect(retrieved).toHaveLength(1)
    expect(retrieved[0].id).toBe(saved.id)
  })

  it('should delete a result', () => {
    const result = {
      suggestions: ['Test 1', 'Test 2'],
      tone: 'neutral' as const
    }
    const saved = storageService.saveResult('Text 1', result)
    storageService.deleteResult(saved.id)
    expect(storageService.getResults()).toHaveLength(0)
  })

  it('should clear all results', () => {
    const result = {
      suggestions: ['Test'],
      tone: 'negative' as const
    }
    storageService.saveResult('Text', result)
    storageService.clearResults()
    expect(storageService.getResults()).toHaveLength(0)
  })
})
