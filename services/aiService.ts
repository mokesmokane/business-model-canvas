import { Message } from '@/contexts/ChatContext'
import { v4 as uuidv4 } from 'uuid'
interface ChatRequest {
  messages: Message[]
  currentContent: any
}

export async function sendChatRequest(messages: Message[], currentContent: any) {
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      currentContent,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  let data = await response.json()
  return { 
    role: 'assistant', 
    content: data.message,
    suggestions:data.suggestions?.map((suggestion: any) => ({
      ...suggestion,
      id: uuidv4()
    }))
  }
} 