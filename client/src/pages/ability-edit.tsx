import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { SpellForm } from "@/components/spell-form";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, Spell, MagicSystem } from "@shared/schema";

export default function AbilityEdit() {
  const { projectId, spellId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: ability, isLoading } = useQuery<Spell>({
    queryKey: [`/api/spells/${spellId}`],
    enabled: !!spellId && spellId !== "new" && !isNaN(Number(spellId))
  });

  const { data: powerSystem } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${ability?.magicSystemId}`],
    enabled: !!ability?.magicSystemId
  });

  const updateAbilityMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/spells/${spellId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/spells/${spellId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/magic-systems/${ability?.magicSystemId}/spells`] });
      toast({
        title: "Ability updated",
        description: "Your ability has been successfully updated.",
      });
      handleBack();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    if (ability?.magicSystemId) {
      setLocation(`/projects/${projectId}/magic-systems/${ability.magicSystemId}`);
    } else {
      setLocation(`/projects/${projectId}/magic-systems`);
    }
  };

  const handleSubmit = (data: any) => {
    updateAbilityMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading ability...</p>
        </div>
      </div>
    );
  }

  if (!ability) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Ability not found</p>
        </div>
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
      
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {powerSystem?.name || "Power System"}
            </Button>
          </div>

          <SpellForm
            spell={ability}
            magicSystem={powerSystem}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            isSubmitting={updateAbilityMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
}