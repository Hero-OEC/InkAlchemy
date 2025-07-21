import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Spell {
  id: number;
  name: string;
  type: "spell" | "ability";
}

interface MagicSystem {
  id: number;
  name: string;
  type: "magic" | "power";
  spells?: Spell[];
}

interface CharacterMagicCardProps {
  magicSystem: MagicSystem;
  characterSpells?: Spell[];
  onSpellClick?: (spell: Spell) => void;
  onSystemClick?: (system: MagicSystem) => void;
}

export function CharacterMagicCard({ 
  magicSystem, 
  characterSpells = [], 
  onSpellClick, 
  onSystemClick 
}: CharacterMagicCardProps) {
  // Get the appropriate icon based on system type
  const SystemIcon = magicSystem.type === "magic" ? Sparkles : Zap;
  
  // Filter spells/abilities that belong to this system and the character can use
  const availableSpells = characterSpells.filter(spell => 
    magicSystem.spells?.some(systemSpell => systemSpell.id === spell.id)
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      {/* Main Magic System Header - Mini Card Style */}
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          "bg-brand-50 border-brand-200 hover:bg-brand-100 cursor-pointer"
        )}
        onClick={() => onSystemClick?.(magicSystem)}
      >
        <div className="p-2 rounded-lg bg-brand-200">
          <SystemIcon className="w-5 h-5 text-brand-700" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-brand-900">{magicSystem.name}</h4>
          <p className="text-sm text-brand-700">
            {magicSystem.type === "magic" ? "Magic System" : "Power System"}
          </p>
        </div>
        <div className="text-xs text-brand-600 bg-brand-200 px-2 py-1 rounded-full">
          {availableSpells.length} {magicSystem.type === "magic" ? "spells" : "abilities"}
        </div>
      </div>

      {/* Spells/Abilities List */}
      {availableSpells.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            Available {magicSystem.type === "magic" ? "Spells" : "Abilities"}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableSpells.map((spell) => (
              <div
                key={spell.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md border transition-colors cursor-pointer",
                  "bg-secondary hover:bg-accent border-border hover:border-accent-foreground/20"
                )}
                onClick={() => onSpellClick?.(spell)}
              >
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <span className="text-sm font-medium text-foreground flex-1">
                  {spell.name}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {spell.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableSpells.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">
            No {magicSystem.type === "magic" ? "spells" : "abilities"} assigned
          </p>
        </div>
      )}
    </div>
  );
}