'use client'

import { SiteHeader } from "@/components/site/SiteHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  const helpSections = [
    {
      title: "Getting Started",
      items: [
        {
          question: "What is a Business Model Canvas?",
          answer: "A Business Model Canvas is a strategic management template used to document and develop business models. It helps you visualize all the building blocks of your business, including customers, value proposition, finances, and infrastructure."
        },
        {
          question: "How do I create my first canvas?",
          answer: "Click the 'New Canvas' button in the sidebar to create your first business model canvas. Enter your business name and description, and we'll help you get started with AI-powered suggestions."
        }
      ]
    },
    {
      title: "Using AI Features",
      items: [
        {
          question: "How does the AI assistant work?",
          answer: "Our AI assistant helps you develop your business model by providing suggestions, asking relevant questions, and offering insights based on your inputs. You can interact with it through the chat interface in the sidebar."
        },
        {
          question: "What can I ask the AI?",
          answer: "You can ask for help with any aspect of your business model. The AI can help you brainstorm ideas, analyze your model, suggest improvements, and guide you through the business modeling process."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Find answers to common questions and learn how to use cavvy.ai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {helpSections.map((section) => (
                <div key={section.title} className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 