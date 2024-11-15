import { useCanvas } from "@/contexts/CanvasContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import { MobileCanvasSection } from "./MobileCanvasSection";
import 'swiper/css';
import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins } from "lucide-react";
import { useState } from "react";

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
    <div className={`flex flex-col min-h-screen ${
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
        <div className="flex justify-center gap-1">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? `w-4 ${canvasTheme === 'light' ? 'bg-primary' : 'bg-primary'}`
                  : `w-1 ${canvasTheme === 'light' ? 'bg-muted' : 'bg-gray-800'}`
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}