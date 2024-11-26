
import { createCanvasInteractionRouter } from "./interaction-routers/createCanvasRouter"
import { defaultInteractionRouter } from "./interaction-routers/default"
import { InteractionRouter } from "./interaction-routers/interface"
import { AIAgent } from "@/types/canvas"
import { Message } from "@/contexts/ChatContext"
export const routeInteraction = (interaction: string|null, messages: Message[], formData: any|null, aiAgent: AIAgent | null) => {
  let interactionRouter:InteractionRouter = defaultInteractionRouter
  console.log('interaction', interaction)
  switch(interaction) {
    case 'createCanvas':
        console.log('routing to createNewCanvas')
        interactionRouter = createCanvasInteractionRouter
        break
    default:
      console.log('routing to default')
      interactionRouter = defaultInteractionRouter
  }
  return interactionRouter.getRoute(messages, formData, aiAgent)
}