"use client"

import * as React from "react"
import { Header } from "./Header/Header"
import { CanvasContent } from "./Canvas/CanvasContent"
import { Sidebar } from "./Sidebar/Sidebar"
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './auth/AuthDialog';
import { useEffect } from 'react';
import { useCanvas } from "@/contexts/CanvasContext"

interface BusinessModelCanvas {
  companyName: string;
  companyDescription: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  keyPartners: string;
  keyActivities: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  keyResources: string;
  costStructure: string;
  revenueStreams: string;
}

export function BusinessModelCanvasComponent() {
  const { user } = useAuth();
  const {
    formData,
    status,
    error,
    loadCanvas,
    updateField,
    resetForm
  } = useCanvas();
  
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

  const handleExpandSidebar = React.useCallback(() => {
    setIsDrawerExpanded(true);
  }, []);

  useEffect(() => {
    // If there's a canvas ID in the URL or stored somewhere, load it
    const storedCanvasId = localStorage.getItem('lastCanvasId');
    if (storedCanvasId) {
      loadCanvas(storedCanvasId);
    }
  }, [loadCanvas]);


  const handleSave = React.useCallback(async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
  }, [user]);

  return (
    <>
      <div className="flex h-screen bg-white dark:bg-gray-950">
        <Sidebar 
          isExpanded={isDrawerExpanded}
          onToggle={() => setIsDrawerExpanded(!isDrawerExpanded)}
          setShowAuthDialog={setShowAuthDialog}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <CanvasContent 
            onExpandSidebar={handleExpandSidebar}
          />
        </div>
      </div>
      <AuthDialog 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleSave}
      />
    </>
  );
}