import { Crown, Sword, Shield, Users, Zap, Heart, Skull } from "lucide-react";

export interface CharacterCardProps {
  id: number;
  name: string;
  prefix?: string;
  suffix?: string;
  type: "protagonist" | "antagonist" | "supporting" | "ally" | "neutral" | "love-interest" | "villain";
  description: string;
  imageUrl?: string;
  className?: string;
}

const CHARACTER_TYPE_CONFIG = {
  protagonist: {
    icon: Crown,
    label: "Protagonist",
    bgColor: "bg-brand-400",
    textColor: "text-white",
    iconColor: "text-brand-400"
  },
  antagonist: {
    icon: Sword,
    label: "Antagonist", 
    bgColor: "bg-red-500",
    textColor: "text-white",
    iconColor: "text-red-500"
  },
  villain: {
    icon: Skull,
    label: "Villain",
    bgColor: "bg-red-600", 
    textColor: "text-white",
    iconColor: "text-red-600"
  },
  supporting: {
    icon: Users,
    label: "Supporting",
    bgColor: "bg-brand-600",
    textColor: "text-white", 
    iconColor: "text-brand-600"
  },
  ally: {
    icon: Shield,
    label: "Ally",
    bgColor: "bg-green-500",
    textColor: "text-white",
    iconColor: "text-green-500"
  },
  neutral: {
    icon: Zap,
    label: "Neutral",
    bgColor: "bg-gray-500",
    textColor: "text-white",
    iconColor: "text-gray-500"
  },
  "love-interest": {
    icon: Heart,
    label: "Love Interest",
    bgColor: "bg-pink-500",
    textColor: "text-white",
    iconColor: "text-pink-500"
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
  className = "" 
}: CharacterCardProps) {
  const config = CHARACTER_TYPE_CONFIG[type];
  const Icon = config.icon;
  
  // Truncate description to about 80 characters
  const truncatedDescription = description.length > 80 
    ? description.substring(0, 80) + "..."
    : description;

  // Format full name with prefix and suffix
  const fullName = [prefix, name, suffix].filter(Boolean).join(" ");

  return (
    <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}>
      {/* Character Image - 1:1 aspect ratio */}
      <div className="relative mb-3">
        <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden">
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
        
        {/* Character Type Icon - Positioned over image */}
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 border-2 border-border shadow-sm">
          <Icon size={20} className={config.iconColor} />
        </div>
      </div>

      {/* Character Name */}
      <div className="mb-2">
        <h3 className="text-brand-950 font-semibold text-lg leading-tight">
          {fullName}
        </h3>
      </div>

      {/* Character Type Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          <Icon size={12} className="mr-1" />
          {config.label}
        </span>
      </div>

      {/* Character Description */}
      <p className="text-brand-700 text-sm leading-relaxed">
        {truncatedDescription}
      </p>
    </div>
  );
}