import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { NoteForm } from "@/components/note-form";
import { Button } from "@/components/button-variations";
import { ArrowLeft, StickyNote } from "lucide-react";
import type { Project, Note } from "@shared/schema";

export default function EditNote() {
  const { projectId, noteId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: note } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
  });

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/notes/${noteId}`);
  };

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  if (!note) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true}
          currentPage="notes"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-brand-300" />
            <h2 className="text-xl font-semibold text-brand-900 mb-2">Note Not Found</h2>
            <p className="text-brand-600">The note you're trying to edit doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true}
        currentPage="notes"
        onNavigate={handleNavigation}
        projectName={project?.name}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setLocation(`/projects/${projectId}/notes/${noteId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Note
          </Button>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-brand-950 mb-8">Edit Note</h1>

        {/* Note Form */}
        <NoteForm
          note={note}
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
        />
      </main>
    </div>
  );
}