import { useCanvas } from "@/contexts/CanvasContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useEffect, useState } from "react";
import { CanvasSection } from "../Canvas/CanvasSection";
import { Loader2 } from "lucide-react";

export function MobileBusinessModelCanvas({ canvasId }: { canvasId: string }) {
  const { formData, canvasTheme, loadCanvas } = useCanvas();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (canvasId && typeof canvasId === 'string') {
      setIsLoading(true)
      loadCanvas(canvasId)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [canvasId, loadCanvas])
  if (!formData) return null;
  if (isLoading) return <div className="flex justify-center items-center h-[calc(100vh-64px)]"><Loader2 className="animate-spin" /></div>;
  
  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] ${
      canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
    }`}>
      <div className="flex-1 overflow-hidden pb-16">
        <Swiper
          spaceBetween={30}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-full"
        >
          {Array.from(formData.sections.entries()).map(([key, section]) => {
            const sectionConfig = formData.canvasType.sections.find(s => s.name === section.name);
            if (!sectionConfig) return null;
            const sectionData = formData.sections.get(key);
            if (!sectionData) return null;
            return (
              <SwiperSlide key={key}>
                <CanvasSection
                  onChange={() => {}}
                  placeholder={sectionConfig.placeholder.replace(/([.!?]) /g, '$1\n\n')}
                  title={section.name}
                  icon={sectionConfig?.icon || ''}
                  sectionKey={key}
                  section={sectionData}
                /> 
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className={`fixed bottom-16 left-0 right-0 flex justify-center gap-2 py-2 z-10 bg-transparent`}>
        {Array.from(formData.sections.entries()).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === activeIndex
                ? `${canvasTheme === 'light' ? 'bg-gray-900' : 'bg-gray-100'}`
                : `${canvasTheme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`
            }`}
          />
        ))}
      </div>
    </div>
  );
}