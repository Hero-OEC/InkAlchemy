import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { Button } from "@/components/button-variations";
import { Plus, Sparkles, Zap } from "lucide-react";
import type { Project, MagicSystem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Simple two-type system configuration
const SYSTEM_TYPE_CONFIG = {
  magic: {
    icon: Sparkles,
    label: "Magic System",
    color: "bg-purple-500"
  },
  power: {
    icon: Zap,
    label: "Power System", 
    color: "bg-blue-500"
  }
};

// Helper function to get appropriate icon
const getSystemIcon = (system: MagicSystem) => {
  const config = SYSTEM_TYPE_CONFIG[system.type as keyof typeof SYSTEM_TYPE_CONFIG] || SYSTEM_TYPE_CONFIG.magic;
  return config.icon;
};

export default function MagicSystems() {
  const { projectId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [deleteItem, setDeleteItem] = useState<MagicSystem | null>(null);
  const queryClient = useQueryClient();
  const { navigateWithReferrer } = useNavigation();
  
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
    navigateWithReferrer(`/projects/${projectId}/magic-systems/${systemId}`, currentPath);
  };

  const handleEditSystem = (systemId: number) => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: (systemId: number) => apiRequest(`/api/magic-systems/${systemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/magic-systems`] });
      setDeleteItem(null);
    },
  });

  const handleDeleteSystem = (system: MagicSystem) => {
    setDeleteItem(system);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate(deleteItem.id);
    }
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                subtype={system.type === 'power' ? 'power' : 'magic'}
                description={system.description || 'No description available'}
                icon={getSystemIcon(system)}
                createdAt={system.createdAt}
                lastEditedAt={system.updatedAt}
                onClick={() => handleSystemClick(system.id)}
                onEdit={() => handleEditSystem(system.id)}
                onDelete={() => handleDeleteSystem(system)}
              />
            ))}
          </div>
        )}
      </main>

      <DeleteConfirmation
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteItem?.type === 'power' ? 'Power System' : 'Magic System'}`}
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        itemName={deleteItem?.name || `this ${deleteItem?.type === 'power' ? 'power system' : 'magic system'}`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}