import { useCanvas } from "@/contexts/CanvasContext";
import { Swiper, SwiperSlide } from 'swiper/react';
// import { MobileCanvasSection } from "../mobile/MobileCanvasSection";
import { MobileAIChat } from "./MobileAIChat";
import 'swiper/css';
import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins, Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { CanvasSection } from "../Canvas/CanvasSection";
import DynamicIcon from "../Util/DynamicIcon";

export function MobileBusinessModelCanvas() {
  const { formData, canvasTheme } = useCanvas();
  const [activeIndex, setActiveIndex] = useState(0);
  if (!formData) return null;

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] ${
      canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
    }`}>
      <div className="flex-1 w-full pt-4">
        <Swiper
          spaceBetween={30}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-full"
        >
          {Array.from(formData.sections.entries()).map(([key, section]) => {
            const sectionConfig = formData.canvasType.sections.find(s => s.name === section.name);
            return (
              <SwiperSlide key={key}>
                <CanvasSection
                  onChange={() => {}}
                  placeholder={section.name}
                  title={section.name}
                  icon={sectionConfig?.icon || ''}
                  sectionKey={key}
                  section={formData.sections.get(key) || { name: '', items: [], qAndAs: [] }}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className={`${
        canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
      }`}>
        <TooltipProvider>
          <div className="flex justify-between px-4 py-2">
          {Array.from(formData.sections.entries()).map(([key, section], index) => {
            const sectionConfig = formData.canvasType.sections.find(s => s.name === section.name);
              const icon = sectionConfig?.icon;
              return (
                <Tooltip key={section.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`mt-2 h-8 w-8 ${
                        index === activeIndex
                          ? `${canvasTheme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-100'}`
                          : `${canvasTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`
                      }`}
                      onClick={() => {
                        const swiperEl = document.querySelector('.swiper') as HTMLElement & { swiper: any };
                        if (swiperEl) {
                          swiperEl.swiper.slideTo(index);
                        }
                      }}
                    >
                      <DynamicIcon name={icon || ''} className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className={`${
                      canvasTheme === 'light' 
                        ? 'bg-gray-100 text-gray-900 border-gray-200' 
                        : 'bg-gray-900 text-gray-100 border-gray-800'
                    }`}
                  >
                    {section.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <MobileAIChat />
          </div>

        </TooltipProvider>
        
        <div className="px-4 py-1">
        </div>
      </div>
    </div>
  );
}