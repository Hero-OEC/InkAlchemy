import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { ContentCard } from "@/components/content-card";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { CharacterCard } from "@/components/character-card";
import { MiniCard } from "@/components/mini-card";
import { ArrowLeft, Edit, Trash2, Sparkles, Zap, DollarSign, Users, BookOpen, Wand2, Plus, Scroll, Shield } from "lucide-react";
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
  
  // Get tabs based on system type
  const tabs = system.type === "power" 
    ? [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "rules", label: "Rules", icon: Scroll },
        { id: "limitations", label: "Limitations", icon: Shield },
        { id: "abilities", label: "Abilities", icon: Zap }
      ]
    : [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "rules", label: "Rules", icon: Scroll },
        { id: "limitations", label: "Limitations", icon: Shield },
        { id: "spells", label: "Spells", icon: Wand2 }
      ];

  // Filter characters that might use this system (placeholder logic)
  const systemUsers = characters?.filter(char => 
    char.powerType?.toLowerCase().includes(system.source?.toLowerCase() || '') ||
    char.powerType?.toLowerCase().includes(system.name.toLowerCase())
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                  {system.description || "No description available"}
                </p>
              </div>
            </div>
            



          </div>
        );

      case "rules":
        return (
          <div>
            <h3 className="text-lg font-semibold text-brand-900 mb-3">System Rules</h3>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                {system.rules || "No rules defined yet"}
              </p>
            </div>
          </div>
        );

      case "limitations":
        return (
          <div>
            <h3 className="text-lg font-semibold text-brand-900 mb-3">Limitations & Drawbacks</h3>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                {system.limitations || "No limitations defined yet"}
              </p>
            </div>
          </div>
        );



      case "abilities":
      case "spells":
        const contentType = system.type === "power" ? "abilities" : "spells";
        const actualSpells = spells || [];

        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-brand-900">
                {system.type === "power" ? "Abilities" : "Spells"}
              </h3>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  setLocation(`/projects/${projectId}/magic-systems/${systemId}/spells/new`);
                }}
              >
                <Plus size={16} className="mr-2" />
                Add {system.type === "power" ? "Ability" : "Spell"}
              </Button>
            </div>
            
            {actualSpells.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actualSpells.map((spell) => (
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
            ) : (
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
                  variant="primary" 
                  size="sm"
                  onClick={() => {
                    if (system.type === "power") {
                      setLocation(`/projects/${projectId}/magic-systems/${systemId}/abilities/new`);
                    } else {
                      setLocation(`/projects/${projectId}/magic-systems/${systemId}/spells/new`);
                    }
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Create First {system.type === "power" ? "Ability" : "Spell"}
                </Button>
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
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magic Systems
          </Button>
        </div>

        {/* System Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950 mb-2">{system.name}</h1>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  system.type === "magic" ? "bg-brand-100 text-brand-800" : "bg-brand-200 text-brand-900"
                }`}>
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

        {/* Content Grid - 2/3 main content + 1/3 sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Tabs */}
          <div className="lg:col-span-2">
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
                system.complexity === "low" ? "bg-green-100 text-green-800" :
                system.complexity === "medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {system.complexity || "Medium"}
              </span>
            </div>

            {/* Characters Using This System */}
            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Characters Using This System</h3>
              {systemUsers.length > 0 ? (
                <div className="space-y-3">
                  {systemUsers.slice(0, 3).map((character) => (
                    <MiniCard
                      key={character.id}
                      icon={Users}
                      title={character.name}
                      badge={character.role || "character"}
                      badgeVariant="type"
                      onClick={() => setLocation(`/projects/${projectId}/characters/${character.id}`)}
                    />
                  ))}
                  {systemUsers.length > 3 && (
                    <p className="text-sm text-brand-600 text-center pt-2">
                      +{systemUsers.length - 3} more characters
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users size={20} className="mx-auto text-brand-300 mb-2" />
                  <p className="text-sm text-brand-600">No characters using this system</p>
                </div>
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