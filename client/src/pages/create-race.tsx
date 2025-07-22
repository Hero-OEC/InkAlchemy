import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Select } from "@/components/form-inputs";
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

        {/* Race Header Form */}
        <form id="race-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Race Title */}
          <div className="space-y-6">
            <div>
              <Input
                {...form.register("name")}
                placeholder="Enter race name..."
                error={form.formState.errors.name?.message}
                className="text-lg font-semibold"
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Section */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h2 className="text-xl font-semibold text-brand-900 mb-6">Description</h2>
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

            {/* Sidebar - Race Properties */}
            <div className="lg:col-span-1 space-y-6">
              {/* Race Origin */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Origin & Homeland</h3>
                <div className="space-y-4">
                  <div>
                    <Select
                      label="Primary Homeland"
                      placeholder="Select homeland location..."
                      options={[
                        { value: "unknown", label: "Unknown/Nomadic" },
                        { value: "multiple", label: "Multiple Regions" }
                      ]}
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>

              {/* Physical Traits */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Physical Characteristics</h3>
                <div className="space-y-4">
                  <div>
                    <Select
                      label="Average Lifespan"
                      placeholder="Select lifespan..."
                      options={[
                        { value: "short", label: "Short (20-50 years)" },
                        { value: "human", label: "Human-like (60-100 years)" },
                        { value: "long", label: "Long-lived (100-500 years)" },
                        { value: "immortal", label: "Near Immortal (500+ years)" },
                        { value: "eternal", label: "Truly Immortal" }
                      ]}
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <Select
                      label="Size Category"
                      placeholder="Select size..."
                      options={[
                        { value: "tiny", label: "Tiny (< 3 feet)" },
                        { value: "small", label: "Small (3-4 feet)" },
                        { value: "medium", label: "Medium (4-7 feet)" },
                        { value: "large", label: "Large (7-10 feet)" },
                        { value: "huge", label: "Huge (10+ feet)" }
                      ]}
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>

              {/* Special Abilities */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Abilities & Powers</h3>
                <div className="space-y-4">
                  <div>
                    <Select
                      label="Magical Affinity"
                      placeholder="Select magical ability..."
                      options={[
                        { value: "none", label: "No Magic" },
                        { value: "low", label: "Low Magic Sensitivity" },
                        { value: "medium", label: "Moderate Magic User" },
                        { value: "high", label: "Highly Magical" },
                        { value: "innate", label: "Innate Magic Powers" }
                      ]}
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <Select
                      label="Special Traits"
                      placeholder="Select special traits..."
                      options={[
                        { value: "enhanced-senses", label: "Enhanced Senses" },
                        { value: "flight", label: "Natural Flight" },
                        { value: "shapeshifting", label: "Shapeshifting" },
                        { value: "telepathy", label: "Telepathic" },
                        { value: "elemental", label: "Elemental Control" },
                        { value: "regeneration", label: "Regeneration" },
                        { value: "other", label: "Other Unique Traits" }
                      ]}
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}