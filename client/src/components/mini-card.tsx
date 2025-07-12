import { LucideIcon, Users, MapPin, Sword, Zap, FileText, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MiniCardProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  badgeVariant?: "stage" | "type" | "status" | "custom";
  badgeColor?: string; // For custom badge colors using brand palette
  onClick?: () => void;
  className?: string;
}

export function MiniCard({ 
  icon: IconComponent, 
  title, 
  badge, 
  badgeVariant = "type",
  badgeColor,
  onClick, 
  className 
}: MiniCardProps) {
  const getBadgeStyles = () => {
    if (badgeVariant === "custom" && badgeColor) {
      return badgeColor;
    }
    
    switch (badgeVariant) {
      case "stage":
        return "bg-brand-100 border-brand-300 text-brand-800";
      case "type":
        return "bg-secondary border-border text-secondary-foreground";
      case "status":
        return "bg-brand-200 border-brand-400 text-brand-900";
      default:
        return "bg-secondary border-border text-secondary-foreground";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-brand-200 bg-brand-100 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-brand-200 hover:border-brand-300",
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent className="w-5 h-5 text-brand-700" />
      </div>
      
      {/* Content Container */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h4 className="text-sm font-medium text-brand-950 truncate">
          {title}
        </h4>
        
        {/* Badge */}
        {badge && (
          <div className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1",
            getBadgeStyles()
          )}>
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}

// Demo component for showcase
export function MiniCardDemo() {
  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Mini Card Variations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <MiniCard
          icon={Users}
          title="Aria Blackthorn"
          badge="Protagonist"
          badgeVariant="type"
          onClick={() => console.log("Character clicked")}
        />
        
        <MiniCard
          icon={MapPin}
          title="Silver Falls Academy"
          badge="School"
          badgeVariant="type"
        />
        
        <MiniCard
          icon={Sword}
          title="The Great Battle"
          badge="Complete"
          badgeVariant="stage"
        />
        
        <MiniCard
          icon={Zap}
          title="Ancient Magic System"
          badge="Elemental"
          badgeVariant="custom"
          badgeColor="bg-brand-300 border-brand-500 text-brand-900"
        />
        
        <MiniCard
          icon={FileText}
          title="Quick Note About Plot"
          badge="Important"
          badgeVariant="status"
        />
        
        <MiniCard
          icon={Crown}
          title="Very Long Title That Should Truncate Properly"
          badge="Long Badge Name"
          badgeVariant="type"
        />
      </div>
    </div>
  );
}