import { describe, expect, it, beforeEach, vi } from 'vitest';
import { EventBus } from '@lemos/core';
import { RitualEditor } from '../src/domain/RitualEditor';
import type { RitualTemplate, IStorage } from '@lemos/core';

// Mock storage implementation
const createMockStorage = (): IStorage & { records: Record<string, any[]> } => {
  const records: Record<string, any[]> = {};

  return {
    records,
    get: vi.fn(async (key) => null),
    set: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    query: vi.fn(async (table, filter) => {
      const tableRecords = records[table] || [];
      if (!filter) return tableRecords;
      return tableRecords.filter((record: any) =>
        Object.entries(filter).every(([key, value]) => record[key] === value)
      );
    }),
    insert: vi.fn(async (table, record) => {
      if (!records[table]) records[table] = [];
      const id = record.id || 'test-id-' + Math.random();
      const recordWithId = { ...record, id };
      records[table].push(recordWithId);
      return id;
    }),
    update: vi.fn(async (table, record) => {
      if (!records[table]) return;
      const index = records[table].findIndex((r: any) => r.id === record.id);
      if (index !== -1) {
        records[table][index] = record;
      }
    }),
    deleteRecord: vi.fn(async (table, id) => {
      if (!records[table]) return;
      records[table] = records[table].filter((r: any) => r.id !== id);
    }),
  };
};

