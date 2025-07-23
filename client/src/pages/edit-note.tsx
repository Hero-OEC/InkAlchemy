import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { NoteForm } from "@/components/note-form";
import { ArrowLeft, StickyNote, Lightbulb, Bell, FileText, User, MapPin, Search } from "lucide-react";
import type { Project, Note } from "@shared/schema";

// Note category icons
const NOTE_CATEGORY_ICONS = {
  general: StickyNote,
  idea: Lightbulb,
  reminder: Bell,
  plot: FileText,
  character: User,
  location: MapPin,
  research: Search,
};

export default function EditNote() {
  const { projectId, noteId } = useParams();
  const [, setLocation] = useLocation();
  const [currentCategory, setCurrentCategory] = useState<string>("general");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: note } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
  });

  // Update current category when note data loads
  useEffect(() => {
    if (note?.category) {
      setCurrentCategory(note.category);
    }
  }, [note?.category]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/notes/${noteId}`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/notes/${noteId}`);
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };

  const getCurrentIcon = () => {
    return NOTE_CATEGORY_ICONS[currentCategory as keyof typeof NOTE_CATEGORY_ICONS] || StickyNote;
  };

  if (!note) {
    return (
      <div className="min-h-screen bg-background text-foreground">
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
    <div className="min-h-screen bg-background text-foreground">
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
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Note
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-brand-500">
            {(() => {
              const Icon = getCurrentIcon();
              return <Icon size={24} className="text-white" />;
            })()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-950">Edit Note</h1>
            <p className="text-brand-600 mt-1">Update your note details</p>
          </div>
        </div>

        {/* Note Form */}
        <NoteForm
          note={note}
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
          onCategoryChange={handleCategoryChange}
        />
      </main>
    </div>
  );
}