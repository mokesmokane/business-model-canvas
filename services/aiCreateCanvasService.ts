import { createCanvasTypeSuggestionMessage, createTextMessage, Message, MessageEnvelope } from '@/contexts/ChatContext'
import { AIAgent, Canvas, SectionItem } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid'
import { CanvasSection, CanvasType } from '@/types/canvas-sections';
import { canvasService } from './canvasService';
import { canvasTypeService } from './canvasTypeService';
import { aiAgentService } from './aiAgentService';
import { getAuth } from 'firebase/auth';

interface ChatRequest {
  messages: Message[]
  currentContent: any
}


export async function* sendCanvasSelectorRequest(messageEnvelope: MessageEnvelope) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No user');
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const idToken = await user?.getIdToken();
  if (idToken) {
    headers = {
      ...headers,
      'Authorization': `Bearer ${idToken}`
    };
  }

  const response = await fetch('/api/ai-canvas-selector', {
    method: 'POST',
    headers,
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
    const message = createCanvasTypeSuggestionMessage(data.message, data.canvasTypeSuggestions, data.newCanvasType)
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
      newMessage: createTextMessage(data.newCanvasType)
    }, idToken) 

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

export async function* sendCreateCanvasTypeRequest(messageEnvelope: MessageEnvelope, idToken: string) {
  yield {
    role: 'thinking',
    content: 'Creating new canvas type...',
  }
  const newCanvasTypeResponse = await sendAdminChatRequest(messageEnvelope, idToken)
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

    const nameDescription = await sendNameDescriptionRequest(messageEnvelope, idToken)

    const canvasId = await canvasService.createNewCanvas({
      name: nameDescription.name,
      description: nameDescription.description,
      canvasType: canvasType,
      folderId: "root",
      parentCanvasId: null,
      canvasId: null
    });

    yield {
      role: 'thinking',
      content: `Creating AI agent for canvas`,
    }

    const aiAgent = await aiAgentService.createandSaveAIAgent(canvasType, idToken)

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

export async function sendCreateCanvasTypeFromDiveRequest(messageEnvelope: MessageEnvelope, idToken: string) {
  const newCanvasTypeResponse = await sendAdminChatRequest(messageEnvelope, idToken)
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
    const aiAgent = await aiAgentService.createandSaveAIAgent(canvasType, idToken)
    console.log('aiAgent', aiAgent)
    return canvasType
  }
}

export async function sendNameDescriptionRequest(messageEnvelope: MessageEnvelope, idToken: string) {
  const response = await fetch('/api/ai-name-description', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ messageEnvelope }),
 
  })

  let data = await response.json()

  return data
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

export async function generateSectionSuggestions({
  parentCanvas,
  newCanvas,
  diveItem,
  sectionToGenerate
}: {
  parentCanvas: Canvas;
  newCanvas: Canvas;
  diveItem: SectionItem;
  sectionToGenerate: CanvasSection;
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No user');
  const idToken = await user?.getIdToken();
  if (!idToken) throw new Error('No idToken');
  const response = await fetch('/api/ai-canvas-dive/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      parentCanvas,
      newCanvas,
      diveItem,
      sectionToGenerate
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate suggestions');
  }

  return response.json();
}
