import { CanvasTypeSuggestionMessage, CreateCanvasTypeMessage, Message, MessageEnvelope } from '@/contexts/ChatContext'
import { AIAgent } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid'
import { CanvasTypeService } from './canvasTypeService';
import { CanvasType } from '@/types/canvas-sections';
import { canvasService } from './canvasService';
import { canvasTypeService } from './canvasTypeService';
import { aiAgentService } from './aiAgentService';

interface ChatRequest {
  messages: Message[]
  currentContent: any
}


export async function* sendCanvasSelectorRequest(messageEnvelope: MessageEnvelope) {
  const response = await fetch('/api/ai-canvas-selector', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messageEnvelope
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
    const newCanvasTypeResponse = await sendAdminChatRequest({
      messageHistory: messageEnvelope.messageHistory,
      action: 'suggestCanvasTypes',
      newMessage: {
        role: 'user',
        content: data.newCanvasType,
      }
    })
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

export async function* sendCreateCanvasTypeRequest(messageEnvelope: MessageEnvelope) {
  yield {
    role: 'thinking',
    content: 'Creating new canvas type...',
  }
  const newCanvasTypeResponse = await sendAdminChatRequest(messageEnvelope)
  yield {
    role: 'thinking',
    content: "Saving new canvas type...",
  }
  console.log('newCanvasTypeResponse', newCanvasTypeResponse)
  if(newCanvasTypeResponse.canvasTypeSuggestions && newCanvasTypeResponse.canvasTypeSuggestions.length > 0) {
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
    
    await canvasTypeService.saveUserCanvasType(canvasType);

    yield {
      role: 'thinking',
      content: `Creating canvas`,
    }

    const nameDescription = await sendNameDescriptionRequest(messageEnvelope)

    const canvasId = await canvasService.createNewCanvas({
      name: nameDescription.name,
      description: nameDescription.description,
      canvasType: canvasType,
      folderId: "root",
      parentCanvasId: null
    });

    yield {
      role: 'thinking',
      content: `Creating AI agent for canvas`,
    }

    const aiAgent = await aiAgentService.createandSaveAIAgent(canvasType)

    yield {
      role: 'assistant',
      content: `Canvas created successfully! ID: ${canvasId}`,
      canvasId
    };
  } else {
    yield {
      role: 'assistant',
      content: newCanvasTypeResponse.content
    }
  }
}

export async function sendCreateCanvasTypeFromDiveRequest(messageEnvelope: MessageEnvelope) {
  const newCanvasTypeResponse = await sendAdminChatRequest(messageEnvelope)
  console.log('newCanvasTypeResponse', newCanvasTypeResponse)
  if(newCanvasTypeResponse.canvasTypeSuggestions && newCanvasTypeResponse.canvasTypeSuggestions.length > 0) {
    const suggestion = newCanvasTypeResponse.canvasTypeSuggestions[0]
    console.log('suggestion', suggestion)
    const canvasTypeId = uuidv4()
    const canvasType: CanvasType = {
      id: canvasTypeId, // This will be set by Firestore
      name: suggestion.name,
      description: suggestion.description,
      icon: suggestion.icon,
      sections: suggestion.sections || [],
      defaultLayout: suggestion.defaultLayout
    };
    console.log('canvasType', canvasType)
    await canvasTypeService.saveUserCanvasType(canvasType);
    console.log('saving aiAgent')
    const aiAgent = await aiAgentService.createandSaveAIAgent(canvasType)
    console.log('aiAgent', aiAgent)
    return canvasType
  }
}

export async function sendNameDescriptionRequest(messageEnvelope: MessageEnvelope) {
  const response = await fetch('/api/ai-name-description', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageEnvelope }),
 
  })

  let data = await response.json()

  return data
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
    }))
  }

  return result
}