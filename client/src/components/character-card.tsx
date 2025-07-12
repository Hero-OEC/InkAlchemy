import { Crown, Sword, Shield, Users, Zap, Heart, Skull, Edit, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button-variations";

export interface CharacterCardProps {
  id: number;
  name: string;
  prefix?: string;
  suffix?: string;
  type: "protagonist" | "antagonist" | "supporting" | "ally" | "neutral" | "love-interest" | "villain";
  description: string;
  imageUrl?: string;
  createdAt?: Date;
  lastEditedAt?: Date;
  className?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CHARACTER_TYPE_CONFIG = {
  protagonist: {
    icon: Crown,
    label: "Protagonist",
    bgColor: "bg-brand-500",
    textColor: "text-white"
  },
  antagonist: {
    icon: Sword,
    label: "Antagonist", 
    bgColor: "bg-brand-400",
    textColor: "text-white"
  },
  villain: {
    icon: Skull,
    label: "Villain",
    bgColor: "bg-brand-700", 
    textColor: "text-white"
  },
  supporting: {
    icon: Users,
    label: "Supporting",
    bgColor: "bg-brand-300",
    textColor: "text-brand-900"
  },
  ally: {
    icon: Shield,
    label: "Ally",
    bgColor: "bg-brand-600",
    textColor: "text-white"
  },
  neutral: {
    icon: Zap,
    label: "Neutral",
    bgColor: "bg-brand-800",
    textColor: "text-white"
  },
  "love-interest": {
    icon: Heart,
    label: "Love Interest",
    bgColor: "bg-brand-900",
    textColor: "text-white"
  }
};

export function CharacterCard({ 
  id, 
  name, 
  prefix, 
  suffix, 
  type, 
  description, 
  imageUrl,
  createdAt,
  lastEditedAt,
  className = "",
  onClick,
  onEdit,
  onDelete
}: CharacterCardProps) {
  const config = CHARACTER_TYPE_CONFIG[type];
  const Icon = config.icon;
  
  // Truncate description to about 80 characters
  const truncatedDescription = description.length > 80 
    ? description.substring(0, 80) + "..."
    : description;

  // Format full name with prefix and suffix
  const fullName = [prefix, name, suffix].filter(Boolean).join(" ");

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div 
      className={cn(
        "bg-white border border-brand-200 rounded-xl p-4 hover:shadow-lg hover:border-brand-300 transition-all duration-200 cursor-pointer group relative",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Edit Button - Shows on Hover */}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 bg-white hover:bg-brand-50 border border-brand-200"
          onClick={handleEditClick}
        >
          <Edit className="w-4 h-4 text-brand-600" />
        </Button>
      )}

      {/* Character Image - 1:1 aspect ratio */}
      <div className="mb-4">
        <div className="aspect-square w-full bg-brand-50 rounded-lg overflow-hidden border border-brand-200">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-400">
              <Users size={48} />
            </div>
          )}
        </div>
      </div>

      {/* Character Name with Icon */}
      <div className="mb-3 flex items-start gap-2">
        <div className={cn("p-1.5 rounded-lg flex-shrink-0", config.bgColor)}>
          <Icon size={16} className={config.textColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-brand-900 font-semibold text-lg leading-tight">
            {prefix && <span className="text-sm text-brand-600 font-normal">{prefix} </span>}
            <span className="break-words">{name}</span>
            {suffix && <span className="text-sm text-brand-600 font-normal"> {suffix}</span>}
          </h3>
        </div>
      </div>

      {/* Character Type Badge */}
      <div className="mb-3">
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
          config.bgColor,
          config.textColor
        )}>
          {config.label}
        </span>
      </div>

      {/* Character Description */}
      <p className="text-brand-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {truncatedDescription}
      </p>

      {/* Dates Section */}
      <div className="border-t border-brand-100 pt-3">
        <div className="flex justify-between text-xs text-brand-500">
          {createdAt && (
            <div>
              <span className="font-medium">Created:</span> {new Date(createdAt).toLocaleDateString()}
            </div>
          )}
          {lastEditedAt && (
            <div>
              <span className="font-medium">Edited:</span> {new Date(lastEditedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}