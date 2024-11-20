import { icons } from 'lucide-react';

const DynamicIcon = ({name, className, color, size}: {name: string, className?: string, color?: string, size?: number}) => {
  const LucideIcon = icons[name as keyof typeof icons];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <LucideIcon className={className} color={color} size={size}/>;
};

export default DynamicIcon;