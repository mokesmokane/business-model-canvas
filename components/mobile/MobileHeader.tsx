import { Button } from "@/components/ui/button"
import { CreditCard, LogOut, Menu, Settings, User, Network} from "lucide-react"
import Link from 'next/link'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { CanvasProvider, useCanvas } from "@/contexts/CanvasContext"
import { MobileSidebar } from "../Sidebar/MobileSidebar"
import { useSwipeable } from 'react-swipeable'
import { Grid2x2, Moon, Sun, Printer, ExternalLink, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DynamicIcon from '../Util/DynamicIcon'
import { Canvas, Section, SectionItem, TextSectionItem } from '@/types/canvas'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { CanvasSection } from "@/types/canvas-sections"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"
import { SubscriptionBadge } from "../subscription/SubscriptionBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


export function MobileHeader() {
  const { user, logout } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showLayoutEditor, setShowLayoutEditor] = useState(false)
  const router = useRouter()
  const { canvasTheme, formData, setCanvasTheme, setHoveredItemId } = useCanvas()
  const [showCompanyEditDialog, setShowCompanyEditDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const handleSignOut = async () => {
    try {   
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setIsOpen(false),
  })

  function getChildCanvases(formData: Canvas) {
    return Array.from(formData.sections.values())
      .flatMap(section => 
        section.sectionItems?.filter(item => item.canvasLink) || []
      );
  }

  function findSectionForItem(itemId: string): [string, Section] | undefined {
    return Array.from<[string, Section]>(formData!.sections.entries())
      .find(([_, section]) => 
        section.sectionItems.some((item: SectionItem) => item.id === itemId)
      );
  }

  const handleParentCanvasClick = () => {
    if (formData?.parentCanvasId) {
      localStorage.setItem('lastCanvasId', formData.parentCanvasId)
      router.push(`/canvas/${formData.parentCanvasId}`)
    }
  }

  const handleEditClick = () => {
    setEditName(formData?.name || "")
    setEditDescription(formData?.description || "")
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    // Add your save logic here
    // Example: await updateCanvas(formData.id, { name: editName, description: editDescription })
    setShowEditDialog(false)
  }

  const renderUserDropdown = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={handleEditClick}
        className="text-sm font-medium max-w-[150px] px-2"
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap block w-full text-left">
          {formData?.name || 'Untitled Canvas'}
        </span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" 
            size="icon"
            className={`relative h-8 w-8 rounded-full hover:bg-muted-foreground/10 ${
              canvasTheme === 'light'
                ? 'bg-white text-gray-700 border-gray-200'
                : 'bg-gray-950 text-gray-300 border-gray-800'
            }`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleEditClick}>
              <div className="flex flex-col">
                <span className="font-medium">{formData?.name || 'Untitled Canvas'}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {formData?.description || 'Add description'}
                </span>
              </div>
            </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowLayoutEditor(true)}>
          <Grid2x2 className="h-4 w-4 mr-2" />
          Layout Editor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/canvas/${formData?.id}/screenshot`)}>
          <Printer className="h-4 w-4 mr-2" />
          Screenshot
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCanvasTheme(canvasTheme === 'light' ? 'dark' : 'light')}>
          {canvasTheme === 'light' ? (
            <Moon className="h-4 w-4 mr-2" />
          ) : (
            <Sun className="h-4 w-4 mr-2" />
          )}
          Toggle Theme
        </DropdownMenuItem>
        {formData && (formData?.parentCanvasId || getChildCanvases(formData).length > 0) && (
          <>
            <DropdownMenuLabel>Linked Canvases</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/canvas-hierarchy?canvasId=${formData.id}`)}>
              <Network className="h-4 w-4 mr-2" />
              View Canvas Network
            </DropdownMenuItem>
            {formData.parentCanvasId && (
              <DropdownMenuItem onClick={handleParentCanvasClick}>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Parent Canvas
              </DropdownMenuItem>
            )}
            
            {formData && getChildCanvases(formData).length > 0 && (
              getChildCanvases(formData).map((item, index) => {
                const [sectionName, _] = findSectionForItem(item.id) || [];
                
                return (
                  <DropdownMenuItem 
                    key={item.id}
                    onClick={() => {
                      localStorage.setItem('lastCanvasId', item.canvasLink!.canvasId)
                      router.push(`/canvas/${item.canvasLink!.canvasId}`)
                    }}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    <div className="flex flex-col flex-1">
                      {sectionName && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <DynamicIcon 
                            name={formData.canvasType?.sections.find((section: CanvasSection) => section.name === sectionName)?.icon || 'Square'} 
                            className="h-3 w-3" 
                          /> 
                          {sectionName}
                        </span>
                      )}
                      <span className="line-clamp-1">
                        {item instanceof TextSectionItem ? item.content : `Child Canvas ${index + 1}`}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  )

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-background">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {user && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="left" 
                  className="w-[300px] p-0 [&_button[data-state=open]]:hidden"
                  {...swipeHandlers}
                >
                  <VisuallyHidden asChild>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </VisuallyHidden>
                  <CanvasProvider>
                    <MobileSidebar setShowAuthDialog={setShowAuthDialog} />
                  </CanvasProvider>
                </SheetContent>
              </Sheet>
            )}
            <Link className="flex items-center justify-center" href="#">
              <span className="text-2xl font-extrabold text-foreground">cavvy.ai</span>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {!user && (
              <>
                <Link href="/features" className="text-sm font-medium">
                  Features
                </Link>
                <Link href="/pricing" className="text-sm font-medium">
                  Pricing
                </Link>
              </>
            )}

            {user && formData ? renderUserDropdown() : 
            user? (<>
                <SubscriptionProvider>
                  <SubscriptionBadge />
                </SubscriptionProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-8 w-8 rounded-full hover:bg-muted-foreground/10"
                    >
                      <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </>
             
            ) : (
              <Button
                onClick={() => setShowAuthDialog(true)}
                variant="outline"
                className="font-extrabold"
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="top-[50%] translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle>Edit Canvas Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Canvas name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description"
                rows={3}
              />
            </div>
            <Button onClick={handleSaveEdit} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 