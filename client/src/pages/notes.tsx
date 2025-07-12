import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { Button } from "@/components/button-variations";
import { Plus, StickyNote, FileText, Lightbulb, AlertCircle, Tag } from "lucide-react";
import type { Project, Note } from "@shared/schema";

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

// Note color configurations
const NOTE_COLORS = {
  yellow: { bg: "bg-yellow-100", border: "border-yellow-200" },
  blue: { bg: "bg-blue-100", border: "border-blue-200" },
  green: { bg: "bg-green-100", border: "border-green-200" },
  purple: { bg: "bg-purple-100", border: "border-purple-200" },
  pink: { bg: "bg-pink-100", border: "border-pink-200" },
  orange: { bg: "bg-orange-100", border: "border-orange-200" },
};

export default function Notes() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: [`/api/projects/${projectId}/notes`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateNote = () => {
    setLocation(`/projects/${projectId}/notes/new`);
  };

  const handleNoteClick = (note: Note) => {
    setLocation(`/projects/${projectId}/notes/${note.id}`);
  };

  const handleNoteEdit = (note: Note) => {
    setLocation(`/projects/${projectId}/notes/${note.id}/edit`);
  };

  // Convert notes to ContentCard format
  const noteCards = notes.map(note => {
    const category = note.category || "general";
    const icon = NOTE_CATEGORY_ICONS[category as keyof typeof NOTE_CATEGORY_ICONS] || StickyNote;
    
    return {
      id: note.id,
      title: note.content.length > 50 ? `${note.content.substring(0, 50)}...` : note.content,
      type: "note" as const,
      subtype: category,
      description: note.content,
      icon: icon,
      createdAt: note.createdAt,
      lastEditedAt: note.updatedAt,
      color: note.color,
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
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
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
                className={noteCard.color ? NOTE_COLORS[noteCard.color as keyof typeof NOTE_COLORS]?.bg : undefined}
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
    </div>
  );
}