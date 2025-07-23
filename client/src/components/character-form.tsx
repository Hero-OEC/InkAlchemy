import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertCharacterSchema, type Character, type MagicSystem, type Spell, type Race } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/button-variations";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

const formSchema = insertCharacterSchema.extend({
  projectId: z.number(),
});

interface CharacterFormProps {
  character: Character | null;
  projectId: number;
  onSuccess: () => void;
}

// Helper function to convert null values to empty strings
const normalizeCharacterData = (character: Character | null) => ({
  name: character?.name || "",
  description: character?.description || "",
  prefix: character?.prefix || "",
  suffix: character?.suffix || "",
  type: character?.type || "",
  role: character?.role || "",
  appearance: character?.appearance || "",
  personality: character?.personality || "",
  background: character?.background || "",
  goals: character?.goals || "",
  powerType: character?.powerType || "",
  age: character?.age || "",
  raceId: character?.raceId || undefined,
  weapons: character?.weapons || "",
  equipment: character?.equipment || "",
  imageUrl: character?.imageUrl || "",
  status: character?.status || "active",
});

export function CharacterForm({ character, projectId, onSuccess }: CharacterFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSpells, setSelectedSpells] = useState<number[]>([]);

  const { data: magicSystems = [] } = useQuery<MagicSystem[]>({
    queryKey: [`/api/projects/${projectId}/magic-systems`],
  });

  const { data: projectSpells = [] } = useQuery<Spell[]>({
    queryKey: [`/api/projects/${projectId}/spells`],
  });

  const { data: characterSpells = [] } = useQuery<Spell[]>({
    queryKey: [`/api/characters/${character?.id}/spells`],
    enabled: !!character?.id,
  });

  const { data: races = [] } = useQuery<Race[]>({
    queryKey: [`/api/projects/${projectId}/races`],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      ...normalizeCharacterData(character),
    },
  });

  // Initialize selected spells when character spells load
  useEffect(() => {
    if (characterSpells.length > 0) {
      setSelectedSpells(characterSpells.map(spell => spell.id));
    }
  }, [characterSpells]);

  const updateCharacterSpells = async (characterId: number) => {
    // Remove all current character spells
    if (character) {
      for (const spell of characterSpells) {
        await apiRequest(`/api/spells/${spell.id}`, { method: "DELETE" });
      }
    }

    // Add selected spells as character spells
    for (const spellId of selectedSpells) {
      const originalSpell = projectSpells.find(s => s.id === spellId);
      if (originalSpell) {
        await apiRequest("/api/spells", {
          method: "POST",
          body: JSON.stringify({
            ...originalSpell,
            id: undefined,
            characterId,
            projectId,
          }),
        });
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/characters", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: async (newCharacter) => {
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
      apiRequest(`/api/characters/${character?.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: async (updatedCharacter) => {
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
        {/* Main Content Grid - SWITCHED: tabs on left (2/3), profile on right (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabbed Content (2/3) */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
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
                  onClick={() => setActiveTab("weapons")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "weapons"
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  Weapons
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
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mt-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="bg-white border border-brand-200 rounded-xl p-6">
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
                                <Input placeholder="Sir, Lady, Dr." {...field} />
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
                                <Input placeholder="Jr., III, PhD" {...field} />
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
                                placeholder="Brief description of the character"
                                className="min-h-[100px]"
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

              {activeTab === "background" && (
                <div className="space-y-6">
                  <div className="bg-white border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Character Background</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="personality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personality</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Character's personality traits, quirks, and behavioral patterns"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="background"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Story</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Character's history, upbringing, and past experiences"
                                className="min-h-[100px]"
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
                                placeholder="What drives this character? What are their objectives?"
                                className="min-h-[100px]"
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
                  <div className="bg-white border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Physical & Role Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="appearance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Physical Appearance</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Height, build, hair, eyes, distinguishing features"
                                className="min-h-[100px]"
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
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role in Story</FormLabel>
                              <FormControl>
                                <Input placeholder="Protagonist, Mentor, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="powerType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Power Type</FormLabel>
                              <FormControl>
                                <Input placeholder="Magic, Tech, Physical, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "weapons" && (
                <div className="space-y-6">
                  <div className="bg-white border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Equipment & Combat</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="weapons"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weapons</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Swords, bows, staffs, or other combat tools"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="equipment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment & Gear</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Armor, tools, magical items, and other equipment"
                                className="min-h-[100px]"
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
                  <div className="bg-white border border-brand-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-brand-900 mb-4">Magical Abilities</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-md font-semibold text-brand-900 mb-3">Character Spells & Abilities</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {projectSpells.map((spell) => {
                            const magicSystem = magicSystems.find(ms => ms.id === spell.magicSystemId);
                            return (
                              <label key={spell.id} className="flex items-center space-x-3 p-3 bg-brand-50 rounded-lg">
                                <input
                                  type="checkbox"
                                  checked={selectedSpells.includes(spell.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSpells([...selectedSpells, spell.id]);
                                    } else {
                                      setSelectedSpells(selectedSpells.filter(id => id !== spell.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-brand-600 bg-brand-100 border-brand-300 rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-brand-900">{spell.name}</div>
                                  <div className="text-sm text-brand-600">{magicSystem?.name}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {projectSpells.length === 0 && (
                          <p className="text-brand-500 text-center py-8">No spells available. Create spells in Magic Systems first.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Character Profile (1/3) */}
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

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="developing">Developing</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-brand-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Saving..." : character ? "Update Character" : "Create Character"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}