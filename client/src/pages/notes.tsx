import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { SearchComponent } from "@/components/search-component";
import { Button } from "@/components/button-variations";
import { NotesPageHeaderSkeleton, NotesGridSkeleton } from "@/components/skeleton";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { navigateWithReferrer } = useNavigation();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ['/api/projects', String(projectId), 'notes'],
    staleTime: 0, // Always refetch when invalidated
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || notesLoading;

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Notes - ${project.name} | InkAlchemy`;
    } else {
      document.title = "Notes | InkAlchemy";
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
      queryClient.invalidateQueries({ queryKey: ['/api/projects', String(projectId), 'notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', String(projectId), 'stats'] });
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

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        (note.category && note.category.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Category filter
    if (activeFilters.category && note.category !== activeFilters.category) {
      return false;
    }



    return true;
  });

  // Helper function to extract plain text from Editor.js content
  const extractTextFromEditorContent = (content: string): string => {
    if (!content) return "";

    try {
      const parsedContent = JSON.parse(content);

      if (!parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
        return content; // Return as-is if not Editor.js format
      }

      // Extract text ONLY from paragraph blocks
      // Ignore ALL other block types: header, list, checklist, quote, image, delimiter, table, code, etc.
      const textBlocks = parsedContent.blocks
        .filter((block: any) => block.type === "paragraph")
        .map((block: any) => {
          const text = block.data?.text || "";
          // Strip any HTML tags that might be in the text (from inline formatting)
          return text.replace(/<[^>]*>/g, "");
        })
        .filter((text: string) => text.trim() !== "");

      return textBlocks.join(" ").trim();
    } catch (error) {
      // If JSON parsing fails, return the content as-is (likely plain text)
      return content;
    }
  };

  // Convert filtered notes to ContentCard format
  const noteCards = filteredNotes.map(note => {
    // Extract plain text from Editor.js content
    const extractedText = extractTextFromEditorContent(note.content || "");
    const description = extractedText || "No content available";

    return {
      id: note.id,
      title: note.title,
      type: "note" as const,
      subtype: "quick-note",
      description: description,
      icon: StickyNote,
      createdAt: note.createdAt,
      lastEditedAt: note.updatedAt,
    };
  });

  // Search filters for notes
  const searchFilters = [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "general", label: "General" },
        { value: "idea", label: "Idea" },
        { value: "reminder", label: "Reminder" },
        { value: "plot", label: "Plot" },
        { value: "character", label: "Character" },
        { value: "location", label: "Location" },
        { value: "research", label: "Research" }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="notes"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header Skeleton */}
          <NotesPageHeaderSkeleton />

          {/* Notes Grid Skeleton */}
          <NotesGridSkeleton />
        </main>
      </div>
    );
  }

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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[#624122]">Notes</h1>
            <p className="text-brand-600">Quick thoughts, ideas, and reminders for your story</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <SearchComponent
              placeholder="Search notes..."
              onSearch={setSearchQuery}
              onFilterChange={setActiveFilters}
              filters={searchFilters}
              showFilters={true}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateNote}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes Grid */}
        {noteCards.length > 0 ? (
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
                onClick={() => handleNoteClick(filteredNotes.find(n => n.id === noteCard.id)!)}
                onEdit={() => handleNoteEdit(filteredNotes.find(n => n.id === noteCard.id)!)}
                onDelete={() => handleNoteDelete(filteredNotes.find(n => n.id === noteCard.id)!)}
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
              size="sm"
              onClick={handleCreateNote}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
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