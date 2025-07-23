import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { CharacterForm } from "@/components/character-form";
import { type Character, type Project } from "@shared/schema";
import { ArrowLeft, Users } from "lucide-react";

export default function EditCharacter() {
  const { projectId, characterId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: character } = useQuery<Character>({
    queryKey: [`/api/characters/${characterId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/characters/${characterId}`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/characters/${characterId}`);
  };

  if (!character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true}
        currentPage="characters"
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
            Back to Character
          </Button>
        </div>

        {/* Form Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-500 p-3 rounded-xl">
            <Users size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-950 mb-2">Edit Character</h1>
            <p className="text-brand-600">Update character information</p>
          </div>
        </div>

        {/* Character Form Component */}
        <CharacterForm 
          character={character}
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
        />
      </main>
    </div>
  );
}