import { MainContent } from "@/components/MainContent"
import { ContextProvider } from "@/contexts/ExpandedContext"

export default function Page() {
  return (
    <ContextProvider>
      <MainContent />
    </ContextProvider>
  )
}