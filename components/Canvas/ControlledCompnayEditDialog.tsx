// Create new file: components/Canvas/ControlledCompanyEditDialog.tsx
import { CompanyEditDialog } from './CompanyEditDialog'

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ControlledCompanyEditDialog({ open, onOpenChange }: Props) {
  return <CompanyEditDialog controlledOpen={open} onControlledOpenChange={onOpenChange} />
}