import { Message } from '@/contexts/ChatContext'
import { AIAgent } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid'
interface ChatRequest {
  messages: Message[]
  currentContent: any
}

export async function sendChatRequest(messages: Message[], currentContent: any, aiAgent: AIAgent) {
  const serializedContent = {
    ...currentContent,
    sections: Object.fromEntries(currentContent.sections || new Map())
  };

  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      currentContent: serializedContent,
      aiAgent
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  let data = await response.json()

  const res =  {
    role: 'assistant',
    content: data.message,
    suggestions: data.suggestions?.map((suggestion: any) => ({
      ...suggestion,
      id: uuidv4()
    })),
    questions: data.questions?.map((question: any) => ({
      ...question,
      id: uuidv4()
    }))
  }
  
  return res  
} 

export async function sendAdminChatRequest(messages: Message[]) {
  
  const response = await fetch('/api/ai-admin-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
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