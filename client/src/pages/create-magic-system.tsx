import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { WordProcessor } from "@/components/word-processor";
import { ArrowLeft, Sparkles, Zap, Users } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MiniCard } from "@/components/mini-card";
import { insertMagicSystemSchema, type Project, type Character } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertMagicSystemSchema.extend({
  projectId: z.number(),
});

export default function CreateMagicSystem() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [systemType, setSystemType] = useState<string>("magic");
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Create Magic System - ${project.name} | StoryForge`;
    }
  }, [project?.name]);

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

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      apiRequest("/api/magic-systems", { method: "POST", body: data }),
    onSuccess: (newSystem) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/magic-systems`] });
      toast({
        title: "Magic system created",
        description: "Your magic system has been created successfully.",
      });
      setLocation(`/projects/${projectId}/magic-systems/${newSystem.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error creating the magic system.",
        variant: "destructive",
      });
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/magic-systems`);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  const getIcon = () => {
    return systemType === "power" ? Zap : Sparkles;
  };

  const getTypeLabel = () => {
    return systemType === "power" ? "power" : "magic";
  };

  const Icon = getIcon();

  const watchedType = form.watch("type");
  useEffect(() => {
    setSystemType(watchedType || "magic");
  }, [watchedType]);

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
            Back to Magic Systems
          </Button>
        </div>

        {/* System Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950 mb-2">Create New {systemType === "power" ? "Power" : "Magic"} System</h1>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  systemType === "magic" ? "bg-brand-100 text-brand-800" : "bg-brand-200 text-brand-900"
                }`}>
                  {systemType === "power" ? "Power System" : "Magic System"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="submit" 
              form="magic-system-form"
              variant="primary" 
              disabled={mutation.isPending}
              className="flex items-center gap-2"
            >
              {mutation.isPending ? "Creating..." : "Create System"}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form id="magic-system-form" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Content Grid - 2/3 main content + 1/3 sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content - Description */}
              <div className="lg:col-span-2">
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
                {/* Basic Information */}
                <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                  <h3 className="text-lg font-semibold text-brand-900 mb-4">Basic Information</h3>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            value={field.value || ""}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {/* Characters */}
                <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
                  <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters</h3>
                  <p className="text-brand-500 italic text-sm">
                    You can assign characters to this system after creating it.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}