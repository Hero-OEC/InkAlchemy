import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { NoteDetailsHeaderSkeleton, NoteDetailsContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Edit, Trash2, StickyNote, Lightbulb, Bell, FileText, User, MapPin, Search } from "lucide-react";
import type { Project, Note } from "@shared/schema";
import { format } from "date-fns";

// Note category config
const NOTE_CATEGORY_CONFIG = {
  general: { icon: StickyNote, label: "General", bgColor: "bg-brand-500", textColor: "text-white" },
  idea: { icon: Lightbulb, label: "Idea", bgColor: "bg-brand-500", textColor: "text-white" },
  reminder: { icon: Bell, label: "Reminder", bgColor: "bg-brand-500", textColor: "text-white" },
  plot: { icon: FileText, label: "Plot", bgColor: "bg-brand-500", textColor: "text-white" },
  character: { icon: User, label: "Character", bgColor: "bg-brand-500", textColor: "text-white" },
  location: { icon: MapPin, label: "Location", bgColor: "bg-brand-500", textColor: "text-white" },
  research: { icon: Search, label: "Research", bgColor: "bg-brand-500", textColor: "text-white" },
};

export default function NoteDetails() {
  const { projectId, noteId } = useParams();
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: note, isLoading: noteLoading } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
    enabled: !!noteId && noteId !== "new" && !isNaN(Number(noteId)),
    staleTime: 0
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || noteLoading;

  // Set page title
  useEffect(() => {
    if (note?.title && project?.name) {
      document.title = `${note.title} - ${project.name} | InkAlchemy`;
    } else if (note?.title) {
      document.title = `${note.title} | InkAlchemy`;
    } else {
      document.title = "Note Details | InkAlchemy";
    }
  }, [note?.title, project?.name]);

  // Redirect if this is the create route
  useEffect(() => {
    if (noteId === "new") {
      setLocation(`/projects/${projectId}/notes/new`);
      return;
    }
  }, [noteId, projectId, setLocation]);

  // Don't render anything if this is the "new" route
  if (noteId === "new") {
    return null;
  }

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/notes`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/notes/${noteId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLocation(`/projects/${projectId}/notes`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true}
          currentPage="notes"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="md"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Notes
            </Button>
          </div>

          {/* Note Header Skeleton */}
          <NoteDetailsHeaderSkeleton />

          {/* Main Content Skeleton */}
          <NoteDetailsContentSkeleton />
        </main>
      </div>
    );
  }

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
            <p className="text-brand-600">The note you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const category = note.category || "general";
  const config = NOTE_CATEGORY_CONFIG[category as keyof typeof NOTE_CATEGORY_CONFIG] || NOTE_CATEGORY_CONFIG.general;
  const Icon = config.icon;

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
            Back to Notes
          </Button>
        </div>

        {/* Note Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${config.bgColor}`}>
              <Icon size={24} className={config.textColor} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950 mb-2">{note.title}</h1>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} capitalize`}>
                  {config.label}
                </span>
                {note.updatedAt && (
                  <span className="text-sm text-brand-500">
                    Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
              <Edit size={16} />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          {note.content ? (
            (() => {
              try {
                // Try to parse as JSON first (new format from WordProcessor)
                const parsedData = JSON.parse(note.content);
                return <EditorContentRenderer data={parsedData} />;
              } catch {
                // Fallback to plain text display (old format)
                return (
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">{note.content}</p>
                  </div>
                );
              }
            })()
          ) : (
            <p className="text-brand-700 leading-relaxed">No content available</p>
          )}
        </div>

        {/* Metadata */}
        {note.createdAt && (
          <div className="mt-6 text-center text-sm text-brand-500">
            Created {format(new Date(note.createdAt), "MMM d, yyyy")}
          </div>
        )}
      </main>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        description={`Are you sure you want to delete "${note?.title}"? This action cannot be undone.`}
        itemName={note?.title || "this note"}
      />
    </div>
  );
}