import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MiniCard } from "@/components/mini-card";
import { CharacterMagicCard } from "@/components/character-magic-card";
import { SearchComponent } from "@/components/search-component";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { Edit, Trash2, Users, Crown, Sword, Shield, Zap, Heart, Skull, Sparkles, Calendar, User, ArrowLeft, FileText, Clock, GraduationCap, UserPlus, UserMinus } from "lucide-react";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import type { Project, Character, MagicSystem, Event, Location, Relationship, Spell, Race } from "@shared/schema";

const CHARACTER_TYPE_CONFIG = {
  protagonist: { icon: Crown, label: "Protagonist", bgColor: "bg-brand-500", textColor: "text-white" },
  antagonist: { icon: Sword, label: "Antagonist", bgColor: "bg-brand-400", textColor: "text-white" },
  villain: { icon: Skull, label: "Villain", bgColor: "bg-brand-700", textColor: "text-white" },
  supporting: { icon: Users, label: "Supporting", bgColor: "bg-brand-300", textColor: "text-brand-900" },
  ally: { icon: Shield, label: "Ally", bgColor: "bg-brand-600", textColor: "text-white" },
  neutral: { icon: Zap, label: "Neutral", bgColor: "bg-brand-800", textColor: "text-white" },
  "love-interest": { icon: Heart, label: "Love Interest", bgColor: "bg-brand-900", textColor: "text-white" },
  mentor: { icon: GraduationCap, label: "Mentor", bgColor: "bg-brand-600", textColor: "text-white" },
  sidekick: { icon: UserPlus, label: "Sidekick", bgColor: "bg-brand-400", textColor: "text-white" },
  background: { icon: UserMinus, label: "Background", bgColor: "bg-brand-200", textColor: "text-brand-900" }
};


