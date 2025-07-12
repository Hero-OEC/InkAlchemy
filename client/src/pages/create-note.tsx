import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { NoteForm } from "@/components/note-form";
import { Button } from "@/components/button-variations";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@shared/schema";

export default function CreateNote() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/notes`);
  };

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true}
        currentPage="notes"
        onNavigate={handleNavigation}
        projectName={project?.name}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setLocation(`/projects/${projectId}/notes`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Button>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-brand-950 mb-8">Create New Note</h1>

        {/* Note Form */}
        <NoteForm
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
        />
      </main>
    </div>
  );
}