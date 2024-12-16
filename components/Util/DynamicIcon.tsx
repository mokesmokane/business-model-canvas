import { icons, LayoutDashboard } from 'lucide-react';

const DynamicIcon = ({name, className, color, size}: {name: string, className?: string, color?: string, size?: number}) => {
  const LucideIcon = icons[name as keyof typeof icons];

  if (!LucideIcon) {
    // console.warn(`Icon "${name}" not found`);
    //if its a single letter, try and see if its an emoji
    if (name && name.length === 1 && name.match(/^[a-zA-Z]$/)) {
      return <span className={className}>{name}</span>;
    }
    return <LayoutDashboard className={className} color={color} size={size}/>;
  }

  return <LucideIcon className={className} color={color} size={size}/>;
};

export default DynamicIcon;