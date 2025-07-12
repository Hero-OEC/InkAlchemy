import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { Edit, ArrowLeft, StickyNote, FileText, Lightbulb, AlertCircle, Tag, Calendar } from "lucide-react";
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



export default function NoteDetails() {
  const { projectId, noteId } = useParams();
  const [, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: note } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
    enabled: noteId !== "new" && !!noteId,
  });

  // Prevent this component from rendering if noteId is "new"
  if (noteId === "new") {
    return null;
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true}
          currentPage="notes"
          projectName={project?.name}
          onNavigate={(page) => setLocation(`/projects/${projectId}/${page}`)}
        />
        <main className="max-w-7xl mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
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
  const IconComponent = NOTE_CATEGORY_ICONS[category as keyof typeof NOTE_CATEGORY_ICONS] || StickyNote;

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/notes/${noteId}/edit`);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

        {/* Note Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-200">
                <IconComponent size={24} className="text-brand-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950 mb-2">Note Details</h1>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-600 text-white capitalize">
                    {category}
                  </span>

                </div>
              </div>
            </div>
            <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
              <Edit size={16} />
              Edit Note
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Note Content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl p-6 bg-brand-50 border-brand-200 border">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">Content</h2>
              <div className="prose prose-brand max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-brand-800">
                  {note.content}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Metadata */}
          <div className="lg:col-span-1">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-semibold text-brand-900">Note Information</h2>
              

              {/* Created Date */}
              <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-brand-200 rounded-lg">
                  <Calendar className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Created</div>
                  <div className="text-sm font-semibold text-brand-900">{formatDate(note.createdAt)}</div>
                </div>
              </div>

              {/* Updated Date */}
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-brand-200 rounded-lg">
                    <Edit className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Last Updated</div>
                    <div className="text-sm font-semibold text-brand-900">{formatDate(note.updatedAt)}</div>
                  </div>
                </div>
              )}

              {/* Word Count */}
              <div className="flex items-center gap-2 p-3 bg-brand-100 border border-brand-200 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-brand-200 rounded-lg">
                  <FileText className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-brand-500 uppercase tracking-wide">Word Count</div>
                  <div className="text-sm font-semibold text-brand-900">{note.content.split(/\s+/).length} words</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}