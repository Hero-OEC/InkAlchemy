import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { SearchComponent } from "@/components/search-component";
import { Button } from "@/components/button-variations";
import { LorePageHeaderSkeleton, LoreGridSkeleton } from "@/components/skeleton";
import { Plus, BookOpen, Crown, Scroll, Landmark, Sword, Users, Globe, Calendar } from "lucide-react";
import type { Project, LoreEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Lore category icons
const LORE_CATEGORY_ICONS = {
  history: Calendar,
  culture: Users,
  religion: Landmark,
  politics: Crown,
  geography: Globe,
  technology: Sword,
  magic: Scroll,
  language: BookOpen,
  other: BookOpen,
};

export default function Lore() {
  const { projectId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [deleteItem, setDeleteItem] = useState<LoreEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { navigateWithReferrer } = useNavigation();
  
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: loreEntries = [], isLoading: loreLoading } = useQuery<LoreEntry[]>({
    queryKey: [`/api/projects/${projectId}/lore`],
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || loreLoading;

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Lore - ${project.name} | StoryForge`;
    } else {
      document.title = "Lore | StoryForge";
    }
  }, [project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateLore = () => {
    setLocation(`/projects/${projectId}/lore/new`);
  };

  const handleLoreClick = (lore: LoreEntry) => {
    navigateWithReferrer(`/projects/${projectId}/lore/${lore.id}`, currentPath);
  };

  const handleLoreEdit = (lore: LoreEntry) => {
    setLocation(`/projects/${projectId}/lore/${lore.id}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: (loreId: number) => apiRequest(`/api/lore/${loreId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/lore`] });
      setDeleteItem(null);
    },
  });

  const handleLoreDelete = (lore: LoreEntry) => {
    setDeleteItem(lore);
  };

  const confirmDelete = () => {
    if (deleteItem) {
      deleteMutation.mutate(deleteItem.id);
    }
  };

  // Filter lore entries based on search and filters
  const filteredLoreEntries = loreEntries.filter(lore => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        lore.title.toLowerCase().includes(searchLower) ||
        (lore.content && lore.content.toLowerCase().includes(searchLower)) ||
        (lore.category && lore.category.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (activeFilters.category && lore.category !== activeFilters.category) {
      return false;
    }

    return true;
  });

  // Convert filtered lore entries to ContentCard format
  const loreCards = filteredLoreEntries.map(lore => {
    const category = lore.category || "other";
    const icon = LORE_CATEGORY_ICONS[category as keyof typeof LORE_CATEGORY_ICONS] || BookOpen;
    
    return {
      id: lore.id,
      title: lore.title,
      type: "lore" as const,
      subtype: category,
      description: lore.content && lore.content.length > 100 ? `${lore.content.substring(0, 100)}...` : (lore.content || "No content available"),
      icon: icon,
      createdAt: lore.createdAt,
      lastEditedAt: lore.updatedAt,
    };
  });

  // Search filters for lore
  const searchFilters = [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "history", label: "History" },
        { value: "culture", label: "Culture" },
        { value: "religion", label: "Religion" },
        { value: "politics", label: "Politics" },
        { value: "geography", label: "Geography" },
        { value: "technology", label: "Technology" },
        { value: "magic", label: "Magic" },
        { value: "language", label: "Language" },
        { value: "other", label: "Other" }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="lore"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header Skeleton */}
          <LorePageHeaderSkeleton />

          {/* Lore Grid Skeleton */}
          <LoreGridSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="lore"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[#624122]">Lore</h1>
            <p className="text-brand-600">The history, culture, and knowledge of your world</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <SearchComponent
              placeholder="Search lore..."
              onSearch={setSearchQuery}
              onFilterChange={setActiveFilters}
              filters={searchFilters}
              showFilters={true}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateLore}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Lore
            </Button>
          </div>
        </div>

        {/* Lore Grid */}
        {loreCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loreCards.map((loreCard) => (
              <ContentCard
                key={loreCard.id}
                id={loreCard.id}
                title={loreCard.title}
                type={loreCard.type}
                subtype={loreCard.subtype}
                description={loreCard.description}
                icon={loreCard.icon}
                createdAt={loreCard.createdAt}
                lastEditedAt={loreCard.lastEditedAt}
                onClick={() => handleLoreClick(filteredLoreEntries.find(l => l.id === loreCard.id)!)}
                onEdit={() => handleLoreEdit(filteredLoreEntries.find(l => l.id === loreCard.id)!)}
                onDelete={() => handleLoreDelete(filteredLoreEntries.find(l => l.id === loreCard.id)!)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-brand-300" />
            <h2 className="text-xl font-semibold text-brand-900 mb-2">No Lore Entries Yet</h2>
            <p className="text-brand-600 mb-6">Start building the history and culture of your world</p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateLore}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Lore Entry
            </Button>
          </div>
        )}
      </main>
      <DeleteConfirmation
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete Lore Entry"
        description={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
        itemName={deleteItem?.title || "this lore entry"}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}