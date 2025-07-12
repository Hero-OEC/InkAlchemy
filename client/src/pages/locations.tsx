import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Search, Plus } from "lucide-react";
import { ContentCard } from "../components/content-card";
import { Button } from "../components/button-variations";
import { DeleteConfirmation, useDeleteConfirmation } from "../components/delete-confirmation";
import { queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { Location } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { deleteConfirmation, openDeleteConfirmation, closeDeleteConfirmation } = useDeleteConfirmation();

  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "locations"],
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "locations"] 
      });
      closeDeleteConfirmation();
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const filteredLocations = locations?.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteLocation = (location: Location) => {
    openDeleteConfirmation({
      title: "Delete Location",
      description: `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
      itemName: location.name,
      onConfirm: () => deleteLocationMutation.mutate(location.id),
    });
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedLocation(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-brand-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-brand-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-950">Locations</h1>
            <p className="text-brand-700 mt-2 font-medium">
              Explore and manage your world's places ({filteredLocations.length} total)
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setSelectedLocation(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-brand-200 rounded-xl text-brand-900 placeholder-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent font-medium"
            />
          </div>
        </div>

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <div className="bg-white border border-brand-200 rounded-xl p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-6 text-brand-400" />
            <h3 className="text-xl font-semibold text-brand-950 mb-3">
              {searchQuery ? "No locations found" : "No locations yet"}
            </h3>
            <p className="text-brand-700 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No locations match "${searchQuery}". Try adjusting your search terms.`
                : "Start mapping your world by creating your first location. Add cities, forests, dungeons, and other important places."
              }
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Location
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <ContentCard
                key={location.id}
                id={location.id}
                title={location.name}
                type="location"
                subtype={location.type || "unknown"}
                description={location.description || "No description provided"}
                icon={MapPin}
                createdAt={location.createdAt}
                lastEditedAt={location.lastEditedAt}
                onClick={() => handleEditLocation(location)}
                onEdit={() => handleEditLocation(location)}
                onDelete={() => handleDeleteLocation(location)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={deleteConfirmation.onConfirm}
          title={deleteConfirmation.title}
          description={deleteConfirmation.description}
          itemName={deleteConfirmation.itemName}
          isLoading={deleteLocationMutation.isPending}
        />

        {/* Location Form Modal - TODO: Implement */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <h2 className="text-xl font-semibold text-brand-950 mb-4">
                {selectedLocation ? "Edit Location" : "Create New Location"}
              </h2>
              <p className="text-brand-700 mb-4">
                Location form will be implemented here
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleFormSuccess}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleFormSuccess}>
                  Save Location
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}