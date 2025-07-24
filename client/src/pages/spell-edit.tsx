
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SpellForm } from "@/components/spell-form";
import { SpellFormHeaderSkeleton, SpellFormContentSkeleton } from "@/components/skeleton";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, Spell, MagicSystem } from "@shared/schema";

export default function SpellEdit() {
  const { projectId, spellId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: spell, isLoading: spellLoading } = useQuery<Spell>({
    queryKey: [`/api/spells/${spellId}`],
    enabled: !!spellId && spellId !== "new" && !isNaN(Number(spellId))
  });

  const { data: magicSystem, isLoading: systemLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${spell?.magicSystemId}`],
    enabled: !!spell?.magicSystemId
  });

  const isLoading = projectLoading || spellLoading || systemLoading;

  const updateSpellMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/spells/${spellId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/spells/${spellId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/magic-systems/${spell?.magicSystemId}/spells`] });
      const itemType = magicSystem?.type === "power" ? "Ability" : "Spell";
      toast({
        title: `${itemType} updated`,
        description: `Your ${itemType.toLowerCase()} has been successfully updated.`,
      });
      handleBack();
    },
    onError: () => {
      const itemType = magicSystem?.type === "power" ? "ability" : "spell";
      toast({
        title: "Error",
        description: `Failed to update ${itemType}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    if (spell?.magicSystemId) {
      setLocation(`/projects/${projectId}/magic-systems/${spell.magicSystemId}`);
    } else {
      setLocation(`/projects/${projectId}/magic-systems`);
    }
  };

  const handleSubmit = (data: any) => {
    updateSpellMutation.mutate(data);
  };

  if (isLoading || !spell || !magicSystem) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
          <div className="w-full max-w-3xl">
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

  const systemType = magicSystem?.type || "magic";
  const systemName = systemType === "power" ? "Power System" : "Magic System";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"

              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {magicSystem?.name || systemName}
            </Button>
          </div>

          <SpellForm
            spell={spell}
            magicSystem={magicSystem}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            isSubmitting={updateSpellMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
}
