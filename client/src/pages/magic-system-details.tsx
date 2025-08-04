import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { CharacterCard } from "@/components/character-card";
import { MiniCard } from "@/components/mini-card";
import { SearchComponent } from "@/components/search-component";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { MagicSystemDetailsHeaderSkeleton, MagicSystemDetailsContentSkeleton } from "@/components/skeleton";
import { ArrowLeft, Edit, Trash2, Sparkles, Zap, Users, BookOpen, Wand2, Plus } from "lucide-react";
import type { Project, MagicSystem, Character, Spell } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Simple two-type system configuration
const SYSTEM_TYPE_CONFIG = {
  magic: {
    icon: Sparkles,
    label: "Magic",
    color: "bg-purple-500"
  },
  power: {
    icon: Zap,
    label: "Power", 
    color: "bg-blue-500"
  }
};

const getSystemIcon = (system: MagicSystem) => {
  const config = SYSTEM_TYPE_CONFIG[system.type as keyof typeof SYSTEM_TYPE_CONFIG] || SYSTEM_TYPE_CONFIG.magic;
  return config.icon;
};

export default function MagicSystemDetails() {
  const { projectId, systemId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSpell, setDeleteSpell] = useState<Spell | null>(null);
  const [spellSearchQuery, setSpellSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { goBack, navigateWithReferrer } = useNavigation();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: system, isLoading: systemLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${systemId}`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  // Handle redirect to create page if systemId is "new"
  useEffect(() => {
    if (systemId === "new") {
      setLocation(`/projects/${projectId}/magic-systems/new`);
      return;
    }
  }, [systemId, projectId, setLocation]);

  // Set page title
  useEffect(() => {
    if (system?.name && project?.name) {
      document.title = `${system.name} - ${project.name} | InkAlchemy`;
    } else if (system?.name) {
      document.title = `${system.name} | InkAlchemy`;
    } else {
      document.title = "System Details | InkAlchemy";
    }
  }, [system?.name, project?.name]);

  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: spells, isLoading: spellsLoading } = useQuery<Spell[]>({
    queryKey: [`/api/magic-systems/${systemId}/spells`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  // Get characters that use this magic system (both direct assignment and through spells)
  const { data: allSystemUsers = [], isLoading: systemUsersLoading } = useQuery<Character[]>({
    queryKey: [`/api/magic-systems/${systemId}/characters`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || systemLoading || charactersLoading || spellsLoading || systemUsersLoading;

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/magic-systems/${systemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/magic-systems`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/activities`] });
      setLocation(`/projects/${projectId}/magic-systems`);
    },
    onError: (error) => {
      console.error('Error deleting magic system:', error);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleCharacterClick = (characterId: number) => {
    navigateWithReferrer(`/projects/${projectId}/characters/${characterId}`, currentPath);
  };

  const deleteSpellMutation = useMutation({
    mutationFn: (spellId: number) => apiRequest(`/api/spells/${spellId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/magic-systems/${systemId}/spells`] });
      setDeleteSpell(null);
    },
  });

  const handleDeleteSpell = (spell: Spell) => {
    setDeleteSpell(spell);
  };

  const confirmDeleteSpell = () => {
    if (deleteSpell) {
      deleteSpellMutation.mutate(deleteSpell.id);
    }
  };

  // Don't render anything if this is the "new" route
  if (systemId === "new") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Header with Back Button Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Magic System Header Skeleton */}
          <MagicSystemDetailsHeaderSkeleton />

          {/* Main Content Skeleton */}
          <MagicSystemDetailsContentSkeleton />
        </main>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">System not found</p>
        </div>
      </div>
    );
  }

  const Icon = getSystemIcon(system);
  
  // Get tabs based on system type
  const tabs = system.type === "power" 
    ? [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "effects", label: "Abilities", icon: Zap }
      ]
    : [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "effects", label: "Spells", icon: Wand2 }
      ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div>
            {system.description ? (
              (() => {
                try {
                  const parsedData = JSON.parse(system.description);
                  return (
                    <EditorContentRenderer 
                      data={parsedData}
                      className="prose prose-brand max-w-none"
                    />
                  );
                } catch {
                  return (
                    <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                      {system.description}
                    </p>
                  );
                }
              })()
            ) : (
              <p className="text-brand-500">No description available</p>
            )}
          </div>
        );

      case "effects":
        const contentType = system.type === "power" ? "abilities" : "spells";
        const actualSpells = spells || [];
        
        // Filter spells based on search
        const filteredSpells = actualSpells.filter((spell) => {
          if (spellSearchQuery) {
            const searchLower = spellSearchQuery.toLowerCase();
            return spell.name.toLowerCase().includes(searchLower) || 
                   spell.description?.toLowerCase().includes(searchLower) ||
                   spell.level?.toLowerCase().includes(searchLower);
          }
          return true;
        });

        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-brand-900">
                {system.type === "power" ? "Abilities" : "Spells"}
              </h3>
              <div className="flex items-center gap-4 flex-shrink-0">
                <SearchComponent
                  placeholder={`Search ${system.type === "power" ? "abilities" : "spells"}...`}
                  onSearch={setSpellSearchQuery}
                  onFilterChange={() => {}} // No filters needed
                  filters={[]} // No filters
                  showFilters={false}
                />
                <Button 
                  onClick={() => {
                    setLocation(`/projects/${projectId}/magic-systems/${systemId}/spells/new`);
                  }}
                  className="whitespace-nowrap"
                >
                  <Plus size={16} className="mr-2" />
                  Add {system.type === "power" ? "Ability" : "Spell"}
                </Button>
              </div>
            </div>
            
            {actualSpells.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {system.type === "power" ? (
                    <Zap size={24} className="text-brand-500" />
                  ) : (
                    <Wand2 size={24} className="text-brand-500" />
                  )}
                </div>
                <h4 className="text-xl font-semibold text-brand-900 mb-2">No {system.type === "power" ? "Abilities" : "Spells"} Yet</h4>
                <p className="text-brand-600 mb-4">
                  Start building your {system.type === "power" ? "ability" : "spell"} collection for this system.
                </p>
                <Button 
                  onClick={() => {
                    setLocation(`/projects/${projectId}/magic-systems/${systemId}/spells/new`);
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Create First {system.type === "power" ? "Ability" : "Spell"}
                </Button>
              </div>
            ) : filteredSpells.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {system.type === "power" ? (
                    <Zap size={24} className="text-brand-500" />
                  ) : (
                    <Wand2 size={24} className="text-brand-500" />
                  )}
                </div>
                <h4 className="text-xl font-semibold text-brand-900 mb-2">No Results Found</h4>
                <p className="text-brand-600 mb-4">
                  No {system.type === "power" ? "abilities" : "spells"} match your search criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSpells.map((spell) => (
                  <ContentCard
                    key={spell.id}
                    id={spell.id}
                    title={spell.name}
                    type="magic"
                    subtype={spell.level || ""}
                    description={spell.description || "No description available"}
                    icon={system.type === "power" ? Zap : Wand2}
                    onClick={() => setLocation(`/projects/${projectId}/spells/${spell.id}`)}
                    onEdit={() => setLocation(`/projects/${projectId}/spells/${spell.id}/edit`)}
                    onDelete={() => handleDeleteSpell(spell)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="magic-systems"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Magic System Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 text-white p-3 rounded-xl">
              <Icon size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">{system.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {system.type === "power" ? "Power System" : "Magic System"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="default" onClick={handleEdit}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8 border-b border-brand-200">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-brand-500 text-brand-600'
                          : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
                      }`}
                    >
                      <IconComponent size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
              {renderTabContent()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Source */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Source</h3>
              <p className="text-brand-700 capitalize">{system.source || "Unknown"}</p>
            </div>

            {/* Complexity */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Complexity</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                system.complexity === "low" ? "bg-brand-100 text-brand-800" :
                system.complexity === "medium" ? "bg-brand-200 text-brand-900" :
                "bg-brand-300 text-brand-950"
              }`}>
                {system.complexity || "Medium"}
              </span>
            </div>

            {/* Characters Section */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters Using This System</h3>
              {allSystemUsers.length > 0 ? (
                <div className="space-y-3">
                  {allSystemUsers.map((character) => (
                    <MiniCard
                      key={character.id}
                      icon={Users}
                      title={character.name}
                      badge={character.role || "supporting"}
                      badgeVariant="type"
                      onClick={() => handleCharacterClick(character.id)}
                      className="w-full"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-brand-500 italic text-sm">
                  No characters are currently using this {system.type} system.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Metadata */}
        {system.createdAt && (
          <div className="mt-8 text-center text-sm text-brand-500">
            Created {formatDate(system.createdAt)}
          </div>
        )}
      </main>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Magic System"
        description={`Are you sure you want to delete "${system?.name}"? This action cannot be undone and will remove all associated spells and data.`}
        itemName={system?.name || "this magic system"}
        isLoading={deleteMutation.isPending}
      />

      <DeleteConfirmation
        isOpen={!!deleteSpell}
        onClose={() => setDeleteSpell(null)}
        onConfirm={confirmDeleteSpell}
        title={`Delete ${system?.type === 'power' ? 'Ability' : 'Spell'}`}
        description={`Are you sure you want to delete "${deleteSpell?.name}"? This action cannot be undone.`}
        itemName={deleteSpell?.name || `this ${system?.type === 'power' ? 'ability' : 'spell'}`}
        isLoading={deleteSpellMutation.isPending}
      />
    </div>
  );
}