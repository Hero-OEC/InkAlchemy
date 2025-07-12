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
  createdAt,
  lastEditedAt,
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
    <div className={`bg-brand-100 border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}>
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
        <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
          <Icon size={16} className="text-white" />
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

      {/* Character Description */}
      <p className="text-brand-700 text-sm leading-relaxed mb-3">
        {truncatedDescription}
      </p>

      {/* Separator Line */}
      <div className="border-t border-brand-200 pt-3">
        {/* Dates Section */}
        <div className="flex flex-col gap-1 text-xs text-brand-600">
          {createdAt && (
            <div>
              <span className="font-medium">Created:</span> {createdAt.toLocaleDateString()}
            </div>
          )}
          {lastEditedAt && (
            <div>
              <span className="font-medium">Last edited:</span> {lastEditedAt.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}