import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { ContentCard } from "@/components/content-card";
import { CharacterCard } from "@/components/character-card";
import { ArrowLeft, Edit, Sparkles, Zap, Scroll, Crown, Shield, Sword, Brain, Eye, Heart, Skull, DollarSign, Users, BookOpen, Wand2, Plus } from "lucide-react";
import type { Project, MagicSystem, Character, Spell } from "@shared/schema";

// Icon configuration for magic systems
const MAGIC_TYPE_CONFIG = {
  magic: {
    icons: {
      elemental: Sparkles,
      arcane: Scroll,
      divine: Crown,
      nature: Sparkles,
      shadow: Eye,
      necromancy: Skull,
      illusion: Brain,
      enchantment: Heart,
      other: Sparkles
    }
  },
  power: {
    icons: {
      psychic: Brain,
      physical: Sword,
      energy: Zap,
      elemental: Sparkles,
      technological: Shield,
      genetic: Heart,
      supernatural: Eye,
      other: Zap
    }
  }
};

const getSystemIcon = (system: MagicSystem) => {
  const category = system.source?.toLowerCase() || 'other';
  const typeConfig = MAGIC_TYPE_CONFIG[system.type as keyof typeof MAGIC_TYPE_CONFIG] || MAGIC_TYPE_CONFIG.magic;
  return typeConfig.icons[category as keyof typeof typeConfig.icons] || typeConfig.icons.other;
};

export default function MagicSystemDetails() {
  const { projectId, systemId } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: system, isLoading } = useQuery<MagicSystem>({
    queryKey: [`/api/magic-systems/${systemId}`],
    enabled: !!systemId && systemId !== "new" && !isNaN(Number(systemId))
  });

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
    setLocation(`/projects/${projectId}/magic-systems`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/magic-systems/${systemId}/edit`);
  };

  const handleCharacterClick = (characterId: number) => {
    setLocation(`/projects/${projectId}/characters/${characterId}`);
  };

  const handleSpellClick = (spellId: number) => {
    setLocation(`/projects/${projectId}/spells/${spellId}`);
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
        { id: "cost", label: "Cost", icon: DollarSign },
        { id: "abilities", label: "Abilities", icon: Zap },
        { id: "characters", label: "Characters", icon: Users }
      ]
    : [
        { id: "details", label: "Details", icon: BookOpen },
        { id: "rules", label: "Rules", icon: Scroll },
        { id: "limitations", label: "Limitations", icon: Shield },
        { id: "cost", label: "Cost", icon: DollarSign },
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                  {system.description || "No description available"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-3">Source</h3>
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                  <p className="text-brand-700 capitalize">{system.source || "Unknown"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-3">Complexity</h3>
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
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

            <div>
              <h3 className="text-lg font-semibold text-brand-900 mb-3">Users & Practitioners</h3>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
                <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                  {system.users || "No information about users available"}
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

      case "cost":
        return (
          <div>
            <h3 className="text-lg font-semibold text-brand-900 mb-3">Cost & Requirements</h3>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
              <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                {system.cost || "No cost information defined yet"}
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
              <Button variant="primary" size="sm">
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
                    subtype={spell.level}
                    description={spell.description || "No description available"}
                    icon={system.type === "power" ? Zap : Wand2}
                    onClick={() => handleSpellClick(spell.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 size={24} className="text-brand-500" />
                </div>
                <h4 className="text-xl font-semibold text-brand-900 mb-2">No {system.type === "power" ? "Abilities" : "Spells"} Yet</h4>
                <p className="text-brand-600 mb-4">
                  Start building your {system.type === "power" ? "ability" : "spell"} collection for this system.
                </p>
                <Button variant="primary" size="sm">
                  <Plus size={16} className="mr-2" />
                  Create First {system.type === "power" ? "Ability" : "Spell"}
                </Button>
              </div>
            )}
          </div>
        );

      case "characters":
        return (
          <div>
            <h3 className="text-lg font-semibold text-brand-900 mb-6">Characters Using This System</h3>
            
            {systemUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-brand-500" />
                </div>
                <h4 className="text-xl font-semibold text-brand-900 mb-2">No Characters Assigned</h4>
                <p className="text-brand-600">
                  No characters are currently using this {system.type} system.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemUsers.map((character) => (
                  <CharacterCard
                    key={character.id}
                    id={character.id}
                    name={character.name}
                    prefix={character.prefix}
                    suffix={character.suffix}
                    type={character.type as any}
                    description={character.description || ""}
                    imageUrl={character.imageUrl}
                    createdAt={character.createdAt}
                    lastEditedAt={character.updatedAt}
                    onClick={() => handleCharacterClick(character.id)}
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  system.type === "magic" ? "bg-brand-100 text-brand-800" : "bg-brand-200 text-brand-900"
                }`}>
                  {system.type} System
                </span>
                {system.updatedAt && (
                  <span className="text-sm text-brand-500">
                    Updated {formatDate(system.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
            <Edit size={16} />
            Edit
          </Button>
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

        {/* Tab Content */}
        <div>{renderTabContent()}</div>

        {/* Metadata */}
        {system.createdAt && (
          <div className="mt-8 text-center text-sm text-brand-500">
            Created {formatDate(system.createdAt)}
          </div>
        )}
      </main>
    </div>
  );
}