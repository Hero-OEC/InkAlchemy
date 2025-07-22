import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { CharacterCard } from "@/components/character-card";
import { UserCheck, Edit, ArrowLeft, Trash2, FileText, Users } from "lucide-react";
import type { Race, Project, Character } from "@shared/schema";

export default function RaceDetails() {
  const { projectId, raceId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("description");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { goBack, navigateWithReferrer } = useNavigation();

  // Don't track detail pages in history - only main pages should be tracked

  // Redirect if this is the create route
  useEffect(() => {
    if (raceId === "new") {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setLocation(`/projects/${projectId}/races/new`);
      }, 0);
    }
  }, [raceId, projectId, setLocation]);

  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch race data (only if raceId is not "new")
  const { data: race, isLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: raceId !== "new",
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  // Set page title
  useEffect(() => {
    if (race?.name && project?.name) {
      document.title = `${race.name} - ${project.name} | StoryForge`;
    } else if (race?.name) {
      document.title = `${race.name} | StoryForge`;
    } else {
      document.title = "Race Details | StoryForge";
    }
  }, [race?.name, project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/races/${raceId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/races/${raceId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLocation(`/projects/${projectId}/characters`);
      }
    } catch (error) {
      console.error('Error deleting race:', error);
    }
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

  if (!race && raceId !== "new") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-brand-600 mb-4">Race not found</p>
            <p className="text-sm text-brand-500 mb-4">Race ID: {raceId}</p>
            <button 
              onClick={handleBack}
              className="text-brand-600 hover:text-brand-700 underline"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If raceId is "new", redirect to create race page
  if (raceId === "new") {
    setLocation(`/projects/${projectId}/races/new`);
    return null;
  }

  const handleCharacterClick = (character: Character) => {
    navigateWithReferrer(`/projects/${projectId}/characters/${character.id}`, currentPath);
  };

  // Filter characters that belong to this race
  const raceCharacters = characters.filter(character => 
    character.race?.toLowerCase() === race?.name.toLowerCase()
  );

  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "characters", label: "Characters", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Race Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-200">
                <UserCheck size={24} className="text-brand-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{race.name}</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-200 text-brand-700">
                    Race
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                <Edit size={16} />
                Edit Race
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-brand-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
          {activeTab === "description" && (
            <div>
              <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
              <div className="prose prose-brand max-w-none">
                <p className="text-brand-700 leading-relaxed">
                  {race.description || "No description available"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "characters" && (
            <div>
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters of {race.name} Race</h3>
              {raceCharacters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {raceCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onClick={() => handleCharacterClick(character)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                  <p className="text-brand-600">No characters of this race found</p>
                  <p className="text-sm text-brand-500 mt-2">
                    Create characters and set their race to "{race.name}" to see them here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Race"
          description={`Are you sure you want to delete "${race.name}"? This action cannot be undone.`}
        />
      </main>
    </div>
  );
}