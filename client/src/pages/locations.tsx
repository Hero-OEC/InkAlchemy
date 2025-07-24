import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { SearchComponent } from "@/components/search-component";
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
  const [currentPath, setLocation] = useLocation();
  const [deleteItem, setDeleteItem] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { navigateWithReferrer } = useNavigation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Locations - ${project.name} | StoryForge`;
    } else {
      document.title = "Locations | StoryForge";
    }
  }, [project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateLocation = () => {
    setLocation(`/projects/${projectId}/locations/new`);
  };

  const handleLocationClick = (location: Location) => {
    navigateWithReferrer(`/projects/${projectId}/locations/${location.id}`, currentPath);
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

  // Filter locations based on search and filters
  const filteredLocations = locations.filter(location => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        location.name.toLowerCase().includes(searchLower) ||
        (location.content && location.content.toLowerCase().includes(searchLower)) ||
        (location.type && location.type.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (activeFilters.type && location.type !== activeFilters.type) {
      return false;
    }

    return true;
  });

  // Convert filtered locations to ContentCard format
  const locationCards = filteredLocations.map(location => {
    const locationType = location.type || "other";
    const icon = LOCATION_TYPE_ICONS[locationType as keyof typeof LOCATION_TYPE_ICONS] || Globe;
    
    return {
      id: location.id,
      title: location.name,
      type: "location" as const,
      subtype: locationType,
      description: location.content || "No description available",
      icon: icon,
      createdAt: location.createdAt,
      lastEditedAt: location.updatedAt,
    };
  });

  // Search filters for locations
  const searchFilters = [
    {
      key: "type",
      label: "Location Type",
      options: [
        { value: "settlement", label: "Settlement" },
        { value: "city", label: "City" },
        { value: "village", label: "Village" },
        { value: "town", label: "Town" },
        { value: "natural", label: "Natural" },
        { value: "forest", label: "Forest" },
        { value: "mountain", label: "Mountain" },
        { value: "river", label: "River" },
        { value: "lake", label: "Lake" },
        { value: "ocean", label: "Ocean" },
        { value: "building", label: "Building" },
        { value: "fortress", label: "Fortress" },
        { value: "castle", label: "Castle" },
        { value: "temple", label: "Temple" },
        { value: "academy", label: "Academy" },
        { value: "tower", label: "Tower" },
        { value: "dungeon", label: "Dungeon" },
        { value: "other", label: "Other" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="locations"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[#624122]">Locations</h1>
            <p className="text-brand-600">Manage your world's places and settings</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <SearchComponent
              placeholder="Search locations..."
              onSearch={setSearchQuery}
              onFilterChange={setActiveFilters}
              filters={searchFilters}
              showFilters={true}
            />
            <Button onClick={handleCreateLocation} className="flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              New Location
            </Button>
          </div>
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
            <Button 
              variant="primary"
              size="md"
              onClick={handleCreateLocation} 
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
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