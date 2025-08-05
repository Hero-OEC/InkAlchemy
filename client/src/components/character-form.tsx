import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertCharacterSchema, type Character, type MagicSystem, type Spell, type Race } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WordProcessor } from "@/components/word-processor";
import { CharacterMagicSelector } from "@/components/character-magic-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/button-variations";
import { CharacterFormHeaderSkeleton, CharacterFormContentSkeleton } from "@/components/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Upload, X } from "lucide-react";

const formSchema = insertCharacterSchema.extend({
  projectId: z.number(),
});

interface CharacterFormProps {
  character: Character | null;
  projectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Helper function to convert null values to empty strings for form fields
const normalizeCharacterData = (character: Character | null) => ({
  name: character?.name || "",
  description: character?.description || "",
  prefix: character?.prefix || "",
  suffix: character?.suffix || "",
  role: character?.role || "",
  age: character?.age || "",
  raceId: character?.raceId || undefined,
  magicSystemId: character?.magicSystemId || undefined,
  imageUrl: character?.imageUrl || "",
});

export function CharacterForm({ character, projectId, onSuccess, onCancel }: CharacterFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedSpells, setSelectedSpells] = useState<number[]>([]);

  // Add logging to see when selectedSpells changes
  const handleSpellSelectionChange = (spells: number[]) => {
    console.log('CharacterForm: setSelectedSpells called with:', spells);
    setSelectedSpells(spells);
  };
  const [isUploading, setIsUploading] = useState(false);

