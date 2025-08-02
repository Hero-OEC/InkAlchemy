import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import { 
  projects, characters, locations, events, magicSystems, spells, loreEntries, notes, relationships, characterSpells, eventCharacters, races,
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
  type EventCharacter, type InsertEventCharacter,
  type Race, type InsertRace
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      // Delete all project-related data in the correct order (respecting foreign key constraints)
      
      // 1. Get all characters for this project first
      const projectCharacters = await db.select({ id: characters.id }).from(characters).where(eq(characters.projectId, id));
      const characterIds = projectCharacters.map(c => c.id);
      
      // Get all events for this project  
      const projectEvents = await db.select({ id: events.id }).from(events).where(eq(events.projectId, id));
      const eventIds = projectEvents.map(e => e.id);
      
      // 2. Delete junction table records that reference characters/events
      if (characterIds.length > 0) {
        await db.delete(characterSpells).where(inArray(characterSpells.characterId, characterIds));
      }
      
      if (eventIds.length > 0) {
        await db.delete(eventCharacters).where(inArray(eventCharacters.eventId, eventIds));
      }
      
      // 3. Delete all main entities that reference the project
      await db.delete(spells).where(eq(spells.projectId, id));
      await db.delete(relationships).where(eq(relationships.projectId, id));
      await db.delete(characters).where(eq(characters.projectId, id));
      await db.delete(events).where(eq(events.projectId, id));
      await db.delete(magicSystems).where(eq(magicSystems.projectId, id));
      await db.delete(locations).where(eq(locations.projectId, id));
      await db.delete(loreEntries).where(eq(loreEntries.projectId, id));
      await db.delete(notes).where(eq(notes.projectId, id));
      await db.delete(races).where(eq(races.projectId, id));
      
      // 4. Finally delete the project itself
      const result = await db.delete(projects).where(eq(projects.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting project and related data:', error);
      throw error;
    }
  }

  // Characters
  async getCharacters(projectId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.projectId, projectId));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const result = await db.select().from(characters).where(eq(characters.id, id));
    return result[0];
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const result = await db.insert(characters).values(character).returning();
    return result[0];
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const result = await db.update(characters)
      .set({ ...character, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
    return result[0];
  }

  async deleteCharacter(id: number): Promise<boolean> {
    try {
      // Delete all references to this character first
      await db.delete(characterSpells).where(eq(characterSpells.characterId, id));
      await db.delete(eventCharacters).where(eq(eventCharacters.characterId, id));
      await db.delete(relationships).where(
        and(
          eq(relationships.sourceType, 'character'),
          eq(relationships.sourceId, id)
        )
      );
      await db.delete(relationships).where(
        and(
          eq(relationships.targetType, 'character'),
          eq(relationships.targetId, id)
        )
      );
      
      // Now delete the character itself
      const result = await db.delete(characters).where(eq(characters.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }

  // Locations
  async getLocations(projectId: number): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.projectId, projectId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db.update(locations)
      .set({ ...location, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return result[0];
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id)).returning();
    return result.length > 0;
  }

  // Events
  async getEvents(projectId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.projectId, projectId));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Magic Systems
  async getMagicSystems(projectId: number): Promise<MagicSystem[]> {
    return await db.select().from(magicSystems).where(eq(magicSystems.projectId, projectId));
  }

  async getMagicSystem(id: number): Promise<MagicSystem | undefined> {
    const result = await db.select().from(magicSystems).where(eq(magicSystems.id, id));
    return result[0];
  }

  async createMagicSystem(magicSystem: InsertMagicSystem): Promise<MagicSystem> {
    const result = await db.insert(magicSystems).values(magicSystem).returning();
    return result[0];
  }

  async updateMagicSystem(id: number, magicSystem: Partial<InsertMagicSystem>): Promise<MagicSystem | undefined> {
    const result = await db.update(magicSystems)
      .set({ ...magicSystem, updatedAt: new Date() })
      .where(eq(magicSystems.id, id))
      .returning();
    return result[0];
  }

  async deleteMagicSystem(id: number): Promise<boolean> {
    // First get all spell IDs associated with this magic system
    const associatedSpells = await db.select({ id: spells.id }).from(spells).where(eq(spells.magicSystemId, id));
    const spellIds = associatedSpells.map(spell => spell.id);
    
    // Delete all character-spell relationships for these spells
    if (spellIds.length > 0) {
      await db.delete(characterSpells).where(inArray(characterSpells.spellId, spellIds));
    }
    
    // Delete all spells associated with this magic system
    await db.delete(spells).where(eq(spells.magicSystemId, id));
    
    // Then delete the magic system itself
    const result = await db.delete(magicSystems).where(eq(magicSystems.id, id)).returning();
    return result.length > 0;
  }

  // Spells
  async getSpells(magicSystemId: number): Promise<Spell[]> {
    return await db.select().from(spells).where(eq(spells.magicSystemId, magicSystemId));
  }

  async getAllSpellsForProject(projectId: number): Promise<Spell[]> {
    return await db.select().from(spells).where(eq(spells.projectId, projectId));
  }

  async getSpell(id: number): Promise<Spell | undefined> {
    const result = await db.select().from(spells).where(eq(spells.id, id));
    return result[0];
  }

  async createSpell(spell: InsertSpell): Promise<Spell> {
    const result = await db.insert(spells).values(spell).returning();
    return result[0];
  }

  async updateSpell(id: number, spell: Partial<InsertSpell>): Promise<Spell | undefined> {
    const result = await db.update(spells)
      .set({ ...spell, updatedAt: new Date() })
      .where(eq(spells.id, id))
      .returning();
    return result[0];
  }

  async deleteSpell(id: number): Promise<boolean> {
    const result = await db.delete(spells).where(eq(spells.id, id)).returning();
    return result.length > 0;
  }

  // Character Spells
  async getCharacterSpells(characterId: number): Promise<(Spell & { proficiency?: string })[]> {
    const result = await db
      .select({
        id: spells.id,
        projectId: spells.projectId,
        magicSystemId: spells.magicSystemId,
        name: spells.name,
        level: spells.level,
        description: spells.description,
        createdAt: spells.createdAt,
        updatedAt: spells.updatedAt,
        proficiency: characterSpells.proficiency,
      })
      .from(characterSpells)
      .innerJoin(spells, eq(characterSpells.spellId, spells.id))
      .where(eq(characterSpells.characterId, characterId));
    
    return result;
  }

  async addCharacterSpell(characterSpell: InsertCharacterSpell): Promise<CharacterSpell> {
    const result = await db.insert(characterSpells).values(characterSpell).returning();
    return result[0];
  }

  async removeCharacterSpell(characterId: number, spellId: number): Promise<boolean> {
    const result = await db.delete(characterSpells)
      .where(and(
        eq(characterSpells.characterId, characterId),
        eq(characterSpells.spellId, spellId)
      ))
      .returning();
    return result.length > 0;
  }

  async getSpellCharacters(spellId: number): Promise<(Character & { proficiency?: string })[]> {
    const result = await db
      .select({
        id: characters.id,
        projectId: characters.projectId,
        name: characters.name,
        prefix: characters.prefix,
        suffix: characters.suffix,
        role: characters.role,
        description: characters.description,
        age: characters.age,
        raceId: characters.raceId,
        magicSystemId: characters.magicSystemId,
        imageUrl: characters.imageUrl,
        createdAt: characters.createdAt,
        updatedAt: characters.updatedAt,
        proficiency: characterSpells.proficiency,
      })
      .from(characterSpells)
      .innerJoin(characters, eq(characterSpells.characterId, characters.id))
      .where(eq(characterSpells.spellId, spellId));
    
    return result;
  }

  async getMagicSystemCharacters(magicSystemId: number): Promise<Character[]> {
    // Get characters in two ways:
    // 1. Characters directly assigned to this magic system
    const directAssigned = await db
      .select()
      .from(characters)
      .where(eq(characters.magicSystemId, magicSystemId));
    
    // 2. Characters who have spells from this magic system
    const throughSpells = await db
      .select({
        id: characters.id,
        projectId: characters.projectId,
        name: characters.name,
        prefix: characters.prefix,
        suffix: characters.suffix,
        role: characters.role,
        description: characters.description,
        age: characters.age,
        raceId: characters.raceId,
        magicSystemId: characters.magicSystemId,
        imageUrl: characters.imageUrl,
        createdAt: characters.createdAt,
        updatedAt: characters.updatedAt,
      })
      .from(characterSpells)
      .innerJoin(spells, eq(characterSpells.spellId, spells.id))
      .innerJoin(characters, eq(characterSpells.characterId, characters.id))
      .where(eq(spells.magicSystemId, magicSystemId));
    
    // Combine and deduplicate by character ID
    const allCharacters = [...directAssigned, ...throughSpells];
    const uniqueCharacters = allCharacters.filter((char, index, arr) => 
      arr.findIndex(c => c.id === char.id) === index
    );
    
    return uniqueCharacters;
  }

  // Event Characters
  async getEventCharacters(eventId: number): Promise<(Character & { role?: string })[]> {
    const result = await db
      .select({
        id: characters.id,
        projectId: characters.projectId,
        name: characters.name,
        prefix: characters.prefix,
        suffix: characters.suffix,
        role: eventCharacters.role,
        description: characters.description,
        age: characters.age,
        raceId: characters.raceId,
        magicSystemId: characters.magicSystemId,
        imageUrl: characters.imageUrl,
        createdAt: characters.createdAt,
        updatedAt: characters.updatedAt,
      })
      .from(eventCharacters)
      .innerJoin(characters, eq(eventCharacters.characterId, characters.id))
      .where(eq(eventCharacters.eventId, eventId));
    
    return result;
  }

  async addEventCharacter(eventCharacter: InsertEventCharacter): Promise<EventCharacter> {
    const result = await db.insert(eventCharacters).values(eventCharacter).returning();
    return result[0];
  }

  async removeEventCharacter(eventId: number, characterId: number): Promise<boolean> {
    const result = await db.delete(eventCharacters)
      .where(and(
        eq(eventCharacters.eventId, eventId),
        eq(eventCharacters.characterId, characterId)
      ))
      .returning();
    return result.length > 0;
  }

  // Lore Entries
  async getLoreEntries(projectId: number): Promise<LoreEntry[]> {
    return await db.select().from(loreEntries).where(eq(loreEntries.projectId, projectId));
  }

  async getLoreEntry(id: number): Promise<LoreEntry | undefined> {
    const result = await db.select().from(loreEntries).where(eq(loreEntries.id, id));
    return result[0];
  }

  async createLoreEntry(loreEntry: InsertLoreEntry): Promise<LoreEntry> {
    const result = await db.insert(loreEntries).values(loreEntry).returning();
    return result[0];
  }

  async updateLoreEntry(id: number, loreEntry: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined> {
    const result = await db.update(loreEntries)
      .set({ ...loreEntry, updatedAt: new Date() })
      .where(eq(loreEntries.id, id))
      .returning();
    return result[0];
  }

  async deleteLoreEntry(id: number): Promise<boolean> {
    const result = await db.delete(loreEntries).where(eq(loreEntries.id, id)).returning();
    return result.length > 0;
  }

  // Notes
  async getNotes(projectId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.projectId, projectId));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const result = await db.select().from(notes).where(eq(notes.id, id));
    return result[0];
  }

  async createNote(note: InsertNote): Promise<Note> {
    const result = await db.insert(notes).values(note).returning();
    return result[0];
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const result = await db.update(notes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return result[0];
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id)).returning();
    return result.length > 0;
  }

  // Races
  async getRaces(projectId: number): Promise<Race[]> {
    return await db.select().from(races).where(eq(races.projectId, projectId));
  }

  async getRace(id: number): Promise<Race | undefined> {
    const result = await db.select().from(races).where(eq(races.id, id));
    return result[0];
  }

  async createRace(race: InsertRace): Promise<Race> {
    const result = await db.insert(races).values(race).returning();
    return result[0];
  }

  async updateRace(id: number, race: Partial<InsertRace>): Promise<Race | undefined> {
    const result = await db.update(races)
      .set({ ...race, updatedAt: new Date() })
      .where(eq(races.id, id))
      .returning();
    return result[0];
  }

  async deleteRace(id: number): Promise<boolean> {
    const result = await db.delete(races).where(eq(races.id, id)).returning();
    return result.length > 0;
  }

  async getCharactersByRace(raceId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.raceId, raceId));
  }

  // Relationships
  async getRelationships(projectId: number): Promise<Relationship[]> {
    return await db.select().from(relationships).where(eq(relationships.projectId, projectId));
  }

  async getRelationshipsForElement(projectId: number, elementType: string, elementId: number): Promise<Relationship[]> {
    return await db.select().from(relationships).where(
      and(
        eq(relationships.projectId, projectId),
        eq(relationships.sourceType, elementType),
        eq(relationships.sourceId, elementId)
      )
    );
  }

  async createRelationship(relationship: InsertRelationship): Promise<Relationship> {
    const result = await db.insert(relationships).values(relationship).returning();
    return result[0];
  }

  async updateRelationship(id: number, relationship: Partial<InsertRelationship>): Promise<Relationship | undefined> {
    const result = await db.update(relationships)
      .set(relationship)
      .where(eq(relationships.id, id))
      .returning();
    return result[0];
  }

  async deleteRelationship(id: number): Promise<boolean> {
    const result = await db.delete(relationships).where(eq(relationships.id, id)).returning();
    return result.length > 0;
  }

  // Search
  async searchElements(projectId: number, query: string): Promise<any[]> {
    // Simple search implementation - in a real app you might want full-text search
    const lowerQuery = query.toLowerCase();
    
    const [characterResults, locationResults, eventResults] = await Promise.all([
      db.select().from(characters).where(eq(characters.projectId, projectId)),
      db.select().from(locations).where(eq(locations.projectId, projectId)),
      db.select().from(events).where(eq(events.projectId, projectId))
    ]);

    const results = [];
    
    characterResults.forEach(char => {
      if (char.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'character', ...char });
      }
    });
    
    locationResults.forEach(loc => {
      if (loc.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'location', ...loc });
      }
    });
    
    eventResults.forEach(event => {
      if (event.title.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'event', ...event });
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
    const [
      charactersResult,
      locationsResult,
      eventsResult,
      magicSystemsResult,
      loreEntriesResult,
      notesResult
    ] = await Promise.all([
      db.select().from(characters).where(eq(characters.projectId, projectId)),
      db.select().from(locations).where(eq(locations.projectId, projectId)),
      db.select().from(events).where(eq(events.projectId, projectId)),
      db.select().from(magicSystems).where(eq(magicSystems.projectId, projectId)),
      db.select().from(loreEntries).where(eq(loreEntries.projectId, projectId)),
      db.select().from(notes).where(eq(notes.projectId, projectId))
    ]);

    return {
      characters: charactersResult.length,
      locations: locationsResult.length,
      events: eventsResult.length,
      magicSystems: magicSystemsResult.length,
      loreEntries: loreEntriesResult.length,
      notes: notesResult.length
    };
  }

  // User data cleanup - cascade delete all user data
  async deleteAllUserData(userId: string): Promise<boolean> {
    try {
      console.log(`Starting cascade deletion for user: ${userId}`);
      
      // Get all projects for this user
      const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));
      console.log(`Found ${userProjects.length} projects to delete for user ${userId}`);
      
      // Delete each project and all its associated data
      for (const project of userProjects) {
        console.log(`Deleting project ${project.id}: ${project.name}`);
        await this.deleteProject(project.id);
      }
      
      console.log(`Successfully deleted all data for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user data for ${userId}:`, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();