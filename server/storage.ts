import { 
  projects, characters, locations, events, magicSystems, loreEntries, notes, relationships,
  type Project, type InsertProject,
  type Character, type InsertCharacter,
  type Location, type InsertLocation,
  type Event, type InsertEvent,
  type MagicSystem, type InsertMagicSystem,
  type LoreEntry, type InsertLoreEntry,
  type Note, type InsertNote,
  type Relationship, type InsertRelationship
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
  private loreEntries: Map<number, LoreEntry>;
  private notes: Map<number, Note>;
  private relationships: Map<number, Relationship>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.characters = new Map();
    this.locations = new Map();
    this.events = new Map();
    this.magicSystems = new Map();
    this.loreEntries = new Map();
    this.notes = new Map();
    this.relationships = new Map();
    this.currentId = 10;

    // Create a default project
    const defaultProject: Project = {
      id: 1,
      name: "The Chronicles of Aethermoor",
      description: "A fantasy epic spanning multiple realms",
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
        type: "protagonist",
        description: "A young mage discovering her true power",
        appearance: "Auburn hair, green eyes, tall and graceful",
        personality: "Determined, curious, brave but sometimes reckless",
        background: "Orphaned at young age, raised by village elders",
        age: "19",
        race: "Human",
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
        type: "ally",
        description: "Ancient mage and mentor to Aria",
        appearance: "Long white beard, piercing blue eyes, weathered face",
        personality: "Wise, patient, mysterious",
        background: "Guardian of ancient secrets for centuries",
        age: "150",
        race: "Elf",
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
        type: "villain",
        description: "Dark sorcerer seeking to corrupt the realm",
        appearance: "Tall, gaunt, always in dark robes",
        personality: "Cunning, ruthless, charismatic",
        background: "Former student turned to dark magic",
        age: "45",
        race: "Human",
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
        description: "A peaceful village nestled in the mountains",
        size: "small",
        population: "200",
        government: "Elder Council",
        economy: "Farming and mining",
        culture: "Traditional mountain folk",
        geography: "Mountainous region with streams",
        climate: "Temperate, cold winters",
        parentLocationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        projectId: 1,
        name: "The Ancient Grove",
        type: "natural",
        description: "A mystical forest where ancient magic lingers",
        size: "large",
        population: "0",
        government: "None",
        economy: "None",
        culture: "Sacred to druids",
        geography: "Dense old-growth forest",
        climate: "Mild and misty",
        parentLocationId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        projectId: 1,
        name: "Shadowspire Tower",
        type: "fortress",
        description: "Dark tower serving as Malachar's stronghold",
        size: "medium",
        population: "50",
        government: "Dictatorship",
        economy: "Raiding and dark magic",
        culture: "Cult of shadow",
        geography: "Isolated mountain peak",
        climate: "Perpetually stormy",
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
    this.currentId = 20;
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
      role: insertCharacter.role ?? null,
      description: insertCharacter.description ?? null,
      appearance: insertCharacter.appearance ?? null,
      personality: insertCharacter.personality ?? null,
      background: insertCharacter.background ?? null,
      goals: insertCharacter.goals ?? null,
      status: insertCharacter.status ?? null,
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
      content: insertNote.content,
      category: insertNote.category ?? null,
      color: insertNote.color ?? null,
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
