import { CharacterMagicCard } from "./character-magic-card";

// Sample data for testing
const sampleMagicSystems = [
  {
    id: 1,
    name: "Elemental Magic",
    type: "magic" as const,
    spells: [
      { id: 1, name: "Fireball", type: "spell" as const },
      { id: 2, name: "Ice Shard", type: "spell" as const },
      { id: 3, name: "Lightning Bolt", type: "spell" as const },
      { id: 4, name: "Earth Wall", type: "spell" as const },
    ]
  },
  {
    id: 2,
    name: "Shadow Powers",
    type: "power" as const,
    spells: [
      { id: 5, name: "Shadow Step", type: "ability" as const },
      { id: 6, name: "Dark Vision", type: "ability" as const },
      { id: 7, name: "Umbral Strike", type: "ability" as const },
    ]
  },
  {
    id: 3,
    name: "Divine Magic",
    type: "magic" as const,
    spells: [
      { id: 8, name: "Healing Light", type: "spell" as const },
      { id: 9, name: "Divine Shield", type: "spell" as const },
    ]
  }
];

// Character's available spells (subset of all spells)
const characterSpells = [
  { id: 1, name: "Fireball", type: "spell" as const },
  { id: 3, name: "Lightning Bolt", type: "spell" as const },
  { id: 5, name: "Shadow Step", type: "ability" as const },
  { id: 6, name: "Dark Vision", type: "ability" as const },
  { id: 8, name: "Healing Light", type: "spell" as const },
];

export function CharacterMagicCardShowcase() {
  const handleSpellClick = (spell: any) => {
    console.log("Clicked spell:", spell);
  };

  const handleSystemClick = (system: any) => {
    console.log("Clicked magic system:", system);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-950 mb-4">Character Magic Card Showcase</h1>
        <p className="text-brand-700">
          Testing the character magic system cards with various configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sampleMagicSystems.map((system) => (
          <div key={system.id} className="space-y-2">
            <h3 className="text-lg font-semibold text-brand-900">
              {system.name} ({system.type === "magic" ? "Magic System" : "Power System"})
            </h3>
            <CharacterMagicCard
              magicSystem={system}
              characterSpells={characterSpells}
              projectId="1"
            />
          </div>
        ))}
      </div>

      {/* Empty state example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-brand-900">Empty State Example</h3>
        <CharacterMagicCard
          magicSystem={{
            id: 99,
            name: "Arcane Studies",
            type: "magic",
            spells: []
          }}
          characterSpells={[]}
          projectId="1"
        />
      </div>

      {/* Usage info */}
      <div className="bg-secondary rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Usage Information</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Displays magic systems with brand color styling</li>
            <li>Shows appropriate icons (Sparkles for magic, Zap for power)</li>
            <li>Lists character's available spells/abilities</li>
            <li>Clickable cards for navigation</li>
            <li>Responsive grid layout for spell cards</li>
            <li>Empty state handling</li>
            <li>Spell/ability counter badge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}