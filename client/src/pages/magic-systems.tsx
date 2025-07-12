import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wand2, Search, Plus, Edit, Trash2 } from "lucide-react";
import { MagicSystemForm } from "@/components/magic-system-form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MagicSystem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const DEFAULT_PROJECT_ID = 1;

export default function MagicSystems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMagicSystem, setSelectedMagicSystem] = useState<MagicSystem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: magicSystems, isLoading } = useQuery<MagicSystem[]>({
    queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "magic-systems"],
  });

  const deleteMagicSystemMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/magic-systems/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", DEFAULT_PROJECT_ID, "magic-systems"] 
      });
      toast({
        title: "Success",
        description: "Magic system deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete magic system",
        variant: "destructive",
      });
    },
  });

  const filteredMagicSystems = magicSystems?.filter(system =>
    system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    system.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    system.source?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    }
  };

  const handleEditMagicSystem = (system: MagicSystem) => {
    setSelectedMagicSystem(system);
    setIsFormOpen(true);
  };

  const handleDeleteMagicSystem = (id: number) => {
    if (confirm("Are you sure you want to delete this magic system?")) {
      deleteMagicSystemMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedMagicSystem(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Magic Systems</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Define and manage your world's magical rules ({filteredMagicSystems.length} total)
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedMagicSystem(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Magic System
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedMagicSystem ? "Edit Magic System" : "Create New Magic System"}
              </DialogTitle>
            </DialogHeader>
            <MagicSystemForm
              magicSystem={selectedMagicSystem}
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
            placeholder="Search magic systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredMagicSystems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wand2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No magic systems found" : "No magic systems yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery 
                ? `No magic systems match "${searchQuery}"`
                : "Start defining the magical rules of your world"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Magic System
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMagicSystems.map((system) => (
            <Card key={system.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{system.name}</CardTitle>
                      <Badge className={getComplexityColor(system.complexity)}>
                        {system.complexity || "Medium"} Complexity
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {system.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {system.description}
                      </p>
                    </div>
                  )}
                  
                  {system.source && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Source of Power
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {system.source}
                      </p>
                    </div>
                  )}
                  
                  {system.users && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Who Can Use It
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {system.users}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">Rules</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {system.rules ? `${system.rules.split('\n').length} defined` : 'None defined'}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">Limitations</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {system.limitations ? `${system.limitations.split('\n').length} defined` : 'None defined'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMagicSystem(system)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMagicSystem(system.id)}
                        disabled={deleteMagicSystemMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(system.createdAt).toLocaleDateString()}
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
