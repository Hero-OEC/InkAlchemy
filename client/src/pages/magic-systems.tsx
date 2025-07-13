import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { Button } from "@/components/button-variations";
import { Plus, Sparkles, Zap, Scroll, Crown, Shield, Sword, Brain, Eye, Heart, Skull } from "lucide-react";
import type { Project, MagicSystem } from "@shared/schema";

// Magic system type configuration
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

// Helper function to get appropriate icon
const getSystemIcon = (system: MagicSystem) => {
  const category = system.source?.toLowerCase() || 'other';
  const typeConfig = MAGIC_TYPE_CONFIG[system.type as keyof typeof MAGIC_TYPE_CONFIG] || MAGIC_TYPE_CONFIG.magic;
  return typeConfig.icons[category as keyof typeof typeConfig.icons] || typeConfig.icons.other;
};

export default function MagicSystems() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: magicSystems, isLoading } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateSystem = () => {
    setLocation(`/projects/${projectId}/magic-systems/new`);
  };

  const handleSystemClick = (systemId: number) => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}`);
  };

  const handleEditSystem = (systemId: number) => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading magic systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-900 mb-2">Magic & Power Systems</h1>
            <p className="text-brand-600">Manage the supernatural and extraordinary abilities in your world</p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleCreateSystem}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add New System
          </Button>
        </div>

        {/* Content */}
        {!magicSystems || magicSystems.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="bg-brand-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold text-brand-900 mb-4">No Magic Systems Yet</h2>
            <p className="text-brand-600 mb-8 max-w-md mx-auto">
              Create your first magic or power system to define how supernatural abilities work in your world.
            </p>
            <Button 
              variant="primary" 
              onClick={handleCreateSystem}
              className="mx-auto flex items-center gap-2"
            >
              <Plus size={18} />
              Create Your First System
            </Button>
          </div>
        ) : (
          // Systems Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {magicSystems.map((system) => (
              <ContentCard
                key={system.id}
                id={system.id}
                title={system.name}
                type="magic"
                subtype={system.type || 'magic'}
                description={system.description || 'No description available'}
                icon={getSystemIcon(system)}
                createdAt={system.createdAt}
                lastEditedAt={system.updatedAt}
                onClick={() => handleSystemClick(system.id)}
                onEdit={() => handleEditSystem(system.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}