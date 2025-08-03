import { db } from "./db";
import { activities } from "@shared/schema";
import type { InsertActivity } from "@shared/schema";

export class ActivityLogger {
  static async logActivity(data: InsertActivity) {
    try {
      await db.insert(activities).values(data);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - activity logging should never break the main operation
    }
  }

  static async logCreate(
    projectId: number,
    entityType: string,
    entityId: number,
    entityName: string,
    userId: string,
    additionalMetadata?: Record<string, any>
  ) {
    const description = `Created ${entityType.replace('_', ' ')} "${entityName}"`;
    const metadata = additionalMetadata ? JSON.stringify(additionalMetadata) : null;
    
    await this.logActivity({
      projectId,
      entityType,
      entityId,
      entityName,
      action: 'create',
      description,
      metadata,
      userId,
    });
  }

  static async logUpdate(
    projectId: number,
    entityType: string,
    entityId: number,
    entityName: string,
    userId: string,
    changes?: Record<string, any>
  ) {
    const description = `Updated ${entityType.replace('_', ' ')} "${entityName}"`;
    const metadata = changes ? JSON.stringify({ changes }) : null;
    
    await this.logActivity({
      projectId,
      entityType,
      entityId,
      entityName,
      action: 'update',
      description,
      metadata,
      userId,
    });
  }

  static async logDelete(
    projectId: number,
    entityType: string,
    entityId: number,
    entityName: string,
    userId: string,
    additionalMetadata?: Record<string, any>
  ) {
    const description = `Deleted ${entityType.replace('_', ' ')} "${entityName}"`;
    const metadata = additionalMetadata ? JSON.stringify(additionalMetadata) : null;
    
    await this.logActivity({
      projectId,
      entityType,
      entityId,
      entityName,
      action: 'delete',
      description,
      metadata,
      userId,
    });
  }

  static getIconForEntityType(entityType: string): string {
    switch (entityType) {
      case 'character': return 'Users';
      case 'location': return 'MapPin';
      case 'event': return 'Calendar';
      case 'magic_system': return 'Sparkles';
      case 'lore': return 'BookOpen';
      case 'note': return 'StickyNote';
      case 'race': return 'Crown';
      default: return 'Edit3';
    }
  }

  static getCategoryForEntityType(entityType: string): string {
    switch (entityType) {
      case 'character': return 'Characters';
      case 'location': return 'Locations';
      case 'event': return 'Timeline';
      case 'magic_system': return 'Magic Systems';
      case 'lore': return 'Lore';
      case 'note': return 'Notes';
      case 'race': return 'Races';
      default: return 'Other';
    }
  }
}