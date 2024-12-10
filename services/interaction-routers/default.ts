import { AIAgent } from "@/types/canvas"
import { sendChatRequest } from "../aiService"
import { InteractionRouter } from "./interface"
import { Message, MessageEnvelope } from "@/contexts/ChatContext"
export const defaultInteractionRouter: InteractionRouter = {
    getRoute: (messageEnvelope: MessageEnvelope, formData: any|null, aiAgent: AIAgent | null) => {
        return (messageEnvelope: MessageEnvelope, idToken: string) => sendChatRequest(messageEnvelope, formData, aiAgent!, idToken) as AsyncGenerator<Message, any, unknown>
    }
}