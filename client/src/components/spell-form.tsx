import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSpellSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WordProcessor } from "@/components/word-processor";
import { Wand2, Sparkles, Scroll, Crown, Shield, Zap } from "lucide-react";
import type { Spell, MagicSystem } from "@shared/schema";

interface SpellFormProps {
  spell?: Spell;
  magicSystem?: MagicSystem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SPELL_LEVELS = [
  { value: "novice", label: "Novice", icon: Wand2 },
  { value: "apprentice", label: "Apprentice", icon: Sparkles },
  { value: "adept", label: "Adept", icon: Scroll },
  { value: "expert", label: "Expert", icon: Crown },
  { value: "master", label: "Master", icon: Shield }
];

const ABILITY_LEVELS = [
  { value: "novice", label: "Novice", icon: Zap },
  { value: "apprentice", label: "Apprentice", icon: Sparkles },
  { value: "adept", label: "Adept", icon: Scroll },
  { value: "expert", label: "Expert", icon: Crown },
  { value: "master", label: "Master", icon: Shield }
];

export function SpellForm({ spell, magicSystem, onSubmit, onCancel, isSubmitting }: SpellFormProps) {
  const isAbility = magicSystem?.type === "power";
  const levels = isAbility ? ABILITY_LEVELS : SPELL_LEVELS;
  const contentType = isAbility ? "ability" : "spell";

  const form = useForm({
    resolver: zodResolver(insertSpellSchema.omit({ projectId: true, magicSystemId: true })),
    defaultValues: {
      name: spell?.name || "",
      level: spell?.level || "novice",
      description: spell?.description || "",
    }
  });

  const selectedLevel = form.watch("level");
  const selectedLevelConfig = levels.find(l => l.value === selectedLevel);
  const HeaderIcon = selectedLevelConfig?.icon || (isAbility ? Zap : Wand2);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500 p-3 rounded-xl">
            <HeaderIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-950">
              {spell ? `Edit ${contentType}` : `Create ${contentType}`}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-500 text-white">
                {magicSystem?.type === "power" ? "Power System" : "Magic System"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="spell-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (spell ? `Update ${contentType}` : `Create ${contentType}`)}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form id="spell-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Container */}
          <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
            <h2 className="text-xl font-semibold text-brand-950 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-900">{contentType === "ability" ? "Ability" : "Spell"} Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter ${contentType} name`}
                        {...field}
                        className="border-brand-200 focus:border-brand-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Level */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-900">Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-brand-200 focus:border-brand-500">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level) => {
                          const LevelIcon = level.icon;
                          return (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <LevelIcon size={16} className="text-brand-600" />
                                <span className="capitalize">{level.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Content Container */}
          <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
            <h2 className="text-xl font-semibold text-brand-950 mb-6">Content</h2>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <WordProcessor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder={`Describe how this ${contentType} works, its effects, and any special properties...`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}