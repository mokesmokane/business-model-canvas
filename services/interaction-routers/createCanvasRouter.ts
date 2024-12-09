import { AIAgent } from "@/types/canvas"
import { sendChatRequest } from "../aiService"
import { InteractionRouter } from "./interface"
import { sendCanvasSelectorRequest, sendCreateCanvasTypeRequest } from "../aiCreateCanvasService"
import { CreateCanvasTypeMessage, Message, MessageEnvelope } from "@/contexts/ChatContext"

export const createCanvasInteractionRouter: InteractionRouter = {
    getRoute: (messageEnvelope: MessageEnvelope, formData: any|null, aiAgent: AIAgent | null) => {
        console.log('createCanvasInteractionRouter')
        console.log('messages', messageEnvelope.messageHistory)
        let interaction
        if(messageEnvelope.messageHistory.length === 0) {
            console.log('sending canvas selector request')
            interaction = (messageEnvelope: MessageEnvelope, idToken: string) => sendCanvasSelectorRequest(messageEnvelope) as AsyncGenerator<Message, void, unknown>
        }
        else if (messageEnvelope.newMessage.type === 'createCanvasType') {
            console.log('sending create canvas type request')
            interaction = (messageEnvelope: MessageEnvelope, idToken: string) => sendCreateCanvasTypeRequest(messageEnvelope, idToken) as AsyncGenerator<Message, void, unknown>
        }
        else {
            console.log('sending chat request')
            interaction = (messageEnvelope: MessageEnvelope, idToken: string) => sendChatRequest(messageEnvelope, formData, aiAgent!, idToken) as AsyncGenerator<Message, void, unknown>
        }
        return interaction
    }
}