  const { data: magicSystems = [], isLoading: magicSystemsLoading } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
  });

  const { data: projectSpells = [], isLoading: projectSpellsLoading } = useQuery<Spell[]>({
    queryKey: [`/api/projects/${projectId}/spells`],
  });

  // Prepare magic systems with spells for CharacterMagicSelector
  const magicSystemsWithSpells = magicSystems.map(system => ({
    ...system,
    type: system.type as "magic" | "power" || "magic",
    spells: projectSpells
      .filter(spell => spell.magicSystemId === system.id)
      .map(spell => ({
        ...spell,
        type: system.type === "magic" ? "spell" as const : "ability" as const
      }))
  }));

  const { data: characterSpells = [], isLoading: characterSpellsLoading } = useQuery<Spell[]>({
    queryKey: [`/api/characters/${character?.id}/spells`],
    enabled: !!character?.id,
  });

  const { data: races = [], isLoading: racesLoading } = useQuery<Race[]>({
    queryKey: [`/api/projects/${projectId}/races`],
  });

  // Check if required data is still loading
  const isDataLoading = magicSystemsLoading || projectSpellsLoading || racesLoading || 
    (character?.id && characterSpellsLoading);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      ...normalizeCharacterData(character),
      magicSystemId: character?.magicSystemId || undefined,
    },
  });

  // Initialize selected spells when character spells load
  useEffect(() => {
    if (characterSpells.length > 0) {
      setSelectedSpells(characterSpells.map(spell => spell.id));
    }
  }, [characterSpells]);

  const updateCharacterSpells = async (characterId: number) => {
    // Remove existing character spells
    if (character && characterSpells.length > 0) {
      for (const spell of characterSpells) {
        await apiRequest(`/api/characters/${characterId}/spells/${spell.id}`, {
          method: "DELETE",
        });
      }
    }

    // Add selected spells to character using the character spells endpoint
    for (const spellId of selectedSpells) {
      await apiRequest(`/api/characters/${characterId}/spells`, {
        method: "POST",
        body: JSON.stringify({
          spellId,
          proficiency: "novice"
        }),
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/characters", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: async (newCharacter) => {
      await updateCharacterSpells(newCharacter.id);
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/characters`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`] 
      });
      toast({
        title: "Success",
        description: "Character created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create character",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/characters/${character?.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: async (updatedCharacter) => {
      await updateCharacterSpells(updatedCharacter.id);
      
      // Invalidate all character-related caches
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/characters`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/characters/${updatedCharacter.id}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/characters/${updatedCharacter.id}/spells`] 
      });
      toast({
        title: "Success",
        description: "Character updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update character",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Form submitted with data:', data);
    console.log('Description field value:', data.description);
    
    if (character) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isDataLoading) {
    return (
      <div>
        <CharacterFormHeaderSkeleton />
        <CharacterFormContentSkeleton />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Header with Title and Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">
                {character ? "Edit Character" : "Create Character"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              onClick={(e) => {
                console.log('Save button clicked, form values:', form.getValues());
                // Let the form handle submission
              }}
            >
              {isLoading ? "Saving..." : character ? "Update Character" : "Create Character"}
            </Button>
          </div>
        </div>

        {/* Main Content Grid - SWITCHED: tabs on left (2/3), profile on right (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabbed Content (2/3) */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-brand-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("magic")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "magic"
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  Magic & Abilities
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6 mt-6">
              {activeTab === "details" && (
                <>
                  {/* Basic Information */}
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-950 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Character Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter character name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="prefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prefix</FormLabel>
                              <FormControl>
                                <Input placeholder="Sir, Lady, Dr." value={field.value || ""} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="suffix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suffix</FormLabel>
                              <FormControl>
                                <Input placeholder="Jr., III, PhD" value={field.value || ""} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-950 mb-4">Description</h3>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <WordProcessor
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Write a detailed description of your character..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {activeTab === "magic" && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                  <CharacterMagicSelector
                    availableMagicSystems={magicSystemsWithSpells}
                    selectedSpells={selectedSpells}
                    onSelectionChange={handleSpellSelectionChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Character Profile (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-brand-950 mb-4">Character Profile</h3>
              
              {/* Character Image */}
              <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200 mb-6 relative">
                {(form.watch("imageUrl") || "") ? (
                  <>
                    <img 
                      src={form.watch("imageUrl") || ""} 
                      alt="Character preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-brand-400" />
                  </div>
                )}
              </div>

              {/* Basic Profile Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Image</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  setIsUploading(true);
                                  try {
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    
                                    // Use character-specific endpoint if editing existing character
                                    const uploadUrl = character?.id 
                                      ? `/api/characters/${character.id}/upload-image`
                                      : '/api/upload-image';
                                    
                                    // Get authentication token from Supabase
                                    const { data: { session } } = await supabase.auth.getSession();
                                    const token = session?.access_token;
                                    
                                    const response = await fetch(uploadUrl, {
                                      method: 'POST',
                                      headers: {
                                        ...(token && { 'Authorization': `Bearer ${token}` })
                                      },
                                      body: formData,
                                    });
                                    
                                    if (response.ok) {
                                      const data = await response.json();
                                      // Handle both character upload and Editor.js response formats
                                      const imageUrl = data.imageUrl || data.file?.url || data.url;
                                      field.onChange(imageUrl);
                                      
                                      // If this was a character-specific upload, invalidate character queries
                                      if (character?.id) {
                                        queryClient.invalidateQueries({ 
                                          queryKey: [`/api/characters/${character.id}`] 
                                        });
                                        queryClient.invalidateQueries({ 
                                          queryKey: [`/api/projects/${projectId}/characters`] 
                                        });
                                      }
                                      
                                      toast({
                                        title: "Image uploaded successfully",
                                        description: "Your character image has been uploaded.",
                                      });
                                    } else {
                                      throw new Error('Upload failed');
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Upload failed",
                                      description: "Failed to upload image. Please try again.",
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setIsUploading(false);
                                  }
                                }
                              };
                              input.click();
                            }}
                            disabled={isUploading}
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? "Uploading..." : "Upload Image"}
                          </Button>
                          
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const currentImageUrl = field.value;
                                
                                // Remove image from form immediately
                                field.onChange("");
                                
                                // If this is an existing character, update it in the database and clean up storage
                                if (character && currentImageUrl) {
                                  try {
                                    // Update character in database to remove image
                                    const { data: { session } } = await supabase.auth.getSession();
                                    const token = session?.access_token;
                                    
                                    const response = await fetch(`/api/characters/${character.id}`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(token && { 'Authorization': `Bearer ${token}` })
                                      },
                                      body: JSON.stringify({ imageUrl: "" }),
                                    });
                                    
                                    if (response.ok) {
                                      // Refresh queries to update UI
                                      queryClient.invalidateQueries({ 
                                        queryKey: [`/api/characters/${character.id}`] 
                                      });
                                      queryClient.invalidateQueries({ 
                                        queryKey: [`/api/projects/${projectId}/characters`] 
                                      });
                                      
                                      toast({
                                        title: "Image removed",
                                        description: "Character image has been removed successfully.",
                                      });
                                      
                                      console.log('Character image removed from database and storage');
                                    } else {
                                      throw new Error('Failed to update character');
                                    }
                                  } catch (error) {
                                    console.error('Failed to remove character image:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to remove image. Please try again.",
                                      variant: "destructive",
                                    });
                                    // Restore the image URL if the update failed
                                    field.onChange(currentImageUrl);
                                  }
                                } else {
                                  toast({
                                    title: "Image removed",
                                    description: "Image removed from form.",
                                  });
                                }
                              }}
                              className="px-3"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select character type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="protagonist">Protagonist</SelectItem>
                          <SelectItem value="antagonist">Antagonist</SelectItem>
                          <SelectItem value="ally">Ally</SelectItem>
                          <SelectItem value="mentor">Mentor</SelectItem>
                          <SelectItem value="sidekick">Sidekick</SelectItem>
                          <SelectItem value="love-interest">Love Interest</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="villain">Villain</SelectItem>
                          <SelectItem value="supporting">Supporting</SelectItem>
                          <SelectItem value="background">Background</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input placeholder="25" value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="raceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select race" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {races.map((race) => (
                              <SelectItem key={race.id} value={race.id.toString()}>
                                {race.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



              </div>


            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}