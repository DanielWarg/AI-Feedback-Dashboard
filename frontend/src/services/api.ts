import axios, { AxiosInstance } from 'axios'
import { AnalyzeResponseSchema, GenerateResponseSchema, type AnalyzeResponse, type GenerateResponse } from '@types/api'

// Använd VITE_API_BASE_URL från .env eller fallback till port 8002
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string) {
    console.log('🔧 API Client initialized with baseURL:', baseURL)
    this.client = axios.create({
      baseURL,
      timeout: 90000,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async analyze(text: string, temperature: number = 0.7): Promise<AnalyzeResponse> {
    try {
      console.log('📤 Sending request to:', `${this.client.defaults.baseURL}/analyze`)
      const response = await this.client.post<unknown>('/analyze', { text, temperature })
      console.log('📥 Response received:', response.data)
      const parsed = AnalyzeResponseSchema.parse(response.data)
      return parsed
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = `API error: ${error.response?.status} ${error.response?.data?.detail || error.message}`
        console.error('❌ API Error:', errorMsg)
        throw new Error(errorMsg)
      }
      console.error('❌ Unknown error:', error)
      throw error
    }
  }

  async generate(text: string, suggestions: string[], selected: boolean[], temperature: number = 0.7): Promise<GenerateResponse> {
    try {
      console.log('📤 Sending generate request...')
      const response = await this.client.post<unknown>('/generate', {
        text,
        suggestions,
        selected_suggestions: selected,
        temperature
      })
      console.log('📥 Generated response:', response.data)
      const parsed = GenerateResponseSchema.parse(response.data)
      return parsed
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = `Generate error: ${error.response?.status} ${error.response?.data?.detail || error.message}`
        console.error('❌ Generate Error:', errorMsg)
        throw new Error(errorMsg)
      }
      console.error('❌ Unknown error:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
