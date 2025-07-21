import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { CharacterCard } from "@/components/character-card";
import { MiniCard } from "@/components/mini-card";
import { Button } from "@/components/button-variations";
import { Plus, Users, UserCheck } from "lucide-react";
import type { Project, Character, Race } from "@shared/schema";

export default function Characters() {
  const { projectId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const { navigateWithReferrer } = useNavigation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: races = [] } = useQuery<Race[]>({
    queryKey: [`/api/projects/${projectId}/races`],
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Characters - ${project.name} | StoryForge`;
    } else {
      document.title = "Characters | StoryForge";
    }
  }, [project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleCreateCharacter = () => {
    setLocation(`/projects/${projectId}/characters/new`);
  };

  const handleCharacterClick = (character: Character) => {
    navigateWithReferrer(`/projects/${projectId}/characters/${character.id}`, currentPath);
  };

  const handleCharacterEdit = (character: Character) => {
    setLocation(`/projects/${projectId}/characters/${character.id}/edit`);
  };

  const handleCreateRace = () => {
    setLocation(`/projects/${projectId}/races/new`);
  };

  const handleRaceClick = (race: Race) => {
    navigateWithReferrer(`/projects/${projectId}/races/${race.id}`, currentPath);
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-brand-900 mb-2 text-[36px]">Characters</h1>
            <p className="text-brand-600">Manage your story's cast of characters and races</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateCharacter}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Character
          </Button>
        </div>

        {/* Races Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-900 mb-2">Races</h2>
              <p className="text-brand-600">Define the races that inhabit your world</p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={handleCreateRace}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Race
            </Button>
          </div>

          {races.length === 0 ? (
            <div className="bg-white rounded-lg border border-brand-200 p-8 text-center">
              <UserCheck className="w-12 h-12 text-brand-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-900 mb-2">No races yet</h3>
              <p className="text-brand-600 mb-4">Start building your world by defining the races that live in it.</p>
              <Button variant="primary" onClick={handleCreateRace}>
                Create Your First Race
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {races.map((race) => (
                <MiniCard
                  key={race.id}
                  title={race.name}
                  description={race.description || "No description"}
                  category="race"
                  categoryLabel="Race"
                  onClick={() => handleRaceClick(race)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Characters Grid */}
        {characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                id={character.id}
                name={character.name}
                prefix={character.prefix}
                suffix={character.suffix}
                type={character.type as any}
                description={character.description || "No description available"}
                imageUrl={character.imageUrl}
                createdAt={character.createdAt}
                lastEditedAt={character.updatedAt}
                onClick={() => handleCharacterClick(character)}
                onEdit={() => handleCharacterEdit(character)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-brand-300" />
            <h2 className="text-xl font-semibold text-brand-900 mb-2">No Characters Yet</h2>
            <p className="text-brand-600 mb-6">Create your first character to bring your story to life</p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateCharacter}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Character
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}