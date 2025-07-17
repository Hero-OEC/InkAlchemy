import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MagicSystemForm } from "@/components/magic-system-form";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Project } from "@shared/schema";

export default function CreateMagicSystem() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/magic-systems`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/magic-systems`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8" style={{ margin: '0 100px' }}>
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft size={16} />
            Back to Magic Systems
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">Create New Magic System</h1>
              <p className="text-brand-600 mt-1">
                Define a new magical or supernatural power system for your world
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-brand-200 p-8">
          <MagicSystemForm 
            projectId={Number(projectId)} 
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}