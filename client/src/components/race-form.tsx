import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertRaceSchema, type Race } from "@shared/schema";
import { FileText, Users, Clock, Sparkles, Languages } from "lucide-react";
import { z } from "zod";

const formSchema = insertRaceSchema.extend({
  name: z.string().min(1, "Name is required"),
});

interface RaceFormProps {
  race?: Race | null;
  projectId: number;
  onSuccess: () => void;
}

export function RaceForm({ race, projectId, onSuccess }: RaceFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("description");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      name: race?.name || "",
      description: race?.description || "",
      culture: race?.culture || "",
      language: race?.language || "",
      traits: race?.traits || "",
      lifespan: race?.lifespan || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/races", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/races`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`] 
      });
      toast({
        title: "Success",
        description: "Race created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create race",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/races/${race?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/races`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/races/${race?.id}`] 
      });
      toast({
        title: "Success",
        description: "Race updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update race",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (race) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "culture", label: "Culture & Society", icon: Users },
    { id: "lifespan", label: "Lifespan", icon: Clock },
    { id: "traits", label: "Traits & Abilities", icon: Sparkles },
    { id: "language", label: "Language", icon: Languages },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Race Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Aetherian, Stormborn, Earthkin" {...field} />
                  </FormControl>
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
                      placeholder="Describe the race's basic characteristics, appearance, and notable features..."
                      className="min-h-[150px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "culture":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="culture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Culture & Society</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe their social structure, traditions, values, customs, and way of life..."
                      className="min-h-[200px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "lifespan":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="lifespan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lifespan</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe their typical lifespan, aging process, and life stages..."
                      className="min-h-[150px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "traits":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="traits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traits & Abilities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe their special abilities, physical traits, magical powers, and unique characteristics..."
                      className="min-h-[200px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe their language, communication style, writing systems, and linguistic characteristics..."
                      className="min-h-[150px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-brand-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-6 border-t border-brand-200">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : race ? "Update Race" : "Create Race"}
          </Button>
        </div>
      </form>
    </Form>
  );
}