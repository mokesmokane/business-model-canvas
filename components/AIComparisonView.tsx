import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface AIComparisonViewProps {
  original: string;
  suggestion: string;
  onAccept: () => void;
  onReject: () => void;
  canvasTheme: 'light' | 'dark';
}

export const AIComparisonView: React.FC<AIComparisonViewProps> = ({
  original,
  suggestion,
  onAccept,
  onReject,
  canvasTheme,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-4 border-t pt-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Original</h4>
          <div className={`text-sm whitespace-pre-wrap p-3 rounded-md ${
            canvasTheme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
          }`}>
            <ReactMarkdown>{original}</ReactMarkdown>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">AI Suggestion</h4>
          <div className={`text-sm whitespace-pre-wrap p-3 rounded-md ${
            canvasTheme === 'light' ? 'bg-blue-50' : 'bg-blue-900'
          }`}>
            <ReactMarkdown>{suggestion}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
      </div>
    </motion.div>
  );
};

