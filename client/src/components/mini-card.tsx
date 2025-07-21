import { LucideIcon, Users, MapPin, Sword, Zap, FileText, Crown, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button-variations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface MiniCardProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  badgeVariant?: "stage" | "type" | "status" | "custom";
  badgeColor?: string; // For custom badge colors using brand palette
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: "default" | "editable";
  className?: string;
}

export function MiniCard({ 
  icon: IconComponent, 
  title, 
  badge, 
  badgeVariant = "type",
  badgeColor,
  onClick, 
  onEdit,
  onDelete,
  variant = "default",
  className 
}: MiniCardProps) {
  const getBadgeStyles = () => {
    if (badgeVariant === "custom" && badgeColor) {
      return badgeColor;
    }
    
    switch (badgeVariant) {
      case "stage":
        return "bg-brand-500 text-white";
      case "type":
        return "bg-brand-400 text-white";
      case "status":
        return "bg-brand-600 text-white";
      default:
        return "bg-brand-400 text-white";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-brand-200 bg-brand-100 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-brand-200 hover:border-brand-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        variant === "editable" && "justify-between",
        className
      )}
      onClick={variant === "default" ? onClick : undefined}
    >
      {/* Main Content */}
      <div className="flex items-center gap-3 flex-1 min-w-0" onClick={variant === "editable" ? onClick : undefined}>
        {/* Icon */}
        <div className="flex-shrink-0 p-1.5 rounded-lg bg-brand-200">
          <IconComponent className="w-6 h-6 text-brand-700" />
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
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1",
              getBadgeStyles()
            )}>
              {badge}
            </div>
          )}
        </div>
      </div>

      {/* Three-dot dropdown menu for Editable Variant */}
      {variant === "editable" && (onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-brand-500 hover:text-brand-700 flex-shrink-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onEdit && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
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