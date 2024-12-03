'use client'

import { AIChatArea } from "@/components/chat/AIChatArea"
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav"

export default function ChatPage() {
  return (
    <>
      <div className="h-[calc(100vh-4rem)]">
        <AIChatArea />
      </div>
      <MobileBottomNav />
    </>
  )
} 