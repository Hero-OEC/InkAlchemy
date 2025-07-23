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
        <div className="mb-6">
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

        {/* Character Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-500 p-3 rounded-xl">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">Create New Character</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-200 text-brand-700">
                    Creating
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Content */}
          <div className="lg:col-span-2">
            <CharacterForm 
              character={null}
              projectId={parseInt(projectId!)}
              onSuccess={handleSuccess}
              isEdit={false}
            />
          </div>

          {/* Right Column - Character Preview */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-6">
              {/* Character Image */}
              <div className="aspect-square w-full bg-brand-100 rounded-lg overflow-hidden border-2 border-brand-200 mb-4">
                <div className="w-full h-full flex items-center justify-center text-brand-400">
                  <Users size={64} />
                </div>
              </div>
              
              {/* Character Info Preview */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-brand-950">New Character</h3>
                  <p className="text-sm text-brand-600">Fill out the form to create</p>
                </div>
                
                <div className="p-3 bg-brand-100 border border-brand-200 rounded-lg text-center">
                  <p className="text-xs text-brand-600">Character preview will appear here as you fill out the form</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}