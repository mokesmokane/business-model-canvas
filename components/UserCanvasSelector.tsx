'use client'

import { useCanvas } from "@/contexts/CanvasContext"
import { useRef, useEffect, useState } from "react"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { CanvasType } from "@/types/canvas-sections"
import { TAG_INFO } from "@/src/constants/tags"
import useEmblaCarousel from 'embla-carousel-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CanvasTypeSelector } from "./CanvasTypeSelector"
import { ExistingCanvases } from "./Canvas/ExistingCanvases"
import { CanvasTypeCard } from "./Canvas/CanvasTypeCard"
import { Canvas } from "@/types/canvas"

export function UserCanvasSelector() {
  const { userCanvases, loadCanvas } = useCanvas()
  const { getCanvasTypes } = useCanvasTypes()
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedType, setSelectedType] = useState<CanvasType | null>(null)
  const [newCanvasRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  })
  const [customCanvasRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  })

  const tagCarousels = TAG_INFO.reduce((acc, tag) => {
    const [ref] = useEmblaCarousel({
      dragFree: true,
      containScroll: "trimSnaps"
    });
    acc[tag.name] = { ref };
    return acc;
  }, {} as Record<string, { ref: ReturnType<typeof useEmblaCarousel>[0] }>);

  useEffect(() => {
    getCanvasTypes().then(setCanvasTypes)
  }, [getCanvasTypes])

  const handleCanvasSelect = async (canvasId: string) => {
    await loadCanvas(canvasId)
    localStorage.setItem('lastCanvasId', canvasId)
  }

  const handleNewCanvasSelect = (type: CanvasType) => {
    setSelectedType(type)
    setShowTypeSelector(true)
  };

  const filteredCanvasTypes = Object.entries(canvasTypes).filter(([_, type]) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCanvasTypesByTag = (tagName: string) => {
    return Object.entries(canvasTypes).filter(([_, type]) => type.tags?.includes(tagName));
  }

  const getCustomCanvasTypes = () => {
    return Object.entries(canvasTypes).filter(([_, type]) => type.isCustom);
  }

  return (
    <>
      <div className="flex flex-col w-full h-screen overflow-y-auto bg-background">
        <div className="p-8 space-y-12">
          <ExistingCanvases 
            userCanvases={userCanvases as Canvas[]}
            onCanvasSelect={handleCanvasSelect}
          />

          

          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold tracking-tight mr-4">Create New Canvas</h2>
              <input
                type="text"
                placeholder="Search canvas types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md p-2 max-w-xs"
              />
            </div>
            <div className="overflow-hidden" ref={newCanvasRef}>
              <div className="flex gap-6 pl-6">
                {filteredCanvasTypes.map(([key, type]) => (
                  <CanvasTypeCard
                    key={key}
                    type={type}
                    onClick={handleNewCanvasSelect}
                  />
                ))}
              </div>
            </div>
          </div>

          {getCustomCanvasTypes().length > 0 && (
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Custom Canvas Types</h2>
              <div className="overflow-hidden" ref={customCanvasRef}>
                <div className="flex gap-6 pl-6">
                  {getCustomCanvasTypes().map(([key, type]) => (
                    <CanvasTypeCard
                      key={key}
                      type={type}
                      onClick={handleNewCanvasSelect}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {TAG_INFO.map(tag => {
            const canvasTypesForTag = getCanvasTypesByTag(tag.name);
            if (canvasTypesForTag.length === 0) return null;

            return (
              <div key={tag.name}>
                <h2 className="text-3xl font-bold tracking-tight mb-4">{`${tag.name} Canvases`}</h2>
                <div className="overflow-hidden" ref={tagCarousels[tag.name].ref}>
                  <div className="flex gap-6 pl-6">
                    {canvasTypesForTag.map(([key, type]) => (
                      <CanvasTypeCard
                        key={key}
                        type={type}
                        onClick={handleNewCanvasSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={showTypeSelector} onOpenChange={setShowTypeSelector}>
        <DialogContent className="!max-w-[80vw] !w-[80vw] sm:!max-w-[80vw] h-[85vh] overflow-hidden rounded-md border">
          <DialogTitle></DialogTitle>
          <CanvasTypeSelector selectedType={selectedType} />
        </DialogContent>
      </Dialog>
    </>
  )
}