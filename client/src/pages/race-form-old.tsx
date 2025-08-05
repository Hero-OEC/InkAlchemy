import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Race } from "@shared/schema";

const raceFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  biology: z.string().optional(),
  culture: z.string().optional(),
  homeland: z.string().optional(),
  traits: z.string().optional(),
});

type RaceFormData = z.infer<typeof raceFormSchema>;

interface RaceFormProps {
  mode: "create" | "edit";
}

export default function RaceForm({ mode }: RaceFormProps) {
  const { projectId, raceId } = useParams();
  const [, setLocation] = useLocation();
  const { navigateWithReferrer } = useNavigation();
  const queryClient = useQueryClient();
  const currentPath = mode === "create" 
    ? `/projects/${projectId}/races/new`
    : `/projects/${projectId}/races/${raceId}/edit`;

  // Set page title
  useEffect(() => {
    document.title = mode === "create" ? "Create Race - InkAlchemy" : "Edit Race - InkAlchemy";
  }, [mode]);

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch race data for edit mode
  const { data: race, isLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: mode === "edit" && !!raceId,
  });

  // Update page title when race data loads
  useEffect(() => {
    if (race && project && mode === "edit") {
      document.title = `Edit ${race.name} - ${project.name} | InkAlchemy`;
    } else if (project && mode === "create") {
      document.title = `Create Race - ${project.name} | InkAlchemy`;
    }
  }, [race, project, mode]);

  const form = useForm<RaceFormData>({
    resolver: zodResolver(raceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      biology: "",
      culture: "",
      homeland: "",
      traits: "",
    },
  });

  // Update form when race data loads
  useEffect(() => {
    if (race && mode === "edit") {
      form.reset({
        name: race.name,
        description: race.description || "",
        biology: race.biology || "",
        culture: race.culture || "",
        homeland: race.homeland || "",
        traits: race.traits || "",
      });
    }
  }, [race, mode, form]);

  const createMutation = useMutation({
    mutationFn: (data: RaceFormData) => 
      apiRequest(`/api/races`, {
        method: "POST",
        body: JSON.stringify({ ...data, projectId: parseInt(projectId!) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/races`] });
      navigateWithReferrer(`/projects/${projectId}/characters`, currentPath);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RaceFormData) => 
      apiRequest(`/api/races/${raceId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/races/${raceId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/races`] });
      navigateWithReferrer(`/projects/${projectId}/races/${raceId}`, currentPath);
    },
  });

  const handleBack = () => {
    if (mode === "edit") {
      navigateWithReferrer(`/projects/${projectId}/races/${raceId}`, currentPath);
    } else {
      navigateWithReferrer(`/projects/${projectId}/characters`, currentPath);
    }
  };

  const onSubmit = (data: RaceFormData) => {
    if (mode === "create") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (mode === "edit" && isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          projectId={projectId || ""} 
          projectName={project?.name}
          onNavigate={(path) => setLocation(path)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-brand-200 rounded mb-4"></div>
            <div className="h-96 bg-brand-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        projectId={projectId || ""} 
        projectName={project?.name}
        onNavigate={(path) => setLocation(path)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-brand-600 hover:text-brand-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-200">
              <UserCheck className="w-8 h-8 text-brand-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-900">
                {mode === "create" ? "Create Race" : `Edit ${race?.name || "Race"}`}
              </h1>
              <p className="text-brand-600">
                {mode === "create" ? "Add a new race to your world" : "Update race information"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-brand-200 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Elves, Dwarves, Dragonborn"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief overview of this race..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Biology */}
              <FormField
                control={form.control}
                name="biology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biology & Physiology</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Physical characteristics, lifespan, abilities..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Culture */}
              <FormField
                control={form.control}
                name="culture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Culture & Society</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Social structure, traditions, values..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Homeland */}
              <FormField
                control={form.control}
                name="homeland"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Homeland</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Where this race originates from or primarily lives..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Traits */}
              <FormField
                control={form.control}
                name="traits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traits & Abilities</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Special abilities, magical traits, unique characteristics..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Saving..." : mode === "create" ? "Create Race" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}