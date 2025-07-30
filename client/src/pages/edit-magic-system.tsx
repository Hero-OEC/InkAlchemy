import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { WordProcessor } from "@/components/word-processor";
import { MagicSystemFormHeaderSkeleton, MagicSystemFormContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertMagicSystemSchema, type Project, type MagicSystem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertMagicSystemSchema.extend({
  projectId: z.number(),
});

export default function EditMagicSystem() {
  const { projectId, systemId } = useParams();
  const [, setLocation] = useLocation();
  const [systemType, setSystemType] = useState<string>("magic");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: system, isLoading: systemLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${systemId}`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  const isLoading = projectLoading || systemLoading;



  // Set page title
  useEffect(() => {
    if (system?.name && project?.name) {
      document.title = `Edit ${system.name} - ${project.name} | InkAlchemy`;
    }
  }, [system?.name, project?.name]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: Number(projectId),
      name: "",
      type: "magic",
      description: "",
      source: "",
      complexity: "medium",
    },
  });

  // Update form when system data loads
  useEffect(() => {
    if (system) {
      form.reset({
        projectId: Number(projectId),
        name: system.name,
        type: system.type || "magic",
        description: system.description || "",
        source: system.source || "",
        complexity: system.complexity || "medium",
      });
      setSystemType(system.type || "magic");
    }
  }, [system, form, projectId]);

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest(`/api/magic-systems/${systemId}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/magic-systems', systemId] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'magic-systems'] });
      toast({
        title: "Magic system updated",
        description: "Your magic system has been updated successfully.",
      });
      setLocation(`/projects/${projectId}/magic-systems/${systemId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the magic system.",
        variant: "destructive",
      });
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}`);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  const getIcon = () => {
    return systemType === "power" ? Zap : Sparkles;
  };

  const Icon = getIcon();



  const watchedType = form.watch("type");
  useEffect(() => {
    setSystemType(watchedType || "magic");
  }, [watchedType]);

  if (isLoading || !system) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Magic System
            </Button>
          </div>

          {/* Magic System Form Skeleton */}
          <MagicSystemFormHeaderSkeleton />
          <MagicSystemFormContentSkeleton />
        </main>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {system.name}
          </Button>
        </div>

        {/* System Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950 mb-2">Edit {system.name}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-500 text-white">
                  {systemType === "power" ? "Power System" : "Magic System"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="magic-system-form"
              disabled={mutation.isPending}
              className="flex items-center gap-2"
            >
              {mutation.isPending ? "Updating..." : "Update System"}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form id="magic-system-form" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Content Grid - 2/3 main content + 1/3 sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
                  <h2 className="text-xl font-semibold text-brand-900 mb-6">Basic Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter system name" {...field} />
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
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
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
                  </div>
                </div>

                {/* System Description */}
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
                  <h2 className="text-xl font-semibold text-brand-900 mb-4">System Description</h2>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <WordProcessor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Describe how this magic/power system works, its principles, and its role in your world..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Source */}
                <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                  <h3 className="text-lg font-semibold text-brand-900 mb-4">Source</h3>
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="e.g., elemental forces, divine blessing, life energy" 
                            {...field} 
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Complexity */}
                <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                  <h3 className="text-lg font-semibold text-brand-900 mb-4">Complexity</h3>
                  <FormField
                    control={form.control}
                    name="complexity"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value ?? "medium"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complexity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>


              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}