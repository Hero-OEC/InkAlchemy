import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Search, Plus, Edit, Trash2 } from "lucide-react";
import { LocationForm } from "@/components/location-form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Location } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "locations"],
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "locations"] 
      });
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

  const getLocationTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'city': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'forest': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'mountain': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      case 'ocean': return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300';
      case 'building': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'realm': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteLocation = (id: number) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocationMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedLocation(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your story's places and settings ({filteredLocations.length} total)
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedLocation(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedLocation ? "Edit Location" : "Create New Location"}
              </DialogTitle>
            </DialogHeader>
            <LocationForm
              location={selectedLocation}
              projectId={DEFAULT_PROJECT_ID}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No locations found" : "No locations yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery 
                ? `No locations match "${searchQuery}"`
                : "Start building your world by creating your first location"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Location
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      {location.type && (
                        <Badge className={getLocationTypeColor(location.type)}>
                          {location.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {location.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {location.description}
                      </p>
                    </div>
                  )}
                  
                  {location.geography && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Geography
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {location.geography}
                      </p>
                    </div>
                  )}
                  
                  {location.culture && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Culture
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {location.culture}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLocation(location)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id)}
                        disabled={deleteLocationMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(location.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
