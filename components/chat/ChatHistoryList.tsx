import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useChat } from '@/contexts/ChatContext'
import type { ChatHistory } from '@/contexts/ChatContext'
import { cn } from '@/lib/utils'
import DynamicIcon from '../Util/DynamicIcon'
import { useCanvas } from '@/contexts/CanvasContext'
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'

interface ChatHistoryListProps {
    onSelect: (chatId: string, canvasId?: string) => void
    onBack: () => void
    canvasId?: string
}

export function ChatHistoryList({ onSelect, onBack, canvasId }: ChatHistoryListProps) {
    const { chatHistories } = useChat()
    const { currentCanvas } = useCanvas()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null)

    const handleChatSelect = (chat: ChatHistory) => {
        // If the chat has no canvas or is from the current canvas, select it directly
        console.log('Chat canvasId:', chat.canvasInfo?.id, 'Selected canvasId:', currentCanvas?.id)
        if (!chat.canvasInfo || chat.canvasInfo.id === currentCanvas?.id) {
            onSelect(chat.id, currentCanvas?.id)
            return
        }

        // Otherwise, show the confirmation dialog
        setSelectedChat(chat)
        setDialogOpen(true)
    }

    const handleConfirmNavigation = () => {
        if (selectedChat) {

            onSelect(selectedChat.id, selectedChat.canvasInfo?.id)
        }
        setDialogOpen(false)
        setSelectedChat(null)
    }

    const filteredChatHistories = canvasId ? chatHistories.filter(chat => chat.canvasInfo?.id === canvasId) : chatHistories
    console.log('Chat histories:', filteredChatHistories.map(chat => ({
        id: chat.id,
        title: chat.title,
        canvasInfo: chat.canvasInfo
    })))

    const groupedHistory = filteredChatHistories.reduce((acc: Record<string, ChatHistory[]>, chat) => {
        const date = chat.updatedAt
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let group = 'Older'
        if (date.toDateString() === today.toDateString()) {
            group = 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            group = 'Yesterday'
        }

        if (!acc[group]) {
            acc[group] = []
        }
        acc[group].push(chat)
        return acc
    }, {})

    // Calculate total items for animation delay
    let itemCount = 0

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col max-w-sm mx-auto w-full h-full"
            >
                <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-4">
                        {['Today', 'Yesterday', 'Older'].map((group) => {
                            if (!groupedHistory[group]?.length) return null

                            return (
                                <motion.div
                                    key={group}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: itemCount * 0.1 }}
                                >
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">{group}</h4>
                                    <div className="flex flex-col gap-2">
                                        {groupedHistory[group].map((chat, index) => {
                                            itemCount++
                                            return (
                                                <motion.div
                                                    key={chat.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: itemCount * 0.1 }}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-left justify-start"
                                                        onClick={() => handleChatSelect(chat)}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {chat.canvasInfo ? (
                                                                <DynamicIcon name={chat.canvasInfo.icon} className="w-4 h-4 text-blue-500" />
                                                            ) : (
                                                                <Clock className="w-4 h-4" />
                                                            )}
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="font-medium truncate">{chat.title}</span>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <span>{formatDistanceToNow(chat.updatedAt, { addSuffix: true })}</span>
                                                                    {chat.canvasInfo && (
                                                                        <>
                                                                            <span className="text-muted-foreground">•</span>
                                                                            <span className={cn(
                                                                                "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                                                                                "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                                                            )}>
                                                                                {chat.canvasInfo.name}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </ScrollArea>

                {onBack && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (itemCount + 1) * 0.1 }}
                        className="mt-4 border-t pt-2 bg-background"
                    >
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            onClick={onBack}
                        >
                            ← Back
                        </Button>
                    </motion.div>
                )}
            </motion.div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Switch Canvas?</DialogTitle>
                        <DialogDescription>
                            This chat is associated with a different canvas. Selecting it will navigate you to{' '}
                            <span className="font-medium">{selectedChat?.canvasInfo?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmNavigation}>
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 