import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { CharacterCard } from "@/components/character-card";
import { ArrowLeft, Edit, Trash2, Sparkles, Zap, Users, BookOpen, Wand2, Plus } from "lucide-react";
import type { Project, MagicSystem, Character, Spell } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Simple two-type system configuration
const SYSTEM_TYPE_CONFIG = {
  magic: {
    icon: Sparkles,
    label: "Magic System",
    color: "bg-purple-500"
  },
  power: {
    icon: Zap,
    label: "Power System", 
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
  const queryClient = useQueryClient();
  const { goBack, navigateWithReferrer } = useNavigation();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: system, isLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${systemId}`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  // Set page title
  useEffect(() => {
    if (system?.name && project?.name) {
      document.title = `${system.name} - ${project.name} | StoryForge`;
    } else if (system?.name) {
      document.title = `${system.name} | StoryForge`;
    } else {
      document.title = "Magic System Details | StoryForge";
    }
  }, [system?.name, project?.name]);

  const { data: characters } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: spells } = useQuery<Spell[]>({
    queryKey: [`/api/magic-systems/${systemId}/spells`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    goBack();
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/magic-systems/${systemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLocation(`/projects/${projectId}/magic-systems`);
      }
    } catch (error) {
      console.error('Error deleting magic system:', error);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="magic-systems"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Loading magic system...</p>
        </div>
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
          <p className="text-brand-600">Magic system not found</p>
        </div>
      </div>
    );
  }

  const Icon = getSystemIcon(system);
  
  // Simplified tabs - only Details, Spells/Abilities, and Characters
  const tabs = system.type === "power" 
    ? [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "abilities", label: "Abilities", icon: Zap },
        { id: "characters", label: "Characters", icon: Users }
      ]
    : [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "spells", label: "Spells", icon: Wand2 },
        { id: "characters", label: "Characters", icon: Users }
      ];

  // Filter characters that might use this system (placeholder logic)
  const systemUsers = characters?.filter(char => 
    char.powerType?.toLowerCase().includes(system.source?.toLowerCase() || '') ||
    char.powerType?.toLowerCase().includes(system.name.toLowerCase()) ||
    char.type === "protagonist" || char.type === "ally"
  ) || [];

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
          <div className="bg-brand-50 rounded-xl border border-brand-200 p-8">
            <div className="prose prose-brand max-w-none">
              {system.description ? (
                <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">{system.description}</p>
              ) : (
                <p className="text-brand-700 leading-relaxed">No description available</p>
              )}
            </div>
          </div>
        );

      case "spells":
      case "abilities":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-900">
                {system.type === "power" ? "Abilities" : "Spells"}
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setLocation(`/projects/${projectId}/magic-systems/${systemId}/${system.type === "power" ? "abilities" : "spells"}/new`)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add {system.type === "power" ? "Ability" : "Spell"}
              </Button>
            </div>

            {spells && spells.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {spells.map((spell) => (
                  <ContentCard
                    key={spell.id}
                    title={spell.name}
                    description={spell.description}
                    badge={spell.level}
                    badgeVariant="level"
                    onClick={() => setLocation(`/projects/${projectId}/${system.type === "power" ? "abilities" : "spells"}/${spell.id}`)}
                    onDelete={() => handleDeleteSpell(spell)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-brand-50 rounded-xl border border-brand-200">
                <Wand2 className="w-12 h-12 mx-auto mb-4 text-brand-300" />
                <h3 className="text-lg font-semibold text-brand-900 mb-2">
                  No {system.type === "power" ? "abilities" : "spells"} yet
                </h3>
                <p className="text-brand-600 mb-4">
                  Create your first {system.type === "power" ? "ability" : "spell"} to get started.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setLocation(`/projects/${projectId}/magic-systems/${systemId}/${system.type === "power" ? "abilities" : "spells"}/new`)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add {system.type === "power" ? "Ability" : "Spell"}
                </Button>
              </div>
            )}
          </div>
        );

      case "characters":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-brand-900">Characters</h3>
            {systemUsers && systemUsers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {systemUsers.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-brand-50 rounded-xl border border-brand-200">
                <Users className="w-12 h-12 mx-auto mb-4 text-brand-300" />
                <h3 className="text-lg font-semibold text-brand-900 mb-2">No characters found</h3>
                <p className="text-brand-600">No characters are currently associated with this system.</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Content not available</div>;
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
      
      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Magic System Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-500">
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{system.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-500 text-white">
                    {system.type === "power" ? "Power System" : "Magic System"}
                  </span>
                  {system.updatedAt && (
                    <span className="text-sm text-brand-500">
                      Updated {formatDate(system.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                <Edit size={16} />
                Edit
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid - 2/3 main content + 1/3 sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-brand-200 mb-8">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-brand-500 text-brand-600"
                          : "border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300"
                      }`}
                    >
                      <TabIcon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-brand-50 rounded-xl border border-brand-200">
              <div className="p-8">
                {renderTabContent()}
              </div>
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
                system.complexity === "low" ? "bg-green-100 text-green-800" :
                system.complexity === "medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {system.complexity || "Medium"}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Magic System"
        description={`Are you sure you want to delete "${system.name}"? This action cannot be undone.`}
      />

      {/* Delete Spell Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={!!deleteSpell}
        onClose={() => setDeleteSpell(null)}
        onConfirm={confirmDeleteSpell}
        title={`Delete ${system.type === "power" ? "Ability" : "Spell"}`}
        description={`Are you sure you want to delete "${deleteSpell?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}