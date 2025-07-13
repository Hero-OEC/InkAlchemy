import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Textarea, Select } from "@/components/form-inputs";
import { ArrowLeft, Building2, Trees, Castle, Mountain, Home, Landmark, Globe } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLocationSchema, type Project } from "@shared/schema";
import { z } from "zod";

const formSchema = insertLocationSchema.extend({
  type: z.string().min(1, "Type is required"),
});

const LOCATION_TYPES = [
  { value: "settlement", label: "Settlement", icon: Building2 },
  { value: "city", label: "City", icon: Building2 },
  { value: "village", label: "Village", icon: Home },
  { value: "town", label: "Town", icon: Building2 },
  { value: "natural", label: "Natural Area", icon: Trees },
  { value: "forest", label: "Forest", icon: Trees },
  { value: "mountain", label: "Mountain", icon: Mountain },
  { value: "river", label: "River", icon: Globe },
  { value: "lake", label: "Lake", icon: Globe },
  { value: "ocean", label: "Ocean", icon: Globe },
  { value: "building", label: "Building", icon: Landmark },
  { value: "fortress", label: "Fortress", icon: Castle },
  { value: "castle", label: "Castle", icon: Castle },
  { value: "temple", label: "Temple", icon: Landmark },
  { value: "academy", label: "Academy", icon: Landmark },
  { value: "tower", label: "Tower", icon: Castle },
  { value: "dungeon", label: "Dungeon", icon: Castle },
  { value: "other", label: "Other", icon: Globe },
];

export default function CreateLocation() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: parseInt(projectId!),
      name: "",
      type: "",
      description: "",
      geography: "",
      culture: "",
      politics: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("POST", "/api/locations", data),
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/locations`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`] 
      });
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      setLocation(`/projects/${projectId}/locations/${newLocation.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/locations`);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data);
  };

  const selectedType = LOCATION_TYPES.find(type => type.value === form.watch("type"));
  const TypeIcon = selectedType?.icon || Globe;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true}
        currentPage="locations"
        onNavigate={handleNavigation}
        projectName={project?.name}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Locations
          </Button>
        </div>

        {/* Form Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-500 p-3 rounded-xl">
            <TypeIcon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-950 mb-2">Create New Location</h1>
            <p className="text-brand-600">Add a new location to your world</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location Name"
                placeholder="Enter location name"
                value={form.watch("name")}
                onChange={(e) => form.setValue("name", e.target.value)}
                error={form.formState.errors.name?.message}
              />

              <Select
                label="Location Type"
                placeholder="Select location type"
                value={form.watch("type")}
                onChange={(value) => form.setValue("type", value)}
                options={LOCATION_TYPES.map(type => ({
                  value: type.value,
                  label: type.label,
                  icon: type.icon
                }))}
                error={form.formState.errors.type?.message}
              />
            </div>

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Describe this location, its atmosphere, and importance to your story"
              value={form.watch("description")}
              onChange={(e) => form.setValue("description", e.target.value)}
              error={form.formState.errors.description?.message}
              className="min-h-[100px]"
            />

            {/* Geography */}
            <Textarea
              label="Geography & Environment"
              placeholder="Describe the physical features, climate, terrain, and environmental details"
              value={form.watch("geography")}
              onChange={(e) => form.setValue("geography", e.target.value)}
              error={form.formState.errors.geography?.message}
              className="min-h-[80px]"
            />

            {/* Culture */}
            <Textarea
              label="Culture & Significance"
              placeholder="Describe the cultural importance, traditions, or significance of this location"
              value={form.watch("culture")}
              onChange={(e) => form.setValue("culture", e.target.value)}
              error={form.formState.errors.culture?.message}
              className="min-h-[80px]"
            />

            {/* Politics */}
            <Textarea
              label="Politics & Governance"
              placeholder="Describe the political structure, leadership, or governance of this location"
              value={form.watch("politics")}
              onChange={(e) => form.setValue("politics", e.target.value)}
              error={form.formState.errors.politics?.message}
              className="min-h-[80px]"
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Location"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}