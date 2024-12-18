'use client'

import { Plus, MessageCircle, Settings, Layout } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import { CanvasTypeSelector } from "@/components/CanvasTypeSelector"
import { MobileAIChat } from "./MobileAIChat"
import { MobileCanvasTypeSelector } from "../MobileCanvasTypeSelector"

export function MobileBottomNav() {
  const pathname = usePathname()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showChatSheet, setShowChatSheet] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-t">
        <nav className="h-full max-w-screen-xl mx-auto px-4">
          <ul className="h-full flex items-center justify-around">
            <li>
              <Link 
                href="/canvases" 
                className={`flex flex-col items-center gap-1 ${
                  pathname === '/canvases' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Layout size={24} />
                <span className="text-xs">Canvases</span>
              </Link>
            </li>
            <li>
              <button 
                onClick={() => setShowChatSheet(true)}
                className={`flex flex-col items-center gap-1 ${
                  showChatSheet ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <MessageCircle size={24} />
                <span className="text-xs">Chat</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setShowCreateDialog(true)}
                className="flex flex-col items-center gap-1 text-muted-foreground"
              >
                <Plus size={24} />
                <span className="text-xs">Create</span>
              </button>
            </li>
            <li>
              <Link 
                href="/settings" 
                className={`flex flex-col items-center gap-1 ${
                  pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Settings size={24} />
                <span className="text-xs">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <MobileAIChat isOpen={showChatSheet} onOpenChange={setShowChatSheet} />
      <MobileCanvasTypeSelector isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />

    </>
  )
} 