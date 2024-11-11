import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"
import { ContextProvider } from "@/contexts/ExpandedContext"

export default function Page() {
  return (
    <ContextProvider>
      <div className="min-h-screen flex flex-col bg-gray-900">
      <SiteHeader />
      <div className="flex-1">
        <BusinessModelCanvasComponent />
        </div>
      </div>
    </ContextProvider>
  )
}