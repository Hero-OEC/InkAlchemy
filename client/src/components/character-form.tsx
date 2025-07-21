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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCharacterSchema, type Character, type MagicSystem, type Spell } from "@shared/schema";
import { z } from "zod";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Character name" {...field} />
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
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Protagonist, Mentor, Antagonist" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select character status" />
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief overview of the character"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Character Image URL</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://example.com/character-image.jpg"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appearance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appearance</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Physical description, clothing, notable features"
                  className="min-h-[80px]"
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
                  placeholder="Traits, mannerisms, quirks, strengths, weaknesses"
                  className="min-h-[80px]"
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
              <FormLabel>Background</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="History, upbringing, formative experiences"
                  className="min-h-[80px]"
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
                  placeholder="What does this character want? What drives them?"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Magic Systems & Abilities Section */}
        <div className="col-span-2 space-y-4">
          <div className="border-t pt-6">
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
        </div>

        <div className="flex justify-end space-x-2 col-span-2">
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
