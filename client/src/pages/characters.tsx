import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Plus, Edit, Trash2 } from "lucide-react";
import { CharacterForm } from "@/components/character-form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function Characters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "characters"],
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/characters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "characters"] 
      });
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
    character.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getCharacterInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'developing': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    }
  };

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsFormOpen(true);
  };

  const handleDeleteCharacter = (id: number) => {
    if (confirm("Are you sure you want to delete this character?")) {
      deleteCharacterMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCharacter(null);
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Characters</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your story's characters ({filteredCharacters.length} total)
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCharacter(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCharacter ? "Edit Character" : "Create New Character"}
              </DialogTitle>
            </DialogHeader>
            <CharacterForm
              character={selectedCharacter}
              projectId={DEFAULT_PROJECT_ID}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCharacters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No characters found" : "No characters yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery 
                ? `No characters match "${searchQuery}"`
                : "Start building your story by creating your first character"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Character
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <Card key={character.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getCharacterInitials(character.name)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{character.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {character.role || "No role defined"}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(character.status)}>
                    {character.status || "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {character.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {character.description}
                      </p>
                    </div>
                  )}
                  
                  {character.goals && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Goals
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {character.goals}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCharacter(character)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCharacter(character.id)}
                        disabled={deleteCharacterMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(character.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
