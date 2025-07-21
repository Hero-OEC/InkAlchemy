import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { UserCheck, Edit, ArrowLeft, FileText, Users, Clock, Sparkles, Languages } from "lucide-react";
import type { Race, Project } from "@shared/schema";

export default function RaceDetails() {
  const { projectId, raceId } = useParams();
  const [, setLocation] = useLocation();
  const { navigateWithReferrer } = useNavigation();
  const currentPath = `/projects/${projectId}/races/${raceId}`;
  const [activeTab, setActiveTab] = useState("description");

  // Set page title
  useEffect(() => {
    document.title = `Race Details - StoryForge`;
  }, []);

  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch race data (only if raceId is not "new")
  const { data: race, isLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: raceId !== "new",
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
          hasActiveProject={true}
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

  if (!race && raceId !== "new") {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true}
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

  // If raceId is "new", redirect to create race page
  if (raceId === "new") {
    setLocation(`/projects/${projectId}/races/new`);
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true}
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
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-brand-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "description"
                    ? "border-brand-400 text-brand-600 bg-brand-50"
                    : "border-transparent text-brand-600 hover:text-brand-800 hover:border-brand-300"
                }`}
              >
                <FileText className="w-4 h-4" />
                Description
              </button>
              <button
                onClick={() => setActiveTab("culture")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "culture"
                    ? "border-brand-400 text-brand-600 bg-brand-50"
                    : "border-transparent text-brand-600 hover:text-brand-800 hover:border-brand-300"
                }`}
              >
                <Users className="w-4 h-4" />
                Culture & Society
              </button>
              <button
                onClick={() => setActiveTab("lifespan")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "lifespan"
                    ? "border-brand-400 text-brand-600 bg-brand-50"
                    : "border-transparent text-brand-600 hover:text-brand-800 hover:border-brand-300"
                }`}
              >
                <Clock className="w-4 h-4" />
                Lifespan
              </button>
              <button
                onClick={() => setActiveTab("traits")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "traits"
                    ? "border-brand-400 text-brand-600 bg-brand-50"
                    : "border-transparent text-brand-600 hover:text-brand-800 hover:border-brand-300"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Traits & Abilities
              </button>
              <button
                onClick={() => setActiveTab("language")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "language"
                    ? "border-brand-400 text-brand-600 bg-brand-50"
                    : "border-transparent text-brand-600 hover:text-brand-800 hover:border-brand-300"
                }`}
              >
                <Languages className="w-4 h-4" />
                Language
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="space-y-4">
                {race.description ? (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{race.description}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600 mb-4">No description available for this race.</p>
                    <Button variant="outline" onClick={handleEdit}>
                      Add Description
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "culture" && (
              <div className="space-y-4">
                {race.culture ? (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{race.culture}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600 mb-4">No cultural information available for this race.</p>
                    <Button variant="outline" onClick={handleEdit}>
                      Add Culture & Society
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "lifespan" && (
              <div className="space-y-4">
                {race.lifespan ? (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{race.lifespan}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600 mb-4">No lifespan information available for this race.</p>
                    <Button variant="outline" onClick={handleEdit}>
                      Add Lifespan Details
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "traits" && (
              <div className="space-y-4">
                {race.traits ? (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{race.traits}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600 mb-4">No traits or abilities information available for this race.</p>
                    <Button variant="outline" onClick={handleEdit}>
                      Add Traits & Abilities
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "language" && (
              <div className="space-y-4">
                {race.language ? (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{race.language}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Languages className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600 mb-4">No language information available for this race.</p>
                    <Button variant="outline" onClick={handleEdit}>
                      Add Language Details
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}