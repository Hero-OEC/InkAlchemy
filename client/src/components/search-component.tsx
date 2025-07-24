import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchComponentProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  filters?: SearchFilter[];
  showFilters?: boolean;
  className?: string;
}

export function SearchComponent({
  placeholder = "Search...",
  onSearch,
  onFilterChange,
  filters = [],
  showFilters = false,
  className = ""
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === "all" || value === "") {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={`flex items-center gap-3 w-full max-w-lg ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-500 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10 h-10 bg-brand-50 border-brand-300 text-brand-900 placeholder:text-brand-500 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-500 hover:text-brand-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Button */}
      {showFilters && filters.length > 0 && (
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-2 h-10 px-3 border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-brand-400 shadow-sm ${
                activeFilterCount > 0 ? "bg-brand-50 border-brand-400 text-brand-800" : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-brand-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6 bg-brand-50 border-brand-200 shadow-lg" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-brand-950">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-brand-600 hover:text-brand-800 hover:bg-brand-50"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-brand-900">
                    {filter.label}
                  </label>
                  <Select
                    value={activeFilters[filter.key] || "all"}
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger className="w-full h-9 bg-brand-50 border-brand-300 text-brand-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600">
                      <SelectValue placeholder={`All ${filter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}