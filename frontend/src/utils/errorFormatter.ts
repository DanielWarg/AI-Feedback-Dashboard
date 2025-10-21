/**
 * Centralized error message formatting for consistent UX
 */

export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Network') || error.message.includes('ERR_CONNECTION')) {
      return 'Kan inte ansluta till servern. Kontrollera din internetanslutning.'
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'Förfrågan tog för lång tid. Försök igen.'
    }

    // Service unavailable
    if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
      return 'AI-tjänsten är tillfälligt otillgänglig. Försök igen senare.'
    }

    // Validation errors
    if (error.message.includes('422') || error.message.includes('Validation')) {
      return 'Ogiltig inmatning. Kontrollera din text och försök igen.'
    }

    // Server errors
    if (error.message.includes('500')) {
      return 'Ett serverfel uppstod. Kontakta supporten om problemet kvarstår.'
    }

    // Default API error
    if (error.message.includes('API error')) {
      return error.message.replace('API error: ', '')
    }

    // Return original error message if it's meaningful
    return error.message
  }

  return 'Ett okänt fel uppstod. Försök igen.'
}

export function formatValidationError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('required')) {
      return 'Obligatoriskt fält saknas.'
    }
    if (error.message.includes('invalid')) {
      return 'Ogiltig värde.'
    }
  }
  return 'Valideringsfel uppstod.'
}
