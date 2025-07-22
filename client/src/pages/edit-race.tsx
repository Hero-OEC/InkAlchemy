import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input } from "@/components/form-inputs";
import { WordProcessor } from "@/components/word-processor";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { useNavigation } from "@/contexts/navigation-context";
import { ArrowLeft, UserCheck, Save, X } from "lucide-react";
import { insertRaceSchema, type Project, type Race } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

type RaceFormData = z.infer<typeof insertRaceSchema>;

export default function EditRace() {
  const { projectId, raceId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { goBack } = useNavigation();
  const [description, setDescription] = useState<any>(null);
  const [descriptionInitialized, setDescriptionInitialized] = useState(false);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: race, isLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: !!raceId && raceId !== "new" && !isNaN(Number(raceId))
  });

  const form = useForm<RaceFormData>({
    resolver: zodResolver(insertRaceSchema),
    defaultValues: {
      name: race?.name || "",
      description: race?.description || "",
      projectId: parseInt(projectId!),
    },
  });

  // Initialize form when race data loads
  useEffect(() => {
    if (race && !descriptionInitialized) {
      form.reset({
        name: race.name,
        description: race.description || "",
        projectId: race.projectId,
      });
      
      // Initialize description for WordProcessor
      if (race.description) {
        try {
          const parsedDescription = JSON.parse(race.description);
          setDescription(parsedDescription);
        } catch {
          // If it's not JSON, treat as plain text
          setDescription({
            blocks: [{ type: "paragraph", data: { text: race.description } }]
          });
        }
      }
      setDescriptionInitialized(true);
    }
  }, [race, form, descriptionInitialized]);

  // Set page title
  useEffect(() => {
    if (race?.name && project?.name) {
      document.title = `Edit ${race.name} - ${project.name} | StoryForge`;
    } else if (race?.name) {
      document.title = `Edit ${race.name} | StoryForge`;
    } else {
      document.title = "Edit Race | StoryForge";
    }
  }, [race?.name, project?.name]);

  const updateMutation = useMutation({
    mutationFn: async (data: RaceFormData) => {
      const response = await apiRequest(`/api/races/${raceId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/races/${raceId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/races`] });
      setLocation(`/projects/${projectId}/races/${raceId}`);
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleCancel = () => {
    setLocation(`/projects/${projectId}/races/${raceId}`);
  };

  const onSubmit = (data: RaceFormData) => {
    const submissionData = {
      ...data,
      description: description ? JSON.stringify(description) : "",
    };
    updateMutation.mutate(submissionData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading race...</p>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Race not found</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-brand-950">Edit Race</h1>
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
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <form id="race-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Race Name Section */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h2 className="text-xl font-semibold text-brand-900 mb-6">Race Name</h2>
                <div>
                  <Input
                    {...form.register("name")}
                    placeholder="Enter race name..."
                    className="text-2xl font-bold h-14 bg-transparent border-none shadow-none text-brand-950 placeholder:text-brand-400"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.name.message}</p>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h2 className="text-xl font-semibold text-brand-900 mb-6">Description</h2>
                <div className="border border-brand-200 rounded-lg">
                  <WordProcessor
                    value={description ? JSON.stringify(description) : undefined}
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
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Primary Homeland
                    </label>
                    <select className="w-full px-3 py-2 border border-brand-200 rounded-lg text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Select homeland location...</option>
                      <option value="unknown">Unknown/Nomadic</option>
                      <option value="multiple">Multiple Regions</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Traits */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Physical Characteristics</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Average Lifespan
                    </label>
                    <select className="w-full px-3 py-2 border border-brand-200 rounded-lg text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Select lifespan...</option>
                      <option value="short">Short (20-50 years)</option>
                      <option value="human">Human-like (60-100 years)</option>
                      <option value="long">Long-lived (100-500 years)</option>
                      <option value="immortal">Near Immortal (500+ years)</option>
                      <option value="eternal">Truly Immortal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Size Category
                    </label>
                    <select className="w-full px-3 py-2 border border-brand-200 rounded-lg text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Select size...</option>
                      <option value="tiny">Tiny (&lt; 3 feet)</option>
                      <option value="small">Small (3-4 feet)</option>
                      <option value="medium">Medium (4-7 feet)</option>
                      <option value="large">Large (7-10 feet)</option>
                      <option value="huge">Huge (10+ feet)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Abilities */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Abilities & Powers</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Magical Affinity
                    </label>
                    <select className="w-full px-3 py-2 border border-brand-200 rounded-lg text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Select magical ability...</option>
                      <option value="none">No Magic</option>
                      <option value="low">Low Magic Sensitivity</option>
                      <option value="medium">Moderate Magic User</option>
                      <option value="high">Highly Magical</option>
                      <option value="innate">Innate Magic Powers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Special Traits
                    </label>
                    <select className="w-full px-3 py-2 border border-brand-200 rounded-lg text-brand-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Select special traits...</option>
                      <option value="enhanced-senses">Enhanced Senses</option>
                      <option value="flight">Natural Flight</option>
                      <option value="shapeshifting">Shapeshifting</option>
                      <option value="telepathy">Telepathic</option>
                      <option value="elemental">Elemental Control</option>
                      <option value="regeneration">Regeneration</option>
                      <option value="other">Other Unique Traits</option>
                    </select>
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