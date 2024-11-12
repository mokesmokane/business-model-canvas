"use client"

import * as React from "react"
import { Header } from "./Canvas/Header"
import { CanvasContent } from "./Canvas/CanvasContent"
import { Sidebar } from "./Sidebar/Sidebar"
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './auth/AuthDialog';
import { useEffect } from 'react';
import { useCanvas } from "@/contexts/CanvasContext"
import { useExpanded } from "@/contexts/ExpandedContext"

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
  
  const { isExpanded, setIsExpanded } = useExpanded()
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

  const handleExpandSidebar = React.useCallback(() => {
    setIsExpanded(true)
  }, []);

  useEffect(() => {
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
      <div className="flex h-[calc(100vh-64px)] bg-white">
        <Sidebar 
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
        openSignUp={false}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleSave}
      />
    </>
  );
}