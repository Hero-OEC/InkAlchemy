import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MiniCard } from "@/components/mini-card";
import { ArrowLeft, Edit, Calendar, MapPin, Users, Landmark, Crown, Route } from "lucide-react";
import type { Project, Location, Character, Event } from "@shared/schema";
import { Building2, Trees, Castle, Mountain, Home, Globe } from "lucide-react";

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

export default function LocationDetails() {
  const { projectId, locationId } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: location } = useQuery<Location>({
    queryKey: [`/api/locations/${locationId}`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/locations`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/locations/${locationId}/edit`);
  };

  const handleCharacterClick = (character: Character) => {
    setLocation(`/projects/${projectId}/characters/${character.id}`);
  };

  const handleEventClick = (event: Event) => {
    setLocation(`/projects/${projectId}/events/${event.id}`);
  };

  if (!location) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="locations"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Location not found</p>
        </div>
      </div>
    );
  }

  const locationType = location.type || "other";
  const IconComponent = LOCATION_TYPE_ICONS[locationType as keyof typeof LOCATION_TYPE_ICONS] || Globe;

  // Filter related data
  const relatedEvents = events.filter(event => event.locationId === location.id);
  const relatedCharacters = characters.filter(character => 
    character.background?.toLowerCase().includes(location.name.toLowerCase()) ||
    character.description?.toLowerCase().includes(location.name.toLowerCase())
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: MapPin },
    { id: "geography", label: "Geography", icon: Mountain },
    { id: "politics", label: "Politics", icon: Crown },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "characters", label: "Characters", icon: Users },
    { id: "connections", label: "Connections", icon: Route },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="locations"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Locations
        </Button>

        {/* Location Header */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-200">
                <IconComponent size={24} className="text-brand-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950 mb-2">{location.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-600 text-white capitalize">
                    {locationType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
                <Edit size={16} />
                Edit Location
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-200 mb-8">
          <div className="border-b border-brand-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-brand-500 hover:text-brand-700"
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
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
                  <div className="prose prose-brand max-w-none">
                    <p className="text-base leading-relaxed text-brand-800">
                      {location.description || "No description available"}
                    </p>
                  </div>
                </div>
                
                {location.culture && (
                  <div>
                    <h3 className="text-lg font-semibold text-brand-900 mb-3">Culture & Significance</h3>
                    <div className="prose prose-brand max-w-none">
                      <p className="text-base leading-relaxed text-brand-800">
                        {location.culture}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-brand-500 uppercase tracking-wide mb-1">Created</div>
                    <div className="text-brand-900">{formatDate(location.createdAt)}</div>
                  </div>
                  <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-brand-500 uppercase tracking-wide mb-1">Last Updated</div>
                    <div className="text-brand-900">{formatDate(location.updatedAt)}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "geography" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-3">Geography & Environment</h3>
                <div className="prose prose-brand max-w-none">
                  <p className="text-base leading-relaxed text-brand-800">
                    {location.geography || "No geographical information available"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "politics" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-3">Political Structure</h3>
                <div className="prose prose-brand max-w-none">
                  <p className="text-base leading-relaxed text-brand-800">
                    {location.politics || "No political information available"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Events at this Location</h3>
                {relatedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {relatedEvents.map((event) => (
                      <MiniCard
                        key={event.id}
                        icon={Calendar}
                        title={event.title}
                        badge={`${event.month}/${event.day}/${event.year}`}
                        badgeVariant="custom"
                        badgeColor="brand-600"
                        onClick={() => handleEventClick(event)}
                        variant="editable"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-600 italic">No events recorded at this location</p>
                )}
              </div>
            )}

            {activeTab === "characters" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Related Characters</h3>
                {relatedCharacters.length > 0 ? (
                  <div className="space-y-3">
                    {relatedCharacters.map((character) => (
                      <MiniCard
                        key={character.id}
                        icon={Users}
                        title={character.name}
                        badge={character.type || "character"}
                        badgeVariant="type"
                        onClick={() => handleCharacterClick(character)}
                        variant="editable"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-600 italic">No characters directly connected to this location</p>
                )}
              </div>
            )}

            {activeTab === "connections" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Connected Locations</h3>
                <p className="text-brand-600 italic">Location connections feature coming soon</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}