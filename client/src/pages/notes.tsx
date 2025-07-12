import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/button-variations";
import { Plus, StickyNote, FileText, Lightbulb, AlertCircle, Tag, MoreVertical } from "lucide-react";
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

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
            {notes.map((note) => {
              const category = note.category || "general";
              const IconComponent = NOTE_CATEGORY_ICONS[category as keyof typeof NOTE_CATEGORY_ICONS] || StickyNote;
              const colorClasses = NOTE_COLORS[note.color as keyof typeof NOTE_COLORS];
              
              return (
                <Card
                  key={note.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-brand-300 ${colorClasses?.bg || 'bg-brand-50'} ${colorClasses?.border || 'border-brand-200'}`}
                  onClick={() => handleNoteClick(note)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-brand-200 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-brand-700" />
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-600 text-white capitalize">
                          {category}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNoteEdit(note);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-sm text-brand-800 line-clamp-4">
                        {note.content}
                      </p>
                      <div className="flex justify-between items-center text-xs text-brand-500">
                        <span>Created: {formatDate(note.createdAt)}</span>
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span>Updated: {formatDate(note.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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