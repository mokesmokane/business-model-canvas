import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { createSubscriptionRequiredMessage, Message, MessageEnvelope, QuestionMessage, RequestSuggestEditMessage, SuggestEditMessage, SuggestionMessage } from '@/contexts/ChatContext'
import { AIAgent, Canvas, SectionItem, Section, TextSectionItem } from '@/types/canvas'
import { CanvasSection } from '@/types/canvas-sections'
import { verifySubscriptionStatus } from '@/utils/subscription-check'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})


export async function POST(req: Request) {
  console.log('Starting AI item edit request');
  try {
    const authHeader = req.headers.get('authorization');
    console.log('Checking subscription status');
    const isSubscribed = await verifySubscriptionStatus(authHeader || '');
    
    if (!isSubscribed) {
      console.log('User not subscribed - returning 403');
      return NextResponse.json(
        createSubscriptionRequiredMessage(),
        { status: 403 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' }, 
        { status: 500 }
      )
    }

    const { currentContent, section, item, instruction } = await req.json()
    console.log('Request payload:', {
      canvasName: currentContent.name,
      canvasType: currentContent.canvasType?.name,
      section,
      itemContent: (item as TextSectionItem).content,
      instruction
    });

    const canvas: Canvas = {
      ...currentContent,
      sections: new Map(Object.entries(currentContent.sections))
    };
    const sections = canvas?.canvasType?.sections.map((section:CanvasSection) => section.name) || []

    const canvasTypeName = canvas?.canvasType?.name || ''
    const currentSection = canvas?.sections.get(section)
    if(!currentSection) {
      console.log(`Section "${section}" not found in canvas`);
      return NextResponse.json(
        { error: 'Section not found' }, 
        { status: 404 }
      )
    }

    console.log('Preparing OpenAI request with context:', {
      canvasType: canvasTypeName,
      section: currentSection.name,
      itemsCount: currentSection.sectionItems.length
    });

    const canvasType = canvas?.canvasType || ''
    const canvasName = canvas?.name || ''
    const description = canvasType.description || ''
    const sectionConsiderations = canvasType.sections.find((section:CanvasSection) => section.name === currentSection.name)?.placeholder || ''
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI assistant that helps users complete their canvas. The canvas is a way of representing a framework for a specific task. You are given a canvas and a section of the canvas, and an item in that section. You are given an instruction for the item, and you are to suggest an edit to the item. All the time you must consider the aim of the canvas and the section of the canvas.
        The canvas type is: ${canvasTypeName}
        (${canvasType.description})
        The title of this canvas is: ${canvasName}
        The description of this canvas is: ${description}
        The section the user is editing is: ${currentSection.name}
        Considerations for this section are: ${sectionConsiderations}
        The section currently has these items: ${currentSection.sectionItems.map((item:SectionItem) => JSON.stringify((item as TextSectionItem).content)).join('\n')}

        JUST RETURN THE EDIT, DO NOT INCLUDE ANY OTHER TEXT
        `
      },
      {
        role: 'user',
        content: `The item I would like help editing is: ${(item as TextSectionItem).content}
        `
      },
      {
        role: 'user',
        content: instruction
      }
    ]
    console.log('Initiating OpenAI streaming request');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      stream: true,
      temperature: 0.7,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return the response with the appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in AI analysis:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(JSON.stringify({ error: 'Failed to analyze document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
}
