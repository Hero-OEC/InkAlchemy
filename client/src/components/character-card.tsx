import { Crown, Sword, Shield, Users, Zap, Heart, Skull } from "lucide-react";

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
  const config = CHARACTER_TYPE_CONFIG[type] || CHARACTER_TYPE_CONFIG.supporting;
  const Icon = config.icon;
  
  // Extract text from Editor.js JSON or use as plain text
  const getDescriptionText = (desc: string) => {
    try {
      // Try to parse as Editor.js JSON
      const parsedData = JSON.parse(desc);
      if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
        // Extract text from all blocks and join them
        const textContent = parsedData.blocks
          .map((block: any) => {
            if (block.type === 'paragraph' && block.data?.text) {
              // Remove HTML tags from paragraph text
              return block.data.text.replace(/<[^>]*>/g, '');
            }
            if (block.type === 'header' && block.data?.text) {
              return block.data.text.replace(/<[^>]*>/g, '');
            }
            return '';
          })
          .filter(Boolean)
          .join(' ');
        return textContent || 'No description available';
      }
    } catch {
      // If parsing fails, treat as plain text
      return desc || 'No description available';
    }
    return desc || 'No description available';
  };

  const fullDescription = getDescriptionText(description);
  const truncatedDescription = fullDescription.length > 80 
    ? fullDescription.substring(0, 80) + "..."
    : fullDescription;

  // Format full name with prefix and suffix
  const fullName = [prefix, name, suffix].filter(Boolean).join(" ");

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-brand-100 border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Character Image - 1:1 aspect ratio */}
      <div className="mb-3">
        <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-600">
              <Users size={48} />
            </div>
          )}
        </div>
      </div>

      {/* Character Name with Icon */}
      <div className="mb-2 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-brand-200">
          <Icon size={24} className="text-brand-700" />
        </div>
        <h3 className="text-brand-950 font-semibold text-lg leading-tight">
          {prefix && <span className="text-sm text-brand-600 font-normal">{prefix} </span>}
          {name}
          {suffix && <span className="text-sm text-brand-600 font-normal"> {suffix}</span>}
        </h3>
      </div>

      {/* Character Type Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Separator Line */}
      <div className="border-t border-brand-200 pt-3">
        {/* Dates Section */}
        <div className="flex justify-between text-xs text-brand-600">
          {createdAt && (
            <div>
              <span className="font-medium">Created:</span> {formatDate(createdAt)}
            </div>
          )}
          {lastEditedAt && (
            <div>
              <span className="font-medium">Last edited:</span> {formatDate(lastEditedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}