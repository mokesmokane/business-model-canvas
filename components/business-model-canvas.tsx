"use client"

import * as React from "react"
import { Canvas } from "./Canvas/Canvas"
import { Sidebar } from "./Sidebar/Sidebar"
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './auth/AuthDialog';
import { useExpanded } from "@/contexts/ExpandedContext"
import { useCanvas } from "@/contexts/CanvasContext";
import { UserCanvasSelector } from "./UserCanvasSelector";

export function BusinessModelCanvasComponent() {
  const { user } = useAuth();
  const { currentCanvas } = useCanvas();
  
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
          {currentCanvas ? (
            <div className="flex h-full bg-white">
              <Sidebar setShowAuthDialog={setShowAuthDialog} />
              <Canvas onExpandSidebar={handleExpandSidebar} />  
          </div>
          ) :(
            <div className="flex h-full bg-white">
              <Sidebar setShowAuthDialog={setShowAuthDialog} />
              <UserCanvasSelector />
            </div>
          )}
      <AuthDialog 
        isOpen={showAuthDialog}
        openSignUp={false}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleSave}
        />
    </>
  );
}