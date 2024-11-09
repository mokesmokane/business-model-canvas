import { Bot } from 'lucide-react'

export function AIThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 p-2 bg-zinc-100 rounded-lg animate-in fade-in duration-300">
      <Bot className="h-4 w-4 text-zinc-500" />
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
      </div>
    </div>
  )
} 