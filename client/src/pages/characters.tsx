import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { CharacterCard } from "@/components/character-card";
import { MiniCard } from "@/components/mini-card";
import { Button } from "@/components/button-variations";
import { SearchComponent } from "@/components/search-component";
import { CharactersSectionHeaderSkeleton, RacesGridSkeleton, CharactersGridSkeleton } from "@/components/skeleton";
import { Plus, Users, UserCheck } from "lucide-react";
import type { Project, Character, Race } from "@shared/schema";

export default function Characters() {
  const { projectId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const { navigateWithReferrer } = useNavigation();
  
  // Search states
  const [raceSearchQuery, setRaceSearchQuery] = useState("");
  const [raceActiveFilters, setRaceActiveFilters] = useState<Record<string, any>>({});
  const [characterSearchQuery, setCharacterSearchQuery] = useState("");
  const [characterActiveFilters, setCharacterActiveFilters] = useState<Record<string, any>>({});
  
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: races = [], isLoading: racesLoading } = useQuery<Race[]>({
    queryKey: [`/api/projects/${projectId}/races`],
  });

  // Check if any core data is still loading
  const isLoading = projectLoading || charactersLoading || racesLoading;

  // Search filters for races
  const raceSearchFilters = [
    {
      key: "lifespan",
      label: "Lifespan",
      options: [
        { value: "short", label: "Short" },
        { value: "normal", label: "Normal" },
        { value: "long", label: "Long" },
        { value: "extended", label: "Extended" },
        { value: "immortal", label: "Immortal" }
      ]
    },
    {
      key: "sizeCategory",
      label: "Size",
      options: [
        { value: "tiny", label: "Tiny" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "huge", label: "Huge" }
      ]
    }
  ];

  // Search filters for characters
  const characterSearchFilters = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "protagonist", label: "Protagonist" },
        { value: "antagonist", label: "Antagonist" },
        { value: "supporting", label: "Supporting" },
        { value: "minor", label: "Minor" }
      ]
    }
  ];

  // Filter races based on search
  const filteredRaces = races.filter((race) => {
    // Text search
    if (raceSearchQuery && !race.name.toLowerCase().includes(raceSearchQuery.toLowerCase())) {
      return false;
    }

    // Lifespan filter
    if (raceActiveFilters.lifespan && race.lifespan !== raceActiveFilters.lifespan) {
      return false;
    }

    // Size category filter
    if (raceActiveFilters.sizeCategory && race.sizeCategory !== raceActiveFilters.sizeCategory) {
      return false;
    }

    return true;
  });

  // Filter characters based on search
  const filteredCharacters = characters.filter((character) => {
    // Text search
    if (characterSearchQuery) {
      const searchLower = characterSearchQuery.toLowerCase();
      const fullName = [character.prefix, character.name, character.suffix].filter(Boolean).join(" ");
      if (!fullName.toLowerCase().includes(searchLower) && 
          !character.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Role filter
    if (characterActiveFilters.role && character.role !== characterActiveFilters.role) {
      return false;
    }

    return true;
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Characters - ${project.name} | InkAlchemy`;
    } else {
      document.title = "Characters | InkAlchemy";
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



  const handleRaceEdit = (race: Race) => {
    setLocation(`/projects/${projectId}/races/${race.id}/edit`);
  };

  const handleRaceDelete = (race: Race) => {
    // TODO: Implement race deletion with confirmation dialog
    console.log("Delete race:", race.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50">
        <Navbar 
          hasActiveProject={true} 
          currentPage="characters"
          projectName="Loading..."
          onNavigate={handleNavigation}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Races Section Skeleton */}
          <div className="mb-16">
            <CharactersSectionHeaderSkeleton />
            <RacesGridSkeleton />
          </div>

          {/* Characters Section Skeleton */}
          <div>
            <CharactersSectionHeaderSkeleton />
            <CharactersGridSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="characters"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Races Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-bold text-brand-900 mb-2 text-[36px]">Races</h1>
              <p className="text-brand-600">Define the races that inhabit your world</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <SearchComponent
                placeholder="Search races..."
                onSearch={setRaceSearchQuery}
                onFilterChange={setRaceActiveFilters}
                filters={raceSearchFilters}
                showFilters={true}
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateRace}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Race
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRaces.map((race) => (
              <MiniCard
                key={race.id}
                icon={UserCheck}
                title={race.name}
                onClick={() => handleRaceClick(race)}
                variant="dropdown"
                onEdit={() => handleRaceEdit(race)}
                onDelete={() => handleRaceDelete(race)}
              />
            ))}
          </div>
        </div>

        {/* Characters Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-bold text-brand-900 mb-2 text-[36px]">Characters</h1>
              <p className="text-brand-600">Manage your story's cast of characters</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <SearchComponent
                placeholder="Search characters..."
                onSearch={setCharacterSearchQuery}
                onFilterChange={setCharacterActiveFilters}
                filters={characterSearchFilters}
                showFilters={true}
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateCharacter}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Character
              </Button>
            </div>
          </div>

          {/* Characters Grid */}
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  id={character.id}
                  name={character.name}
                  prefix={character.prefix || undefined}
                  suffix={character.suffix || undefined}
                  type={character.role as any}
                  description={character.description || "No description available"}
                  imageUrl={character.imageUrl || undefined}
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
                size="sm"
                onClick={handleCreateCharacter}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Your First Character
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}