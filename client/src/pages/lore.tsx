import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Book, Search, Plus, Edit, Trash2, StickyNote } from "lucide-react";
import { NoteForm } from "@/components/note-form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoreEntry, Note } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function Lore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lore" | "notes">("lore");
  const { toast } = useToast();

  const { data: loreEntries, isLoading: loreLoading } = useQuery<LoreEntry[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "lore"],
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "notes"],
  });

  const deleteLoreMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/lore/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "lore"] 
      });
      toast({
        title: "Success",
        description: "Lore entry deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lore entry",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "notes"] 
      });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const filteredLoreEntries = loreEntries?.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredNotes = notes?.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'history': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'mythology': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300';
      case 'culture': return 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300';
      case 'religion': return 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300';
      case 'politics': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'geography': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  const getNoteColorBg = (color?: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700';
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700';
      case 'green': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700';
      case 'red': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-700';
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700';
      default: return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700';
    }
  };

  const handleDeleteLore = (id: number) => {
    if (confirm("Are you sure you want to delete this lore entry?")) {
      deleteLoreMutation.mutate(id);
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsNoteFormOpen(true);
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleNoteFormSuccess = () => {
    setIsNoteFormOpen(false);
    setSelectedNote(null);
  };

  const isLoading = loreLoading || notesLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lore & Notes</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your world's knowledge and quick notes
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isNoteFormOpen} onOpenChange={setIsNoteFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setSelectedNote(null)}>
                <StickyNote className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedNote ? "Edit Note" : "Create New Note"}
                </DialogTitle>
              </DialogHeader>
              <NoteForm
                note={selectedNote}
                projectId={DEFAULT_PROJECT_ID}
                onSuccess={handleNoteFormSuccess}
              />
            </DialogContent>
          </Dialog>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lore Entry
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("lore")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "lore"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Book className="w-4 h-4 mr-2 inline" />
            Lore Entries ({filteredLoreEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "notes"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <StickyNote className="w-4 h-4 mr-2 inline" />
            Quick Notes ({filteredNotes.length})
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {activeTab === "lore" ? (
        // Lore Entries Tab
        filteredLoreEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? "No lore entries found" : "No lore entries yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery 
                  ? `No lore entries match "${searchQuery}"`
                  : "Start documenting your world's history and knowledge"
                }
              </p>
              {!searchQuery && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Lore Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoreEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {entry.category && (
                          <Badge className={getCategoryColor(entry.category)}>
                            {entry.category}
                          </Badge>
                        )}
                        <Badge className={getImportanceColor(entry.importance)}>
                          {entry.importance || "Medium"} Importance
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entry.content && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
                        {entry.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLore(entry.id)}
                          disabled={deleteLoreMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        // Notes Tab
        filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery 
                  ? `No notes match "${searchQuery}"`
                  : "Start capturing your ideas and thoughts"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsNoteFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className={`hover:shadow-lg transition-shadow ${getNoteColorBg(note.color)}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {note.content}
                    </p>
                    
                    {note.category && note.category !== 'general' && (
                      <Badge variant="outline" className="text-xs">
                        {note.category}
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-20">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deleteNoteMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
