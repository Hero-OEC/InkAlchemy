import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SpellForm } from "@/components/spell-form";
import { SpellFormHeaderSkeleton, SpellFormContentSkeleton } from "@/components/skeleton";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, MagicSystem } from "@shared/schema";

export default function SpellCreate() {
  const { projectId, systemId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: magicSystem, isLoading: systemLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${systemId}`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  const isLoading = projectLoading || systemLoading;

  const createSpellMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/spells`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        projectId: parseInt(projectId!),
        magicSystemId: parseInt(systemId!),
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/magic-systems/${systemId}/spells`] });
      toast({
        title: magicSystem?.type === "power" ? "Ability created" : "Spell created",
        description: `Your ${magicSystem?.type === "power" ? "ability" : "spell"} has been successfully created.`,
      });
      handleBack();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to create ${magicSystem?.type === "power" ? "ability" : "spell"}. Please try again.`,
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

  const handleSubmit = (data: any) => {
    createSpellMutation.mutate(data);
  };

  if (isLoading || !magicSystem) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center">
          <div className="w-full max-w-5xl">
            {/* Header with Back Button Skeleton */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                disabled
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Magic System
              </Button>
            </div>

            {/* Spell Form Skeleton */}
            <SpellFormHeaderSkeleton />
            <SpellFormContentSkeleton />
          </div>
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
      
      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {magicSystem.name}
            </Button>
          </div>

          <SpellForm
            magicSystem={magicSystem}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            isSubmitting={createSpellMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
}