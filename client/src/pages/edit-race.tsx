import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Select } from "@/components/form-inputs";
import { WordProcessor } from "@/components/word-processor";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { CharacterCard } from "@/components/character-card";
import { MiniCard } from "@/components/mini-card";
import { RaceFormHeaderSkeleton, RaceFormContentSkeleton } from "@/components/skeleton";
import { useNavigation } from "@/contexts/navigation-context";
import { ArrowLeft, Users, Save, X } from "lucide-react";
import { insertRaceSchema, type Project, type Race, type Character, type Location } from "@shared/schema";
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

  // Additional form state for race properties
  const [homelandId, setHomelandId] = useState<string>("");
  const [lifespan, setLifespan] = useState<string>("");
  const [sizeCategory, setSizeCategory] = useState<string>("");
  const [magicalAffinity, setMagicalAffinity] = useState<string>("");


  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: race, isLoading: raceLoading } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: !!raceId && raceId !== "new" && !isNaN(Number(raceId))
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  // Query for locations to populate homeland dropdown
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
    enabled: !!projectId,
  });

  // Check if any required data is still loading
  const isLoading = projectLoading || raceLoading || charactersLoading || locationsLoading;

  // Filter characters of this race
  const raceCharacters = characters.filter(character => 
    character.raceId === race?.id
  );

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
      
      // Initialize additional race properties
      setHomelandId(race.homelandId?.toString() || "");
      setLifespan(race.lifespan || "");
      setSizeCategory(race.sizeCategory || "");
      setMagicalAffinity(race.magicalAffinity || "");
      
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
      document.title = `Edit ${race.name} - ${project.name} | InkAlchemy`;
    } else if (race?.name) {
      document.title = `Edit ${race.name} | InkAlchemy`;
    } else {
      document.title = "Edit Race | InkAlchemy";
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
      homelandId: homelandId ? parseInt(homelandId) : null,
      lifespan: lifespan || null,
      sizeCategory: sizeCategory || null,
      magicalAffinity: magicalAffinity || null,
    };
    updateMutation.mutate(submissionData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
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
              Back
            </Button>
          </div>

          {/* Race Header Skeleton */}
          <RaceFormHeaderSkeleton />

          {/* Main Content Skeleton */}
          <RaceFormContentSkeleton />
        </main>
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
              <div className="p-3 rounded-xl bg-brand-500">
                <Users size={24} className="text-white" />
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
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
                <h2 className="text-xl font-semibold text-brand-900 mb-6">Race Description</h2>
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

            {/* Sidebar - Race Properties */}
            <div className="lg:col-span-1 space-y-6">
              {/* Homeland */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Homeland</h3>
                <div className="space-y-4">
                  <div>
                    <Select
                      label="Homeland Location"
                      placeholder="Select homeland location..."
                      options={[
                        { value: "", label: "No homeland specified" },
                        { value: "nomadic", label: "Nomadic/No Fixed Home" },
                        ...locations.map(location => ({
                          value: location.id.toString(),
                          label: location.name
                        }))
                      ]}
                      value={homelandId}
                      onChange={setHomelandId}
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
                      value={lifespan}
                      onChange={setLifespan}
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
                      value={sizeCategory}
                      onChange={setSizeCategory}
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
                      value={magicalAffinity}
                      onChange={setMagicalAffinity}
                    />
                  </div>

                </div>
              </div>

              {/* Characters Section */}
              <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters of This Race</h3>
                
                {/* Character Assignment Dropdown - only show if there are unassigned characters */}
                {characters.filter(char => !char.raceId || char.raceId !== race?.id).length > 0 && (
                  <div className="mb-4">
                    <Select
                      placeholder="Assign a character to this race..."
                      options={[
                        { value: "", label: "Select a character..." },
                        ...characters
                          .filter(char => !char.raceId || char.raceId !== race?.id)
                          .map(character => ({
                            value: character.id.toString(),
                            label: [character.prefix, character.name, character.suffix].filter(Boolean).join(" "),
                          }))
                      ]}
                      value=""
                      onChange={async (characterId) => {
                        if (characterId && race?.id) {
                          try {
                            await apiRequest(`/api/characters/${characterId}`, {
                              method: "PATCH",
                              body: JSON.stringify({ raceId: race.id }),
                            });
                            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/characters`] });
                          } catch (error) {
                            console.error('Failed to assign character to race:', error);
                          }
                        }
                      }}
                    />
                  </div>
                )}
                
                {raceCharacters.length > 0 ? (
                  <div className="space-y-3">
                    {raceCharacters.map((character) => (
                      <MiniCard
                        key={character.id}
                        icon={Users}
                        title={[character.prefix, character.name, character.suffix].filter(Boolean).join(" ")}
                        badge={character.type || "supporting"}
                        badgeVariant="type"
                        variant="editable"
                        onClick={() => setLocation(`/projects/${projectId}/characters/${character.id}`)}
                        onDelete={async () => {
                          try {
                            await apiRequest(`/api/characters/${character.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ raceId: null }),
                            });
                            queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/characters`] });
                          } catch (error) {
                            console.error('Failed to remove character from race:', error);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users size={24} className="mx-auto text-brand-300 mb-2" />
                    <p className="text-sm text-brand-600 mb-3">No characters assigned to this race yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/projects/${projectId}/characters`)}
                    >
                      View All Characters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}