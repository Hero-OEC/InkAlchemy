import { LucideIcon, MapPin, Sparkles, BookOpen, StickyNote, FolderOpen } from "lucide-react";
import { cn } from "../lib/utils";

export interface ContentCardProps {
  id: number;
  title: string;
  type: "location" | "magic" | "lore" | "note" | "project";
  subtype: string; // e.g., "city", "forest", "elemental", "history", "quick-note", etc.
  description: string;
  icon: LucideIcon;
  createdAt?: Date;
  lastEditedAt?: Date;
  className?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Type-specific styling configurations using brand color scheme
const typeConfigs = {
  location: {
    iconBg: "bg-brand-600",
    badgeBg: "bg-brand-200",
    badgeText: "text-brand-800",
    borderColor: "border-brand-200",
  },
  magic: {
    iconBg: "bg-brand-700", 
    badgeBg: "bg-brand-200",
    badgeText: "text-brand-900",
    borderColor: "border-brand-300",
  },
  lore: {
    iconBg: "bg-brand-500",
    badgeBg: "bg-brand-100",
    badgeText: "text-brand-700",
    borderColor: "border-brand-200",
  },
  note: {
    iconBg: "bg-brand-400",
    badgeBg: "bg-brand-100",
    badgeText: "text-brand-800", 
    borderColor: "border-brand-200",
  },
  project: {
    iconBg: "bg-brand-800",
    badgeBg: "bg-brand-200",
    badgeText: "text-brand-900",
    borderColor: "border-brand-300",
  },
};

export function ContentCard({ 
  id,
  title,
  type,
  subtype,
  description,
  icon: Icon,
  createdAt,
  lastEditedAt,
  className,
  onClick,
  onEdit,
  onDelete,
}: ContentCardProps) {
  const config = typeConfigs[type];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className={cn(
        "bg-brand-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-brand-300 cursor-pointer",
        config.borderColor,
        className
      )}
      onClick={onClick}
    >
      {/* Header with Icon, Title, and Badge */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            config.iconBg
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-brand-950 truncate">
              {title}
            </h3>
          </div>
        </div>

        {/* Subtype Badge - positioned under title */}
        <div className="ml-[52px]">
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
            config.badgeBg,
            config.badgeText
          )}>
            {subtype}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm font-normal text-brand-700 leading-relaxed mb-4 line-clamp-3">
        {description}
      </p>

      {/* Metadata Footer */}
      <div className="border-t border-brand-200 pt-3">
        <div className="flex justify-between text-xs font-light text-brand-600">
          <span>
            <span className="font-medium">Created:</span>{" "}
            {createdAt ? formatDate(createdAt) : "Unknown"}
          </span>
          <span>
            <span className="font-medium">Edited:</span>{" "}
            {lastEditedAt ? formatDate(lastEditedAt) : "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Demo component showcasing different content types
export function ContentCardDemo() {
  const sampleCards = [
    {
      id: 1,
      title: "Whispering Woods",
      type: "location" as const,
      subtype: "forest",
      description: "A mysterious forest where the trees seem to whisper ancient secrets to those brave enough to listen. Strange lights dance between the branches at night.",
      createdAt: new Date(2024, 0, 15),
      lastEditedAt: new Date(2024, 0, 20),
    },
    {
      id: 2, 
      title: "Elemental Binding",
      type: "magic" as const,
      subtype: "elemental",
      description: "The art of forming contracts with elemental spirits, allowing the caster to channel their power. Requires great mental fortitude and respect for nature.",
      createdAt: new Date(2024, 0, 18),
      lastEditedAt: new Date(2024, 0, 22),
    },
    {
      id: 3,
      title: "The Great Sundering", 
      type: "lore" as const,
      subtype: "history",
      description: "A cataclysmic event that split the realm into floating islands, forever changing the world's geography and the way magic flows through it.",
      createdAt: new Date(2024, 0, 10),
      lastEditedAt: new Date(2024, 0, 25),
    },
    {
      id: 4,
      title: "Character Development Ideas",
      type: "note" as const, 
      subtype: "quick-note",
      description: "Remember to explore the protagonist's fear of heights - could be crucial for the floating city scenes. Also consider their relationship with their mentor.",
      createdAt: new Date(2024, 0, 22),
      lastEditedAt: new Date(2024, 0, 23),
    },
    {
      id: 5,
      title: "The Shattered Realm",
      type: "project" as const,
      subtype: "fantasy",
      description: "An epic fantasy world where floating islands drift through endless skies, connected by bridges of hardened cloud and magical currents.",
      createdAt: new Date(2024, 0, 5),
      lastEditedAt: new Date(2024, 0, 25),
    },
  ];

  const iconMap = {
    location: MapPin,
    magic: Sparkles, 
    lore: BookOpen,
    note: StickyNote,
    project: FolderOpen,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Content Card Variations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleCards.map((card) => (
            <ContentCard
              key={card.id}
              {...card}
              icon={iconMap[card.type]}
              onClick={() => console.log(`Clicked ${card.title}`)}
            />
          ))}
        </div>
      </div>

      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <h4 className="text-md font-medium text-brand-900 mb-3">Design Features</h4>
        <ul className="text-sm text-brand-700 space-y-2">
          <li>• <strong>Type-specific colors:</strong> Each content type has unique icon and badge colors</li>
          <li>• <strong>Consistent layout:</strong> Icon + title, badge, description, metadata structure</li>
          <li>• <strong>Cairo typography:</strong> Proper font weights for hierarchy and readability</li>
          <li>• <strong>Hover effects:</strong> Subtle shadow and border color changes on interaction</li>
          <li>• <strong>Responsive grid:</strong> Adapts from 1 to 3 columns based on screen size</li>
          <li>• <strong>Truncation:</strong> Long titles and descriptions handle overflow gracefully</li>
        </ul>
      </div>
    </div>
  );
}