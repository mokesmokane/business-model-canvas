import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <SiteHeader />
      <div className="flex-1">
        <BusinessModelCanvasComponent />
      </div>
    </div>
  )
}