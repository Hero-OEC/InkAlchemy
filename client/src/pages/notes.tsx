import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { Button } from "@/components/button-variations";
import { Plus, StickyNote, FileText, Lightbulb, AlertCircle, Tag } from "lucide-react";
import type { Project, Note } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Note category icons
const NOTE_CATEGORY_ICONS = {
  general: StickyNote,
  idea: Lightbulb,
  reminder: AlertCircle,
  plot: FileText,
  character: Tag,
  location: Tag,
  research: FileText,
};



export default function Notes() {
  const { projectId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [deleteItem, setDeleteItem] = useState<Note | null>(null);
  const queryClient = useQueryClient();
  const { navigateWithReferrer } = useNavigation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: [`/api/projects/${projectId}/notes`],
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Notes - ${project.name} | StoryForge`;
    } else {
      document.title = "Notes | StoryForge";
    }
  }, [project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateNote = () => {
    setLocation(`/projects/${projectId}/notes/new`);
  };

  const handleNoteClick = (note: Note) => {
    navigateWithReferrer(`/projects/${projectId}/notes/${note.id}`, currentPath);
  };

  const handleNoteEdit = (note: Note) => {
    setLocation(`/projects/${projectId}/notes/${note.id}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: (noteId: number) => apiRequest(`/api/notes/${noteId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/notes`] });
      setDeleteItem(null);
    },
  });

  const handleNoteDelete = (note: Note) => {
    setDeleteItem(note);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate(deleteItem.id);
    }
  };

  // Convert notes to ContentCard format
  const noteCards = notes.map(note => {
    const category = note.category || "general";
    const icon = NOTE_CATEGORY_ICONS[category as keyof typeof NOTE_CATEGORY_ICONS] || StickyNote;
    
    return {
      id: note.id,
      title: note.title,
      type: "note" as const,
      subtype: category,
      description: note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content,
      icon: icon,
      createdAt: note.createdAt,
      lastEditedAt: note.updatedAt,
    };
  });

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="notes"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-900 mb-2">Notes</h1>
            <p className="text-brand-600">Quick thoughts, ideas, and reminders for your story</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNote}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </Button>
        </div>

        {/* Notes Grid */}
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noteCards.map((noteCard) => (
              <ContentCard
                key={noteCard.id}
                id={noteCard.id}
                title={noteCard.title}
                type={noteCard.type}
                subtype={noteCard.subtype}
                description={noteCard.description}
                icon={noteCard.icon}
                createdAt={noteCard.createdAt}
                lastEditedAt={noteCard.lastEditedAt}
                onClick={() => handleNoteClick(notes.find(n => n.id === noteCard.id)!)}
                onEdit={() => handleNoteEdit(notes.find(n => n.id === noteCard.id)!)}
                onDelete={() => handleNoteDelete(notes.find(n => n.id === noteCard.id)!)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-brand-300" />
            <h2 className="text-xl font-semibold text-brand-900 mb-2">No Notes Yet</h2>
            <p className="text-brand-600 mb-6">Start capturing your ideas and thoughts about your story</p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateNote}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Note
            </Button>
          </div>
        )}
      </main>

      <DeleteConfirmation
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
        itemName={deleteItem?.title || "this note"}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}