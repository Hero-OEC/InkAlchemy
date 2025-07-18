import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { SpellForm } from "@/components/spell-form";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, Spell, MagicSystem } from "@shared/schema";

export default function SpellEdit() {
  const { projectId, spellId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: spell, isLoading } = useQuery<Spell>({
    queryKey: [`/api/spells/${spellId}`],
    enabled: !!spellId && spellId !== "new" && !isNaN(Number(spellId))
  });

  const { data: magicSystem } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${spell?.magicSystemId}`],
    enabled: !!spell?.magicSystemId
  });

  const updateSpellMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/spells/${spellId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/spells/${spellId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/magic-systems/${spell?.magicSystemId}/spells`] });
      toast({
        title: "Spell updated",
        description: "Your spell has been successfully updated.",
      });
      handleBack();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update spell. Please try again.",
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
          <p className="text-brand-600">Loading spell...</p>
        </div>
      </div>
    );
  }

  if (!spell) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Spell not found</p>
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
              Back to {magicSystem?.name || "Magic System"}
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