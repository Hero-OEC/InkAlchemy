import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { UserCheck, Edit, ArrowLeft } from "lucide-react";
import type { Race, Project } from "@shared/schema";

export default function RaceDetails() {
  const { projectId, raceId } = useParams();
  const [, setLocation] = useLocation();
  const { navigateWithReferrer } = useNavigation();
  const currentPath = `/projects/${projectId}/races/${raceId}`;

  // Set page title
  useEffect(() => {
    document.title = `Race Details - StoryForge`;
  }, []);

  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch race data
  const { data: race, isLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
  });

  // Update page title when race data loads
  useEffect(() => {
    if (race && project) {
      document.title = `${race.name} - ${project.name} | StoryForge`;
    }
  }, [race, project]);

  const handleBack = () => {
    navigateWithReferrer(`/projects/${projectId}/characters`, currentPath);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/races/${raceId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          projectId={projectId || ""} 
          projectName={project?.name}
          onNavigate={(path) => setLocation(path)}
        />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-brand-200 rounded mb-4"></div>
            <div className="h-32 bg-brand-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          projectId={projectId || ""} 
          projectName={project?.name}
          onNavigate={(path) => setLocation(path)}
        />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-900 mb-4">Race Not Found</h1>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Characters
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        projectId={projectId || ""} 
        projectName={project?.name}
        onNavigate={(path) => setLocation(path)}
      />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-brand-600 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Characters
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-200">
                <UserCheck className="w-8 h-8 text-brand-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-900">{race.name}</h1>
                <p className="text-brand-600">Race Details</p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-brand-200 p-6">
          <div className="space-y-6">
            {/* Description */}
            {race.description && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2">Description</h3>
                <p className="text-brand-700 leading-relaxed">{race.description}</p>
              </div>
            )}

            {/* Biology */}
            {race.biology && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2">Biology & Physiology</h3>
                <p className="text-brand-700 leading-relaxed">{race.biology}</p>
              </div>
            )}

            {/* Culture */}
            {race.culture && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2">Culture & Society</h3>
                <p className="text-brand-700 leading-relaxed">{race.culture}</p>
              </div>
            )}

            {/* Homeland */}
            {race.homeland && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2">Homeland</h3>
                <p className="text-brand-700 leading-relaxed">{race.homeland}</p>
              </div>
            )}

            {/* Traits */}
            {race.traits && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-2">Traits & Abilities</h3>
                <p className="text-brand-700 leading-relaxed">{race.traits}</p>
              </div>
            )}

            {/* Empty state if no detailed information */}
            {!race.description && !race.biology && !race.culture && !race.homeland && !race.traits && (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                <p className="text-brand-600">No detailed information available for this race.</p>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="mt-4"
                >
                  Add Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}