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
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-brand-400" />
                </div>
              </div>

              {/* Basic Profile Fields */}
              <div className="space-y-4">
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
                  name="powerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Magic type, abilities..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="magic">Magic & Abilities</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                </TabsContent>

                <TabsContent value="background" className="space-y-6">
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
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
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
                </TabsContent>

                <TabsContent value="magic" className="space-y-6">
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Magic Systems & Abilities</h3>
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
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sidebar for Image, Age, and Race */}
          <div className="w-80 space-y-6">
            <div className="bg-brand-50 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-900">Character Profile</h3>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Image URL</FormLabel>
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

              {form.watch("imageUrl") && (
                <div className="aspect-square rounded-lg overflow-hidden bg-brand-100">
                  <img 
                    src={form.watch("imageUrl")} 
                    alt="Character preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="25"
                          {...field} 
                        />
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
                        <Input 
                          placeholder="Human, Elf, etc."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Sir, Lady, Dr."
                          {...field} 
                        />
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
                        <Input 
                          placeholder="Jr., III, PhD"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="powerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Magic type, abilities..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            size="md"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            loading={isLoading}
            className="flex items-center gap-2"
            size="md"
          >
            {character ? <Save size={16} /> : <Plus size={16} />}
            {character ? "Update Character" : "Create Character"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
