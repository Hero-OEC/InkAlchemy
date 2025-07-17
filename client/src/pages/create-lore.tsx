import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Input, Textarea, Select } from "@/components/form-inputs";
import { ArrowLeft, BookOpen, Crown, Scroll, Landmark, Sword, Users, Globe, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertLoreEntrySchema, type Project } from "@shared/schema";
import { z } from "zod";

const formSchema = insertLoreEntrySchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
});

const LORE_CATEGORIES = [
  { value: "history", label: "History", icon: Calendar },
  { value: "culture", label: "Culture", icon: Users },
  { value: "religion", label: "Religion", icon: Landmark },
  { value: "politics", label: "Politics", icon: Crown },
  { value: "geography", label: "Geography", icon: Globe },
  { value: "technology", label: "Technology", icon: Sword },
  { value: "magic", label: "Magic", icon: Scroll },
  { value: "language", label: "Language", icon: BookOpen },
  { value: "other", label: "Other", icon: BookOpen },
];

export default function CreateLore() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: parseInt(projectId!),
      title: "",
      content: "",
      category: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("POST", "/api/lore", data),
    onSuccess: (newLore) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/lore`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/stats`] 
      });
      toast({
        title: "Success",
        description: "Lore entry created successfully",
      });
      setLocation(`/projects/${projectId}/lore/${newLore.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lore entry",
        variant: "destructive",
      });
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/lore`);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMutation.mutate(data);
  };

  const selectedCategory = LORE_CATEGORIES.find(cat => cat.value === form.watch("category"));
  const CategoryIcon = selectedCategory?.icon || BookOpen;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true}
        currentPage="lore"
        onNavigate={handleNavigation}
        projectName={project?.name}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lore
          </Button>
        </div>

        {/* Form Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-500 p-3 rounded-xl">
            <CategoryIcon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-950 mb-2">Create New Lore Entry</h1>
            <p className="text-brand-600">Add knowledge and history to your world</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Lore Title"
                placeholder="Enter lore title"
                value={form.watch("title")}
                onChange={(e) => form.setValue("title", e.target.value)}
                error={form.formState.errors.title?.message}
              />

              <Select
                label="Category"
                placeholder="Select category"
                value={form.watch("category")}
                onChange={(value) => form.setValue("category", value)}
                options={LORE_CATEGORIES.map(cat => ({
                  value: cat.value,
                  label: cat.label,
                  icon: cat.icon
                }))}
                error={form.formState.errors.category?.message}
              />
            </div>

            {/* Content */}
            <Textarea
              label="Content"
              placeholder="Write the lore content, history, or knowledge here..."
              value={form.watch("content")}
              onChange={(e) => form.setValue("content", e.target.value)}
              error={form.formState.errors.content?.message}
              className="min-h-[300px]"
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Lore Entry"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}