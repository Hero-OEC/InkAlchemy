import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { MiniCard } from "@/components/mini-card";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation, useDeleteConfirmation } from "@/components/delete-confirmation";
import { useNavigation } from "@/contexts/navigation-context";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { EventDetailsHeaderSkeleton, EventDetailsContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Calendar, Crown, MapPin, Sword, Shield, Users, Zap, Heart, Skull, Eye, Lightbulb, PenTool, FileText, Edit, Trash2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Event, Character, Location, Relationship } from "@shared/schema";

// Event type icons (same as timeline)
const EVENT_TYPE_ICONS = {
  battle: Sword,
  meeting: Users,
  discovery: Eye,
  political: Crown,
  personal: Heart,
  death: Skull,
  travel: MapPin,
  magic: Zap,
  other: Calendar
};

// Writing stage colors (same as timeline)
const STAGE_COLORS = {
  planning: {
    bg: "bg-brand-200",
    border: "border-brand-300",
    icon: "text-brand-900",
    stageIcon: Lightbulb
  },
  writing: {
    bg: "bg-brand-400", 
    border: "border-brand-500",
    icon: "text-white",
    stageIcon: PenTool
  },
  "first-draft": {
    bg: "bg-brand-600",
    border: "border-brand-700", 
    icon: "text-white",
    stageIcon: FileText
  },
  editing: {
    bg: "bg-brand-800",
    border: "border-brand-900",
    icon: "text-white",
    stageIcon: Edit
  },
  complete: {
    bg: "bg-brand-900",
    border: "border-brand-900",
    icon: "text-white",
    stageIcon: CheckCircle
  }
};

export default function EventDetails() {
  const { projectId, eventId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const { goBack, navigateWithReferrer } = useNavigation();
  
  // Use the delete confirmation hook for proper loading state management
  const deleteConfirmation = useDeleteConfirmation();

  // Don't track detail pages in history - only main pages should be tracked

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  // Set page title
  useEffect(() => {
    if (event?.title && project?.name) {
      document.title = `${event.title} - ${project.name} | InkAlchemy`;
    } else if (event?.title) {
      document.title = `${event.title} | InkAlchemy`;
    } else {
      document.title = "Event Details | InkAlchemy";
    }
  }, [event?.title, project?.name]);

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: relationships = [], isLoading: relationshipsLoading } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || eventLoading || charactersLoading || locationsLoading || relationshipsLoading;

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleCharacterClick = (characterId: number) => {
    navigateWithReferrer(`/projects/${projectId}/characters/${characterId}`, currentPath);
  };

  const handleLocationClick = (locationId: number) => {
    navigateWithReferrer(`/projects/${projectId}/locations/${locationId}`, currentPath);
  };

  const handleEditEvent = () => {
    setLocation(`/projects/${projectId}/events/${event?.id}/edit`);
  };

  const handleDelete = async () => {
    await deleteConfirmation.handleConfirm(async () => {
      await apiRequest(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      // Force refetch of relevant queries to update the UI immediately
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/events`],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/relationships`],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}`],
        refetchType: 'all'
      });
      
      // Clear the specific event query as well
      queryClient.removeQueries({ queryKey: [`/api/events/${eventId}`] });
      
      setLocation(`/projects/${projectId}/timeline`);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="timeline"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-7xl mx-auto px-8 py-8">
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

          {/* Event Header Skeleton */}
          <EventDetailsHeaderSkeleton />

          {/* Main Content Skeleton */}
          <EventDetailsContentSkeleton />
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="timeline"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-brand-900 mb-4">Event not found</h1>
            <button 
              onClick={handleBack}
              className="text-brand-600 hover:text-brand-700"
            >
              ← Back to Timeline
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Get event relationships
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

  const stageConfig = STAGE_COLORS[event.stage as keyof typeof STAGE_COLORS] || STAGE_COLORS.planning;
  const IconComponent = EVENT_TYPE_ICONS[event.type as keyof typeof EVENT_TYPE_ICONS] || Calendar;

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="timeline"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />

      <main className="max-w-7xl mx-auto px-8 py-8">
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

        {/* Event Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={cn("p-3 rounded-lg", stageConfig.bg, stageConfig.border)}>
            <IconComponent className={cn("w-6 h-6", stageConfig.icon)} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-900 mb-2">{event.title}</h1>
            <div className="flex items-center gap-3">
              <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm", stageConfig.bg, stageConfig.border)}>
                <stageConfig.stageIcon className={cn("w-4 h-4", stageConfig.icon)} />
                <span className={cn("capitalize font-medium", stageConfig.icon)}>{event.stage}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary border border-border">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize text-secondary-foreground">{event.type}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-brand-100 border border-brand-200">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span className="text-brand-800 font-medium">
                  Year {event.year}, Month {event.month}, Day {event.day}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleEditEvent}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Event
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={deleteConfirmation.openModal}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Event Description */}
          <div className="lg:col-span-2">
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">Event Description</h2>
              {event.description ? (
                <EditorContentRenderer data={JSON.parse(event.description)} />
              ) : (
                <p className="text-brand-500 italic">
                  No description provided for this event.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Location & Characters */}
          <div className="space-y-6">
            {/* Location Section */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Location</h3>
              {eventLocation ? (
                <MiniCard
                  icon={MapPin}
                  title={eventLocation.name}
                  badge={eventLocation.type || "Location"}
                  badgeVariant="type"
                  onClick={() => handleLocationClick(eventLocation.id)}
                  className="w-full"
                />
              ) : (
                <p className="text-brand-500 italic text-sm">
                  No location specified for this event.
                </p>
              )}
            </div>

            {/* Characters Section */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters Involved</h3>
              {eventCharacters.length > 0 ? (
                <div className="space-y-3">
                  {eventCharacters.map((character) => (
                    <MiniCard
                      key={character.id}
                      icon={Users}
                      title={character.name}
                      badge={character.role || "Character"}
                      badgeVariant="type"
                      onClick={() => handleCharacterClick(character.id)}
                      className="w-full"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-brand-500 italic text-sm">
                  No characters specified for this event.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={deleteConfirmation.closeModal}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${event?.title}"? This action cannot be undone and will remove all associated relationships and data.`}
        itemName={event?.title || "this event"}
        isLoading={deleteConfirmation.isLoading}
      />
    </div>
  );
}