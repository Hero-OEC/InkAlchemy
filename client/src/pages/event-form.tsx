import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Textarea, Select } from "@/components/form-inputs";
import { ArrowLeft, Calendar, Crown, MapPin, Sword, Shield, Users, Zap, Heart, Skull, Eye, Lightbulb, PenTool, FileText, Edit, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { insertEventSchema, type Project, type Event, type Location, type Character } from "@shared/schema";
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
    bg: "bg-brand-950",
    border: "border-brand-950",
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
  const isEditing = !!eventId;

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: isEditing,
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      type: event?.type || "meeting",
      stage: event?.stage || "planning",
      importance: event?.importance || 3,
      year: event?.year || 1,
      month: event?.month || 1,
      day: event?.day || 1,
      locationId: event?.locationId || undefined,
      projectId: parseInt(projectId!),
    },
  });

  // Reset form when event data loads
  useEffect(() => {
    if (event && isEditing) {
      form.reset({
        title: event.title,
        description: event.description || "",
        type: event.type,
        stage: event.stage,
        importance: event.importance,
        year: event.year,
        month: event.month,
        day: event.day,
        locationId: event.locationId || undefined,
        projectId: event.projectId,
      });
    }
  }, [event, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => apiRequest(`/api/events`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/events`] });
      setLocation(`/projects/${projectId}/timeline`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EventFormData) => apiRequest(`/api/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/events`] });
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
    { value: "battle", label: "Battle" },
    { value: "meeting", label: "Meeting" },
    { value: "discovery", label: "Discovery" },
    { value: "political", label: "Political" },
    { value: "personal", label: "Personal" },
    { value: "death", label: "Death" },
    { value: "travel", label: "Travel" },
    { value: "magic", label: "Magic" },
    { value: "other", label: "Other" },
  ];

  const stageOptions = [
    { value: "planning", label: "Planning" },
    { value: "writing", label: "Writing" },
    { value: "first-draft", label: "First Draft" },
    { value: "editing", label: "Editing" },
    { value: "complete", label: "Complete" },
  ];

  const locationOptions = [
    { value: "", label: "No location specified" },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name,
    })),
  ];

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="timeline"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
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
        <div className="flex items-center gap-4 mb-8">
          <div className={cn("p-3 rounded-lg", stageConfig.bg, stageConfig.border)}>
            <IconComponent className={cn("w-6 h-6", stageConfig.icon)} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-900 mb-2">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-brand-600">
              {isEditing ? "Update event details and timeline information" : "Add a new event to your project timeline"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl border border-brand-200 p-6">
            <h2 className="text-xl font-semibold text-brand-900 mb-6">Event Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Event Title"
                  placeholder="Enter event title..."
                  {...form.register("title")}
                  error={form.formState.errors.title?.message}
                />
              </div>

              <Select
                label="Event Type"
                options={eventTypeOptions}
                value={form.watch("type")}
                onChange={(value) => form.setValue("type", value as any)}
                error={form.formState.errors.type?.message}
              />

              <Select
                label="Writing Stage"
                options={stageOptions}
                value={form.watch("stage")}
                onChange={(value) => form.setValue("stage", value as any)}
                error={form.formState.errors.stage?.message}
              />

              <Select
                label="Location"
                options={locationOptions}
                value={form.watch("locationId")?.toString() || ""}
                onChange={(value) => form.setValue("locationId", value ? parseInt(value) : undefined)}
                error={form.formState.errors.locationId?.message}
              />

              <div>
                <Input
                  label="Importance (1-5)"
                  type="number"
                  min={1}
                  max={5}
                  {...form.register("importance", { valueAsNumber: true })}
                  error={form.formState.errors.importance?.message}
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-brand-900 mb-3">Event Date</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Year"
                    type="number"
                    min={1}
                    {...form.register("year", { valueAsNumber: true })}
                    error={form.formState.errors.year?.message}
                  />
                  <Input
                    label="Month"
                    type="number"
                    min={1}
                    max={12}
                    {...form.register("month", { valueAsNumber: true })}
                    error={form.formState.errors.month?.message}
                  />
                  <Input
                    label="Day"
                    type="number"
                    min={1}
                    max={31}
                    {...form.register("day", { valueAsNumber: true })}
                    error={form.formState.errors.day?.message}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Event Description"
                  placeholder="Describe what happens in this event..."
                  rows={6}
                  {...form.register("description")}
                  error={form.formState.errors.description?.message}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
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
            >
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}