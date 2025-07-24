import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { MiniCard } from "@/components/mini-card";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { RaceDetailsHeaderSkeleton, RaceDetailsContentSkeleton } from "@/components/skeleton";
import { Users, Edit, ArrowLeft, Trash2, MapPin, Mountain, Crown } from "lucide-react";
import type { Race, Project, Character, Location } from "@shared/schema";

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
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch race data (only if raceId is not "new")
  const { data: race, isLoading: raceLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: raceId !== "new",
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || raceLoading || charactersLoading || locationsLoading;

  // Filter characters of this race
  const raceCharacters = characters.filter(character => 
    character.raceId === race?.id
  );

  // Find homeland location
  const homelandLocation = race?.homelandId 
    ? locations.find(loc => loc.id === race.homelandId)
    : null;

  // Set page title
  useEffect(() => {
    if (race?.name && project?.name) {
      document.title = `${race.name} - ${project.name} | InkAlchemy`;
    } else if (race?.name) {
      document.title = `${race.name} | InkAlchemy`;
    } else {
      document.title = "Race Details | InkAlchemy";
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
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-6xl mx-auto px-8 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Race Header Skeleton */}
          <RaceDetailsHeaderSkeleton />

          {/* Main Content Skeleton */}
          <RaceDetailsContentSkeleton />
        </main>
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-6xl mx-auto px-8 py-8">
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
              <div className="p-3 rounded-xl bg-brand-500">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{race?.name}</h1>
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

        {/* Content Grid - 2/3 main content + 1/3 sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Description */}
          <div className="lg:col-span-2">
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
              <div className="prose prose-brand max-w-none">
                {race?.description ? (
                  <EditorContentRenderer data={race.description} />
                ) : (
                  <p className="text-brand-700 leading-relaxed">No description available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Homeland */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Homeland</h3>
              {homelandLocation ? (
                <MiniCard
                  icon={MapPin}
                  title={homelandLocation.name}
                  badge={homelandLocation.type || "location"}
                  badgeVariant="type"
                  onClick={() => setLocation(`/projects/${projectId}/locations/${homelandLocation.id}`)}
                />
              ) : (
                <div className="text-center py-4">
                  <MapPin size={20} className="mx-auto text-brand-300 mb-2" />
                  <p className="text-sm text-brand-600">No homeland set</p>
                </div>
              )}
            </div>

            {/* Physical Characteristics */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Physical Characteristics</h3>
              <div className="space-y-3">
                {race?.lifespan && (
                  <div className="flex justify-between">
                    <span className="text-brand-600">Lifespan:</span>
                    <span className="text-brand-900 capitalize">{race.lifespan}</span>
                  </div>
                )}
                {race?.sizeCategory && (
                  <div className="flex justify-between">
                    <span className="text-brand-600">Size:</span>
                    <span className="text-brand-900 capitalize">{race.sizeCategory}</span>
                  </div>
                )}
                {!race?.lifespan && !race?.sizeCategory && (
                  <p className="text-sm text-brand-600 text-center py-2">No characteristics set</p>
                )}
              </div>
            </div>

            {/* Abilities & Powers */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Abilities & Powers</h3>
              <p className="text-sm text-brand-600 text-center py-2">No special abilities defined</p>
            </div>

            {/* Characters */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters of This Race</h3>
              {raceCharacters.length > 0 ? (
                <div className="space-y-3">
                  {raceCharacters.map((character) => (
                    <MiniCard
                      key={character.id}
                      icon={Users}
                      title={[character.prefix, character.name, character.suffix].filter(Boolean).join(" ")}
                      badge={character.type || "supporting"}
                      badgeVariant="type"
                      onClick={() => setLocation(`/projects/${projectId}/characters/${character.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users size={20} className="mx-auto text-brand-300 mb-2" />
                  <p className="text-sm text-brand-600">No characters assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Race"
          description={`Are you sure you want to delete "${race?.name}"? This action cannot be undone.`}
        />
      </main>
    </div>
  );
}