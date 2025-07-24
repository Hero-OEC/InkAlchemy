import { 
  projects, characters, locations, events, magicSystems, spells, loreEntries, notes, relationships, characterSpells, races,
  type Project, type InsertProject,
  type Character, type InsertCharacter,
  type Location, type InsertLocation,
  type Event, type InsertEvent,
  type MagicSystem, type InsertMagicSystem,
  type Spell, type InsertSpell,
  type LoreEntry, type InsertLoreEntry,
  type Note, type InsertNote,
  type Relationship, type InsertRelationship,
  type CharacterSpell, type InsertCharacterSpell,
  type Race, type InsertRace
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Characters
  getCharacters(projectId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;

  // Locations
  getLocations(projectId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Events
  getEvents(projectId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Magic Systems
  getMagicSystems(projectId: number): Promise<MagicSystem[]>;
  getMagicSystem(id: number): Promise<MagicSystem | undefined>;
  createMagicSystem(magicSystem: InsertMagicSystem): Promise<MagicSystem>;
  updateMagicSystem(id: number, magicSystem: Partial<InsertMagicSystem>): Promise<MagicSystem | undefined>;
  deleteMagicSystem(id: number): Promise<boolean>;

  // Spells
  getSpells(magicSystemId: number): Promise<Spell[]>;
  getAllSpellsForProject(projectId: number): Promise<Spell[]>;
  getSpell(id: number): Promise<Spell | undefined>;
  createSpell(spell: InsertSpell): Promise<Spell>;
  updateSpell(id: number, spell: Partial<InsertSpell>): Promise<Spell | undefined>;
  deleteSpell(id: number): Promise<boolean>;

  // Character Spells
  getCharacterSpells(characterId: number): Promise<(Spell & { proficiency?: string })[]>;
  addCharacterSpell(characterSpell: InsertCharacterSpell): Promise<CharacterSpell>;
  removeCharacterSpell(characterId: number, spellId: number): Promise<boolean>;

  // Lore Entries
  getLoreEntries(projectId: number): Promise<LoreEntry[]>;
  getLoreEntry(id: number): Promise<LoreEntry | undefined>;
  createLoreEntry(loreEntry: InsertLoreEntry): Promise<LoreEntry>;
  updateLoreEntry(id: number, loreEntry: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined>;
  deleteLoreEntry(id: number): Promise<boolean>;

  // Notes
  getNotes(projectId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;

  // Races
  getRaces(projectId: number): Promise<Race[]>;
  getRace(id: number): Promise<Race | undefined>;
  createRace(race: InsertRace): Promise<Race>;
  updateRace(id: number, race: Partial<InsertRace>): Promise<Race | undefined>;
  deleteRace(id: number): Promise<boolean>;

  // Relationships
  getRelationships(projectId: number): Promise<Relationship[]>;
  getRelationshipsForElement(projectId: number, elementType: string, elementId: number): Promise<Relationship[]>;
  createRelationship(relationship: InsertRelationship): Promise<Relationship>;
  updateRelationship(id: number, relationship: Partial<InsertRelationship>): Promise<Relationship | undefined>;
  deleteRelationship(id: number): Promise<boolean>;

  // Search
  searchElements(projectId: number, query: string): Promise<any[]>;

  // Stats
  getProjectStats(projectId: number): Promise<{
    characters: number;
    locations: number;
    events: number;
    magicSystems: number;
    loreEntries: number;
    notes: number;
  }>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private characters: Map<number, Character>;
  private locations: Map<number, Location>;
  private events: Map<number, Event>;
  private magicSystems: Map<number, MagicSystem>;
  private spells: Map<number, Spell>;
  private loreEntries: Map<number, LoreEntry>;
  private notes: Map<number, Note>;
  private races: Map<number, Race>;
  private relationships: Map<number, Relationship>;
  private characterSpells: Map<number, CharacterSpell>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.characters = new Map();
    this.locations = new Map();
    this.events = new Map();
    this.magicSystems = new Map();
    this.spells = new Map();
    this.loreEntries = new Map();
    this.notes = new Map();
    this.races = new Map();
    this.relationships = new Map();
    this.characterSpells = new Map();
    this.currentId = 10;

    // Create a default project
    const defaultProject: Project = {
      id: 1,
      name: "The Chronicles of Aethermoor",
      description: "A fantasy epic spanning multiple realms",
      genre: "fantasy",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(1, defaultProject);

    // Add sample characters for the default project
    const defaultCharacters: Character[] = [
      {
        id: 1,
        projectId: 1,
        name: "Aria Stormwind",
        prefix: "",
        suffix: "",
        role: "protagonist",
        description: "A young mage discovering her true power and learning to master elemental magic",
        age: "19",
        raceId: null,
        magicSystemId: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        projectId: 1,
        name: "Master Theron",
        prefix: "Master",
        suffix: "",
        role: "mentor",
        description: "Ancient mage and mentor to Aria, guardian of ancient secrets for centuries",
        age: "150",
        raceId: null,
        magicSystemId: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        projectId: 1,
        name: "Lord Malachar",
        prefix: "Lord",
        suffix: "the Shadowbane",
        role: "antagonist",
        description: "Dark sorcerer seeking to corrupt the realm through forbidden shadow magic",
        age: "45",
        raceId: null,
        magicSystemId: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add sample locations for the default project
    const defaultLocations: Location[] = [
      {
        id: 1,
        projectId: 1,
        name: "Silverbrook Village",
        type: "settlement",
        description: "A peaceful village nestled in the mountains where traditional mountain folk live and work",
        geography: "Mountainous region with streams and fertile valleys perfect for farming",
        culture: "Traditional mountain folk with strong community bonds and Elder Council governance",
        politics: "Governed by an Elder Council with decisions made through village meetings",
        parentLocationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        projectId: 1,
        name: "The Ancient Grove",
        type: "natural",
        description: "A mystical forest where ancient magic lingers and druids gather to perform rituals",
        geography: "Dense old-growth forest with towering trees that seem to whisper secrets",
        culture: "Sacred to druids who protect the ancient magic that flows through the trees",
        politics: "No formal government, but druids serve as guardians and mediators",
        parentLocationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        projectId: 1,
        name: "Shadowspire Tower",
        type: "fortress",
        description: "Dark tower serving as Malachar's stronghold, perpetually shrouded in storms",
        geography: "Isolated mountain peak surrounded by treacherous cliffs and perpetual storms",
        culture: "Cult of shadow magic with strict hierarchy and dark rituals",
        politics: "Absolute dictatorship under Lord Malachar with fear as the primary tool of control",
        parentLocationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultCharacters.forEach(char => this.characters.set(char.id, char));
    defaultLocations.forEach(loc => this.locations.set(loc.id, loc));

    // Add sample events for the default project
    const defaultEvents: Event[] = [
      {
        id: 1,
        projectId: 1,
        title: "The Great Discovery",
        description: "The main character discovers their hidden power",
        year: 1,
        month: 2,
        day: 15,
        type: "discovery",
        stage: "editing",
        importance: "high",
        locationId: 2, // The Ancient Grove
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        projectId: 1,
        title: "First Battle",
        description: "The character's first real test in combat",
        year: 1,
        month: 5,
        day: 3,
        type: "battle",
        stage: "writing",
        importance: "medium",
        locationId: null,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        projectId: 1,
        title: "Meeting the Mentor",
        description: "The protagonist meets their guide and teacher who reveals ancient secrets",
        year: 1,
        month: 1,
        day: 20,
        type: "meeting",
        stage: "complete",
        importance: "high",
        locationId: 1, // Silverbrook Village
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        projectId: 1,
        title: "Dark Revelation",
        description: "A shocking truth about the world is revealed",
        year: 2,
        month: 3,
        day: 10,
        type: "discovery",
        stage: "planning",
        importance: "critical",
        locationId: null,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        projectId: 1,
        title: "The Final Confrontation",
        description: "The climactic battle between good and evil",
        year: 3,
        month: 12,
        day: 25,
        type: "battle",
        stage: "first-draft",
        importance: "critical",
        locationId: 3, // Shadowspire Tower
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Multi-event scenario: Three events on the same date (year 2, month 6, day 15)
      {
        id: 6,
        projectId: 1,
        title: "The Royal Festival",
        description: "A grand celebration in the capital city",
        year: 2,
        month: 6,
        day: 15,
        type: "political",
        stage: "writing",
        importance: "medium",
        locationId: 1, // Silverbrook Village
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        projectId: 1,
        title: "Assassin's Strike",
        description: "An attempt on the protagonist's life during the festival",
        year: 2,
        month: 6,
        day: 15,
        type: "battle",
        stage: "editing",
        importance: "high",
        locationId: 1, // Silverbrook Village
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        projectId: 1,
        title: "Love's Declaration",
        description: "A romantic moment between protagonists amid the chaos",
        year: 2,
        month: 6,
        day: 15,
        type: "personal",
        stage: "complete",
        importance: "medium",
        locationId: 1, // Silverbrook Village
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultEvents.forEach(event => this.events.set(event.id, event));

    // Add sample relationships to connect characters to events
    const defaultRelationships: Relationship[] = [
      {
        id: 1,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 3, // Meeting the Mentor
        toElementType: "character", 
        toElementId: 1, // Aria Stormwind
        relationshipType: "participant",
        description: "Aria participates in this event",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 3, // Meeting the Mentor
        toElementType: "character",
        toElementId: 2, // Master Theron
        relationshipType: "participant",
        description: "Theron participates in this event",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 1, // The Great Discovery
        toElementType: "character",
        toElementId: 1, // Aria Stormwind
        relationshipType: "participant",
        description: "Aria discovers her power",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 5, // The Final Confrontation
        toElementType: "character",
        toElementId: 1, // Aria Stormwind
        relationshipType: "participant",
        description: "Aria participates in final battle",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 5, // The Final Confrontation
        toElementType: "character",
        toElementId: 3, // Lord Malachar
        relationshipType: "participant",
        description: "Malachar is the antagonist in final battle",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Relationships for multi-event scenario (events 6, 7, 8 on same date)
      {
        id: 6,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 6, // The Royal Festival
        toElementType: "character",
        toElementId: 1, // Aria Stormwind
        relationshipType: "participant",
        description: "Aria attends the festival",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 7, // Assassin's Strike
        toElementType: "character",
        toElementId: 1, // Aria Stormwind
        relationshipType: "target",
        description: "Aria is the target of the assassination attempt",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        projectId: 1,
        fromElementType: "event",
        fromElementId: 8, // Love's Declaration
        toElementType: "character",
        toElementId: 1, // Aria Stormwind
        relationshipType: "participant",
        description: "Aria shares a romantic moment",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRelationships.forEach(rel => this.relationships.set(rel.id, rel));

    // Add sample notes for the default project
    const defaultNotes: Note[] = [
      {
        id: 21,
        projectId: 1,
        title: "Magic System Cost Mechanism",
        content: "Remember to develop the magic system's cost mechanism - each spell should require something from the caster",
        category: "idea",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 22,
        projectId: 1,
        title: "Ancient Prophecy Plot Hole",
        content: "Plot hole: How does Aria learn about the ancient prophecy? Need to establish this earlier in Chapter 3",
        category: "plot",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 23,
        projectId: 1,
        title: "Medieval Clothing Research",
        content: "Research medieval clothing styles for the royal court scenes - need accurate descriptions",
        category: "research",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 24,
        projectId: 1,
        title: "Theron Character Development",
        content: "Character development: Show more of Theron's backstory through dialogue rather than exposition",
        category: "character",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 25,
        projectId: 1,
        title: "Beta Reader Deadline",
        content: "Don't forget to submit first three chapters to beta readers by Friday",
        category: "reminder",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 26,
        projectId: 1,
        title: "Great Line Idea",
        content: "Great line idea: 'The shadows whispered secrets that daylight could never reveal'",
        category: "general",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultNotes.forEach(note => this.notes.set(note.id, note));

    // Add sample lore entries for the default project
    const defaultLoreEntries: LoreEntry[] = [
      {
        id: 27,
        projectId: 1,
        title: "The Great Sundering",
        content: "Three thousand years ago, the realm was torn asunder by a cataclysmic magical event known as the Great Sundering. This catastrophe split the once-united continent of Aethermoor into seven distinct realms, each separated by treacherous void-barriers that can only be crossed through ancient gateways.\n\nThe Sundering was caused by the misuse of the Eternal Crystals - seven powerful artifacts that once maintained balance across the realm. When the High Mage Valdris attempted to merge all seven crystals to achieve immortality, the resulting magical explosion tore reality itself.\n\nThe aftermath left each realm with its own unique magical properties and dangers, forever changing the nature of magic and the creatures that inhabit these lands.",
        category: "history",
        importance: "high",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 28,
        projectId: 1,
        title: "The Order of the Silver Moon",
        content: "The Order of the Silver Moon is an ancient religious organization dedicated to preserving the balance between light and shadow magic. Founded in the early days following the Great Sundering, the Order serves as both a spiritual guide and a guardian against magical corruption.\n\nBeliefs and Practices:\n- Monthly ceremonies during the full moon to renew magical protections\n- Meditation techniques that help practitioners resist dark magic influence\n- Sacred vows of neutrality in political conflicts\n- Preservation of ancient texts and magical knowledge\n\nThe Order maintains temples in each of the seven realms, serving as neutral ground where even enemies can seek sanctuary. Their priests and priestesses are recognizable by their silver robes and moon-shaped amulets.",
        category: "religion",
        importance: "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 29,
        projectId: 1,
        title: "The Council of Seven Realms",
        content: "Following the chaos after the Great Sundering, the surviving leaders established the Council of Seven Realms as a governing body to maintain peace and coordinate responses to realm-threatening dangers.\n\nStructure:\n- Each realm sends one representative (usually a ruler or high noble)\n- Decisions require majority vote (4 of 7 realms)\n- Rotating leadership changes every three years\n- Emergency sessions can be called if void-creatures threaten multiple realms\n\nThe Council meets annually in the Neutral Sanctum, a floating island maintained by powerful magic that exists between all seven realms. Recent tensions have strained relationships, particularly between the Northern Ice Realm and the Southern Desert Provinces.",
        category: "politics",
        importance: "high",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 30,
        projectId: 1,
        title: "Festival of Convergence",
        content: "The Festival of Convergence is the most important cultural celebration across all seven realms, commemorating the rare astronomical event when all three moons align. This occurs once every seven years and is believed to amplify magical abilities.\n\nTraditions:\n- Exchange of Convergence Gifts between realms\n- Lighting of the Unity Flames in each realm's capital\n- Performance of the ancient Song of Binding by trained bards\n- Temporary opening of additional pathways between realms\n- Pilgrimage to the Sundering Memorial Sites\n\nDuring the festival, magical barriers weaken, allowing easier travel between realms. It's also when new mages traditionally attempt their first major spells and when diplomatic marriages are often arranged between ruling families.",
        category: "culture",
        importance: "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 31,
        projectId: 1,
        title: "Ancient Draconic Language",
        content: "The Ancient Draconic language predates the Great Sundering and remains the primary language for complex magical incantations and scholarly texts. Modern scholars study this dead language to unlock the secrets of pre-Sundering magic.\n\nKey Characteristics:\n- Tonal language with five distinct pitch levels\n- Complex grammar with 12 verb tenses relating to magical states\n- Runic writing system with 87 base symbols\n- Many concepts have no equivalent in modern common tongue\n\nImportant Phrases:\n- 'Veth mor drakon' = 'By the ancient power' (common incantation opening)\n- 'Sil'thara nex' = 'The void between' (referring to barriers between realms)\n- 'Mor'dun keth' = 'Balance restored' (traditional greeting among mages)\n\nMastery of Ancient Draconic is required for advancement in most magical institutions and is considered a mark of true scholarship.",
        category: "language",
        importance: "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 32,
        projectId: 1,
        title: "Elemental Crystals and Magical Technology",
        content: "The technology of Aethermoor is built around the manipulation of elemental crystals - naturally occurring gems that can store and channel specific types of magical energy. These crystals power everything from simple household items to massive realm-protecting barriers.\n\nTypes of Crystals:\n- Fire Crystals (red): Used for heating, lighting, and forging\n- Water Crystals (blue): Purification, healing, and weather control\n- Earth Crystals (brown): Construction, agriculture, and defensive barriers\n- Air Crystals (clear): Communication, transportation, and wind power\n- Shadow Crystals (black): Rare and dangerous, used in forbidden magic\n\nCrystal-powered inventions include floating platforms for transportation, communication mirrors that work across realms, and defensive barriers that protect cities from void-creature attacks. The largest crystals, known as Heart Stones, power entire cities and are heavily guarded.",
        category: "technology",
        importance: "high",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 33,
        projectId: 1,
        title: "The Whispering Woods Geographic Anomaly",
        content: "The Whispering Woods span the border between three realms and represent one of the most dangerous geographical features in Aethermoor. The forest itself seems to exist partially outside normal reality, with paths that change based on the traveler's intentions and trees that remember events from centuries past.\n\nUnique Properties:\n- Time flows differently - some areas experience rapid aging while others are frozen in temporal loops\n- The trees themselves are sentient and can communicate through telepathic whispers\n- Plant life exhibits properties from all seven realms simultaneously\n- Compass and magical navigation fail within the forest boundaries\n- Seasonal changes occur randomly rather than following natural patterns\n\nThe woods are home to the last remaining population of Fae Folk, who serve as guardians of this mystical place. Many who enter seeking shortcuts between realms are never seen again, though some emerge years later claiming only hours have passed.",
        category: "geography",
        importance: "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 34,
        projectId: 1,
        title: "The Three Schools of Magic",
        content: "Magic in Aethermoor is divided into three fundamental schools, each with distinct principles, practitioners, and societal roles. Understanding these schools is crucial for any magical education.\n\n**Arcane Magic** (The School of Knowledge)\n- Relies on study, formulas, and precise incantations\n- Practitioners: Wizards, scholars, court mages\n- Strengths: Predictable results, powerful long-range effects\n- Weaknesses: Requires preparation and components\n\n**Divine Magic** (The School of Faith)\n- Draws power from devotion to deities or cosmic forces\n- Practitioners: Clerics, paladins, temple guardians\n- Strengths: Healing abilities, protective wards\n- Weaknesses: Limited by faith and divine approval\n\n**Primal Magic** (The School of Instinct)\n- Channels raw magical energy through emotion and will\n- Practitioners: Sorcerers, druids, wild mages\n- Strengths: Spontaneous casting, elemental control\n- Weaknesses: Unpredictable, physically exhausting\n\nMost magical institutions teach all three schools, though students typically specialize in one primary discipline.",
        category: "magic",
        importance: "high",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultLoreEntries.forEach(lore => this.loreEntries.set(lore.id, lore));

    // Add sample magic systems for the default project
    const defaultMagicSystems: MagicSystem[] = [
      {
        id: 35,
        projectId: 1,
        name: "Elemental Manipulation",
        type: "magic",
        description: "The ability to control and manipulate the four classical elements: fire, water, earth, and air through willpower and training.",
        rules: "Practitioners must maintain physical contact with their chosen element or its derivatives. The more distant from the pure element, the more difficult the manipulation becomes.",
        limitations: "Cannot create elements from nothing - must work with existing matter. Overuse leads to elemental fatigue and temporary loss of abilities. Weather conditions can greatly enhance or diminish power.",
        source: "elemental",
        complexity: "medium",
        users: "Approximately 15% of the population shows elemental affinity, but only 3% develop usable skills through training.",
        cost: "Physical and mental exhaustion with overuse, requires concentration and proximity to elements",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 36,
        projectId: 1,
        name: "Divine Channeling",
        type: "magic",
        description: "Sacred magic drawn from devotion to the Seven Celestial Guardians, granting protective wards, healing abilities, and divine insight.",
        rules: "Power scales with genuine faith and moral alignment. Requires daily prayers and adherence to divine commandments. More powerful abilities require ritual components and group ceremonies.",
        limitations: "Divine magic fails completely when the practitioner acts against their deity's principles. Cannot be used for purely selfish or harmful purposes. Power fluctuates based on holy calendar and celestial events.",
        source: "divine",
        complexity: "high",
        users: "Restricted to ordained clergy and paladins of the Seven Celestial Guardians. Approximately 500 active practitioners across all realms.",
        cost: "Requires daily prayers, ritual components, and adherence to divine commandments",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 37,
        projectId: 1,
        name: "Shadow Weaving",
        type: "magic",
        description: "The manipulation of shadow and darkness for concealment, illusion, and limited offensive capabilities. Often misunderstood and feared by the general population.",
        rules: "Strongest in darkness or dim light, weakest in bright sunlight. Requires emotional control and understanding of fear psychology. Advanced techniques involve merging with shadows for travel.",
        limitations: "Completely powerless in absolute light or areas blessed by divine magic. Prolonged use can lead to 'shadow addiction' and gradual loss of connection to light and warmth.",
        source: "shadow",
        complexity: "high",
        users: "Secretive practitioners organized in hidden guilds. Estimated 200-300 shadow weavers exist, mostly operating covertly.",
        cost: "Risk of shadow addiction and gradual loss of connection to light and warmth",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 38,
        projectId: 1,
        name: "Psychic Resonance",
        type: "power",
        description: "Mental abilities including telepathy, telekinesis, and precognitive flashes. Believed to be an evolutionary development rather than learned magic.",
        rules: "Power manifests during emotional stress or life-threatening situations. Strength correlates with mental discipline and meditation practice. Range limited by emotional connection to target.",
        limitations: "Causes severe mental fatigue and headaches with overuse. Cannot read minds protected by magical wards or strong mental barriers. Precognitive visions are often symbolic and difficult to interpret.",
        source: "psychic",
        complexity: "medium",
        users: "Genetic trait appearing in roughly 2% of the population. Most develop only minor abilities; true psychics number less than 50 known individuals.",
        cost: "Severe mental fatigue and headaches with overuse, emotional stress required for activation",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 39,
        projectId: 1,
        name: "Crystal Fusion",
        type: "power",
        description: "The ability to mentally interface with and amplify elemental crystals, creating powerful technological-magical hybrid effects.",
        rules: "Requires direct skin contact with charged crystals. User's life force temporarily bonds with crystal energy. More powerful effects demand multiple synchronized crystals.",
        limitations: "Overuse can cause crystalline scarring on the skin and eventual crystal poisoning. Incompatible crystals can cause violent energy feedback. Each person can only bond with 2-3 crystal types safely.",
        source: "technological",
        complexity: "low",
        users: "Modern development taught in specialized academies. Approximately 800 certified crystal fusion specialists work in various technological and defensive roles.",
        cost: "Risk of crystalline scarring and crystal poisoning, requires physical contact with charged crystals",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultMagicSystems.forEach(system => this.magicSystems.set(system.id, system));

    // Add sample spells for the default magic systems
    const defaultSpells: Spell[] = [
      // Elemental Manipulation spells (system 35)
      {
        id: 101,
        projectId: 1,
        magicSystemId: 35,
        name: "Fireball",
        level: "novice",
        description: "A basic spell that conjures a ball of fire to hurl at enemies. The size and intensity depend on the caster's skill level.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 102,
        projectId: 1,
        magicSystemId: 35,
        name: "Water Shield",
        level: "apprentice",
        description: "Creates a protective barrier of flowing water that can absorb physical and magical attacks. Requires a nearby water source.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 103,
        projectId: 1,
        magicSystemId: 35,
        name: "Earth Tremor",
        level: "adept",
        description: "Causes the ground to shake violently in a small area, potentially knocking down opponents and damaging structures.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 104,
        projectId: 1,
        magicSystemId: 35,
        name: "Hurricane Call",
        level: "master",
        description: "Summons a powerful localized storm with destructive winds and lightning. Extremely draining and difficult to control.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Divine Channeling spells (system 36)
      {
        id: 105,
        projectId: 1,
        magicSystemId: 36,
        name: "Healing Light",
        level: "novice",
        description: "Channels divine energy to restore health and vitality to the target. The most fundamental divine magic spell.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 106,
        projectId: 1,
        magicSystemId: 36,
        name: "Guardian's Ward",
        level: "apprentice",
        description: "Creates a protective barrier blessed by the Celestial Guardians that repels evil and dark magic.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 107,
        projectId: 1,
        magicSystemId: 36,
        name: "Divine Insight",
        level: "adept",
        description: "Grants the ability to see through illusions and detect lies for a limited time. Reveals the true nature of things.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Shadow Weaving spells (system 37)
      {
        id: 108,
        projectId: 1,
        magicSystemId: 37,
        name: "Shadow Cloak",
        level: "novice",
        description: "Wraps the caster in darkness, making them nearly invisible in dim light and completely invisible in darkness.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 109,
        projectId: 1,
        magicSystemId: 37,
        name: "Fear Whisper",
        level: "apprentice",
        description: "Sends tendrils of shadow to whisper frightening thoughts into an enemy's mind, causing panic and confusion.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 110,
        projectId: 1,
        magicSystemId: 37,
        name: "Shadow Step",
        level: "expert",
        description: "Allows the caster to travel instantly through shadows, appearing at any shadowed location within sight.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Psychic Resonance abilities (system 38)
      {
        id: 111,
        projectId: 1,
        magicSystemId: 38,
        name: "Mind Read",
        level: "novice",
        description: "Read surface thoughts and emotions from a willing or distracted target within close range.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 112,
        projectId: 1,
        magicSystemId: 38,
        name: "Telekinetic Push",
        level: "apprentice",
        description: "Move objects with the mind, lifting and manipulating items up to 20 pounds without physical contact.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 113,
        projectId: 1,
        magicSystemId: 38,
        name: "Precognitive Flash",
        level: "adept",
        description: "Glimpse potential future events through vivid mental flashes, typically 3-10 seconds ahead.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 114,
        projectId: 1,
        magicSystemId: 38,
        name: "Mental Barrier",
        level: "expert",
        description: "Create a protective shield around the mind, blocking telepathic intrusion and psychic attacks.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Crystal Fusion abilities (system 39)
      {
        id: 115,
        projectId: 1,
        magicSystemId: 39,
        name: "Energy Amplification",
        level: "novice",
        description: "Channel crystal energy to boost physical strength and endurance temporarily.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 116,
        projectId: 1,
        magicSystemId: 39,
        name: "Crystal Shield",
        level: "apprentice",
        description: "Project a protective barrier of crystalline energy that can deflect both physical and energy attacks.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 117,
        projectId: 1,
        magicSystemId: 39,
        name: "Elemental Discharge",
        level: "adept",
        description: "Release stored elemental energy from crystals in a powerful directed blast.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 118,
        projectId: 1,
        magicSystemId: 39,
        name: "Crystal Network",
        level: "master",
        description: "Simultaneously bond with multiple crystals to create complex energy patterns and amplified effects.",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultSpells.forEach(spell => this.spells.set(spell.id, spell));

    // Add sample character spells to demonstrate both magic and power systems
    const defaultCharacterSpells: CharacterSpell[] = [
      // Aria (character 1) - Elemental magic user
      {
        id: 201,
        characterId: 1,
        spellId: 101, // Fireball
        proficiency: "adept",
        createdAt: new Date()
      },
      {
        id: 202,
        characterId: 1,
        spellId: 102, // Water Shield
        proficiency: "apprentice",
        createdAt: new Date()
      },
      {
        id: 203,
        characterId: 1,
        spellId: 103, // Earth Tremor
        proficiency: "novice",
        createdAt: new Date()
      },
      
      // Master Theron (character 2) - Divine magic user with psychic abilities
      {
        id: 204,
        characterId: 2,
        spellId: 105, // Healing Light
        proficiency: "master",
        createdAt: new Date()
      },
      {
        id: 205,
        characterId: 2,
        spellId: 106, // Guardian's Ward
        proficiency: "expert",
        createdAt: new Date()
      },
      {
        id: 206,
        characterId: 2,
        spellId: 107, // Divine Insight
        proficiency: "adept",
        createdAt: new Date()
      },
      {
        id: 207,
        characterId: 2,
        spellId: 111, // Mind Read (Psychic ability)
        proficiency: "apprentice",
        createdAt: new Date()
      },
      {
        id: 208,
        characterId: 2,
        spellId: 114, // Mental Barrier (Psychic ability)
        proficiency: "adept",
        createdAt: new Date()
      },
      
      // Kara (character 3) - Power system user (Crystal Fusion and Psychic)
      {
        id: 209,
        characterId: 3,
        spellId: 115, // Energy Amplification (Crystal ability)
        proficiency: "expert",
        createdAt: new Date()
      },
      {
        id: 210,
        characterId: 3,
        spellId: 116, // Crystal Shield (Crystal ability)
        proficiency: "adept",
        createdAt: new Date()
      },
      {
        id: 211,
        characterId: 3,
        spellId: 117, // Elemental Discharge (Crystal ability)
        proficiency: "apprentice",
        createdAt: new Date()
      },
      {
        id: 212,
        characterId: 3,
        spellId: 112, // Telekinetic Push (Psychic ability)
        proficiency: "adept",
        createdAt: new Date()
      },
      {
        id: 213,
        characterId: 3,
        spellId: 113, // Precognitive Flash (Psychic ability)
        proficiency: "novice",
        createdAt: new Date()
      }
    ];

    defaultCharacterSpells.forEach(charSpell => this.characterSpells.set(charSpell.id, charSpell));

    // Add sample races for the default project
    const defaultRaces: Race[] = [
      {
        id: 301,
        projectId: 1,
        name: "Aetherian",
        description: "Ancient magical beings with profound connection to elemental forces",
        biology: "Lifespan: 800-1200 years. Enhanced magical conductivity, luminescent eyes that reflect their elemental affinity. Taller and more slender than humans.",
        culture: "Deeply spiritual society centered around elemental harmony. Value wisdom and magical knowledge above material wealth. Live in crystalline cities that amplify magical energies.",
        language: "Aetheric - a melodic language with tonal variations that can influence magical resonance",
        homelandId: 1, // Silverhold
        traits: "Natural spellcasters, can see magical auras, resistant to elemental damage",
        lifespan: "800-1200 years",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 302,
        projectId: 1,
        name: "Stormborn",
        description: "Hardy mountain dwellers with inherent resistance to harsh environments",
        biology: "Lifespan: 120-150 years. Dense bone structure, enhanced lung capacity, natural cold resistance. Gray-tinted skin that darkens with age.",
        culture: "Clan-based warrior society that values honor, strength, and loyalty. Masters of metalworking and storm magic. Oral tradition preserves ancient laws.",
        language: "Stormtongue - harsh consonants that echo mountain winds, includes ritual battle-chants",
        homelandId: 2, // Ironpeak Mountains
        traits: "Natural weather resistance, enhanced physical strength, can predict storms",
        lifespan: "120-150 years",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 303,
        projectId: 1,
        name: "Shadowkin",
        description: "Mysterious beings who dwell between light and darkness",
        biology: "Lifespan: 600-800 years. Can partially phase between material and shadow realms. Pale, almost translucent skin that becomes more solid in darkness.",
        culture: "Secretive society of scholars, spies, and guardians of forbidden knowledge. Value secrets and information. Rarely seen by other races.",
        language: "Umbral - a whispered language that can only be fully understood in darkness",
        homelandId: 3, // Whispering Woods
        traits: "Shadow manipulation, natural stealth abilities, can see in complete darkness",
        lifespan: "600-800 years",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRaces.forEach(race => this.races.set(race.id, race));
    this.currentId = 350;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, insertProject: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated: Project = {
      ...existing,
      ...insertProject,
      updatedAt: new Date()
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Characters
  async getCharacters(projectId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(c => c.projectId === projectId);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentId++;
    const character: Character = {
      id,
      projectId: insertCharacter.projectId,
      name: insertCharacter.name,
      prefix: insertCharacter.prefix ?? null,
      suffix: insertCharacter.suffix ?? null,
      role: insertCharacter.role ?? null,
      description: insertCharacter.description ?? null,
      age: insertCharacter.age ?? null,
      raceId: insertCharacter.raceId ?? null,
      magicSystemId: insertCharacter.magicSystemId ?? null,
      imageUrl: insertCharacter.imageUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, insertCharacter: Partial<InsertCharacter>): Promise<Character | undefined> {
    const existing = this.characters.get(id);
    if (!existing) return undefined;
    
    const updated: Character = {
      ...existing,
      ...insertCharacter,
      updatedAt: new Date()
    };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Locations
  async getLocations(projectId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(l => l.projectId === projectId);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId++;
    const location: Location = {
      id,
      projectId: insertLocation.projectId,
      name: insertLocation.name,
      type: insertLocation.type ?? null,
      description: insertLocation.description ?? null,
      geography: insertLocation.geography ?? null,
      culture: insertLocation.culture ?? null,
      politics: insertLocation.politics ?? null,
      parentLocationId: insertLocation.parentLocationId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, insertLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = this.locations.get(id);
    if (!existing) return undefined;
    
    const updated: Location = {
      ...existing,
      ...insertLocation,
      updatedAt: new Date()
    };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Events
  async getEvents(projectId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(e => e.projectId === projectId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const event: Event = {
      id,
      projectId: insertEvent.projectId,
      title: insertEvent.title,
      description: insertEvent.description ?? null,
      year: insertEvent.year,
      month: insertEvent.month,
      day: insertEvent.day,
      type: insertEvent.type ?? null,
      stage: insertEvent.stage ?? null,
      importance: insertEvent.importance ?? null,
      locationId: insertEvent.locationId ?? null,
      order: insertEvent.order ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, insertEvent: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    
    const updated: Event = {
      ...existing,
      ...insertEvent,
      updatedAt: new Date()
    };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Magic Systems
  async getMagicSystems(projectId: number): Promise<MagicSystem[]> {
    return Array.from(this.magicSystems.values()).filter(m => m.projectId === projectId);
  }

  async getMagicSystem(id: number): Promise<MagicSystem | undefined> {
    return this.magicSystems.get(id);
  }

  async createMagicSystem(insertMagicSystem: InsertMagicSystem): Promise<MagicSystem> {
    const id = this.currentId++;
    const magicSystem: MagicSystem = {
      id,
      projectId: insertMagicSystem.projectId,
      name: insertMagicSystem.name,
      description: insertMagicSystem.description ?? null,
      rules: insertMagicSystem.rules ?? null,
      limitations: insertMagicSystem.limitations ?? null,
      source: insertMagicSystem.source ?? null,
      complexity: insertMagicSystem.complexity ?? null,
      users: insertMagicSystem.users ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.magicSystems.set(id, magicSystem);
    return magicSystem;
  }

  async updateMagicSystem(id: number, insertMagicSystem: Partial<InsertMagicSystem>): Promise<MagicSystem | undefined> {
    const existing = this.magicSystems.get(id);
    if (!existing) return undefined;
    
    const updated: MagicSystem = {
      ...existing,
      ...insertMagicSystem,
      updatedAt: new Date()
    };
    this.magicSystems.set(id, updated);
    return updated;
  }

  async deleteMagicSystem(id: number): Promise<boolean> {
    return this.magicSystems.delete(id);
  }

  // Spells
  async getSpells(magicSystemId: number): Promise<Spell[]> {
    return Array.from(this.spells.values()).filter(s => s.magicSystemId === magicSystemId);
  }

  async getAllSpellsForProject(projectId: number): Promise<Spell[]> {
    return Array.from(this.spells.values()).filter(s => s.projectId === projectId);
  }

  async getSpell(id: number): Promise<Spell | undefined> {
    return this.spells.get(id);
  }

  async createSpell(insertSpell: InsertSpell): Promise<Spell> {
    const id = this.currentId++;
    const spell: Spell = {
      id,
      projectId: insertSpell.projectId,
      magicSystemId: insertSpell.magicSystemId,
      name: insertSpell.name,
      level: insertSpell.level ?? "novice",
      description: insertSpell.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.spells.set(id, spell);
    return spell;
  }

  async updateSpell(id: number, insertSpell: Partial<InsertSpell>): Promise<Spell | undefined> {
    const existing = this.spells.get(id);
    if (!existing) return undefined;
    
    const updated: Spell = {
      ...existing,
      ...insertSpell,
      updatedAt: new Date()
    };
    this.spells.set(id, updated);
    return updated;
  }

  async deleteSpell(id: number): Promise<boolean> {
    return this.spells.delete(id);
  }

  // Lore Entries
  async getLoreEntries(projectId: number): Promise<LoreEntry[]> {
    return Array.from(this.loreEntries.values()).filter(l => l.projectId === projectId);
  }

  async getLoreEntry(id: number): Promise<LoreEntry | undefined> {
    return this.loreEntries.get(id);
  }

  async createLoreEntry(insertLoreEntry: InsertLoreEntry): Promise<LoreEntry> {
    const id = this.currentId++;
    const loreEntry: LoreEntry = {
      id,
      projectId: insertLoreEntry.projectId,
      title: insertLoreEntry.title,
      content: insertLoreEntry.content ?? null,
      importance: insertLoreEntry.importance ?? null,
      category: insertLoreEntry.category ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.loreEntries.set(id, loreEntry);
    return loreEntry;
  }

  async updateLoreEntry(id: number, insertLoreEntry: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined> {
    const existing = this.loreEntries.get(id);
    if (!existing) return undefined;
    
    const updated: LoreEntry = {
      ...existing,
      ...insertLoreEntry,
      updatedAt: new Date()
    };
    this.loreEntries.set(id, updated);
    return updated;
  }

  async deleteLoreEntry(id: number): Promise<boolean> {
    return this.loreEntries.delete(id);
  }

  // Notes
  async getNotes(projectId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(n => n.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const note: Note = {
      id,
      projectId: insertNote.projectId,
      title: insertNote.title,
      content: insertNote.content,
      category: insertNote.category ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, insertNote: Partial<InsertNote>): Promise<Note | undefined> {
    const existing = this.notes.get(id);
    if (!existing) return undefined;
    
    const updated: Note = {
      ...existing,
      ...insertNote,
      updatedAt: new Date()
    };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Relationships
  async getRelationships(projectId: number): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter(r => r.projectId === projectId);
  }

  async getRelationshipsForElement(projectId: number, elementType: string, elementId: number): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter(r => 
      r.projectId === projectId && 
      ((r.sourceType === elementType && r.sourceId === elementId) ||
       (r.targetType === elementType && r.targetId === elementId))
    );
  }

  async createRelationship(insertRelationship: InsertRelationship): Promise<Relationship> {
    const id = this.currentId++;
    const relationship: Relationship = {
      id,
      projectId: insertRelationship.projectId,
      sourceType: insertRelationship.sourceType,
      sourceId: insertRelationship.sourceId,
      targetType: insertRelationship.targetType,
      targetId: insertRelationship.targetId,
      relationshipType: insertRelationship.relationshipType,
      description: insertRelationship.description ?? null,
      strength: insertRelationship.strength ?? null,
      createdAt: new Date()
    };
    this.relationships.set(id, relationship);
    return relationship;
  }

  async updateRelationship(id: number, insertRelationship: Partial<InsertRelationship>): Promise<Relationship | undefined> {
    const existing = this.relationships.get(id);
    if (!existing) return undefined;
    
    const updated: Relationship = {
      ...existing,
      ...insertRelationship
    };
    this.relationships.set(id, updated);
    return updated;
  }

  async deleteRelationship(id: number): Promise<boolean> {
    return this.relationships.delete(id);
  }

  // Search
  async searchElements(projectId: number, query: string): Promise<any[]> {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    // Search characters
    const characters = await this.getCharacters(projectId);
    characters.forEach(char => {
      if (char.name.toLowerCase().includes(lowerQuery) || 
          char.role?.toLowerCase().includes(lowerQuery) ||
          char.description?.toLowerCase().includes(lowerQuery)) {
        results.push({ ...char, type: 'character' });
      }
    });

    // Search locations
    const locations = await this.getLocations(projectId);
    locations.forEach(loc => {
      if (loc.name.toLowerCase().includes(lowerQuery) || 
          loc.type?.toLowerCase().includes(lowerQuery) ||
          loc.description?.toLowerCase().includes(lowerQuery)) {
        results.push({ ...loc, type: 'location' });
      }
    });

    // Search events
    const events = await this.getEvents(projectId);
    events.forEach(event => {
      if (event.title.toLowerCase().includes(lowerQuery) || 
          event.description?.toLowerCase().includes(lowerQuery)) {
        results.push({ ...event, type: 'event' });
      }
    });

    // Search magic systems
    const magicSystems = await this.getMagicSystems(projectId);
    magicSystems.forEach(magic => {
      if (magic.name.toLowerCase().includes(lowerQuery) || 
          magic.description?.toLowerCase().includes(lowerQuery)) {
        results.push({ ...magic, type: 'magicSystem' });
      }
    });

    // Search lore entries
    const loreEntries = await this.getLoreEntries(projectId);
    loreEntries.forEach(lore => {
      if (lore.title.toLowerCase().includes(lowerQuery) || 
          lore.content?.toLowerCase().includes(lowerQuery)) {
        results.push({ ...lore, type: 'lore' });
      }
    });

    // Search notes
    const notes = await this.getNotes(projectId);
    notes.forEach(note => {
      if (note.content.toLowerCase().includes(lowerQuery)) {
        results.push({ ...note, type: 'note' });
      }
    });

    return results;
  }

  // Character Spells
  async getCharacterSpells(characterId: number): Promise<(Spell & { proficiency?: string })[]> {
    const characterSpellsData = Array.from(this.characterSpells.values())
      .filter(cs => cs.characterId === characterId);
    
    const results: (Spell & { proficiency?: string })[] = [];
    for (const cs of characterSpellsData) {
      const spell = this.spells.get(cs.spellId);
      if (spell) {
        results.push({
          ...spell,
          proficiency: cs.proficiency || 'novice'
        });
      }
    }
    
    return results;
  }

  async addCharacterSpell(characterSpell: InsertCharacterSpell): Promise<CharacterSpell> {
    const id = this.currentId++;
    const newCharacterSpell: CharacterSpell = {
      id,
      characterId: characterSpell.characterId,
      spellId: characterSpell.spellId,
      proficiency: characterSpell.proficiency || 'novice',
      createdAt: new Date()
    };
    this.characterSpells.set(id, newCharacterSpell);
    return newCharacterSpell;
  }

  async removeCharacterSpell(characterId: number, spellId: number): Promise<boolean> {
    const toDelete = Array.from(this.characterSpells.entries())
      .find(([_, cs]) => cs.characterId === characterId && cs.spellId === spellId);
    
    if (toDelete) {
      this.characterSpells.delete(toDelete[0]);
      return true;
    }
    return false;
  }

  // Races
  async getRaces(projectId: number): Promise<Race[]> {
    return Array.from(this.races.values()).filter(r => r.projectId === projectId);
  }

  async getRace(id: number): Promise<Race | undefined> {
    return this.races.get(id);
  }

  async createRace(insertRace: InsertRace): Promise<Race> {
    const id = this.currentId++;
    const race: Race = {
      id,
      projectId: insertRace.projectId,
      name: insertRace.name,
      description: insertRace.description ?? null,
      biology: insertRace.biology ?? null,
      culture: insertRace.culture ?? null,
      language: insertRace.language ?? null,
      homelandId: insertRace.homelandId ?? null,
      traits: insertRace.traits ?? null,
      lifespan: insertRace.lifespan ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.races.set(id, race);
    return race;
  }

  async updateRace(id: number, insertRace: Partial<InsertRace>): Promise<Race | undefined> {
    const existing = this.races.get(id);
    if (!existing) return undefined;
    
    const updated: Race = {
      ...existing,
      ...insertRace,
      updatedAt: new Date()
    };
    this.races.set(id, updated);
    return updated;
  }

  async deleteRace(id: number): Promise<boolean> {
    return this.races.delete(id);
  }

  // Stats
  async getProjectStats(projectId: number): Promise<{
    characters: number;
    locations: number;
    events: number;
    magicSystems: number;
    loreEntries: number;
    notes: number;
  }> {
    const characters = await this.getCharacters(projectId);
    const locations = await this.getLocations(projectId);
    const events = await this.getEvents(projectId);
    const magicSystems = await this.getMagicSystems(projectId);
    const loreEntries = await this.getLoreEntries(projectId);
    const notes = await this.getNotes(projectId);

    return {
      characters: characters.length,
      locations: locations.length,
      events: events.length,
      magicSystems: magicSystems.length,
      loreEntries: loreEntries.length,
      notes: notes.length
    };
  }
}

export const storage = new MemStorage();
