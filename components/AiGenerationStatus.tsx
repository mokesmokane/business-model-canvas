import { useAiGeneration } from '@/contexts/AiGenerationContext';
import { Bot, CheckCircle2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AiGenerationStatusProps {
  canvasId: string;
}

export function AiGenerationStatus({ canvasId }: AiGenerationStatusProps) {
  const { generationStatus, clearStatus } = useAiGeneration();
  const status = generationStatus[canvasId];

  if (!status?.isGenerating && !status?.error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-background dark:bg-background-dark rounded-lg shadow-lg border border-border backdrop-blur-sm max-w-md z-50"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {status.error ? (
            <div className="w-8 h-8 rounded-full bg-destructive/20 dark:bg-destructive/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-destructive dark:text-destructive-dark" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary dark:text-primary-dark" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium mb-2 text-foreground dark:text-foreground-dark">
              {status.error ? 'Generation Error' : 'AI Generating Content'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 -mt-1 -mr-1"
              onClick={() => clearStatus(canvasId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {status.error ? (
            <p className="text-sm text-destructive dark:text-destructive-dark">{status.error}</p>
          ) : (
            <>
              {status.currentSection && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary dark:text-primary-dark" />
                  <span>Generating {status.currentSection}...</span>
                </div>
              )}

              <div className="space-y-1">
                {status.completedSections.map((section) => (
                  <div key={section} className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                    <CheckCircle2 className="w-4 h-4 text-primary dark:text-primary-dark" />
                    <span>{section} completed</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
} 