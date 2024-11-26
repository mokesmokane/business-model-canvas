import { AIAgent } from "@/types/canvas"
import { sendChatRequest } from "../aiService"
import { InteractionRouter } from "./interface"
import { Message, MessageEnvelope } from "@/contexts/ChatContext"
export const defaultInteractionRouter: InteractionRouter = {
    getRoute: (messageEnvelope: MessageEnvelope, formData: any|null, aiAgent: AIAgent | null) => {
        return (messageEnvelope: MessageEnvelope) => sendChatRequest(messageEnvelope, formData, aiAgent!) as AsyncGenerator<Message, any, unknown>
    }
}