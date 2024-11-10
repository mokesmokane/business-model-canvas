import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900">
      <SiteHeader />
      <BusinessModelCanvasComponent />
    </div>
  )
}