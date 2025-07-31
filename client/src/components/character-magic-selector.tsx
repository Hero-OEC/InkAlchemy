import { useState, useRef } from "react";
import { Search, Sparkles, Zap, Plus, X } from "lucide-react";
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

export function CharacterMagicSelector({
  availableMagicSystems,
  selectedSpells,
  onSelectionChange,
  className
}: CharacterMagicSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addedSystems, setAddedSystems] = useState<Set<number>>(new Set());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('CharacterMagicSelector - availableMagicSystems:', availableMagicSystems);
  console.log('CharacterMagicSelector - searchTerm:', searchTerm);

  // Find systems that are either added manually or have selected spells
  const activeSystems = availableMagicSystems.filter(system => 
    addedSystems.has(system.id) || 
    system.spells?.some(spell => selectedSpells.includes(spell.id))
  );

  // Get systems not yet added to character
  const availableSystemsToAdd = availableMagicSystems.filter(system =>
    !activeSystems.some(active => active.id === system.id) &&
    system.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('CharacterMagicSelector - availableSystemsToAdd:', availableSystemsToAdd);
  console.log('CharacterMagicSelector - activeSystems:', activeSystems);

  const addMagicSystem = (system: MagicSystem) => {
    // Add system to the added systems set
    setAddedSystems(prev => new Set([...Array.from(prev), system.id]));
    setSearchTerm("");
  };

  const removeMagicSystem = (systemId: number) => {
    // Remove system from added systems
    setAddedSystems(prev => {
      const newSet = new Set(prev);
      newSet.delete(systemId);
      return newSet;
    });
    
    // Remove all spells from this system
    const systemToRemove = availableMagicSystems.find(s => s.id === systemId);
    if (systemToRemove?.spells) {
      const spellIdsToRemove = systemToRemove.spells.map(s => s.id);
      const newSelectedSpells = selectedSpells.filter(id => !spellIdsToRemove.includes(id));
      onSelectionChange(newSelectedSpells);
    }
  };

  const toggleSpell = (spellId: number) => {
    const newSelectedSpells = selectedSpells.includes(spellId)
      ? selectedSpells.filter(id => id !== spellId)
      : [...selectedSpells, spellId];
    onSelectionChange(newSelectedSpells);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Section */}
      <div className="relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search magic systems to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchTerm && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {availableSystemsToAdd.length > 0 ? (
              availableSystemsToAdd.map((system) => {
                const SystemIcon = system.type === "magic" ? Sparkles : Zap;
                return (
                  <button
                    key={system.id}
                    onClick={() => addMagicSystem(system)}
                    className="w-full p-3 text-left hover:bg-brand-100 transition-colors flex items-center gap-3"
                  >
                    <div className="p-1.5 rounded bg-brand-200">
                      <SystemIcon className="w-4 h-4 text-brand-700" />
                    </div>
                    <div>
                      <div className="font-medium text-popover-foreground">{system.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {system.type === "magic" ? "Magic System" : "Power System"} • {system.spells?.length || 0} {system.type === "magic" ? "spells" : "abilities"}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-muted-foreground">
                No systems found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Magic Systems */}
      <div className="space-y-4">
        {activeSystems.map((system) => {
          const SystemIcon = system.type === "magic" ? Sparkles : Zap;
          const systemSpells = system.spells || [];
          
          return (
            <div key={system.id} className="border border-border rounded-lg p-4 bg-card">
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
                  onClick={() => removeMagicSystem(system.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Spells List */}
              {systemSpells.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">
                    Available {system.type === "magic" ? "Spells" : "Abilities"}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {systemSpells.map((spell) => {
                      const isSelected = selectedSpells.includes(spell.id);
                      return (
                        <div
                          key={spell.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md border transition-colors",
                            isSelected 
                              ? "bg-secondary border-border hover:bg-brand-100" 
                              : "bg-brand-50 border-brand-200"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSpell(spell.id)}
                            className="data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-card-foreground truncate">
                              {spell.name}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {spell.type}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">
                    No {system.type === "magic" ? "spells" : "abilities"} available in this system
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {activeSystems.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-12 h-12 text-muted-foreground" />
            <Zap className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-2">No Magic/Power Systems Added</h3>
          <p className="text-sm text-muted-foreground">
            Search above to add magic/power systems and select spells/abilities
          </p>
        </div>
      )}
    </div>
  );
}