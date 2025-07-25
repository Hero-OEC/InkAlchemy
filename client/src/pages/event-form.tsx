import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Textarea, Select } from "@/components/form-inputs";
import { MiniCard } from "@/components/mini-card";
import { useNavigation } from "@/contexts/navigation-context";
import { WordProcessor } from "@/components/word-processor";
import { EventFormHeaderSkeleton, EventFormContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Calendar, Crown, MapPin, Sword, Shield, Users, Zap, Heart, Skull, Eye, Lightbulb, PenTool, FileText, Edit, CheckCircle, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { insertEventSchema, type Project, type Event, type Location, type Character, type Relationship } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Event type icons (same as event details)
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

// Writing stage colors (same as event details)
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

const eventFormSchema = insertEventSchema.extend({
  year: z.number().min(1, "Year is required"),
  month: z.number().min(1, "Month is required").max(12, "Month must be between 1-12"),
  day: z.number().min(1, "Day is required").max(31, "Day must be between 1-31"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function EventForm() {
  const { projectId, eventId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { goBack } = useNavigation();
  const isEditing = !!eventId;
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: isEditing,
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: relationships = [], isLoading: relationshipsLoading } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
    enabled: isEditing,
  });

  // Check if any required data is still loading
  const isLoading = projectLoading || locationsLoading || charactersLoading || 
    (isEditing && (eventLoading || relationshipsLoading));

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      type: event?.type || "meeting",
      stage: event?.stage || "planning",
      year: event?.year || 1,
      month: event?.month || 1,
      day: event?.day || 1,
      locationId: event?.locationId || undefined,
      projectId: parseInt(projectId!),
    },
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      const pageTitle = isEditing ? `Edit Event - ${project.name} | InkAlchemy` : `Create Event - ${project.name} | InkAlchemy`;
      document.title = pageTitle;
    } else {
      document.title = isEditing ? "Edit Event | InkAlchemy" : "Create Event | InkAlchemy";
    }
  }, [project?.name, isEditing]);

  // Reset form when event data loads
  useEffect(() => {
    if (event && isEditing && relationships.length > 0) {
      form.reset({
        title: event.title,
        description: event.description || "",
        type: event.type,
        stage: event.stage,
        year: event.year,
        month: event.month,
        day: event.day,
        locationId: event.locationId || undefined,
        projectId: event.projectId,
      });

      // Load selected characters from relationships
      const eventCharacterIds = relationships
        .filter(rel => rel.sourceType === 'event' && rel.sourceId === event.id && rel.targetType === 'character')
        .map(rel => rel.targetId);
      
      const eventCharacters = characters.filter(char => eventCharacterIds.includes(char.id));
      setSelectedCharacters(eventCharacters);
      
      // Load selected location
      if (event.locationId) {
        const eventLocation = locations.find(loc => loc.id === event.locationId);
        if (eventLocation) {
          setSelectedLocations([eventLocation]);
        }
      }
    }
  }, [event, isEditing, form, relationships, characters]);

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const event = await apiRequest(`/api/events`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      // Create character relationships
      for (const character of selectedCharacters) {
        await apiRequest(`/api/relationships`, {
          method: "POST",
          body: JSON.stringify({
            projectId: parseInt(projectId!),
            sourceType: 'event',
            sourceId: event.id,
            targetType: 'character',
            targetId: character.id,
            relationshipType: 'involved',
            description: `${character.name} is involved in ${event.title}`,
          }),
        });
      }
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/events`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/relationships`] });
      setLocation(`/projects/${projectId}/timeline`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const updatedEvent = await apiRequest(`/api/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      
      // Delete existing character relationships for this event
      const existingRelationships = relationships.filter(rel => 
        rel.sourceType === 'event' && rel.sourceId === parseInt(eventId!) && rel.targetType === 'character'
      );
      
      for (const rel of existingRelationships) {
        await apiRequest(`/api/relationships/${rel.id}`, {
          method: "DELETE",
        });
      }
      
      // Create new character relationships
      for (const character of selectedCharacters) {
        await apiRequest(`/api/relationships`, {
          method: "POST",
          body: JSON.stringify({
            projectId: parseInt(projectId!),
            sourceType: 'event',
            sourceId: parseInt(eventId!),
            targetType: 'character',
            targetId: character.id,
            relationshipType: 'involved',
            description: `${character.name} is involved in ${updatedEvent.title}`,
          }),
        });
      }
      
      return updatedEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/events`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/relationships`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      setLocation(`/projects/${projectId}/events/${eventId}`);
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    if (isEditing) {
      setLocation(`/projects/${projectId}/events/${eventId}`);
    } else {
      setLocation(`/projects/${projectId}/timeline`);
    }
  };

  const onSubmit = (data: EventFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedStage = form.watch("stage");
  const selectedType = form.watch("type");
  const stageConfig = STAGE_COLORS[selectedStage as keyof typeof STAGE_COLORS] || STAGE_COLORS.planning;
  const IconComponent = EVENT_TYPE_ICONS[selectedType as keyof typeof EVENT_TYPE_ICONS] || Calendar;

  const eventTypeOptions = [
    { value: "battle", label: "Battle", icon: EVENT_TYPE_ICONS.battle },
    { value: "meeting", label: "Meeting", icon: EVENT_TYPE_ICONS.meeting },
    { value: "discovery", label: "Discovery", icon: EVENT_TYPE_ICONS.discovery },
    { value: "political", label: "Political", icon: EVENT_TYPE_ICONS.political },
    { value: "personal", label: "Personal", icon: EVENT_TYPE_ICONS.personal },
    { value: "death", label: "Death", icon: EVENT_TYPE_ICONS.death },
    { value: "travel", label: "Travel", icon: EVENT_TYPE_ICONS.travel },
    { value: "magic", label: "Magic", icon: EVENT_TYPE_ICONS.magic },
    { value: "other", label: "Other", icon: EVENT_TYPE_ICONS.other },
  ];

  const stageOptions = [
    { value: "planning", label: "Planning", icon: STAGE_COLORS.planning.stageIcon },
    { value: "writing", label: "Writing", icon: STAGE_COLORS.writing.stageIcon },
    { value: "first-draft", label: "First Draft", icon: STAGE_COLORS["first-draft"].stageIcon },
    { value: "editing", label: "Editing", icon: STAGE_COLORS.editing.stageIcon },
    { value: "complete", label: "Complete", icon: STAGE_COLORS.complete.stageIcon },
  ];

  const locationOptions = [
    { value: "", label: "No location specified" },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name,
    })),
  ];

  const availableCharacters = characters.filter(char => 
    !selectedCharacters.some(selected => selected.id === char.id)
  );

  const availableLocations = locations.filter(location => 
    !selectedLocations.some(selected => selected.id === location.id)
  );

  const handleAddCharacter = (characterId: string) => {
    const character = characters.find(c => c.id === parseInt(characterId));
    if (character) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const handleRemoveCharacter = (characterId: number) => {
    setSelectedCharacters(selectedCharacters.filter(c => c.id !== characterId));
  };

  const handleAddLocation = (locationId: string) => {
    const location = locations.find(l => l.id === parseInt(locationId));
    if (location) {
      setSelectedLocations([...selectedLocations, location]);
      // Set the first selected location as the primary location for the event
      if (selectedLocations.length === 0) {
        form.setValue("locationId", location.id);
      }
    }
  };

  const handleRemoveLocation = (locationId: number) => {
    const newLocations = selectedLocations.filter(l => l.id !== locationId);
    setSelectedLocations(newLocations);
    // Update primary location
    if (form.watch("locationId") === locationId) {
      form.setValue("locationId", newLocations.length > 0 ? newLocations[0].id : undefined);
    }
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
              {isEditing ? "Back to Event" : "Back to Timeline"}
            </Button>
          </div>

          {/* Form Header Skeleton */}
          <EventFormHeaderSkeleton />

          {/* Main Content Skeleton */}
          <EventFormContentSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="timeline"
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
            {isEditing ? "Back to Event" : "Back to Timeline"}
          </Button>
        </div>

        {/* Form Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-lg", stageConfig.bg, stageConfig.border)}>
              <IconComponent className={cn("w-6 h-6", stageConfig.icon)} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-brand-900 mb-2">
                {isEditing ? `Edit Event` : "Create New Event"}
              </h1>
              <p className="text-brand-600">
                {isEditing ? "Update event details and timeline information" : "Add a new event to your project timeline"}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              form="event-form"
            >
              {isEditing ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Event
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Event Header Form */}
        <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Event Title and Status Row */}
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <Input
                placeholder="Enter event title..."
                {...form.register("title")}
                error={form.formState.errors.title?.message}
                className="text-lg font-semibold"
              />
            </div>

            {/* Status and Type Badges Row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-brand-700 uppercase tracking-wide">Writing Stage</label>
                <Select
                  options={stageOptions}
                  value={form.watch("stage") || ""}
                  onChange={(value) => form.setValue("stage", value as any)}
                  error={form.formState.errors.stage?.message}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-brand-700 uppercase tracking-wide">Event Type</label>
                <Select
                  options={eventTypeOptions}
                  value={form.watch("type") || ""}
                  onChange={(value) => form.setValue("type", value as any)}
                  error={form.formState.errors.type?.message}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-brand-700 uppercase tracking-wide">Date</label>
                <div className="flex gap-2 items-center">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Year"
                      {...form.register("year", { valueAsNumber: true })}
                      error={form.formState.errors.year?.message}
                      className="w-20 text-center"
                    />
                    <span className="text-brand-600 font-medium">,</span>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="Month"
                      {...form.register("month", { valueAsNumber: true })}
                      error={form.formState.errors.month?.message}
                      className="w-20 text-center"
                    />
                    <span className="text-brand-600 font-medium">,</span>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Day"
                      {...form.register("day", { valueAsNumber: true })}
                      error={form.formState.errors.day?.message}
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h2 className="text-xl font-semibold text-brand-900 mb-6">Event Description</h2>
                <WordProcessor
                  placeholder="Describe what happens in this event..."
                  value={form.watch("description") || ""}
                  onChange={(value) => form.setValue("description", value)}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location Section */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Locations</h3>
                
                {/* Add Location */}
                {availableLocations.length > 0 && (
                  <div className="mb-4">
                    <Select
                      placeholder="Add a location..."
                      options={[
                        { value: "", label: "Select a location..." },
                        ...availableLocations.map(location => ({
                          value: location.id.toString(),
                          label: location.name,
                        })),
                      ]}
                      value=""
                      onChange={(value) => {
                        if (value) {
                          handleAddLocation(value);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Selected Locations */}
                {selectedLocations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLocations.map((location, index) => (
                      <MiniCard
                        key={location.id}
                        icon={MapPin}
                        title={location.name}
                        badge={index === 0 ? "Primary Location" : "Additional Location"}
                        badgeVariant="type"
                        variant="editable"
                        onDelete={() => handleRemoveLocation(location.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-500 italic text-sm">
                    No locations specified for this event.
                  </p>
                )}
              </div>

              {/* Characters Section */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters Involved</h3>
                
                {/* Add Character */}
                {availableCharacters.length > 0 && (
                  <div className="mb-4">
                    <Select
                      placeholder="Add a character..."
                      options={[
                        { value: "", label: "Select a character..." },
                        ...availableCharacters.map(char => ({
                          value: char.id.toString(),
                          label: char.name,
                        })),
                      ]}
                      value=""
                      onChange={(value) => {
                        if (value) {
                          handleAddCharacter(value);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Selected Characters */}
                {selectedCharacters.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCharacters.map(character => (
                      <MiniCard
                        key={character.id}
                        icon={Users}
                        title={character.name}
                        badge={character.type || "Character"}
                        badgeVariant="type"
                        variant="editable"
                        onDelete={() => handleRemoveCharacter(character.id)}
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


        </form>
      </main>
    </div>
  );
}