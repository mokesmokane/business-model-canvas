import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const { currentContent, section } = await request.json()

    const prompt = `As a business model expert, analyze the following business model canvas content and suggest improvements or fill in missing sections. The current content is:

Company Name: ${currentContent.companyName}
Company Description: ${currentContent.companyDescription}

Key Partners: ${currentContent.keyPartners}
Key Activities: ${currentContent.keyActivities}
Key Resources: ${currentContent.keyResources}
Value Propositions: ${currentContent.valuePropositions}
Customer Relationships: ${currentContent.customerRelationships}
Channels: ${currentContent.channels}
Customer Segments: ${currentContent.customerSegments}
Cost Structure: ${currentContent.costStructure}
Revenue Streams: ${currentContent.revenueStreams}

You are filling out an online form which represents the ${section} section of the Business Model Canvas.
Provide the input for the ${section} section of the Business Model Canvas and the ${section} ONLY. Keep it concise but insightful.
Your response will be entered directly into the form so do not respond with anything other than the input for the ${section} section of the Business Model Canvas and the ${section}.
Markdown is REQUIRED.
Suggest a MAXIMUM of 3 items.
`

    // Create encoder for the stream
    const encoder = new TextEncoder()

    // Create the stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            stream: true,
          })

          // Process each chunk
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              // Encode and enqueue the chunk
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI assistance' }, 
      { status: 500 }
    )
  }
}