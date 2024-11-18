"use client"

import * as React from "react"
import { Canvas } from "./Canvas/Canvas"
import { Sidebar } from "./Sidebar/Sidebar"
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './auth/AuthDialog';
import { useExpanded } from "@/contexts/ExpandedContext"
import { CanvasProvider, useCanvas } from "@/contexts/CanvasContext";
import { CanvasTypeSelector } from "./CanvasTypeSelector";

export function BusinessModelCanvasComponent() {
  const { user } = useAuth();
  const { currentCanvas, userCanvases } = useCanvas();
  
  const { setIsExpanded } = useExpanded()
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);


  const handleExpandSidebar = React.useCallback(() => {
    setIsExpanded(true)
  }, []);
  
  const handleSave = React.useCallback(async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
  }, [user]);

  return (
    <>
        <div className="flex h-[calc(100vh-64px)] bg-white">
          <Sidebar setShowAuthDialog={setShowAuthDialog} />
          {userCanvases && userCanvases.length > 0 && currentCanvas ? (
            <Canvas onExpandSidebar={handleExpandSidebar} />
          ) : (
            <CanvasTypeSelector />
          )}
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