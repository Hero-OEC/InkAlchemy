import { useState } from "react";
import { CharacterMagicSelector } from "./character-magic-selector";

// Sample data for testing
const sampleMagicSystems = [
  {
    id: 1,
    name: "Elemental Magic",
    type: "magic" as const,
    spells: [
      { id: 1, name: "Fireball", type: "spell" as const, magicSystemId: 1 },
      { id: 2, name: "Ice Shard", type: "spell" as const, magicSystemId: 1 },
      { id: 3, name: "Lightning Bolt", type: "spell" as const, magicSystemId: 1 },
      { id: 4, name: "Earth Wall", type: "spell" as const, magicSystemId: 1 },
      { id: 5, name: "Water Shield", type: "spell" as const, magicSystemId: 1 },
    ]
  },
  {
    id: 2,
    name: "Shadow Powers",
    type: "power" as const,
    spells: [
      { id: 6, name: "Shadow Step", type: "ability" as const, magicSystemId: 2 },
      { id: 7, name: "Dark Vision", type: "ability" as const, magicSystemId: 2 },
      { id: 8, name: "Umbral Strike", type: "ability" as const, magicSystemId: 2 },
      { id: 9, name: "Shadow Clone", type: "ability" as const, magicSystemId: 2 },
    ]
  },
  {
    id: 3,
    name: "Divine Magic",
    type: "magic" as const,
    spells: [
      { id: 10, name: "Healing Light", type: "spell" as const, magicSystemId: 3 },
      { id: 11, name: "Divine Shield", type: "spell" as const, magicSystemId: 3 },
      { id: 12, name: "Holy Smite", type: "spell" as const, magicSystemId: 3 },
    ]
  },
  {
    id: 4,
    name: "Arcane Studies",
    type: "magic" as const,
    spells: [
      { id: 13, name: "Teleport", type: "spell" as const, magicSystemId: 4 },
      { id: 14, name: "Dispel Magic", type: "spell" as const, magicSystemId: 4 },
      { id: 15, name: "Arcane Missile", type: "spell" as const, magicSystemId: 4 },
    ]
  },
  {
    id: 5,
    name: "Psychic Powers",
    type: "power" as const,
    spells: [
      { id: 16, name: "Mind Read", type: "ability" as const, magicSystemId: 5 },
      { id: 17, name: "Telekinesis", type: "ability" as const, magicSystemId: 5 },
      { id: 18, name: "Mental Shield", type: "ability" as const, magicSystemId: 5 },
    ]
  }
];

export function CharacterMagicSelectorShowcase() {
  const [selectedSpells, setSelectedSpells] = useState<number[]>([1, 3, 6, 7, 10]); // Pre-select some spells

  const handleSelectionChange = (spellIds: number[]) => {
    setSelectedSpells(spellIds);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-950 mb-4">Character Magic Selector Showcase</h1>
        <p className="text-brand-700">
          Interactive magic system selector for character editing forms
        </p>
      </div>

      {/* Selector Component */}
      <div className="bg-card border border-border rounded-lg p-6">
        <CharacterMagicSelector
          availableMagicSystems={sampleMagicSystems}
          selectedSpells={selectedSpells}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {/* Current Selection Display */}
      <div className="bg-secondary rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Current Selection</h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Selected Spell IDs:</strong> {selectedSpells.length > 0 ? selectedSpells.join(", ") : "None"}
          </p>
          <div className="text-sm">
            <strong>Selected Spells/Abilities:</strong>
            {selectedSpells.length > 0 ? (
              <ul className="list-disc list-inside ml-4 mt-2">
                {selectedSpells.map(spellId => {
                  const spell = sampleMagicSystems
                    .flatMap(sys => sys.spells || [])
                    .find(s => s.id === spellId);
                  const system = sampleMagicSystems.find(sys => 
                    sys.spells?.some(s => s.id === spellId)
                  );
                  
                  return spell && system ? (
                    <li key={spellId} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{spell.name}</span> 
                      ({spell.type}) from <span className="text-brand-600">{system.name}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            ) : (
              <span className="text-muted-foreground ml-2">None selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-secondary rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">How to Use</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Search:</strong> Type in the search box to find magic systems</li>
            <li><strong>Add Systems:</strong> Click on search results to add magic systems</li>
            <li><strong>Toggle Spells:</strong> Click on individual spells/abilities to select/deselect</li>
            <li><strong>Remove Systems:</strong> Click the X button to remove entire systems</li>
            <li><strong>Visual Feedback:</strong> Selected items are highlighted with checkmarks</li>
            <li><strong>Form Integration:</strong> Selected spell IDs can be saved to character data</li>
          </ul>
          <p className="mt-4"><strong>Perfect for:</strong> Character creation/editing forms where users need to assign magical abilities</p>
        </div>
      </div>
    </div>
  );
}