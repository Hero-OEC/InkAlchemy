import { SupabaseClient } from '@supabase/supabase-js';
import type { IStorage } from "./storage";
import type { 
  Project, InsertProject,
  Character, InsertCharacter,
  Location, InsertLocation,
  Event, InsertEvent,
  MagicSystem, InsertMagicSystem,
  Spell, InsertSpell,
  LoreEntry, InsertLoreEntry,
  Note, InsertNote,
  Relationship, InsertRelationship,
  CharacterSpell, InsertCharacterSpell,
  EventCharacter, InsertEventCharacter,
  Race, InsertRace,
  Activity
} from "@shared/schema";
import "./env";

export class SupabaseStorage implements IStorage {
  constructor(private supabase: SupabaseClient) {}

  // Projects
  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProject(id: number): Promise<Project | undefined> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ ...project, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      console.log(`Starting deletion of project ${id} and all related data`);
      
      // Get all related IDs first
      const { data: projectCharacters } = await this.supabase
        .from('characters')
        .select('id')
        .eq('project_id', id);
      const characterIds = projectCharacters?.map(c => c.id) || [];
      
      const { data: projectEvents } = await this.supabase
        .from('events')
        .select('id')
        .eq('project_id', id);
      const eventIds = projectEvents?.map(e => e.id) || [];
      
      // Delete junction table records first
      if (characterIds.length > 0) {
        await this.supabase
          .from('character_spells')
          .delete()
          .in('character_id', characterIds);
        
        await this.supabase
          .from('character_magic_systems')
          .delete()
          .in('character_id', characterIds);
      }
      
      if (eventIds.length > 0) {
        await this.supabase
          .from('event_characters')
          .delete()
          .in('event_id', eventIds);
      }
      
      // Delete activities
      await this.supabase
        .from('activities')
        .delete()
        .eq('project_id', id);
      
      // Delete main entities
      await this.supabase.from('spells').delete().eq('project_id', id);
      await this.supabase.from('relationships').delete().eq('project_id', id);
      await this.supabase.from('characters').delete().eq('project_id', id);
      await this.supabase.from('events').delete().eq('project_id', id);
      await this.supabase.from('magic_systems').delete().eq('project_id', id);
      await this.supabase.from('locations').delete().eq('project_id', id);
      await this.supabase.from('lore_entries').delete().eq('project_id', id);
      await this.supabase.from('notes').delete().eq('project_id', id);
      await this.supabase.from('races').delete().eq('project_id', id);
      
