import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, ArrowLeft, FileText, Users, Clock, Sparkles, Languages } from "lucide-react";
import { insertRaceSchema, type InsertRace, type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function CreateRace() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("basic");
  const { goBack } = useNavigation();
  const queryClient = useQueryClient();

  // Set page title
  useEffect(() => {
    document.title = "Create Race | StoryForge";
  }, []);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const form = useForm<InsertRace>({
    resolver: zodResolver(insertRaceSchema),
    defaultValues: {
      projectId: parseInt(projectId!),
      name: "",
      description: "",
      culture: "",
      language: "",
      traits: "",
      lifespan: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertRace) => apiRequest(`/api/races`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (newRace) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/races`] });
      setLocation(`/projects/${projectId}/races/${newRace.id}`);
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const onSubmit = (data: InsertRace) => {
    createMutation.mutate(data);
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "culture", label: "Culture & Society", icon: Users },
    { id: "traits", label: "Traits & Abilities", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Race Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-brand-200">
              <UserCheck size={24} className="text-brand-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">Create New Race</h1>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-200 text-brand-700">
                  New Race
                </span>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-brand-200 mb-6">
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
                          ? 'border-brand-500 text-brand-600'
                          : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
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
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-900 font-semibold">Race Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Aetherian, Stormborn, Earthkin" 
                            {...field} 
                            className="bg-white border-brand-200"
                          />
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
                        <FormLabel className="text-brand-900 font-semibold">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the race's basic characteristics, appearance, and notable features..."
                            className="bg-white border-brand-200 min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lifespan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-900 font-semibold">Lifespan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe their typical lifespan, aging process, and life stages..."
                            className="bg-white border-brand-200 min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeTab === "culture" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="culture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-900 font-semibold">Culture & Society</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe their social structure, traditions, values, customs, and way of life..."
                            className="bg-white border-brand-200 min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-900 font-semibold">Language</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe their language, communication style, writing systems, and linguistic characteristics..."
                            className="bg-white border-brand-200 min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {activeTab === "traits" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="traits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-900 font-semibold">Traits & Abilities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe their special abilities, physical traits, magical powers, and unique characteristics..."
                            className="bg-white border-brand-200 min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={createMutation.isPending}
                className="px-8"
              >
                {createMutation.isPending ? "Creating..." : "Create Race"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}