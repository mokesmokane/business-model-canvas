import { AIAgent } from "@/types/canvas"
import { sendChatRequest } from "../aiService"
import { InteractionRouter } from "./interface"
import { sendCanvasSelectorRequest, sendCreateCanvasTypeRequest } from "../aiCreateCanvasService"
import { Message } from "@/contexts/ChatContext"

export const createCanvasInteractionRouter: InteractionRouter = {
    getRoute: (messages: Message[], formData: any|null, aiAgent: AIAgent | null) => {
        console.log('createCanvasInteractionRouter')
        console.log('messages', messages)
        let interaction
        if(messages.length === 1) {
            console.log('sending canvas selector request')
            interaction = (messages: Message[]) => sendCanvasSelectorRequest(messages) as AsyncGenerator<Message, void, unknown>
        }
        else if (messages[messages.length - 1].action === 'createCanvasType') {
            console.log('sending create canvas type request')
            interaction = (messages: Message[]) => sendCreateCanvasTypeRequest(messages) as AsyncGenerator<Message, void, unknown>
        }
        else {
            console.log('sending chat request')
            interaction = (messages: Message[]) => sendChatRequest(messages, formData, aiAgent!) as AsyncGenerator<Message, void, unknown>
        }
        return interaction
    }
}