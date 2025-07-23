import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MiniCard } from "@/components/mini-card";
import { CharacterMagicCard } from "@/components/character-magic-card";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { Edit, Trash2, Users, ArrowLeft } from "lucide-react";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import type { Project, Character, MagicSystem, Event, Location, Relationship, Spell, Race } from "@shared/schema";



export default function CharacterDetails() {
  const { projectId, characterId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { goBack, navigateWithReferrer } = useNavigation();

  // Don't track detail pages in history - only main pages should be tracked

  // Only render for valid numeric character IDs
  const numericCharacterId = Number(characterId);
  if (!characterId || characterId === "new" || characterId === "edit" || isNaN(numericCharacterId) || numericCharacterId <= 0) {
    return null;
  }

  const { data: character, isLoading: characterLoading, error: characterError } = useQuery<Character>({
    queryKey: [`/api/characters/${numericCharacterId}`],
  });

  // Only load other data if character exists
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!character,
  });

  const { data: magicSystems = [] } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
    enabled: !!character,
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
    enabled: !!character,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
    enabled: !!character,
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
    enabled: !!character,
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
    enabled: !!character,
  });

  const { data: races = [] } = useQuery<Race[]>({
    queryKey: [`/api/projects/${projectId}/races`],
    enabled: !!character,
  });

  const { data: characterSpells = [] } = useQuery<(Spell & { proficiency?: string })[]>({
    queryKey: [`/api/characters/${numericCharacterId}/spells`],
    enabled: !!character,
  });

  // Set page title
  useEffect(() => {
    if (character?.name && project?.name) {
      document.title = `${character.name} - ${project.name} | StoryForge`;
    } else if (character?.name) {
      document.title = `${character.name} | StoryForge`;
    } else {
      document.title = "Character Details | StoryForge";
    }
  }, [character?.name, project?.name]);

  // Handle loading state - this must be first and exclusive
  if (characterLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-brand-600">Loading character...</p>
        </div>
      </div>
    );
  }

  // Handle error/not found state - this must be second and exclusive  
  if (!character || characterError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true}
          currentPage="characters"
          onNavigate={() => setLocation(`/projects/${projectId}/characters`)}
          projectName="StoryForge"
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-brand-900 mb-4">Character Not Found</h1>
            <p className="text-brand-600 mb-6">The character you're looking for doesn't exist or may have been deleted.</p>
            <Button 
              variant="primary" 
              onClick={() => setLocation(`/projects/${projectId}/characters`)}
            >
              Back to Characters
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const fullName = [character.prefix, character.name, character.suffix].filter(Boolean).join(" ");
  
  // Find the character's race
  const characterRace = character.raceId ? races.find(race => race.id === character.raceId) : null;

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/characters/${characterId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLocation(`/projects/${projectId}/characters`);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const handleMagicSystemClick = (magicSystemId: number) => {
    navigateWithReferrer(`/projects/${projectId}/magic-systems/${magicSystemId}`, currentPath);
  };

  const tabs = [
    { id: "details", label: "Details" },
    { id: "magic", label: "Magic & Abilities" }
  ];

  // Find the power type magic system
  const powerTypeMagicSystem = character.powerType 
    ? magicSystems.find(ms => ms.name.toLowerCase() === character.powerType?.toLowerCase())
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true}
        currentPage="characters"
        onNavigate={handleNavigation}
        projectName={project?.name}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Character Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-500">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{fullName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                <Edit size={16} />
                Edit Character
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tab System */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-brand-200 mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "details" && (
                <>
                  {/* Description */}
                  {character.description && (
                    <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-brand-950 mb-4">Description</h3>
                      {(() => {
                        try {
                          // Try to parse as JSON first (new format)
                          const parsedData = JSON.parse(character.description);
                          return <EditorContentRenderer data={parsedData} />;
                        } catch {
                          // Fallback to plain text display (old format)
                          return (
                            <div className="prose prose-brand max-w-none">
                              <p className="text-brand-900 leading-relaxed">{character.description}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </>
              )}

              {activeTab === "magic" && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                  <CharacterMagicCard
                    magicSystem={null}
                    characterSpells={characterSpells}
                    projectId={projectId!}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Character Profile (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-brand-950 mb-4">Character Profile</h3>
              
              {/* Character Image */}
              <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200 mb-6">
                {character.imageUrl ? (
                  <img 
                    src={character.imageUrl} 
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-brand-400" />
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                {character.age && (
                  <div>
                    <h4 className="text-sm font-medium text-brand-900 mb-1">Age</h4>
                    <p className="text-brand-700">{character.age}</p>
                  </div>
                )}
                
                {characterRace && (
                  <div>
                    <h4 className="text-sm font-medium text-brand-900 mb-1">Race</h4>
                    <p className="text-brand-700">{characterRace.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Character"
        description={`Are you sure you want to delete "${character?.name}"? This action cannot be undone and will remove all associated relationships and data.`}
        itemName={character?.name || "this character"}
      />
    </div>
  );
}