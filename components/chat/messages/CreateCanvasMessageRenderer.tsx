import { Message } from "@/contexts/ChatContext"
import { CanvasType } from "@/types/canvas-sections"
import { MessageRendererProps } from "./MessageRendererInterface"
import { defaultExtraMessageStuff, renderDefaultMessages } from "./DefaultMessageRenderer"
import { CanvasTypeSuggestionMessage } from "@/contexts/ChatContext"
import { useState } from "react"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { useEffect } from "react"
import CanvasSuggestionItem from "./CanvasSuggestionItem"
import NewCanvasSuggestionItem from "./NewCanvasSuggestionItem"

export function renderCanvasTypeSuggestionMessage(message: CanvasTypeSuggestionMessage) {
    // const { getCanvasTypes } = useCanvasTypes()
    // const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({})
    // useEffect(() => {
    //     getCanvasTypes().then(setCanvasTypes)
    // }, [getCanvasTypes])
    console.log('message', message)
    console.log('rendering canvasType suggestions', message.canvasTypeSuggestions)
    const existing = message.canvasTypeSuggestions.map((suggestion) => {
        // const canvasType = canvasTypes[suggestion]
        return <div key={suggestion}>
            <CanvasSuggestionItem canvasTypeId={suggestion} onSelect={()=>{}} />
        </div>
    })
    const newCanvas = <NewCanvasSuggestionItem newCanvasSuggestion={message.newCanvasType} />
    return <>
        {existing}
        <div className="mt-4">Or we could create a new canvas type:</div>
        {newCanvas}
    </>
}

export function extraMessageStuff(message: Message, messageIndex: number, onSuggestionAdd: (messageIndex: number, section: string, suggestion: string, rationale: string, id: string) => void, onSuggestionDismiss: (messageIndex: number, id: string) => void, onSuggestionExpand: (suggestion: { suggestion: string }) => void, onQuestionSubmit: (question: any) => void) {
  console.log('create canvasextraMessageStuff', message)
  return<>
    {defaultExtraMessageStuff(message, messageIndex, onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit)}
    { message instanceof CanvasTypeSuggestionMessage && renderCanvasTypeSuggestionMessage(message)}
  </>
}

export function CreateCanvasMessageRenderer({onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit }: MessageRendererProps) {
    return {
        render: (messages: Message[]) => renderDefaultMessages(messages, (message: Message, messageIndex: number) => extraMessageStuff(message, messageIndex, onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit))
    }
}