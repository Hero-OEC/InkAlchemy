import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { LocationForm } from "@/components/location-form";
import { ArrowLeft, Building2, Trees, Castle, Mountain, Home, Landmark, Globe } from "lucide-react";
import type { Project } from "@shared/schema";

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

export default function CreateLocation() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [currentType, setCurrentType] = useState<string>("other");

  const { data: project } = useQuery<Project>({
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

  const Icon = getCurrentIcon();

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

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-500 p-3 rounded-xl">
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-950">Create New Location</h1>
            <p className="text-brand-600 mt-1">
              Add a new location to your {project?.name} project
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-brand-50 rounded-lg border border-brand-200 p-8">
          <LocationForm 
            projectId={Number(projectId)} 
            onSuccess={handleSuccess}
            onTypeChange={handleTypeChange}
          />
        </div>
      </main>
    </div>
  );
}