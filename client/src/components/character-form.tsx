import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CharacterMagicSelector } from "@/components/character-magic-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCharacterSchema, type Character, type MagicSystem, type Spell } from "@shared/schema";
import { z } from "zod";
import { Users, Save, Plus } from "lucide-react";

const formSchema = insertCharacterSchema.extend({
  status: z.enum(["active", "developing", "inactive"]).optional(),
});

interface CharacterFormProps {
  character?: Character | null;
  projectId: number;
  onSuccess: () => void;
}

export function CharacterForm({ character, projectId, onSuccess }: CharacterFormProps) {
  const { toast } = useToast();
  const [selectedSpells, setSelectedSpells] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch magic systems and character spells
  const { data: magicSystems = [] } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
  });

  const { data: characterSpells = [] } = useQuery<(Spell & { proficiency?: string })[]>({
    queryKey: [`/api/characters/${character?.id}/spells`],
    enabled: !!character?.id,
  });

  // Fetch all spells for all magic systems
  const { data: allSpells = [] } = useQuery<Spell[]>({
    queryKey: [`/api/projects/${projectId}/spells`],
  });

  // Initialize selected spells when character data loads
  useEffect(() => {
    if (characterSpells.length > 0) {
      setSelectedSpells(characterSpells.map(spell => spell.id));
    }
  }, [characterSpells]);

  // Function to sync character spells
  const updateCharacterSpells = async (characterId: number) => {
    try {
      // Get current character spells
      const currentSpells = await queryClient.fetchQuery({
        queryKey: [`/api/characters/${characterId}/spells`],
        queryFn: () => fetch(`/api/characters/${characterId}/spells`).then(res => res.json())
      });
      
      const currentSpellIds = currentSpells.map((spell: any) => spell.id);
      
      // Add new spells
      const spellsToAdd = selectedSpells.filter(spellId => !currentSpellIds.includes(spellId));
      for (const spellId of spellsToAdd) {
        await apiRequest("POST", `/api/characters/${characterId}/spells`, {
          spellId,
          proficiency: "novice"
        });
      }
      
      // Remove spells that are no longer selected
      const spellsToRemove = currentSpellIds.filter((spellId: number) => !selectedSpells.includes(spellId));
      for (const spellId of spellsToRemove) {
        await apiRequest("DELETE", `/api/characters/${characterId}/spells/${spellId}`, {});
      }
    } catch (error) {
      console.error("Error updating character spells:", error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      name: character?.name || "",
      role: character?.role || "",
      description: character?.description || "",
      appearance: character?.appearance || "",
      personality: character?.personality || "",
      background: character?.background || "",
      goals: character?.goals || "",
      imageUrl: character?.imageUrl || "",
      status: character?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("POST", "/api/characters", data),
    onSuccess: async (newCharacter) => {
      // Add character spells
      await updateCharacterSpells(newCharacter.id);
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "characters"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "stats"] 
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
      apiRequest("PATCH", `/api/characters/${character?.id}`, data),
    onSuccess: async (updatedCharacter) => {
      // Update character spells
      await updateCharacterSpells(updatedCharacter.id);
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "characters"] 
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
    if (character) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Main Content Grid - matching character details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Character Image & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Character Profile</h3>
              
              {/* Character Image */}
              <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200 mb-6">
                {form.watch("imageUrl") ? (
                  <img 
                    src={form.watch("imageUrl")} 
                    alt="Character preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
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
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          {...field} 
                        />
                      </FormControl>
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
                          <Input placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <FormControl>
                          <Input placeholder="Human" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select character type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="protagonist">Protagonist</SelectItem>
                          <SelectItem value="antagonist">Antagonist</SelectItem>
                          <SelectItem value="villain">Villain</SelectItem>
                          <SelectItem value="supporting">Supporting</SelectItem>
                          <SelectItem value="ally">Ally</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="love-interest">Love Interest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>
            </div>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation - matching character details exactly */}
            <div className="border-b border-brand-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("background")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "background"
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  Background
                </button>
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
            <div className="mt-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Basic Information</h3>
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
                                <Input placeholder="Sir, Lady" {...field} />
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
                                <Input placeholder="Jr., III" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief overview of the character..." 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Magic & Abilities</h3>
                    <CharacterMagicSelector
                      availableMagicSystems={magicSystems.map(system => ({
                        id: system.id,
                        name: system.name,
                        type: system.type as "magic" | "power",
                        spells: allSpells.filter(spell => spell.magicSystemId === system.id).map(spell => ({
                          id: spell.id,
                          name: spell.name,
                          type: system.type === "magic" ? "spell" as const : "ability" as const,
                          magicSystemId: spell.magicSystemId
                        }))
                      }))}
                      selectedSpells={selectedSpells}
                      onSelectionChange={setSelectedSpells}
                    />
                  </div>
                </div>
              )}

              {activeTab === "background" && (
                <div className="space-y-6">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Character History</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="background"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="History, origin story, past events..."
                                className="min-h-[150px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="goals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goals & Motivations</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What drives this character, their objectives..."
                                className="min-h-[150px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Physical & Personality</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="appearance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Appearance</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Physical description, clothing, distinctive features..."
                                className="min-h-[150px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personality</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Traits, quirks, behavior patterns..."
                                className="min-h-[150px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "magic" && (
                <div className="space-y-6">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Advanced Magic Configuration</h3>
                    <p className="text-brand-600 mb-4">Configure advanced magical abilities and spell combinations for this character.</p>
                    <CharacterMagicSelector
                      availableMagicSystems={magicSystems.map(system => ({
                        id: system.id,
                        name: system.name,
                        type: system.type as "magic" | "power",
                        spells: allSpells.filter(spell => spell.magicSystemId === system.id).map(spell => ({
                          id: spell.id,
                          name: spell.name,
                          type: system.type === "magic" ? "spell" as const : "ability" as const,
                          magicSystemId: spell.magicSystemId
                        }))
                      }))}
                      selectedSpells={selectedSpells}
                      onSelectionChange={setSelectedSpells}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : character ? "Update Character" : "Create Character"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