export default function CharacterDetails() {
  const { projectId, characterId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [timelineSearchQuery, setTimelineSearchQuery] = useState("");
  const [timelineActiveFilters, setTimelineActiveFilters] = useState<Record<string, string>>({});
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

  // Don't render if characterId is "new" - this is handled by CreateCharacter component
  if (characterId === "new") {
    return null;
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

  const config = CHARACTER_TYPE_CONFIG[(character as any).type as keyof typeof CHARACTER_TYPE_CONFIG];
  const Icon = config?.icon || Users;
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
    { id: "details", label: "Details", icon: User },
    { id: "magic", label: "Magic & Abilities", icon: Zap },
    { id: "timeline", label: "Timeline", icon: Clock }
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
              <div className={`p-3 rounded-xl ${config?.bgColor || 'bg-brand-500'}`}>
                <Icon size={24} className={config?.textColor || 'text-white'} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{fullName}</h1>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config?.bgColor || 'bg-brand-500'} ${config?.textColor || 'text-white'}`}>
                    {config?.label || 'Character'}
                  </span>
                </div>
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
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
              {activeTab === "details" && (
                <div className="space-y-6">
                  {character.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
                      {(() => {
                        try {
                          // Try to parse as JSON first (new format)
                          const parsedData = JSON.parse(character.description);
                          return <EditorContentRenderer data={parsedData} />;
                        } catch {
                          // Fallback to plain text display (old format)
                          return (
                            <div className="prose prose-brand max-w-none">
                              <p className="text-brand-700 leading-relaxed">{character.description}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "magic" && (
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-6">Magic Systems & Abilities</h3>
                  {(() => {
                    // Group character spells by magic system
                    const magicSystemsWithSpells = magicSystems.map(system => {
                      const systemSpells = characterSpells.filter(spell => 
                        spell.magicSystemId === system.id
                      );
                      return {
                        ...system,
                        spells: systemSpells
                      };
                    }).filter(system => system.spells.length > 0);

                    if (magicSystemsWithSpells.length === 0) {
                      return (
                        <div className="text-center py-8 bg-brand-50 rounded-lg">
                          <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                          <p className="text-brand-600">No magic systems or abilities assigned to this character.</p>
                          <p className="text-sm text-brand-500 mt-2">
                            Edit this character to assign spells and abilities from available magic systems.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {magicSystemsWithSpells.map(system => (
                          <CharacterMagicCard
                            key={system.id}
                            magicSystem={system as any}
                            characterSpells={system.spells as any}
                            projectId={projectId!}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === "timeline" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-brand-900">Character Timeline</h3>
                    <SearchComponent
                      placeholder="Search character events..."
                      onSearch={setTimelineSearchQuery}
                      onFilterChange={setTimelineActiveFilters}
                      filters={[
                        {
                          key: "stage",
                          label: "Writing Stage",
                          options: [
                            { value: "", label: "All Stages" },
                            { value: "planning", label: "Planning" },
                            { value: "writing", label: "Writing" },
                            { value: "first-draft", label: "First Draft" },
                            { value: "editing", label: "Editing" },
                            { value: "complete", label: "Complete" }
                          ]
                        },
                        {
                          key: "type", 
                          label: "Event Type",
                          options: [
                            { value: "", label: "All Types" },
                            { value: "battle", label: "Battle" },
                            { value: "meeting", label: "Meeting" },
                            { value: "discovery", label: "Discovery" },
                            { value: "journey", label: "Journey" },
                            { value: "celebration", label: "Celebration" },
                            { value: "tragedy", label: "Tragedy" },
                            { value: "ritual", label: "Ritual" },
                            { value: "political", label: "Political" },
                            { value: "personal", label: "Personal" },
                            { value: "magical", label: "Magical" },
                            { value: "other", label: "Other" }
                          ]
                        },
                        {
                          key: "characterId",
                          label: "Other Characters",
                          options: [
                            { value: "", label: "All Characters" },
                            ...characters.filter(char => char.id !== character.id).map(char => ({
                              value: char.id.toString(),
                              label: char.name
                            }))
                          ]
                        },
                        {
                          key: "locationId",
                          label: "Location",
                          options: [
                            { value: "", label: "All Locations" },
                            ...locations.map(location => ({
                              value: location.id.toString(),
                              label: location.name
                            }))
                          ]
                        }
                      ]}
                    />
                  </div>
                  <div className="bg-brand-50 rounded-lg p-4">
                    {(() => {
                      // Filter events where this character is involved
                      const characterEvents = events.filter(event => {
                        const eventRelationships = relationships.filter(rel => 
                          rel.sourceType === 'event' && 
                          rel.sourceId === event.id &&
                          rel.targetType === 'character' &&
                          rel.targetId === character.id
                        );
                        return eventRelationships.length > 0;
                      });

                      // Process events with relationships to add character and location data
                      const processedEvents = characterEvents.map(event => {
                        const eventRelationships = relationships.filter(rel => 
                          rel.sourceType === 'event' && rel.sourceId === event.id
                        );
                        
                        const eventCharacters = eventRelationships
                          .filter(rel => rel.targetType === 'character')
                          .map(rel => characters.find(char => char.id === rel.targetId))
                          .filter(Boolean) as Character[];
                        
                        const eventLocation = event.locationId 
                          ? locations.find(loc => loc.id === event.locationId)
                          : undefined;

                        return {
                          ...event,
                          characters: eventCharacters,
                          location: eventLocation
                        };
                      });

                      // Apply search and filters
                      const filteredEvents = processedEvents.filter((event) => {
                        // Text search
                        if (timelineSearchQuery) {
                          const searchLower = timelineSearchQuery.toLowerCase();
                          const matchesTitle = event.title.toLowerCase().includes(searchLower);
                          const matchesDescription = event.description?.toLowerCase().includes(searchLower);
                          const matchesLocation = event.location?.name.toLowerCase().includes(searchLower);
                          const matchesCharacters = event.characters.some(char => 
                            char.name.toLowerCase().includes(searchLower)
                          );
                          
                          if (!matchesTitle && !matchesDescription && !matchesLocation && !matchesCharacters) {
                            return false;
                          }
                        }

                        // Filter by writing stage
                        if (timelineActiveFilters.stage && event.stage !== timelineActiveFilters.stage) {
                          return false;
                        }

                        // Filter by event type
                        if (timelineActiveFilters.type && event.type !== timelineActiveFilters.type) {
                          return false;
                        }

                        // Filter by other characters involved
                        if (timelineActiveFilters.characterId) {
                          const hasCharacter = event.characters.some(char => 
                            char.id.toString() === timelineActiveFilters.characterId
                          );
                          if (!hasCharacter) {
                            return false;
                          }
                        }

                        // Filter by location
                        if (timelineActiveFilters.locationId && event.locationId?.toString() !== timelineActiveFilters.locationId) {
                          return false;
                        }

                        return true;
                      });

                      if (processedEvents.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <p className="text-brand-600">No timeline events found for this character.</p>
                            <p className="text-sm text-brand-500 mt-2">
                              Create events and link them to this character to see their timeline.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <SerpentineTimeline
                          events={processedEvents}
                          characters={characters}
                          locations={locations}
                          onEventClick={(event) => setLocation(`/projects/${projectId}/events/${event.id}`)}
                          onEventEdit={(event) => setLocation(`/projects/${projectId}/events/${event.id}/edit`)}
                          eventsPerRow={3}
                          maxWidth="800px"
                          responsive={false}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Character Image & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-6">
              {/* Character Image */}
              <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200 mb-4">
                {character.imageUrl ? (
                  <img 
                    src={character.imageUrl} 
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400">
                    <Users size={64} />
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-brand-200 rounded-lg">
                    <Calendar className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Age</div>
                    <div className="text-sm font-semibold text-brand-900">{character.age || "Unknown"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-brand-200 rounded-lg">
                    <User className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Race</div>
                    <div className="text-sm font-semibold text-brand-900">{characterRace?.name || "Unknown"}</div>
                  </div>
                </div>
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