import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import { uploadImage, handleImageUpload, handleImageUploadByUrl } from "./image-upload";
import { optionalAuth, authenticateUser, type AuthenticatedRequest, supabase } from "./auth-middleware";
import { 
  insertProjectSchema, insertCharacterSchema, insertLocationSchema, 
  insertEventSchema, insertMagicSystemSchema, insertSpellSchema, 
  insertLoreEntrySchema, insertNoteSchema, insertRelationshipSchema,
  insertCharacterSpellSchema, insertRaceSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply optional auth to all API routes
  app.use("/api", optionalAuth);

  // Projects
  app.get("/api/projects", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const projects = await storage.getProjects();
      // Filter projects by authenticated user ID
      const userProjects = projects.filter(project => project.userId === req.userId);
      res.json(userProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      // Ensure user can only access their own projects
      if (project.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // Create a schema without userId for validation
      const projectBodySchema = insertProjectSchema.omit({ userId: true });
      const bodyData = projectBodySchema.parse(req.body);
      const projectData = { ...bodyData, userId: req.userId! };
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(400).json({ 
        message: "Invalid project data",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.patch("/api/projects/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      // Ensure user can only update their own projects
      if (project.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const data = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, data);
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      // Ensure user can only delete their own projects
      if (project.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const deleted = await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Characters
  app.get("/api/projects/:projectId/characters", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const characters = await storage.getCharacters(projectId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const data = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(data);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, data);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid character data" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Character Spells
  app.get("/api/characters/:characterId/spells", async (req, res) => {
    try {
      const characterId = parseInt(req.params.characterId);
      const spells = await storage.getCharacterSpells(characterId);
      res.json(spells);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character spells" });
    }
  });

  app.post("/api/characters/:characterId/spells", async (req, res) => {
    try {
      const characterId = parseInt(req.params.characterId);
      const data = insertCharacterSpellSchema.parse({
        ...req.body,
        characterId
      });
      const characterSpell = await storage.addCharacterSpell(data);
      res.status(201).json(characterSpell);
    } catch (error) {
      res.status(400).json({ message: "Invalid character spell data" });
    }
  });

  app.delete("/api/characters/:characterId/spells/:spellId", async (req, res) => {
    try {
      const characterId = parseInt(req.params.characterId);
      const spellId = parseInt(req.params.spellId);
      const deleted = await storage.removeCharacterSpell(characterId, spellId);
      if (!deleted) {
        return res.status(404).json({ message: "Character spell not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove character spell" });
    }
  });

  // Locations
  app.get("/api/projects/:projectId/locations", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const locations = await storage.getLocations(projectId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const data = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(data);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, data);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid location data" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Events
  app.get("/api/projects/:projectId/events", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const events = await storage.getEvents(projectId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, data);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Magic Systems
  app.get("/api/projects/:projectId/magic-systems", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const magicSystems = await storage.getMagicSystems(projectId);
      res.json(magicSystems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch magic systems" });
    }
  });

  app.get("/api/magic-systems/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const magicSystem = await storage.getMagicSystem(id);
      if (!magicSystem) {
        return res.status(404).json({ message: "Magic system not found" });
      }
      res.json(magicSystem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch magic system" });
    }
  });

  app.post("/api/magic-systems", async (req, res) => {
    try {
      const data = insertMagicSystemSchema.parse(req.body);
      const magicSystem = await storage.createMagicSystem(data);
      res.status(201).json(magicSystem);
    } catch (error) {
      res.status(400).json({ message: "Invalid magic system data" });
    }
  });

  app.patch("/api/magic-systems/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertMagicSystemSchema.partial().parse(req.body);
      const magicSystem = await storage.updateMagicSystem(id, data);
      if (!magicSystem) {
        return res.status(404).json({ message: "Magic system not found" });
      }
      res.json(magicSystem);
    } catch (error) {
      res.status(400).json({ message: "Invalid magic system data" });
    }
  });

  app.delete("/api/magic-systems/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMagicSystem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Magic system not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete magic system" });
    }
  });

  // Spells
  app.get("/api/projects/:projectId/spells", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const spells = await storage.getAllSpellsForProject(projectId);
      res.json(spells);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spells" });
    }
  });

  app.get("/api/magic-systems/:magicSystemId/spells", async (req, res) => {
    try {
      const magicSystemId = parseInt(req.params.magicSystemId);
      const spells = await storage.getSpells(magicSystemId);
      res.json(spells);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spells" });
    }
  });

  app.get("/api/spells/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spell = await storage.getSpell(id);
      if (!spell) {
        return res.status(404).json({ message: "Spell not found" });
      }
      res.json(spell);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spell" });
    }
  });

  app.post("/api/spells", async (req, res) => {
    try {
      const data = insertSpellSchema.parse(req.body);
      const spell = await storage.createSpell(data);
      res.status(201).json(spell);
    } catch (error) {
      res.status(400).json({ message: "Invalid spell data" });
    }
  });

  app.patch("/api/spells/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSpellSchema.partial().parse(req.body);
      const spell = await storage.updateSpell(id, data);
      if (!spell) {
        return res.status(404).json({ message: "Spell not found" });
      }
      res.json(spell);
    } catch (error) {
      res.status(400).json({ message: "Invalid spell data" });
    }
  });

  app.delete("/api/spells/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSpell(id);
      if (!deleted) {
        return res.status(404).json({ message: "Spell not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete spell" });
    }
  });

  // Get characters that have a specific spell
  app.get("/api/spells/:spellId/characters", async (req, res) => {
    try {
      const spellId = parseInt(req.params.spellId);
      const characters = await storage.getSpellCharacters(spellId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spell characters" });
    }
  });

  // Get all characters that use spells from a magic system
  app.get("/api/magic-systems/:magicSystemId/characters", async (req, res) => {
    try {
      const magicSystemId = parseInt(req.params.magicSystemId);
      const characters = await storage.getMagicSystemCharacters(magicSystemId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch magic system characters" });
    }
  });

  // Lore Entries
  app.get("/api/projects/:projectId/lore", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const loreEntries = await storage.getLoreEntries(projectId);
      res.json(loreEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lore entries" });
    }
  });

  app.get("/api/lore/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loreEntry = await storage.getLoreEntry(id);
      if (!loreEntry) {
        return res.status(404).json({ message: "Lore entry not found" });
      }
      res.json(loreEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lore entry" });
    }
  });

  app.post("/api/lore", async (req, res) => {
    try {
      const data = insertLoreEntrySchema.parse(req.body);
      const loreEntry = await storage.createLoreEntry(data);
      res.status(201).json(loreEntry);
    } catch (error) {
      res.status(400).json({ message: "Invalid lore entry data" });
    }
  });

  app.patch("/api/lore/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertLoreEntrySchema.partial().parse(req.body);
      const loreEntry = await storage.updateLoreEntry(id, data);
      if (!loreEntry) {
        return res.status(404).json({ message: "Lore entry not found" });
      }
      res.json(loreEntry);
    } catch (error) {
      res.status(400).json({ message: "Invalid lore entry data" });
    }
  });

  app.delete("/api/lore/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLoreEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Lore entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lore entry" });
    }
  });

  // Notes
  app.get("/api/projects/:projectId/notes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const notes = await storage.getNotes(projectId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const data = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(data);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, data);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Relationships
  app.get("/api/projects/:projectId/relationships", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const relationships = await storage.getRelationships(projectId);
      res.json(relationships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch relationships" });
    }
  });

  app.post("/api/relationships", async (req, res) => {
    try {
      const data = insertRelationshipSchema.parse(req.body);
      const relationship = await storage.createRelationship(data);
      res.status(201).json(relationship);
    } catch (error) {
      res.status(400).json({ message: "Invalid relationship data" });
    }
  });

  app.delete("/api/relationships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRelationship(id);
      if (!deleted) {
        return res.status(404).json({ message: "Relationship not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete relationship" });
    }
  });

  // Search
  app.get("/api/projects/:projectId/search", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter required" });
      }
      const results = await storage.searchElements(projectId, query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Races
  app.get("/api/projects/:projectId/races", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const races = await storage.getRaces(projectId);
      res.json(races);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch races" });
    }
  });

  app.get("/api/races/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const race = await storage.getRace(id);
      if (!race) {
        return res.status(404).json({ message: "Race not found" });
      }
      res.json(race);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch race" });
    }
  });

  app.post("/api/races", async (req, res) => {
    try {
      const data = insertRaceSchema.parse(req.body);
      const race = await storage.createRace(data);
      res.status(201).json(race);
    } catch (error) {
      res.status(400).json({ message: "Invalid race data" });
    }
  });

  app.patch("/api/races/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertRaceSchema.partial().parse(req.body);
      const race = await storage.updateRace(id, data);
      if (!race) {
        return res.status(404).json({ message: "Race not found" });
      }
      res.json(race);
    } catch (error) {
      res.status(400).json({ message: "Invalid race data" });
    }
  });

  app.delete("/api/races/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRace(id);
      if (!deleted) {
        return res.status(404).json({ message: "Race not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete race" });
    }
  });

  // Stats
  app.get("/api/projects/:projectId/stats", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const stats = await storage.getProjectStats(projectId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project stats" });
    }
  });

  // Simple in-memory storage for profile data (in production, use a database)
  const userProfiles = new Map();

  app.get("/api/user/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
    // Disable caching for profile data to ensure fresh avatar URLs
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
      // Try to get real user data from Supabase first
      let supabaseUser = null;
      if (supabase && req.userId !== '00000000-0000-0000-0000-000000000001') {
        try {
          const { data: { user }, error } = await supabase.auth.admin.getUserById(req.userId!);
          if (!error && user) {
            supabaseUser = user;
          }
        } catch (error) {
          console.error('Failed to fetch Supabase user:', error);
        }
      }

      const storedProfile = userProfiles.get(req.userId!) || {};
      console.log(`Profile fetch for user: ${req.userId}`, storedProfile, supabaseUser ? 'with Supabase data' : 'no Supabase data');
      
      // Try to get avatar URL from Supabase Storage profile-images bucket
      let avatarUrl = storedProfile.avatar_url || null;
      
      if (supabase && !avatarUrl) {
        try {
          // List files in the user's profile-images folder
          const { data: files, error } = await supabase.storage
            .from('profile-images')
            .list(req.userId!, {
              limit: 1,
              sortBy: { column: 'created_at', order: 'desc' }
            });
          
          if (!error && files && files.length > 0) {
            // Get the most recent profile image
            const fileName = `${req.userId}/${files[0].name}`;
            
            // Try to get public URL first
            const { data: publicUrlData } = supabase.storage
              .from('profile-images')
              .getPublicUrl(fileName);
            
            if (publicUrlData.publicUrl) {
              avatarUrl = publicUrlData.publicUrl;
              console.log('Retrieved profile image from Supabase Storage:', avatarUrl);
              
              // Cache the avatar URL for future requests
              userProfiles.set(req.userId!, {
                ...storedProfile,
                avatar_url: avatarUrl
              });
            }
          } else {
            console.log('No profile images found in storage for user:', req.userId);
          }
        } catch (storageError) {
          console.error('Error retrieving profile image from storage:', storageError);
        }
      }
      
      const profile = {
        id: req.userId,
        username: storedProfile.username || 
                 supabaseUser?.user_metadata?.username || 
                 supabaseUser?.user_metadata?.display_name || 
                 supabaseUser?.user_metadata?.full_name || 
                 (supabaseUser?.email ? supabaseUser.email.split('@')[0] : "User"),
        email: storedProfile.email || supabaseUser?.email || "user@example.com",
        avatar_url: avatarUrl
      };
      console.log('Returning profile:', profile);
      res.json(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.patch("/api/user/update-profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { username, email } = req.body;
      
      console.log(`Profile update requested for user: ${req.userId}`, { username, email });
      
      // Update the in-memory storage
      const existingProfile = userProfiles.get(req.userId!) || {};
      userProfiles.set(req.userId!, {
        ...existingProfile,
        username: username || existingProfile.username,
        email: email || existingProfile.email
      });
      
      // Update Supabase user metadata if we have a real user
      if (supabase && username && req.userId !== '00000000-0000-0000-0000-000000000001') {
        try {
          const { error } = await supabase.auth.admin.updateUserById(req.userId!, {
            user_metadata: {
              username: username,
              display_name: username,
              full_name: username
            }
          });
          
          if (error) {
            console.error('Supabase user metadata update error:', error);
          } else {
            console.log('Successfully updated Supabase user metadata for:', req.userId);
          }
        } catch (supabaseError) {
          console.error('Supabase update failed:', supabaseError);
        }
      }
      
      res.json({ 
        message: "Profile updated successfully",
        username,
        email
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/user/update-profile-image", authenticateUser, uploadImage, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      let imageUrl = `/uploads/${req.file.filename}`;
      
      // Upload to Supabase Storage if available
      if (supabase) {
        try {
          const fileName = `${req.userId}/${Date.now()}-${req.file.originalname}`;
          const { data, error } = await supabase.storage
            .from('profile-images')
            .upload(fileName, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: true
            });

          if (error) {
            console.error('Supabase storage upload error:', error);
          } else {
            // Try public URL first, if that fails, try signed URL
            const { data: publicUrlData } = supabase.storage
              .from('profile-images')
              .getPublicUrl(fileName);
            
            if (publicUrlData.publicUrl) {
              imageUrl = publicUrlData.publicUrl;
              console.log(`Image uploaded to Supabase: ${imageUrl}`);
            } else {
              // If public URL doesn't work, try creating a signed URL (1 year expiry)
              const { data: signedUrlData, error: signedError } = await supabase.storage
                .from('profile-images')
                .createSignedUrl(fileName, 31536000); // 1 year in seconds
              
              if (signedError) {
                console.error('Supabase signed URL error:', signedError);
              } else if (signedUrlData.signedUrl) {
                imageUrl = signedUrlData.signedUrl;
                console.log(`Image uploaded to Supabase with signed URL: ${imageUrl}`);
              }
            }
          }
        } catch (storageError) {
          console.error('Storage error:', storageError);
          // Continue with local storage as fallback
        }
      }
      
      // Store the avatar URL for this user
      const existingProfile = userProfiles.get(req.userId!) || {};
      userProfiles.set(req.userId!, {
        ...existingProfile,
        avatar_url: imageUrl
      });
      
      res.json({ 
        message: "Profile image updated successfully",
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error('Profile image update error:', error);
      res.status(500).json({ message: "Failed to update profile image" });
    }
  });

  app.delete("/api/user/delete-account", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      console.log(`Account deletion requested for user: ${req.userId}`);
      
      // 1. Delete all user's data using cascade deletion
      await storage.deleteAllUserData(req.userId!);
      
      // 2. Delete from local profile storage
      userProfiles.delete(req.userId!);
      
      // 3. Delete associated images from Supabase Storage buckets
      if (supabase) {
        try {
          // Delete user's profile images
          const { data: profileImages } = await supabase.storage
            .from('profile-images')
            .list(`user-${req.userId}`);
          
          if (profileImages && profileImages.length > 0) {
            const profileFilePaths = profileImages.map(file => `user-${req.userId}/${file.name}`);
            await supabase.storage.from('profile-images').remove(profileFilePaths);
            console.log(`Deleted ${profileFilePaths.length} profile images for user ${req.userId}`);
          }
          
          // Delete user's character images
          const { data: characterImages } = await supabase.storage
            .from('character-images')
            .list('', { search: `character-` });
          
          if (characterImages && characterImages.length > 0) {
            // Filter images that belong to this user's characters
            const userCharacterImagePaths = characterImages
              .map(file => file.name)
              .filter(fileName => fileName.includes('character-')); // We'll need to improve this filtering
            
            if (userCharacterImagePaths.length > 0) {
              await supabase.storage.from('character-images').remove(userCharacterImagePaths);
              console.log(`Deleted ${userCharacterImagePaths.length} character images for user ${req.userId}`);
            }
          }
          
          // Delete user's content images
          const { data: contentImages } = await supabase.storage
            .from('content-images')
            .list(`user-${req.userId}`);
          
          if (contentImages && contentImages.length > 0) {
            const contentFilePaths = contentImages.map(file => `user-${req.userId}/${file.name}`);
            await supabase.storage.from('content-images').remove(contentFilePaths);
            console.log(`Deleted ${contentFilePaths.length} content images for user ${req.userId}`);
          }
        } catch (storageError) {
          console.error('Error deleting user images from Supabase Storage:', storageError);
          // Continue with account deletion even if image cleanup fails
        }
      }
      
      // 4. Delete the user account from Supabase using admin API
      if (supabase && req.userId !== '00000000-0000-0000-0000-000000000001') {
        try {
          const { error } = await supabase.auth.admin.deleteUser(req.userId!);
          if (error) {
            console.error('Failed to delete user from Supabase:', error);
            return res.status(500).json({ message: "Failed to delete account from authentication service" });
          }
          console.log(`Successfully deleted user from Supabase: ${req.userId}`);
        } catch (supabaseError) {
          console.error('Supabase deletion error:', supabaseError);
          return res.status(500).json({ message: "Failed to delete account from authentication service" });
        }
      }
      
      res.json({ message: "Account and all associated data deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Character image upload endpoint
  app.post("/api/characters/:id/upload-image", authenticateUser, uploadImage, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const characterId = parseInt(req.params.id);
      let imageUrl = `/uploads/${Date.now()}-${req.file.originalname}`;
      
      // Upload to Supabase Storage if available
      if (supabase) {
        try {
          const fileName = `character-${characterId}/${Date.now()}-${req.file.originalname}`;
          const { data, error } = await supabase.storage
            .from('character-images')
            .upload(fileName, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: true
            });

          if (error) {
            console.error('Supabase character image upload error:', error);
          } else {
            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('character-images')
              .getPublicUrl(fileName);
            
            if (publicUrlData.publicUrl) {
              imageUrl = publicUrlData.publicUrl;
              console.log(`Character image uploaded to Supabase: ${imageUrl}`);
            }
          }
        } catch (storageError) {
          console.error('Character image storage error:', storageError);
          // Continue with local storage as fallback
        }
      }
      
      // Update character with new image URL
      const character = await storage.updateCharacter(characterId, { imageUrl });
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json({ 
        message: "Character image updated successfully",
        imageUrl: imageUrl,
        character: character
      });
    } catch (error) {
      console.error('Character image upload error:', error);
      res.status(500).json({ message: "Failed to upload character image" });
    }
  });

  // Image upload endpoints for Editor.js
  app.post("/api/upload-image", uploadImage, handleImageUpload);
  app.post("/api/upload-image-by-url", handleImageUploadByUrl);
  
  // Image deletion endpoint
  app.delete("/api/delete-image", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "Image URL is required" });
      }
      
      // Extract filename from Supabase URL
      if (url.includes('supabase.co') && supabase) {
        try {
          const urlParts = url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          // Determine which bucket based on URL
          let bucketName = 'content-images';
          if (url.includes('character-images')) {
            bucketName = 'character-images';
          } else if (url.includes('profile-images')) {
            bucketName = 'profile-images';
          }
          
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([decodeURIComponent(fileName)]);
            
          if (error) {
            console.error('Supabase storage deletion error:', error);
            return res.status(500).json({ message: "Failed to delete image from storage" });
          }
          
          console.log(`Deleted image from Supabase: ${fileName}`);
          res.json({ message: "Image deleted successfully" });
        } catch (storageError) {
          console.error('Storage deletion error:', storageError);
          res.status(500).json({ message: "Failed to delete image" });
        }
      } else {
        res.json({ message: "Image URL not recognized or not stored on our servers" });
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
