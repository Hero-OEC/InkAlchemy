import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMagicSystemSchema, type MagicSystem } from "@shared/schema";
import { BookOpen } from "lucide-react";
import { z } from "zod";

const formSchema = insertMagicSystemSchema.extend({
  complexity: z.enum(["low", "medium", "high"]).optional(),
});

interface MagicSystemFormProps {
  magicSystem?: MagicSystem | null;
  projectId: number;
  onSuccess: () => void;
  onTypeChange?: (type: string) => void;
}

export function MagicSystemForm({ magicSystem, projectId, onSuccess, onTypeChange }: MagicSystemFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId,
      name: magicSystem?.name || "",
      type: magicSystem?.type || "magic",
      description: magicSystem?.description || "",
      source: magicSystem?.source || "",
      complexity: (magicSystem?.complexity as "low" | "medium" | "high") || "medium",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/magic-systems", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "magic-systems"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "stats"] 
      });
      toast({
        title: "Success",
        description: "Magic system created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create magic system",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/magic-systems/${magicSystem?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "magic-systems"] 
      });
      toast({
        title: "Success",
        description: "Magic system updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update magic system",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (magicSystem) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const systemType = form.watch("type") || "magic";
  
  const tabs = [
    { id: "details", label: "Details", icon: BookOpen },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="System name" {...field} />
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
                    <FormLabel>System Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        onTypeChange?.(value);
                      }} 
                      defaultValue={field.value || "magic"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select system type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="magic">Magic System</SelectItem>
                        <SelectItem value="power">Power System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complexity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Simple and intuitive</SelectItem>
                        <SelectItem value="medium">Medium - Moderate learning curve</SelectItem>
                        <SelectItem value="high">High - Complex and demanding</SelectItem>
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
                      placeholder="Overview of how this system works"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Where does this power come from? (e.g., elemental forces, divine blessing, life energy)"
                      className="min-h-[80px]"
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
            {isLoading ? "Saving..." : magicSystem ? "Update Magic System" : "Create Magic System"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