      // Finally delete the project
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log(`Project ${id} deletion complete`);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Characters
  async getCharacters(projectId: number): Promise<Character[]> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const { data, error } = await this.supabase
      .from('characters')
      .insert(character)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const { data, error } = await this.supabase
      .from('characters')
      .update({ ...character, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    try {
      // Delete all references first
      await this.supabase.from('character_spells').delete().eq('character_id', id);
      await this.supabase.from('event_characters').delete().eq('character_id', id);
      await this.supabase.from('relationships').delete().eq('source_type', 'character').eq('source_id', id);
      await this.supabase.from('relationships').delete().eq('target_type', 'character').eq('target_id', id);
      
      const { error } = await this.supabase
        .from('characters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }

  // Locations
  async getLocations(projectId: number): Promise<Location[]> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const { data, error } = await this.supabase
      .from('locations')
      .insert(location)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const { data, error } = await this.supabase
      .from('locations')
      .update({ ...location, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Events
  async getEvents(projectId: number): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('project_id', projectId)
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .order('day', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const { data, error } = await this.supabase
      .from('events')
      .update({ ...event, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getEventsByLocation(locationId: number): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('location_id', locationId);
    
    if (error) throw error;
    return data || [];
  }

  // Magic Systems
  async getMagicSystems(projectId: number): Promise<MagicSystem[]> {
    const { data, error } = await this.supabase
      .from('magic_systems')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getMagicSystem(id: number): Promise<MagicSystem | undefined> {
    const { data, error } = await this.supabase
      .from('magic_systems')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createMagicSystem(magicSystem: InsertMagicSystem): Promise<MagicSystem> {
    const { data, error } = await this.supabase
      .from('magic_systems')
      .insert(magicSystem)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateMagicSystem(id: number, magicSystem: Partial<InsertMagicSystem>): Promise<MagicSystem | undefined> {
    const { data, error } = await this.supabase
      .from('magic_systems')
      .update({ ...magicSystem, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteMagicSystem(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('magic_systems')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Spells
  async getSpells(magicSystemId: number): Promise<Spell[]> {
    const { data, error } = await this.supabase
      .from('spells')
      .select('*')
      .eq('magic_system_id', magicSystemId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getAllSpellsForProject(projectId: number): Promise<Spell[]> {
    const { data, error } = await this.supabase
      .from('spells')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getSpell(id: number): Promise<Spell | undefined> {
    const { data, error } = await this.supabase
      .from('spells')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createSpell(spell: InsertSpell): Promise<Spell> {
    const { data, error } = await this.supabase
      .from('spells')
      .insert(spell)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSpell(id: number, spell: Partial<InsertSpell>): Promise<Spell | undefined> {
    const { data, error } = await this.supabase
      .from('spells')
      .update({ ...spell, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteSpell(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('spells')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Character Spells
  async getCharacterSpells(characterId: number): Promise<(Spell & { proficiency?: string })[]> {
    const { data, error } = await this.supabase
      .from('character_spells')
      .select(`
        proficiency,
        spells (*)
      `)
      .eq('character_id', characterId);
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...(item.spells as Spell),
      proficiency: item.proficiency
    }));
  }

  async addCharacterSpell(characterSpell: InsertCharacterSpell): Promise<CharacterSpell> {
    const { data, error } = await this.supabase
      .from('character_spells')
      .insert(characterSpell)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async removeCharacterSpell(characterId: number, spellId: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('character_spells')
      .delete()
      .eq('character_id', characterId)
      .eq('spell_id', spellId);
    
    if (error) throw error;
    return true;
  }

  async getSpellCharacters(spellId: number): Promise<(Character & { proficiency?: string })[]> {
    const { data, error } = await this.supabase
      .from('character_spells')
      .select(`
        proficiency,
        characters (*)
      `)
      .eq('spell_id', spellId);
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...(item.characters as Character),
      proficiency: item.proficiency
    }));
  }

  async getMagicSystemCharacters(magicSystemId: number): Promise<Character[]> {
    const { data, error } = await this.supabase
      .from('character_magic_systems')
      .select('characters (*)')
      .eq('magic_system_id', magicSystemId);
    
    if (error) throw error;
    return (data || []).map((item: any) => item.characters as Character);
  }

  // Event Characters
  async getEventCharacters(eventId: number): Promise<(Character & { role?: string })[]> {
    const { data, error } = await this.supabase
      .from('event_characters')
      .select(`
        role,
        characters (*)
      `)
      .eq('event_id', eventId);
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...(item.characters as Character),
      role: item.role
    }));
  }

  async addEventCharacter(eventCharacter: InsertEventCharacter): Promise<EventCharacter> {
    const { data, error } = await this.supabase
      .from('event_characters')
      .insert(eventCharacter)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async removeEventCharacter(eventId: number, characterId: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('event_characters')
      .delete()
      .eq('event_id', eventId)
      .eq('character_id', characterId);
    
    if (error) throw error;
    return true;
  }

  // Lore Entries
  async getLoreEntries(projectId: number): Promise<LoreEntry[]> {
    const { data, error } = await this.supabase
      .from('lore_entries')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getLoreEntry(id: number): Promise<LoreEntry | undefined> {
    const { data, error } = await this.supabase
      .from('lore_entries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createLoreEntry(loreEntry: InsertLoreEntry): Promise<LoreEntry> {
    const { data, error } = await this.supabase
      .from('lore_entries')
      .insert(loreEntry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateLoreEntry(id: number, loreEntry: Partial<InsertLoreEntry>): Promise<LoreEntry | undefined> {
    const { data, error } = await this.supabase
      .from('lore_entries')
      .update({ ...loreEntry, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteLoreEntry(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('lore_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Notes
  async getNotes(projectId: number): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getNote(id: number): Promise<Note | undefined> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const { data, error } = await this.supabase
      .from('notes')
      .insert(note)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const { data, error } = await this.supabase
      .from('notes')
      .update({ ...note, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Races
  async getRaces(projectId: number): Promise<Race[]> {
    const { data, error } = await this.supabase
      .from('races')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getRace(id: number): Promise<Race | undefined> {
    const { data, error } = await this.supabase
      .from('races')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createRace(race: InsertRace): Promise<Race> {
    const { data, error } = await this.supabase
      .from('races')
      .insert(race)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateRace(id: number, race: Partial<InsertRace>): Promise<Race | undefined> {
    const { data, error } = await this.supabase
      .from('races')
      .update({ ...race, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteRace(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('races')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Relationships
  async getRelationships(projectId: number): Promise<Relationship[]> {
    const { data, error } = await this.supabase
      .from('relationships')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data || [];
  }

  async getRelationship(id: number): Promise<Relationship | null> {
    const { data, error } = await this.supabase
      .from('relationships')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async getRelationshipsForElement(projectId: number, elementType: string, elementId: number): Promise<Relationship[]> {
    const { data, error } = await this.supabase
      .from('relationships')
      .select('*')
      .eq('project_id', projectId)
      .or(`from_element_type.eq.${elementType},to_element_type.eq.${elementType}`)
      .or(`from_element_id.eq.${elementId},to_element_id.eq.${elementId}`);
    
    if (error) throw error;
    return data || [];
  }

  async createRelationship(relationship: InsertRelationship): Promise<Relationship> {
    const { data, error } = await this.supabase
      .from('relationships')
      .insert(relationship)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateRelationship(id: number, relationship: Partial<InsertRelationship>): Promise<Relationship | undefined> {
    const { data, error } = await this.supabase
      .from('relationships')
      .update({ ...relationship, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async deleteRelationship(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('relationships')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Search
  async searchElements(projectId: number, query: string): Promise<any[]> {
    const searchTerm = `%${query}%`;
    const results: any[] = [];

    // Search characters
    const { data: characters } = await this.supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    
    if (characters) {
      results.push(...characters.map(c => ({ ...c, type: 'character' })));
    }

    // Search locations
    const { data: locations } = await this.supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .or(`name.ilike.${searchTerm},content.ilike.${searchTerm}`);
    
    if (locations) {
      results.push(...locations.map(l => ({ ...l, type: 'location' })));
    }

    // Search events
    const { data: events } = await this.supabase
      .from('events')
      .select('*')
      .eq('project_id', projectId)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
    
    if (events) {
      results.push(...events.map(e => ({ ...e, type: 'event' })));
    }

    // Search lore entries
    const { data: lore } = await this.supabase
      .from('lore_entries')
      .select('*')
      .eq('project_id', projectId)
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
    
    if (lore) {
      results.push(...lore.map(l => ({ ...l, type: 'lore' })));
    }

    // Search notes
    const { data: notes } = await this.supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
    
    if (notes) {
      results.push(...notes.map(n => ({ ...n, type: 'note' })));
    }

    return results;
  }

  // Activities
  async getProjectActivities(projectId: number): Promise<Activity[]> {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
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
      { count: characters },
      { count: locations },
      { count: events },
      { count: magicSystems },
      { count: loreEntries },
      { count: notes }
    ] = await Promise.all([
      this.supabase.from('characters').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.supabase.from('locations').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.supabase.from('events').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.supabase.from('magic_systems').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.supabase.from('lore_entries').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      this.supabase.from('notes').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
    ]);

    return {
      characters: characters || 0,
      locations: locations || 0,
      events: events || 0,
      magicSystems: magicSystems || 0,
      loreEntries: loreEntries || 0,
      notes: notes || 0,
    };
  }

  async deleteAllUserData(userId: string): Promise<void> {
    try {
      console.log(`Starting deletion of all data for user ${userId}`);
      
      // Get all projects for this user
      const { data: userProjects } = await this.supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);
      
      if (userProjects && userProjects.length > 0) {
        // Delete each project (which cascades to all related data)
        for (const project of userProjects) {
          await this.deleteProject(project.id);
        }
      }
      
      console.log(`User ${userId} data deletion complete`);
    } catch (error) {
      console.error(`Error deleting user data for ${userId}:`, error);
      throw error;
    }
  }

  async getCharactersByRace(raceId: number): Promise<Character[]> {
    const { data, error } = await this.supabase
      .from('characters')
      .select('*')
      .eq('race_id', raceId);
    
    if (error) throw error;
    return data || [];
  }
}
