import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { Button } from "@/components/button-variations";
import { Plus, Building2, Trees, Castle, Mountain, Home, Landmark, Globe } from "lucide-react";
import type { Project, Location } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Location type icons
const LOCATION_TYPE_ICONS = {
  settlement: Building2,
  city: Building2,
  village: Home,
  town: Building2,
  natural: Trees,
  forest: Trees,
  mountain: Mountain,
  river: Globe,
  lake: Globe,
  ocean: Globe,
  building: Landmark,
  fortress: Castle,
  castle: Castle,
  temple: Landmark,
  academy: Landmark,
  tower: Castle,
  dungeon: Castle,
  other: Globe,
};

export default function Locations() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [deleteItem, setDeleteItem] = useState<Location | null>(null);
  const queryClient = useQueryClient();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateLocation = () => {
    setLocation(`/projects/${projectId}/locations/new`);
  };

  const handleLocationClick = (location: Location) => {
    setLocation(`/projects/${projectId}/locations/${location.id}`);
  };

  const handleLocationEdit = (location: Location) => {
    setLocation(`/projects/${projectId}/locations/${location.id}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: (locationId: number) => apiRequest(`/api/locations/${locationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/locations`] });
      setDeleteItem(null);
    },
  });

  const handleLocationDelete = (location: Location) => {
    setDeleteItem(location);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate(deleteItem.id);
    }
  };

  // Convert locations to ContentCard format
  const locationCards = locations.map(location => {
    const locationType = location.type || "other";
    const icon = LOCATION_TYPE_ICONS[locationType as keyof typeof LOCATION_TYPE_ICONS] || Globe;
    
    return {
      id: location.id,
      title: location.name,
      type: "location" as const,
      subtype: locationType,
      description: location.description || "No description available",
      icon: icon,
      createdAt: location.createdAt,
      lastEditedAt: location.updatedAt,
    };
  });

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="locations"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-950 mb-2">Locations</h1>
            <p className="text-brand-600">Manage your world's places and settings</p>
          </div>
          <Button onClick={handleCreateLocation} className="flex items-center gap-2">
            <Plus size={20} />
            New Location
          </Button>
        </div>

        {/* Locations Grid */}
        {locationCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationCards.map((card) => {
              const originalLocation = locations.find(l => l.id === card.id);
              return (
                <ContentCard
                  key={card.id}
                  {...card}
                  onClick={() => handleLocationClick(originalLocation!)}
                  onEdit={() => handleLocationEdit(originalLocation!)}
                  onDelete={() => handleLocationDelete(originalLocation!)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-6">
              <Globe size={64} className="mx-auto text-brand-400 mb-4" />
              <h3 className="text-xl font-semibold text-brand-900 mb-2">No locations yet</h3>
              <p className="text-brand-600 mb-6">Start building your world by creating your first location</p>
            </div>
            <Button onClick={handleCreateLocation} className="flex items-center gap-2 mx-auto">
              <Plus size={20} />
              Create First Location
            </Button>
          </div>
        )}
      </main>

      <DeleteConfirmation
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Location"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        itemName={deleteItem?.name || "this location"}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}