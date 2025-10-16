import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Projects table for managing multiple story worlds
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase auth user UUID
  name: text("name").notNull(),
  description: text("description"),
  genre: text("genre"), // fantasy, sci-fi, horror, mystery, romance, historical, contemporary, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Characters table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  prefix: text("prefix"),
  suffix: text("suffix"),
  role: text("role"),
  description: text("description"), // rich text content using WordProcessor
  age: text("age"),
  raceId: integer("race_id").references(() => races.id),
  magicSystemId: integer("magic_system_id").references(() => magicSystems.id),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  type: text("type"), // city, forest, building, etc.
  content: text("content"), // rich text content using WordProcessor
  parentLocationId: integer("parent_location_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table for timeline management
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date"), // ISO date string or custom date format
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
  type: text("type").default("other"), // battle, meeting, discovery, political, personal, death, travel, magic, other
  importance: text("importance").default("medium"), // low, medium, high, critical
  stage: text("stage").default("planning"), // planning, writing, first-draft, editing, complete
  status: text("status").default("planned"), // planned, active, completed
  locationId: integer("location_id").references(() => locations.id),
  characterIds: text("character_ids").array(), // Array of character IDs involved in this event
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Magic Systems table
export const magicSystems = pgTable("magic_systems", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  type: text("type").default("magic"), // magic, power
  description: text("description"),
  source: text("source"),
  complexity: text("complexity").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Spells table
export const spells = pgTable("spells", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  magicSystemId: integer("magic_system_id").references(() => magicSystems.id).notNull(),
  name: text("name").notNull(),
  level: text("level").default("novice"), // novice, apprentice, adept, expert, master
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lore entries table
export const loreEntries = pgTable("lore_entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category"), // history, mythology, culture, etc.

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notes table for quick thoughts and ideas
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Races table for defining races in the story
export const races = pgTable("races", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // Origin & Homeland
  homelandId: integer("homeland_id").references(() => locations.id),
  // Physical Characteristics
  lifespan: text("lifespan"), // short, human, long, immortal, eternal
  sizeCategory: text("size_category"), // tiny, small, medium, large, huge
  // Cultural Characteristics
  culture: text("culture"), // cultural traits and practices
  language: text("language"), // primary language(s) spoken
  traits: text("traits"), // unique racial traits
  // Abilities & Powers
  magicalAffinity: text("magical_affinity"), // none, low, medium, high, innate
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Character Magic Systems junction table - linking characters to their magic systems
export const characterMagicSystems = pgTable("character_magic_systems", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  magicSystemId: integer("magic_system_id").references(() => magicSystems.id).notNull(),
  proficiency: text("proficiency").default("novice"), // novice, apprentice, adept, expert, master
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Character Spells junction table - linking characters to their spells/abilities
export const characterSpells = pgTable("character_spells", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  spellId: integer("spell_id").references(() => spells.id).notNull(),
  proficiency: text("proficiency").default("novice"), // novice, apprentice, adept, expert, master
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event Characters junction table - linking events to their participating characters
export const eventCharacters = pgTable("event_characters", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  role: text("role"), // protagonist, antagonist, witness, victim, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// Relationships table for connecting different elements
export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sourceType: text("source_type").notNull(), // character, location, event, etc.
  sourceId: integer("source_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  relationshipType: text("relationship_type").notNull(), // mentor, enemy, ally, etc.
  strength: text("strength").default("medium"), // weak, medium, strong
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity log table for tracking all database changes
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  entityType: text("entity_type").notNull(), // character, location, event, race, magic_system, spell, lore, note
  entityId: integer("entity_id").notNull(), // ID of the affected entity
  entityName: text("entity_name").notNull(), // Name/title of the entity for display
  action: text("action").notNull(), // create, update, delete
  description: text("description"), // Human-readable description of the change
  metadata: text("metadata"), // JSON string with additional details
  userId: text("user_id").notNull(), // User who performed the action
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMagicSystemSchema = createInsertSchema(magicSystems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpellSchema = createInsertSchema(spells).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoreEntrySchema = createInsertSchema(loreEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRaceSchema = createInsertSchema(races).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterMagicSystemSchema = createInsertSchema(characterMagicSystems).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterSpellSchema = createInsertSchema(characterSpells).omit({
  id: true,
  createdAt: true,
});

export const insertEventCharacterSchema = createInsertSchema(eventCharacters).omit({
  id: true,
  createdAt: true,
});

export const insertRelationshipSchema = createInsertSchema(relationships).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Infer types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type MagicSystem = typeof magicSystems.$inferSelect;
export type InsertMagicSystem = z.infer<typeof insertMagicSystemSchema>;

export type Spell = typeof spells.$inferSelect;
export type InsertSpell = z.infer<typeof insertSpellSchema>;

// Naming convention aliases for UI terminology
export type System = MagicSystem;  // Systems = Magic Systems
export type InsertSystem = InsertMagicSystem;
export type Effect = Spell;       // Effects = Spells  
export type InsertEffect = InsertSpell;

export type Race = typeof races.$inferSelect;
export type InsertRace = z.infer<typeof insertRaceSchema>;

export type CharacterMagicSystem = typeof characterMagicSystems.$inferSelect;
export type InsertCharacterMagicSystem = z.infer<typeof insertCharacterMagicSystemSchema>;

export type CharacterSpell = typeof characterSpells.$inferSelect;
export type InsertCharacterSpell = z.infer<typeof insertCharacterSpellSchema>;

export type EventCharacter = typeof eventCharacters.$inferSelect;
export type InsertEventCharacter = z.infer<typeof insertEventCharacterSchema>;

export type LoreEntry = typeof loreEntries.$inferSelect;
export type InsertLoreEntry = z.infer<typeof insertLoreEntrySchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Login/Register form schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
