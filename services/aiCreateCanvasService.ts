import { CanvasTypeSuggestionMessage, CreateCanvasTypeMessage, Message } from '@/contexts/ChatContext'
import { AIAgent } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid'
import { CanvasTypeService } from './canvasTypeService';
import { CanvasType } from '@/types/canvas-sections';
import { canvasService } from './canvasService';
import { canvasTypeService } from './canvasTypeService';

interface ChatRequest {
  messages: Message[]
  currentContent: any
}


export async function* sendCanvasSelectorRequest(messages: Message[]) {
  const response = await fetch('/api/ai-canvas-selector', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
    throw new Error(`${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}`)
  }

  let data = await response.json()
  console.log('data', data)
  
  if(data.canvasTypeSuggestions) {
    console.log('canvasTypeSuggestions', data.canvasTypeSuggestions)
    const message = new CanvasTypeSuggestionMessage(data.message, data.canvasTypeSuggestions, data.newCanvasType)
    yield message
  }

  else if (data.newCanvasType) {
    yield {
      role: 'thinking',
      content: 'Creating new canvas type...',
    }
    const newCanvasTypeResponse = await sendAdminChatRequest([
      ...messages,
      {
        role: 'user',
        content: data.newCanvasType,
        action: 'suggestCanvasTypes'
      }])
    yield {
      role: 'assistant',
      content: data.message,
      newCanvasType: data.newCanvasType
    }
  } else {
    yield {
      role: 'assistant',
      content: "I'm sorry, I don't understand your request. Please try again."
    }
  }
}

export async function* sendCreateCanvasTypeRequest(messages: Message[]) {
  yield {
    role: 'thinking',
    content: 'Creating new canvas type...',
  }
  const newCanvasTypeResponse = await sendAdminChatRequest(messages)
  yield {
    role: 'thinking',
    content: "Saving new canvas type...",
  }
  const suggestion = newCanvasTypeResponse.canvasTypeSuggestions[0]

  const canvasTypeId = uuidv4()
  const canvasType: CanvasType = {
    id: canvasTypeId, // This will be set by Firestore
    name: suggestion.name,
    description: suggestion.description,
    icon: suggestion.icon,
    sections: suggestion.sections || [],
    defaultLayout: suggestion.defaultLayout
  };
  
  await canvasTypeService.saveCanvasType(canvasType);

  const lastMessage = messages[messages.length - 1] as CreateCanvasTypeMessage
  yield {
    role: 'thinking',
    content: `Creating canvas ${lastMessage.newCanvasType.canvasType}...`,
  }

  const canvasId = await canvasService.createNewCanvas({
    name: suggestion.name,
    description: suggestion.description,
    canvasType: canvasType,
    folderId: "root"
  });

  yield {
    role: 'assistant',
    content: `Canvas created successfully! ID: ${canvasId}`,
    canvasId
  };
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
    }))
  }

  return result
}