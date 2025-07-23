import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { CharacterForm } from "@/components/character-form";
import { type Project } from "@shared/schema";
import { ArrowLeft, Plus, Users } from "lucide-react";

export default function CreateCharacter() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/characters`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/characters`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true}
        currentPage="characters"
        onNavigate={handleNavigation}
        projectName={project?.name}
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
            Back to Characters
          </Button>
        </div>

        {/* Form Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-brand-500 p-3 rounded-xl">
            <Users size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-950 mb-2">Create New Character</h1>
            <p className="text-brand-600">Add a new character to your story</p>
          </div>
        </div>

        {/* Character Form Component */}
        <CharacterForm 
          character={null}
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
        />
      </main>
    </div>
  );
}