import { Message, MessageEnvelope } from '@/contexts/ChatContext'
import { AIAgent } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid'

interface ChatRequest {
  messages: Message[]
  currentContent: any
}

export async function* sendChatRequest(envelope: MessageEnvelope, currentContent: any, aiAgent: AIAgent | null) {
  
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messageEnvelope: envelope,
      currentContent: currentContent,
      aiAgent
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  let data = await response.json()

  yield data as Message
} 



export async function* sendContextlessChatRequest(envelope: MessageEnvelope, currentContent: any, aiAgent: AIAgent | null) {
  const response = await fetch('/api/ai-contextless-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messageEnvelope: envelope,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  yield await response.json() as Message
} 

export async function sendAdminChatRequest(messageEnvelope: MessageEnvelope) {
  
  const response = await fetch('/api/ai-admin-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageEnvelope }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  let data = await response.json()

  

  let result = {
    role: 'assistant',
    content: data.message,
    canvasTypeSuggestions: data.canvasTypeSuggestions?.map((s: any) => ({
      ...s,
      id: uuidv4()
    })),
    canvasLayoutSuggestions: data.canvasLayoutSuggestions?.map((s: any) => ({
      ...s,
      id: uuidv4()
    }))
  }

  

  return result
}