import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Search, Plus } from "lucide-react";
import { CharacterCard } from "../components/character-card";
import { Button } from "../components/button-variations";
import { DeleteConfirmation, useDeleteConfirmation } from "../components/delete-confirmation";
import { queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { Character } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function Characters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { deleteConfirmation, openDeleteConfirmation, closeDeleteConfirmation } = useDeleteConfirmation();

  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "characters"],
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/characters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "characters"] 
      });
      closeDeleteConfirmation();
      toast({
        title: "Success",
        description: "Character deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive",
      });
    },
  });

  const filteredCharacters = characters?.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsFormOpen(true);
  };

  const handleDeleteCharacter = (character: Character) => {
    openDeleteConfirmation({
      title: "Delete Character",
      description: `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
      itemName: character.name,
      onConfirm: () => deleteCharacterMutation.mutate(character.id),
    });
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCharacter(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-brand-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-brand-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-950">Characters</h1>
            <p className="text-brand-700 mt-2 font-medium">
              Manage your story's characters ({filteredCharacters.length} total)
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setSelectedCharacter(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Character
          </Button>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-brand-200 rounded-xl text-brand-900 placeholder-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent font-medium"
            />
          </div>
        </div>

        {/* Characters Grid */}
        {filteredCharacters.length === 0 ? (
          <div className="bg-white border border-brand-200 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-brand-400" />
            <h3 className="text-xl font-semibold text-brand-950 mb-3">
              {searchQuery ? "No characters found" : "No characters yet"}
            </h3>
            <p className="text-brand-700 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No characters match "${searchQuery}". Try adjusting your search terms.`
                : "Start building your story by creating your first character. Add details about their personality, background, and role in your world."
              }
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Character
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                id={character.id}
                name={character.name}
                prefix={character.prefix}
                suffix={character.suffix}
                type={character.type as any}
                description={character.description || "No description provided"}
                imageUrl={character.imageUrl}
                createdAt={character.createdAt}
                lastEditedAt={character.lastEditedAt}
                onEdit={() => handleEditCharacter(character)}
                onDelete={() => handleDeleteCharacter(character)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={deleteConfirmation.onConfirm}
          title={deleteConfirmation.title}
          description={deleteConfirmation.description}
          itemName={deleteConfirmation.itemName}
          isLoading={deleteCharacterMutation.isPending}
        />

        {/* Character Form Modal - TODO: Implement */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <h2 className="text-xl font-semibold text-brand-950 mb-4">
                {selectedCharacter ? "Edit Character" : "Create New Character"}
              </h2>
              <p className="text-brand-700 mb-4">
                Character form will be implemented here
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleFormSuccess}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleFormSuccess}>
                  Save Character
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}