import { EventBus } from '@lemos/core';
import type {
  IStorage,
  RitualTemplate,
  RitualTemplateStep,
  RitualCreatedPayload,
  RitualUpdatedPayload,
  RitualDeletedPayload
} from '@lemos/core';

export class RitualEditor {
  private bus: EventBus;
  private storage: IStorage | null = null;

  constructor(bus: EventBus, storage?: IStorage) {
    this.bus = bus;
    this.storage = storage ?? null;
  }

  // ==================== CRUD Operations ====================

  /**
   * Create a new ritual template
   */
  async createRitual(name: string, description?: string, tags?: string[]): Promise<string> {
    const now = new Date().toISOString();
    const ritual: RitualTemplate = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description?.trim() || undefined,
      tags: tags?.filter(tag => tag.trim()) || undefined,
      steps: [],
      meta: {
        createdAt: now,
        updatedAt: now,
      },
    };

    if (this.storage) {
      await this.storage.insert('ritual_templates', ritual);
    }

    // Emit event for other modules
    this.bus.emit<RitualCreatedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualCreated',
      timestamp: now,
      payload: {
        ritualId: ritual.id,
        name: ritual.name,
        tags: ritual.tags,
      },
    });

    return ritual.id;
  }

  /**
   * Get all ritual templates
   */
  async getRituals(): Promise<RitualTemplate[]> {
    if (!this.storage) return [];
    return this.storage.query<RitualTemplate>('ritual_templates');
  }

  /**
   * Get a specific ritual template by ID
   */
  async getRitual(ritualId: string): Promise<RitualTemplate | null> {
    if (!this.storage) return null;
    const rituals = await this.storage.query<RitualTemplate>('ritual_templates', { id: ritualId });
    return rituals.length > 0 ? rituals[0] : null;
  }

  /**
   * Update a ritual template
   */
  async updateRitual(ritualId: string, changes: Partial<RitualTemplate>): Promise<void> {
    if (!this.storage) {
      throw new Error('Storage not available for ritual updates');
    }

    const existing = await this.getRitual(ritualId);
    if (!existing) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    // Create updated ritual with proper timestamp
    const updated: RitualTemplate = {
      ...existing,
      ...changes,
      id: ritualId, // Ensure ID doesn't change
      meta: {
        ...existing.meta,
        ...changes.meta,
        updatedAt: new Date().toISOString(),
      },
    };

    await this.storage.update('ritual_templates', updated);

    // Emit event for other modules
    this.bus.emit<RitualUpdatedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualUpdated',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId,
        changes,
      },
    });
  }

  /**
   * Delete a ritual template
   */
  async deleteRitual(ritualId: string): Promise<void> {
    if (!this.storage) {
      throw new Error('Storage not available for ritual deletion');
    }

    const existing = await this.getRitual(ritualId);
    if (!existing) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    await this.storage.deleteRecord('ritual_templates', ritualId);

    // Emit event for other modules
    this.bus.emit<RitualDeletedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualDeleted',
      timestamp: new Date().toISOString(),
      payload: {
        ritualId,
      },
    });
  }

  // ==================== Step Management ====================

  /**
   * Add a step to a ritual
   */
  async addStep(ritualId: string, step: Omit<RitualTemplateStep, 'id'>): Promise<void> {
    const ritual = await this.getRitual(ritualId);
    if (!ritual) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    const newStep: RitualTemplateStep = {
      id: crypto.randomUUID(),
      ...step,
    };

    const updatedSteps = [...ritual.steps, newStep];
    await this.updateRitual(ritualId, { steps: updatedSteps });
  }

  /**
   * Update a step in a ritual
   */
  async updateStep(ritualId: string, stepId: string, changes: Partial<RitualTemplateStep>): Promise<void> {
    const ritual = await this.getRitual(ritualId);
    if (!ritual) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    const updatedSteps = ritual.steps.map(step =>
      step.id === stepId
        ? { ...step, ...changes, id: stepId } // Ensure ID doesn't change
        : step
    );

    await this.updateRitual(ritualId, { steps: updatedSteps });
  }

  /**
   * Remove a step from a ritual
   */
  async removeStep(ritualId: string, stepId: string): Promise<void> {
    const ritual = await this.getRitual(ritualId);
    if (!ritual) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    const updatedSteps = ritual.steps.filter(step => step.id !== stepId);
    await this.updateRitual(ritualId, { steps: updatedSteps });
  }

  /**
   * Reorder steps in a ritual
   */
  async reorderSteps(ritualId: string, stepIds: string[]): Promise<void> {
    const ritual = await this.getRitual(ritualId);
    if (!ritual) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    // Validate all step IDs exist
    const existingStepIds = new Set(ritual.steps.map(step => step.id));
    const missingIds = stepIds.filter(id => !existingStepIds.has(id));
    if (missingIds.length > 0) {
      throw new Error(`Steps not found: ${missingIds.join(', ')}`);
    }

    // Create reordered steps
    const reorderedSteps = stepIds.map(id => {
      const step = ritual.steps.find(s => s.id === id);
      if (!step) {
        throw new Error(`Step not found: ${id}`);
      }
      return step;
    });

    await this.updateRitual(ritualId, { steps: reorderedSteps });
  }

  // ==================== Utility Methods ====================

  /**
   * Create a copy of an existing ritual
   */
  async duplicateRitual(ritualId: string, newName?: string): Promise<string> {
    const original = await this.getRitual(ritualId);
    if (!original) {
      throw new Error(`Ritual not found: ${ritualId}`);
    }

    const now = new Date().toISOString();
    const duplicate: RitualTemplate = {
      ...original,
      id: crypto.randomUUID(),
      name: newName?.trim() || `${original.name} (Copy)`,
      meta: {
        ...original.meta,
        createdAt: now,
        updatedAt: now,
      },
    };

    if (this.storage) {
      await this.storage.insert('ritual_templates', duplicate);
    }

    // Emit event for other modules
    this.bus.emit<RitualCreatedPayload>({
      id: crypto.randomUUID(),
      type: 'RitualCreated',
      timestamp: now,
      payload: {
        ritualId: duplicate.id,
        name: duplicate.name,
        tags: duplicate.tags,
      },
    });

    return duplicate.id;
  }

  /**
   * Get rituals filtered by tags
   */
  async getRitualsByTag(tag: string): Promise<RitualTemplate[]> {
    const allRituals = await this.getRituals();
    return allRituals.filter(ritual =>
      ritual.tags?.some(ritualTag =>
        ritualTag.toLowerCase() === tag.toLowerCase()
      )
    );
  }

  /**
   * Get all unique tags from all rituals
   */
  async getAllTags(): Promise<string[]> {
    const allRituals = await this.getRituals();
    const tagSet = new Set<string>();

    allRituals.forEach(ritual => {
      ritual.tags?.forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }
}