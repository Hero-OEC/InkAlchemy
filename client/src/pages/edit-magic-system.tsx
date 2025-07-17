import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MagicSystemForm } from "@/components/magic-system-form";
import { ArrowLeft, Sparkles, Zap, Scroll, Crown, Shield, Sword, Brain, Eye, Heart, Skull } from "lucide-react";
import type { Project, MagicSystem } from "@shared/schema";

// Icon configuration for magic systems
const MAGIC_TYPE_CONFIG = {
  magic: {
    icons: {
      elemental: Sparkles,
      arcane: Scroll,
      divine: Crown,
      nature: Sparkles,
      shadow: Eye,
      necromancy: Skull,
      illusion: Brain,
      enchantment: Heart,
      other: Sparkles
    }
  },
  power: {
    icons: {
      psychic: Brain,
      physical: Sword,
      energy: Zap,
      elemental: Sparkles,
      technological: Shield,
      genetic: Heart,
      supernatural: Eye,
      other: Zap
    }
  }
};

const getSystemIcon = (system: MagicSystem) => {
  const category = system.source?.toLowerCase() || 'other';
  const typeConfig = MAGIC_TYPE_CONFIG[system.type as keyof typeof MAGIC_TYPE_CONFIG] || MAGIC_TYPE_CONFIG.magic;
  return typeConfig.icons[category as keyof typeof typeConfig.icons] || typeConfig.icons.other;
};

export default function EditMagicSystem() {
  const { projectId, systemId } = useParams();
  const [, setLocation] = useLocation();
  const [currentType, setCurrentType] = useState<string>("magic");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: system, isLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${systemId}`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  // Set initial type when system data loads
  useEffect(() => {
    if (system) {
      setCurrentType(system.type || "magic");
    }
  }, [system]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}`);
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
  };

  const getCurrentIcon = () => {
    if (currentType === "power") return Zap;
    return getSystemIcon({ ...system, type: currentType } as MagicSystem);
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
          <p className="text-brand-600">Loading magic system...</p>
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Magic system not found</p>
        </div>
      </div>
    );
  }

  const Icon = getCurrentIcon();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8" style={{ margin: '0 100px' }}>
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft size={16} />
            Back to {system.name}
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">Edit {system.name}</h1>
              <p className="text-brand-600 mt-1">
                Modify the details of this {currentType === "power" ? "power" : "magic"} system
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-brand-50 rounded-lg border border-brand-200 p-8">
          <MagicSystemForm 
            magicSystem={system}
            projectId={Number(projectId)} 
            onSuccess={handleSuccess}
            onTypeChange={handleTypeChange}
          />
        </div>
      </div>
    </div>
  );
}