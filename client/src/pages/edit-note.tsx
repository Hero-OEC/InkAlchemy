import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { NoteForm } from "@/components/note-form";
import { NoteFormHeaderSkeleton, NoteFormContentSkeleton } from "@/components/skeleton";
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
  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: note, isLoading: noteLoading } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
  });

  const isLoading = projectLoading || noteLoading;

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

  if (isLoading || !note) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true}
          currentPage="notes"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Note
            </Button>
          </div>

          {/* Note Form Skeleton */}
          <NoteFormHeaderSkeleton />
          <NoteFormContentSkeleton />
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
            Back to Note
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleSuccess}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="note-form"
              variant="primary"
              disabled={isFormLoading}
            >
              {isFormLoading ? "Updating..." : "Update Note"}
            </Button>
          </div>
        </div>

        {/* Note Form */}
        <NoteForm
          note={note}
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
          onCancel={handleSuccess}
          onCategoryChange={handleCategoryChange}
          onLoadingChange={setIsFormLoading}
        />
      </main>
    </div>
  );
}