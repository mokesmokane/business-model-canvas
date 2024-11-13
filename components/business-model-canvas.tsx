"use client"

import * as React from "react"
import { Canvas } from "./Canvas/Canvas"
import { Sidebar } from "./Sidebar/Sidebar"
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './auth/AuthDialog';
import { useExpanded } from "@/contexts/ExpandedContext"
import { CanvasProvider } from "@/contexts/CanvasContext";

export function BusinessModelCanvasComponent() {
  const { user } = useAuth();
  
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
        <CanvasProvider>
      <div className="flex h-[calc(100vh-64px)] bg-white">
        <Sidebar 
          setShowAuthDialog={setShowAuthDialog}
        />
          <Canvas onExpandSidebar={handleExpandSidebar} />
      </div>
      </CanvasProvider>
      <AuthDialog 
        isOpen={showAuthDialog}
        openSignUp={false}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleSave}
      />
    </>
  );
}