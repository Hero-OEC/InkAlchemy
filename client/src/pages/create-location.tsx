import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { LocationForm } from "@/components/location-form";
import { LocationFormHeaderSkeleton, LocationFormContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Building2, Trees, Castle, Mountain, Home, Landmark, Globe, Crown, Zap, TreePine, Waves, MapPin } from "lucide-react";
import type { Project } from "@shared/schema";

// Location type icons
const LOCATION_TYPE_ICONS = {
  settlement: Building2,
  city: Building2,
  village: Home,
  town: Home,
  natural: Trees,
  forest: TreePine,
  mountain: Mountain,
  river: Waves,
  lake: Waves,
  ocean: Waves,
  desert: Mountain,
  building: Building2,
  fortress: Castle,
  castle: Castle,
  temple: Landmark,
  academy: Landmark,
  tower: Castle,
  dungeon: Landmark,
  realm: Crown,
  dimension: Landmark,
  other: MapPin,
};

export default function CreateLocation() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [currentType, setCurrentType] = useState<string>("other");

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/locations`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/locations`);
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
  };

  const getCurrentIcon = () => {
    return LOCATION_TYPE_ICONS[currentType as keyof typeof LOCATION_TYPE_ICONS] || Globe;
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="locations"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Locations
            </Button>
          </div>

          {/* Location Form Skeleton */}
          <LocationFormHeaderSkeleton />
          <LocationFormContentSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="locations"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Locations
          </Button>
        </div>

        {/* Form */}
        <LocationForm 
          projectId={projectId!} 
          onSuccess={handleSuccess}
          onTypeChange={handleTypeChange}
          onLocationCreated={() => {
            console.log('Location created callback, forcing page refresh in 500ms');
            setTimeout(() => {
              setLocation(`/projects/${projectId}/locations`);
            }, 500);
          }}
        />
      </main>
    </div>
  );
}