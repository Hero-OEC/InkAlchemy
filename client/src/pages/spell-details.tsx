
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { ArrowLeft, Wand2, Sparkles, Zap, Scroll, Crown, Shield, Edit, Brain } from "lucide-react";
import type { Project, Spell, MagicSystem } from "@shared/schema";

// Icon configuration for spell levels
const SPELL_LEVEL_CONFIG = {
  novice: {
    icon: Wand2,
    bgColor: "bg-brand-300",
    textColor: "text-brand-900"
  },
  apprentice: {
    icon: Sparkles,
    bgColor: "bg-brand-400",
    textColor: "text-white"
  },
  adept: {
    icon: Scroll,
    bgColor: "bg-brand-500",
    textColor: "text-white"
  },
  expert: {
    icon: Crown,
    bgColor: "bg-brand-600",
    textColor: "text-white"
  },
  master: {
    icon: Shield,
    bgColor: "bg-brand-700",
    textColor: "text-white"
  }
};

// Icon configuration for ability levels
const ABILITY_LEVEL_CONFIG = {
  novice: {
    icon: Zap,
    bgColor: "bg-brand-300",
    textColor: "text-brand-900"
  },
  apprentice: {
    icon: Sparkles,
    bgColor: "bg-brand-400",
    textColor: "text-white"
  },
  adept: {
    icon: Brain,
    bgColor: "bg-brand-500",
    textColor: "text-white"
  },
  expert: {
    icon: Crown,
    bgColor: "bg-brand-600",
    textColor: "text-white"
  },
  master: {
    icon: Shield,
    bgColor: "bg-brand-700",
    textColor: "text-white"
  }
};

const getLevelIcon = (level: string, systemType: string) => {
  const config = systemType === "power" ? ABILITY_LEVEL_CONFIG : SPELL_LEVEL_CONFIG;
  const levelConfig = config[level.toLowerCase() as keyof typeof config];
  return levelConfig || config.novice;
};

export default function SpellDetails() {
  const { projectId, spellId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: spell, isLoading } = useQuery<Spell>({
    queryKey: [`/api/spells/${spellId}`],
    enabled: !!spellId && spellId !== "new" && !isNaN(Number(spellId))
  });

  const { data: magicSystem } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${spell?.magicSystemId}`],
    enabled: !!spell?.magicSystemId
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    if (spell?.magicSystemId) {
      setLocation(`/projects/${projectId}/magic-systems/${spell.magicSystemId}`);
    } else {
      setLocation(`/projects/${projectId}/magic-systems`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading {magicSystem?.type === "power" ? "ability" : "spell"}...</p>
        </div>
      </div>
    );
  }

  if (!spell) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">{magicSystem?.type === "power" ? "Ability" : "Spell"} not found</p>
        </div>
      </div>
    );
  }

  const systemType = magicSystem?.type || "magic";
  const isAbility = systemType === "power";
  const itemType = isAbility ? "ability" : "spell";
  const itemTypeCapitalized = isAbility ? "Ability" : "Spell";
  const systemName = isAbility ? "Power System" : "Magic System";
  
  const levelConfig = getLevelIcon(spell.level || "novice", systemType);
  const LevelIcon = levelConfig.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {magicSystem?.name || systemName}
            </Button>
          </div>

          {/* Spell/Ability Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${levelConfig.bgColor}`}>
                <LevelIcon size={24} className={levelConfig.textColor} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950 mb-2">{spell.name}</h1>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium capitalize ${levelConfig.bgColor} ${levelConfig.textColor}`}>
                    <LevelIcon className="w-3.5 h-3.5" />
                    {spell.level || "Novice"} Level
                  </span>
                  {magicSystem && (
                    <span className="text-sm text-brand-500">
                      From {magicSystem.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setLocation(`/projects/${projectId}/${itemType}s/${spell.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>

          {/* Spell/Ability Description */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-brand-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                {spell.description || `No description available for this ${itemType}.`}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
