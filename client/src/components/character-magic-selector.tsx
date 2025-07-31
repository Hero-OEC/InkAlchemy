import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Zap, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Spell {
  id: number;
  name: string;
  type: "spell" | "ability";
  magicSystemId: number;
}

interface MagicSystem {
  id: number;
  name: string;
  type: "magic" | "power";
  spells?: Spell[];
}

interface CharacterMagicSelectorProps {
  availableMagicSystems: MagicSystem[];
  selectedSpells: number[]; // Array of spell IDs
  onSelectionChange: (spellIds: number[]) => void;
  className?: string;
}

interface SelectedSystem {
  system: MagicSystem;
  selectedSpells: Set<number>;
}

export function CharacterMagicSelector({
  availableMagicSystems,
  selectedSpells,
  onSelectionChange,
  className
}: CharacterMagicSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<Map<number, SelectedSystem>>(new Map());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debug log component renders and props
  console.log('CharacterMagicSelector render:', {
    availableMagicSystems: availableMagicSystems.length,
    selectedSpells: selectedSpells.length,
    selectedSystemsSize: selectedSystems.size,
    selectedSystemIds: Array.from(selectedSystems.keys())
  });

  // Initialize selected systems based on selectedSpells only once or when props change significantly
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Only initialize from props if not already initialized or if selectedSpells has actual content
    if (!isInitialized || (selectedSpells.length > 0 && selectedSystems.size === 0)) {
      console.log('useEffect running - initializing selected systems from props');
      const systemsMap = new Map<number, SelectedSystem>();
      
      selectedSpells.forEach(spellId => {
        const system = availableMagicSystems.find(sys => 
          sys.spells?.some(spell => spell.id === spellId)
        );
        
        if (system) {
          if (!systemsMap.has(system.id)) {
            systemsMap.set(system.id, {
              system,
              selectedSpells: new Set()
            });
          }
          systemsMap.get(system.id)!.selectedSpells.add(spellId);
        }
      });
      
      console.log('Setting systems map from useEffect:', systemsMap.size);
      setSelectedSystems(systemsMap);
      setIsInitialized(true);
    }
  }, [selectedSpells, availableMagicSystems, isInitialized, selectedSystems.size]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notify parent when user interacts with the component (not on prop changes)
  const notifyParentOfChanges = (newSelectedSystems: Map<number, SelectedSystem>) => {
    const allSelectedSpells: number[] = [];
    newSelectedSystems.forEach(({ selectedSpells }) => {
      selectedSpells.forEach(spellId => allSelectedSpells.push(spellId));
    });
    
    console.log('Calling onSelectionChange with spells:', allSelectedSpells);
    onSelectionChange(allSelectedSpells);
  };

  // Filter magic systems based on search
  const filteredSystems = availableMagicSystems.filter(system =>
    system.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMagicSystem = (system: MagicSystem) => {
    console.log('Adding magic system:', system);
    
    setSelectedSystems(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(system.id)) {
        newMap.set(system.id, {
          system,
          selectedSpells: new Set()
        });
        console.log('System added to map:', system.name, 'New map size:', newMap.size);
        
        // Notify parent immediately with the new map
        const allSelectedSpells: number[] = [];
        newMap.forEach(({ selectedSpells }) => {
          selectedSpells.forEach(spellId => allSelectedSpells.push(spellId));
        });
        console.log('Calling onSelectionChange with spells:', allSelectedSpells);
        onSelectionChange(allSelectedSpells);
      } else {
        console.log('System already exists in map:', system.name);
      }
      return newMap;
    });
    
    setSearchTerm(""); // Clear search after adding
  };

  const removeMagicSystem = (systemId: number) => {
    setSelectedSystems(prev => {
      const newMap = new Map(prev);
      newMap.delete(systemId);
      
      // Notify parent immediately with the new map
      const allSelectedSpells: number[] = [];
      newMap.forEach(({ selectedSpells }) => {
        selectedSpells.forEach(spellId => allSelectedSpells.push(spellId));
      });
      onSelectionChange(allSelectedSpells);
      
      return newMap;
    });
  };

  const toggleSpell = (systemId: number, spellId: number) => {
    setSelectedSystems(prev => {
      const newMap = new Map(prev);
      const systemData = newMap.get(systemId);
      
      if (systemData) {
        const newSelectedSpells = new Set(systemData.selectedSpells);
        
        if (newSelectedSpells.has(spellId)) {
          newSelectedSpells.delete(spellId);
        } else {
          newSelectedSpells.add(spellId);
        }
        
        newMap.set(systemId, {
          ...systemData,
          selectedSpells: newSelectedSpells
        });
        
        // Notify parent immediately with the new map
        const allSelectedSpells: number[] = [];
        newMap.forEach(({ selectedSpells }) => {
          selectedSpells.forEach(spellId => allSelectedSpells.push(spellId));
        });
        onSelectionChange(allSelectedSpells);
      }
      
      return newMap;
    });
  };

  const availableSystemsToAdd = filteredSystems.filter(system => 
    !selectedSystems.has(system.id)
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Magic Systems & Abilities
        </label>
        <p className="text-xs text-muted-foreground">
          Search and add magic systems, then select which spells/abilities this character can use
        </p>
      </div>

      {/* Search Input */}
      <div className="relative" ref={searchContainerRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search magic systems..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        
        {/* Search Results Dropdown */}
        {searchTerm && availableSystemsToAdd.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {availableSystemsToAdd.map(system => {
              const SystemIcon = system.type === "magic" ? Sparkles : Zap;
              return (
                <div
                  key={system.id}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => addMagicSystem(system)}
                >
                  <div className="p-1.5 rounded-lg bg-brand-200">
                    <SystemIcon className="w-4 h-4 text-brand-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-popover-foreground">{system.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {system.type === "magic" ? "Magic System" : "Power System"} 
                      {system.spells && ` • ${system.spells.length} ${system.type === "magic" ? "spells" : "abilities"}`}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Magic Systems */}
      <div className="space-y-4">
        {Array.from(selectedSystems.entries()).map(([systemId, { system, selectedSpells: systemSelectedSpells }]) => {
          const SystemIcon = system.type === "magic" ? Sparkles : Zap;
          const systemSpells = system.spells || [];
          
          return (
            <div key={systemId} className="border border-border rounded-lg p-4 bg-card">
              {/* System Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-brand-200">
                    <SystemIcon className="w-6 h-6 text-brand-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{system.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {system.type === "magic" ? "Magic System" : "Power System"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMagicSystem(systemId)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Spells/Abilities List */}
              {systemSpells.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {systemSpells.map(spell => {
                    const isSelected = systemSelectedSpells.has(spell.id);
                    return (
                      <div
                        key={spell.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer",
                          isSelected
                            ? "bg-brand-100 border-brand-300 shadow-sm"
                            : "bg-secondary hover:bg-accent border-border"
                        )}
                        onClick={() => toggleSpell(systemId, spell.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {}} // Handled by parent click
                          className="pointer-events-none"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-card-foreground">{spell.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{spell.type}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No {system.type === "magic" ? "spells" : "abilities"} available</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {selectedSystems.size === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No magic systems selected</p>
          <p className="text-xs">Search above to add magic systems and select spells/abilities</p>
        </div>
      )}
    </div>
  );
}