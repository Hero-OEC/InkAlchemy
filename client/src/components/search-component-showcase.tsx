import { useState } from "react";
import { SearchComponent } from "@/components/search-component";

export function SearchComponentShowcase() {
  const [searchResults, setSearchResults] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = (query: string) => {
    setSearchResults(query ? `Searching for: "${query}"` : "");
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    setActiveFilters(filters);
  };

  // Sample filter configurations for different content types
  const characterFilters = [
    {
      key: "type",
      label: "Character Type",
      options: [
        { value: "protagonist", label: "Protagonist" },
        { value: "antagonist", label: "Antagonist" },
        { value: "ally", label: "Ally" },
        { value: "mentor", label: "Mentor" },
        { value: "sidekick", label: "Sidekick" },
        { value: "love-interest", label: "Love Interest" },
        { value: "neutral", label: "Neutral" },
        { value: "villain", label: "Villain" },
        { value: "supporting", label: "Supporting" },
        { value: "background", label: "Background" }
      ]
    },
    {
      key: "race",
      label: "Race",
      options: [
        { value: "human", label: "Human" },
        { value: "elf", label: "Elf" },
        { value: "dwarf", label: "Dwarf" },
        { value: "orc", label: "Orc" }
      ]
    }
  ];

  const locationFilters = [
    {
      key: "type",
      label: "Location Type",
      options: [
        { value: "city", label: "City" },
        { value: "town", label: "Town" },
        { value: "village", label: "Village" },
        { value: "castle", label: "Castle" },
        { value: "forest", label: "Forest" },
        { value: "mountain", label: "Mountain" },
        { value: "dungeon", label: "Dungeon" },
        { value: "temple", label: "Temple" }
      ]
    }
  ];

  const noteFilters = [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "general", label: "General" },
        { value: "idea", label: "Idea" },
        { value: "reminder", label: "Reminder" },
        { value: "plot", label: "Plot" },
        { value: "character", label: "Character" },
        { value: "location", label: "Location" },
        { value: "research", label: "Research" }
      ]
    },
    {
      key: "color",
      label: "Color",
      options: [
        { value: "yellow", label: "Yellow" },
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "purple", label: "Purple" },
        { value: "pink", label: "Pink" },
        { value: "orange", label: "Orange" }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-950 mb-4">Search Component Showcase</h1>
        <p className="text-brand-700">
          Reusable search component with filtering capabilities for different content types
        </p>
      </div>

      {/* Basic Search */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-900">Basic Search</h2>
        <SearchComponent
          placeholder="Search characters..."
          onSearch={handleSearch}
        />
      </div>

      {/* Character Search with Filters */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-900">Character Search with Filters</h2>
        <SearchComponent
          placeholder="Search characters..."
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={characterFilters}
          showFilters={true}
        />
      </div>

      {/* Location Search with Filters */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-900">Location Search with Filters</h2>
        <SearchComponent
          placeholder="Search locations..."
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={locationFilters}
          showFilters={true}
        />
      </div>

      {/* Note Search with Filters */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-900">Note Search with Filters</h2>
        <SearchComponent
          placeholder="Search notes..."
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={noteFilters}
          showFilters={true}
        />
      </div>

      {/* Results Display */}
      <div className="bg-brand-50 rounded-xl p-6 border border-brand-200">
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Search Results</h3>
        <div className="space-y-2">
          <p className="text-brand-700">
            {searchResults || "Type in the search box above to see results"}
          </p>
          {Object.keys(activeFilters).length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-800">Active Filters:</p>
              {Object.entries(activeFilters).map(([key, value]) => (
                <div key={key} className="inline-flex items-center gap-1 mr-2">
                  <span className="text-xs bg-brand-200 text-brand-800 px-2 py-1 rounded">
                    {key}: {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}