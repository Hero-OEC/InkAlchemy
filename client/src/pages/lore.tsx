import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ContentCard } from "@/components/content-card";
import { Button } from "@/components/button-variations";
import { Plus, BookOpen, Crown, Scroll, Landmark, Sword, Users, Globe, Calendar } from "lucide-react";
import type { Project, LoreEntry } from "@shared/schema";

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
  const [, setLocation] = useLocation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: loreEntries = [] } = useQuery<LoreEntry[]>({
    queryKey: [`/api/projects/${projectId}/lore`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateLore = () => {
    setLocation(`/projects/${projectId}/lore/new`);
  };

  const handleLoreClick = (lore: LoreEntry) => {
    setLocation(`/projects/${projectId}/lore/${lore.id}`);
  };

  const handleLoreEdit = (lore: LoreEntry) => {
    setLocation(`/projects/${projectId}/lore/${lore.id}/edit`);
  };

  // Convert lore entries to ContentCard format
  const loreCards = loreEntries.map(lore => {
    const category = lore.category || "other";
    const icon = LORE_CATEGORY_ICONS[category as keyof typeof LORE_CATEGORY_ICONS] || BookOpen;
    
    return {
      id: lore.id,
      title: lore.title,
      type: "lore" as const,
      subtype: category,
      description: lore.content.length > 100 ? `${lore.content.substring(0, 100)}...` : lore.content,
      icon: icon,
      createdAt: lore.createdAt,
      lastEditedAt: lore.updatedAt,
    };
  });

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="lore"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="container mx-auto px-6 py-8" style={{ marginLeft: '100px', marginRight: '100px' }}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-900 mb-2">World Lore</h1>
            <p className="text-brand-600">The history, culture, and knowledge of your world</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateLore}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lore
          </Button>
        </div>

        {/* Lore Grid */}
        {loreEntries.length > 0 ? (
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
                onClick={() => handleLoreClick(loreEntries.find(l => l.id === loreCard.id)!)}
                onEdit={() => handleLoreEdit(loreEntries.find(l => l.id === loreCard.id)!)}
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
              size="lg"
              onClick={handleCreateLore}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Lore Entry
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}