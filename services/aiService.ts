import { Message, MessageEnvelope } from '@/contexts/ChatContext'
import { AIAgent } from '@/types/canvas';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid'

interface ChatRequest {
  messages: Message[]
  currentContent: any
}

export async function* sendChatRequest(envelope: MessageEnvelope, currentContent: any, aiAgent: AIAgent | null, idToken: string) {
  
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
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
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No user');
  const idToken = await user?.getIdToken();
  if (!idToken) throw new Error('No idToken');
  const response = await fetch('/api/ai-contextless-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
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

export async function sendAdminChatRequest(messageEnvelope: MessageEnvelope, idToken: string) {
  
  const response = await fetch('/api/ai-admin-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ messageEnvelope }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  let data = await response.json()

  if(data.canvasTypeSuggestions) {
   return {
    role: 'assistant',
    content: data.message,
    canvasTypeSuggestions: data.canvasTypeSuggestions?.map((s: any) => ({
      ...s,
      id: uuidv4()
    })) 
   }
  }

  if(data.canvasLayoutSuggestions) {
    return {
      role: 'assistant',
      content: data.message,
      canvasLayoutSuggestions: data.canvasLayoutSuggestions?.map((s: any) => ({
        ...s,
        id: uuidv4()
      })) 
    }
  }

  return data
}