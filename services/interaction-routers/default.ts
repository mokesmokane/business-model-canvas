import { AIAgent } from "@/types/canvas"
import { sendChatRequest } from "../aiService"
import { InteractionRouter } from "./interface"
import { Message } from "@/contexts/ChatContext"
export const defaultInteractionRouter: InteractionRouter = {
    getRoute: (messages: Message[], formData: any|null, aiAgent: AIAgent | null) => {
        return (messages: Message[]) => sendChatRequest(messages, formData, aiAgent!) as AsyncGenerator<Message, any, unknown>
    }
}