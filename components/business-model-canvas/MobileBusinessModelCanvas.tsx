import { useCanvas } from "@/contexts/CanvasContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import { MobileCanvasSection } from "./MobileCanvasSection";
import { MobileAIChat } from "../mobile/MobileAIChat";
import 'swiper/css';
import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const sections = [
  { key: 'keyPartners', title: 'Key Partners', icon: Building2 },
  { key: 'keyActivities', title: 'Key Activities', icon: Workflow },
  { key: 'keyResources', title: 'Key Resources', icon: Receipt },
  { key: 'valuePropositions', title: 'Value Propositions', icon: Gift },
  { key: 'customerRelationships', title: 'Customer Relationships', icon: Heart },
  { key: 'channels', title: 'Channels', icon: Truck },
  { key: 'customerSegments', title: 'Customer Segments', icon: Users2 },
  { key: 'costStructure', title: 'Cost Structure', icon: Users },
  { key: 'revenueStreams', title: 'Revenue Streams', icon: Coins },
];

export function MobileBusinessModelCanvas() {
  const { formData, canvasTheme } = useCanvas();
  const [activeIndex, setActiveIndex] = useState(0);

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
          {sections.map((section) => (
            <SwiperSlide key={section.key}>
              <MobileCanvasSection
                title={section.title}
                icon={section.icon}
                sectionKey={section.key}
                section={formData.sections.get(section.key) || { name: '', items: [], qAndAs: [] }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={`p-4 ${
        canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
      }`}>
        <TooltipProvider>
          <div className="flex justify-between px-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Tooltip key={section.key}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        index === activeIndex
                          ? `${canvasTheme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-100'}`
                          : `${canvasTheme === 'light' ? 'text-gray-400' : 'text-gray-500'}`
                      }`}
                      onClick={() => {
                        const swiper = document.querySelector('.swiper')?.swiper;
                        if (swiper) {
                          swiper.slideTo(index);
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
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
                    {section.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      <MobileAIChat />
    </div>
  );
}