describe('RitualEditor', () => {
  let bus: EventBus;
  let storage: IStorage & { records: Record<string, any[]> };
  let editor: RitualEditor;

  beforeEach(() => {
    bus = new EventBus();
    storage = createMockStorage();
    editor = new RitualEditor(bus, storage);
  });

  describe('Basic CRUD Operations', () => {
    it('creates a new ritual', async () => {
      const events: any[] = [];
      bus.on('RitualCreated', (event) => events.push(event));

      const ritualId = await editor.createRitual('Morning Routine', 'Daily morning ritual', ['morning', 'routine']);

      expect(ritualId).toBeTruthy();
      expect(ritualId).toMatch(/^[a-f0-9-]{36}$/); // UUID format

      expect(storage.insert).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: ritualId,
        name: 'Morning Routine',
        description: 'Daily morning ritual',
        tags: ['morning', 'routine'],
        steps: [],
        meta: expect.objectContaining({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      }));

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'RitualCreated',
        payload: {
          ritualId,
          name: 'Morning Routine',
          tags: ['morning', 'routine'],
        },
      });
    });

    it('creates a ritual with minimal data', async () => {
      const ritualId = await editor.createRitual('Simple Ritual');

      const [call] = (storage.insert as any).mock.calls;
      const record = call[1];

      expect(record).toMatchObject({
        id: ritualId,
        name: 'Simple Ritual',
        description: undefined,
        tags: undefined,
        steps: [],
      });
    });

    it('retrieves all rituals', async () => {
      const mockRituals: RitualTemplate[] = [
        {
          id: 'ritual-1',
          name: 'Morning',
          description: 'Morning ritual',
          tags: ['morning'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
        {
          id: 'ritual-2',
          name: 'Evening',
          description: 'Evening ritual',
          tags: ['evening'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
      ];

      (storage.query as any).mockResolvedValue(mockRituals);

      const rituals = await editor.getRituals();

      expect(rituals).toEqual(mockRituals);
    });

    it('retrieves a specific ritual', async () => {
      const mockRitual: RitualTemplate = {
        id: 'ritual-1',
        name: 'Morning',
        description: 'Morning ritual',
        tags: ['morning'],
        steps: [],
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      };

      (storage.query as any).mockResolvedValue([mockRitual]);

      const ritual = await editor.getRitual('ritual-1');

      expect(ritual).toEqual(mockRitual);
      expect(storage.query).toHaveBeenCalledWith('ritual_templates', { id: 'ritual-1' });
    });

    it('returns null for non-existent ritual', async () => {
      (storage.query as any).mockResolvedValue([]);

      const ritual = await editor.getRitual('non-existent');

      expect(ritual).toBeNull();
    });

    it('updates a ritual', async () => {
      const existingRitual: RitualTemplate = {
        id: 'ritual-1',
        name: 'Morning',
        description: 'Morning ritual',
        tags: ['morning'],
        steps: [],
        meta: { createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      };

      (storage.query as any).mockResolvedValue([existingRitual]);

      const events: any[] = [];
      bus.on('RitualUpdated', (event) => events.push(event));

      await editor.updateRitual('ritual-1', {
        name: 'Updated Morning',
        description: 'Updated description',
      });

      expect(storage.update).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: 'ritual-1',
        name: 'Updated Morning',
        description: 'Updated description',
        tags: ['morning'], // Should preserve existing values
        steps: [], // Should preserve existing values
        meta: expect.objectContaining({
          createdAt: '2024-01-01T00:00:00Z', // Should preserve
          updatedAt: expect.any(String), // Should update
        }),
      }));

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'RitualUpdated',
        payload: {
          ritualId: 'ritual-1',
          changes: {
            name: 'Updated Morning',
            description: 'Updated description',
          },
        },
      });
    });

    it('throws error when updating non-existent ritual', async () => {
      (storage.query as any).mockResolvedValue([]);

      await expect(editor.updateRitual('non-existent', { name: 'New Name' }))
        .rejects.toThrow('Ritual not found: non-existent');
    });

    it('deletes a ritual', async () => {
      const existingRitual: RitualTemplate = {
        id: 'ritual-1',
        name: 'Morning',
        description: 'Morning ritual',
        tags: ['morning'],
        steps: [],
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      };

      (storage.query as any).mockResolvedValue([existingRitual]);

      const events: any[] = [];
      bus.on('RitualDeleted', (event) => events.push(event));

      await editor.deleteRitual('ritual-1');

      expect(storage.deleteRecord).toHaveBeenCalledWith('ritual_templates', 'ritual-1');

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'RitualDeleted',
        payload: {
          ritualId: 'ritual-1',
        },
      });
    });

    it('throws error when deleting non-existent ritual', async () => {
      (storage.query as any).mockResolvedValue([]);

      await expect(editor.deleteRitual('non-existent'))
        .rejects.toThrow('Ritual not found: non-existent');
    });
  });

  describe('Step Management', () => {
    const mockRitual: RitualTemplate = {
      id: 'ritual-1',
      name: 'Test Ritual',
      description: 'Test description',
      tags: ['test'],
      steps: [
        {
          id: 'step-1',
          type: 'prompt',
          content: 'First step',
          duration: 60,
        },
      ],
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };

    beforeEach(() => {
      (storage.query as any).mockResolvedValue([mockRitual]);
    });

    it('adds a step to a ritual', async () => {
      const newStep = {
        type: 'text' as const,
        content: 'New step content',
        duration: 30,
      };

      await editor.addStep('ritual-1', newStep);

      expect(storage.update).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: 'ritual-1',
        steps: expect.arrayContaining([
          mockRitual.steps[0],
          expect.objectContaining({
            type: 'text',
            content: 'New step content',
            duration: 30,
            id: expect.stringMatching(/^[a-f0-9-]{36}$/),
          }),
        ]),
      }));
    });

    it('updates a step in a ritual', async () => {
      await editor.updateStep('ritual-1', 'step-1', {
        content: 'Updated step content',
        duration: 90,
      });

      expect(storage.update).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: 'ritual-1',
        steps: [
          expect.objectContaining({
            id: 'step-1',
            type: 'prompt', // Should preserve
            content: 'Updated step content',
            duration: 90,
          }),
        ],
      }));
    });

    it('removes a step from a ritual', async () => {
      await editor.removeStep('ritual-1', 'step-1');

      expect(storage.update).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: 'ritual-1',
        steps: [], // Should be empty
      }));
    });

    it('reorders steps in a ritual', async () => {
      const multiStepRitual: RitualTemplate = {
        ...mockRitual,
        steps: [
          { id: 'step-1', type: 'prompt', content: 'First', duration: 60 },
          { id: 'step-2', type: 'text', content: 'Second', duration: 30 },
          { id: 'step-3', type: 'movement', content: 'Third', duration: 45 },
        ],
      };

      (storage.query as any).mockResolvedValue([multiStepRitual]);

      await editor.reorderSteps('ritual-1', ['step-3', 'step-1', 'step-2']);

      expect(storage.update).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: 'ritual-1',
        steps: [
          expect.objectContaining({ id: 'step-3' }),
          expect.objectContaining({ id: 'step-1' }),
          expect.objectContaining({ id: 'step-2' }),
        ],
      }));
    });

    it('throws error when reordering with invalid step IDs', async () => {
      await expect(editor.reorderSteps('ritual-1', ['step-1', 'non-existent']))
        .rejects.toThrow('Steps not found: non-existent');
    });
  });

  describe('Utility Methods', () => {
    it('duplicates a ritual', async () => {
      const originalRitual: RitualTemplate = {
        id: 'ritual-1',
        name: 'Original',
        description: 'Original description',
        tags: ['original'],
        steps: [
          { id: 'step-1', type: 'prompt', content: 'Step', duration: 60 },
        ],
        meta: {
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          planet: 'Earth',
          intensity: 'medium' as const,
        },
      };

      (storage.query as any).mockResolvedValue([originalRitual]);

      const events: any[] = [];
      bus.on('RitualCreated', (event) => events.push(event));

      const duplicateId = await editor.duplicateRitual('ritual-1');

      expect(duplicateId).toBeTruthy();
      expect(duplicateId).not.toBe('ritual-1');

      expect(storage.insert).toHaveBeenCalledWith('ritual_templates', expect.objectContaining({
        id: duplicateId,
        name: 'Original (Copy)',
        description: 'Original description',
        tags: ['original'],
        steps: [
          { id: 'step-1', type: 'prompt', content: 'Step', duration: 60 },
        ],
        meta: expect.objectContaining({
          planet: 'Earth', // Should preserve
          intensity: 'medium', // Should preserve
          createdAt: expect.any(String), // Should be new
          updatedAt: expect.any(String), // Should be new
        }),
      }));

      expect(events).toHaveLength(1);
      expect(events[0].payload.name).toBe('Original (Copy)');
    });

    it('duplicates a ritual with custom name', async () => {
      const originalRitual: RitualTemplate = {
        id: 'ritual-1',
        name: 'Original',
        description: 'Original description',
        tags: ['original'],
        steps: [],
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      };

      (storage.query as any).mockResolvedValue([originalRitual]);

      const duplicateId = await editor.duplicateRitual('ritual-1', 'Custom Copy Name');

      const [call] = (storage.insert as any).mock.calls;
      const record = call[1];

      expect(record.name).toBe('Custom Copy Name');
    });

    it('filters rituals by tag', async () => {
      const rituals: RitualTemplate[] = [
        {
          id: 'ritual-1',
          name: 'Morning Ritual',
          tags: ['morning', 'energy'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
        {
          id: 'ritual-2',
          name: 'Evening Ritual',
          tags: ['evening', 'relax'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
        {
          id: 'ritual-3',
          name: 'Energy Boost',
          tags: ['energy', 'quick'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
      ];

      (storage.query as any).mockResolvedValue(rituals);

      const energyRituals = await editor.getRitualsByTag('energy');

      expect(energyRituals).toHaveLength(2);
      expect(energyRituals.map(r => r.id)).toEqual(['ritual-1', 'ritual-3']);
    });

    it('gets all unique tags', async () => {
      const rituals: RitualTemplate[] = [
        {
          id: 'ritual-1',
          name: 'Morning Ritual',
          tags: ['morning', 'energy'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
        {
          id: 'ritual-2',
          name: 'Evening Ritual',
          tags: ['evening', 'energy'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
        {
          id: 'ritual-3',
          name: 'Quick Ritual',
          tags: ['quick'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
      ];

      (storage.query as any).mockResolvedValue(rituals);

      const tags = await editor.getAllTags();

      expect(tags).toEqual(['energy', 'evening', 'morning', 'quick']); // Sorted alphabetically
    });

    it('handles rituals without tags', async () => {
      const rituals: RitualTemplate[] = [
        {
          id: 'ritual-1',
          name: 'Simple Ritual',
          tags: undefined,
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
        {
          id: 'ritual-2',
          name: 'Tagged Ritual',
          tags: ['tag1', 'tag2'],
          steps: [],
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        },
      ];

      (storage.query as any).mockResolvedValue(rituals);

      const tags = await editor.getAllTags();

      expect(tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('Error Handling', () => {
    it('throws error when storage not available for operations requiring it', async () => {
      const editorWithoutStorage = new RitualEditor(bus);

      await expect(editorWithoutStorage.updateRitual('ritual-1', { name: 'New Name' }))
        .rejects.toThrow('Storage not available for ritual updates');

      await expect(editorWithoutStorage.deleteRitual('ritual-1'))
        .rejects.toThrow('Storage not available for ritual deletion');
    });

    it('handles empty ritual array correctly', async () => {
      (storage.query as any).mockResolvedValue([]);

      const rituals = await editor.getRituals();
      expect(rituals).toEqual([]);

      const tags = await editor.getAllTags();
      expect(tags).toEqual([]);
    });

    it('trims whitespace from ritual name', async () => {
      await editor.createRitual('  Trimmed Name  ', '  Description  ');

      const [call] = (storage.insert as any).mock.calls;
      const record = call[1];

      expect(record.name).toBe('Trimmed Name');
      expect(record.description).toBe('Description');
    });

    it('filters empty tags correctly', async () => {
      await editor.createRitual('Test', 'Description', ['valid', '', '  ', 'also-valid']);

      const [call] = (storage.insert as any).mock.calls;
      const record = call[1];

      expect(record.tags).toEqual(['valid', 'also-valid']);
    });
  });
});