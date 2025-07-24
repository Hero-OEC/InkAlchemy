import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { NoteForm } from "@/components/note-form";
import { ArrowLeft, StickyNote, Lightbulb, Bell, FileText, User, MapPin, Search } from "lucide-react";
import type { Project } from "@shared/schema";

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

export default function CreateNote() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [currentCategory, setCurrentCategory] = useState<string>("general");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/notes`);
  };

  const handleSuccess = () => {
    setLocation(`/projects/${projectId}/notes`);
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };

  const getCurrentIcon = () => {
    return NOTE_CATEGORY_ICONS[currentCategory as keyof typeof NOTE_CATEGORY_ICONS] || StickyNote;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="notes"
        projectName={project?.name}
        onNavigate={handleNavigation}
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
            Back to Notes
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
              <h1 className="text-3xl font-bold text-brand-950">Create New Note</h1>
              <p className="text-brand-600 mt-1">Add a new note to your project</p>
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
            >
              Create Note
            </Button>
          </div>
        </div>

        {/* Note Form */}
        <NoteForm
          projectId={parseInt(projectId!)}
          onSuccess={handleSuccess}
          onCancel={handleSuccess}
          onCategoryChange={handleCategoryChange}
        />
      </main>
    </div>
  );
}