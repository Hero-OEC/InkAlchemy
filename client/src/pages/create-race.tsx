import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input } from "@/components/form-inputs";
import { WordProcessor } from "@/components/word-processor";
import { useNavigation } from "@/contexts/navigation-context";
import { ArrowLeft, UserCheck, Save, X } from "lucide-react";
import { insertRaceSchema, type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

type RaceFormData = z.infer<typeof insertRaceSchema>;

export default function CreateRace() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { goBack } = useNavigation();
  const [description, setDescription] = useState<any>(null);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const form = useForm<RaceFormData>({
    resolver: zodResolver(insertRaceSchema),
    defaultValues: {
      name: "",
      description: "",
      projectId: parseInt(projectId!),
    },
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Create Race - ${project.name} | StoryForge`;
    } else {
      document.title = "Create Race | StoryForge";
    }
  }, [project?.name]);

  const createMutation = useMutation({
    mutationFn: async (data: RaceFormData) => {
      const response = await apiRequest("/api/races", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (newRace) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/races`] });
      setLocation(`/projects/${projectId}/races/${newRace.id}`);
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleCancel = () => {
    setLocation(`/projects/${projectId}/races`);
  };

  const onSubmit = (data: RaceFormData) => {
    const submissionData = {
      ...data,
      description: description ? JSON.stringify(description) : "",
    };
    createMutation.mutate(submissionData);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
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
            Back
          </Button>
        </div>

        {/* Race Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-200">
                <UserCheck size={24} className="text-brand-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">Create New Race</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-200 text-brand-700">
                    Race
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                form="race-form"
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {createMutation.isPending ? "Creating..." : "Create Race"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <form id="race-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content - Race Name */}
            <div className="lg:col-span-2">
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-brand-900 mb-2">
                    Race Name
                  </label>
                  <Input
                    {...form.register("name")}
                    placeholder="Enter race name..."
                    className="text-2xl font-bold h-14 bg-transparent border-none shadow-none text-brand-950 placeholder:text-brand-400"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-4">
                    Description
                  </label>
                  <div className="border border-brand-200 rounded-lg">
                    <WordProcessor
                      onChange={(data) => {
                        try {
                          setDescription(JSON.parse(data));
                        } catch {
                          setDescription(null);
                        }
                      }}
                      placeholder="Describe the race's characteristics, appearance, culture, and abilities..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Future expansion area */}
            <div className="lg:col-span-1">
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                  <p className="text-brand-600 text-sm">
                    Additional race properties can be added here in the future
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}