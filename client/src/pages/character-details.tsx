import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MiniCard } from "@/components/mini-card";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { Edit, Users, Crown, Sword, Shield, Zap, Heart, Skull, Sparkles, Calendar, User } from "lucide-react";
import type { Project, Character, MagicSystem, Event, Location, Relationship } from "@shared/schema";

const CHARACTER_TYPE_CONFIG = {
  protagonist: { icon: Crown, label: "Protagonist", bgColor: "bg-brand-500", textColor: "text-white" },
  antagonist: { icon: Sword, label: "Antagonist", bgColor: "bg-brand-400", textColor: "text-white" },
  villain: { icon: Skull, label: "Villain", bgColor: "bg-brand-700", textColor: "text-white" },
  supporting: { icon: Users, label: "Supporting", bgColor: "bg-brand-300", textColor: "text-brand-900" },
  ally: { icon: Shield, label: "Ally", bgColor: "bg-brand-600", textColor: "text-white" },
  neutral: { icon: Zap, label: "Neutral", bgColor: "bg-brand-800", textColor: "text-white" },
  "love-interest": { icon: Heart, label: "Love Interest", bgColor: "bg-brand-900", textColor: "text-white" }
};

export default function CharacterDetails() {
  const { projectId, characterId } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: character } = useQuery<Character>({
    queryKey: [`/api/characters/${characterId}`],
  });

  const { data: magicSystems = [] } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  if (!character) {
    return <div>Loading...</div>;
  }

  const config = CHARACTER_TYPE_CONFIG[character.type as keyof typeof CHARACTER_TYPE_CONFIG];
  const Icon = config?.icon || Users;
  const fullName = [character.prefix, character.name, character.suffix].filter(Boolean).join(" ");

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/characters/${characterId}/edit`);
  };

  const handleMagicSystemClick = (magicSystemId: number) => {
    setLocation(`/projects/${projectId}/magic-systems/${magicSystemId}`);
  };

  const tabs = [
    { id: "details", label: "Details" },
    { id: "appearance", label: "Appearance" },
    { id: "backstory", label: "Backstory" },
    { id: "weapons", label: "Weapons" },
    { id: "timeline", label: "Timeline" }
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
      
      <main className="max-w-7xl mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Character Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${config?.bgColor || 'bg-brand-200'}`}>
                <Icon size={24} className={config?.textColor || 'text-brand-700'} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{fullName}</h1>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config?.bgColor || 'bg-brand-200'} ${config?.textColor || 'text-brand-700'}`}>
                    {config?.label || 'Character'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
              <Edit size={16} />
              Edit Character
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Character Image & Basic Info */}
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
                    <div className="text-sm font-semibold text-brand-900">{character.race || "Unknown"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tab System */}
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
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {character.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
                      <div className="prose prose-brand max-w-none">
                        <p className="text-brand-700 leading-relaxed">{character.description}</p>
                      </div>
                    </div>
                  )}

                  {character.personality && (
                    <div>
                      <h3 className="text-lg font-semibold text-brand-900 mb-3">Personality</h3>
                      <div className="prose prose-brand max-w-none">
                        <p className="text-brand-700 leading-relaxed">{character.personality}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-brand-900 mb-3">Power Type</h3>
                    <div className="prose prose-brand max-w-none">
                      <p className="text-brand-700 leading-relaxed">
                        This character's magical abilities and power type will be displayed here. Click on power type cards to explore connected magic systems.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Appearance</h3>
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">
                      {character.appearance || "No appearance description available."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "backstory" && (
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Background</h3>
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">
                      {character.background || "No background information available."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "weapons" && (
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Equipment & Skills</h3>
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">
                      Equipment and skill information will be available here. This section can be used to describe weapons, tools, special abilities, or combat skills the character possesses.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Character Timeline</h3>
                  <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                    {(() => {
                      // Filter events where this character is involved
                      const characterEvents = events.filter(event => {
                        const eventRelationships = relationships.filter(rel => 
                          rel.fromElementType === 'event' && 
                          rel.fromElementId === event.id &&
                          rel.toElementType === 'character' &&
                          rel.toElementId === character.id
                        );
                        return eventRelationships.length > 0;
                      });

                      // Process events with relationships to add character and location data
                      const processedEvents = characterEvents.map(event => {
                        const eventRelationships = relationships.filter(rel => 
                          rel.fromElementType === 'event' && rel.fromElementId === event.id
                        );
                        
                        const eventCharacters = eventRelationships
                          .filter(rel => rel.toElementType === 'character')
                          .map(rel => characters.find(char => char.id === rel.toElementId))
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
        </div>
      </main>
    </div>
  );
}