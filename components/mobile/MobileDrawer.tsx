import { useAuth } from "@/contexts/AuthContext"
import { LayoutDashboard, Settings, HelpCircle, LogOut, Trash2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCanvas } from "@/contexts/CanvasContext"
import { NewCanvasDialog } from "@/components/NewCanvasDialog"
import { DeleteCanvasDialog } from "@/components/DeleteCanvasDialog"
import { useState } from "react"
import { BUSINESS_MODEL_CANVAS } from "@/types/canvas-sections"

export function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { logout } = useAuth()
  const router = useRouter()
  const { loadCanvas, deleteCanvas, resetForm, currentCanvas, userCanvases } = useCanvas()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [canvasToDelete, setCanvasToDelete] = useState<{ id: string, name: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleCanvasSelect = async (canvasId: string) => {
    await loadCanvas(canvasId)
    localStorage.setItem('lastCanvasId', canvasId)
  }

  const handleDeleteCanvas = async (canvasId: string) => {
    await deleteCanvas(canvasId)
    if (localStorage.getItem('lastCanvasId') === canvasId) {
      localStorage.removeItem('lastCanvasId')
      if (userCanvases.length > 0) {
        handleCanvasSelect(userCanvases[0].id)
      } else {
        resetForm()
      }
    }
  }

  const staticMenuItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-4">
        <div className="space-y-1">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center px-4 py-2">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Business Models
            <div className="flex-grow"></div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClose}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </h3>
          <div className="px-4 mb-2">
            <NewCanvasDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              canvasType={currentCanvas?.canvasType || BUSINESS_MODEL_CANVAS}
            />
          </div>
          {userCanvases.map((item) => (
            <div key={item.id} className="flex items-center gap-1 px-4">
              <Button
                variant="ghost"
                className={`flex-1 justify-start text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  currentCanvas?.id === item.id 
                    ? 'bg-muted font-medium border-l-2 border-primary pl-3' 
                    : 'pl-4'
                }`}
                onClick={() => handleCanvasSelect(item.id)}
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                {item.name}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setCanvasToDelete({ id: item.id, name: item.name })
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {staticMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-base"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
      {canvasToDelete && (
        <DeleteCanvasDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => handleDeleteCanvas(canvasToDelete.id)}
          canvasName={canvasToDelete.name}
        />
      )}
    </div>
  )
} 