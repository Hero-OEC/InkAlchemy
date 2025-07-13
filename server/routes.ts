import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, insertCharacterSchema, insertLocationSchema, 
  insertEventSchema, insertMagicSystemSchema, insertLoreEntrySchema, 
  insertNoteSchema, insertRelationshipSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Characters
  app.get("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
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

  const httpServer = createServer(app);
  return httpServer;
}
