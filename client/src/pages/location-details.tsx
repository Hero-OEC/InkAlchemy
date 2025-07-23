import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MiniCard } from "@/components/mini-card";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users, Landmark, Crown } from "lucide-react";
import type { Project, Location, Character, Event, Relationship } from "@shared/schema";
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
  const [currentPath, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { goBack, navigateWithReferrer } = useNavigation();

  // Don't track detail pages in history - only main pages should be tracked

  // Redirect if this is the create route
  useEffect(() => {
    if (locationId === "new") {
      setLocation(`/projects/${projectId}/locations/new`);
    }
  }, [locationId, projectId, setLocation]);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: location, isLoading: locationLoading } = useQuery<Location>({
    queryKey: [`/api/locations/${locationId}`],
    enabled: !!locationId && locationId !== "new" && !isNaN(Number(locationId))
  });

  // Set page title
  useEffect(() => {
    if (location?.name && project?.name) {
      document.title = `${location.name} - ${project.name} | StoryForge`;
    } else if (location?.name) {
      document.title = `${location.name} | StoryForge`;
    } else {
      document.title = "Location Details | StoryForge";
    }
  }, [location?.name, project?.name]);

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/locations/${locationId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLocation(`/projects/${projectId}/locations`);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleCharacterClick = (character: Character) => {
    navigateWithReferrer(`/projects/${projectId}/characters/${character.id}`, currentPath);
  };

  const handleEventClick = (event: Event) => {
    navigateWithReferrer(`/projects/${projectId}/events/${event.id}`, currentPath);
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="locations"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading location...</p>
        </div>
      </div>
    );
  }

  // Don't render if locationId is "new" - this is handled by CreateLocation component
  if (locationId === "new") {
    return null;
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="locations"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-brand-600 mb-4">Location not found</p>
            <p className="text-sm text-brand-500 mb-4">Location ID: {locationId}</p>
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

  const locationType = location.type || "other";
  const IconComponent = LOCATION_TYPE_ICONS[locationType as keyof typeof LOCATION_TYPE_ICONS] || Globe;

  // Filter related data
  const relatedEvents = events.filter(event => event.locationId === location.id);

  // Process events for the timeline component
  const processedEvents = relatedEvents.map(event => {
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

  const tabs = [
    { id: "details", label: "Details", icon: MapPin },
    { id: "timeline", label: "Timeline", icon: Calendar },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="locations"
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

        {/* Location Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-500">
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{location.name}</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-500 text-white capitalize">
                    {locationType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                <Edit size={16} />
                Edit Location
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
            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Content</h3>
                  {location.content ? (
                    <div className="prose prose-brand max-w-none">
                      {(() => {
                        try {
                          // Try to parse as JSON first (new format from WordProcessor)
                          const parsedData = JSON.parse(location.content);
                          return <EditorContentRenderer data={parsedData} />;
                        } catch {
                          // Fallback to plain text display (old format)
                          return (
                            <div className="prose prose-brand max-w-none">
                              <p className="text-brand-700 leading-relaxed">{location.content}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <p className="text-brand-700 leading-relaxed">No content available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Timeline: Events at {location.name}</h3>
                {processedEvents.length > 0 ? (
                  <div className="bg-brand-50 rounded-lg p-4">
                    <SerpentineTimeline
                      events={processedEvents}
                      characters={characters}
                      locations={locations}
                      onEventClick={handleEventClick}
                      onEventEdit={(event) => setLocation(`/projects/${projectId}/events/${event.id}/edit`)}
                      eventsPerRow={3}
                      maxWidth="800px"
                      responsive={false}
                      showFilters={false}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600">No events recorded at this location</p>
                    <p className="text-sm text-brand-500 mt-2">
                      Create events and set their location to see them here.
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>
      </main>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        description={`Are you sure you want to delete "${location?.name}"? This action cannot be undone and will remove all associated events and data.`}
        itemName={location?.name || "this location"}
      />
    </div>
  );
}