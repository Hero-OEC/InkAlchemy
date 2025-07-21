import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { RaceForm } from "@/components/race-form";
import { ArrowLeft, UserCheck } from "lucide-react";
import type { Project, Race } from "@shared/schema";

export default function EditRace() {
  const { projectId, raceId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: race, isLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: !!raceId && raceId !== "new" && !isNaN(Number(raceId))
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/races/${raceId}`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/races/${raceId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading race...</p>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Race not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
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
            Back to {race.name}
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-500 p-3 rounded-xl">
            <UserCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-950">Edit {race.name}</h1>
            <p className="text-brand-600 mt-1">
              Update race details for your {project?.name} project
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-brand-50 rounded-lg border border-brand-200 p-8">
          <RaceForm 
            race={race}
            projectId={Number(projectId)} 
            onSuccess={handleSuccess}
          />
        </div>
      </main>
    </div>
  );
}