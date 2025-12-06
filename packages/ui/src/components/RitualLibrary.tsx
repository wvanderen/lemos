import { useState, useEffect, useCallback } from 'react';
import type { EventBus, RitualTemplate } from '@lemos/core';
import { type RitualEditor as RitualEditorDomain } from '@lemos/modules-ritual-editor';
import { Button } from '../atoms';
import { RitualEditor } from './RitualEditor';

interface RitualLibraryProps {
  bus: EventBus;
  ritualEditor: RitualEditorDomain;
}

export function RitualLibrary({ bus, ritualEditor }: RitualLibraryProps): JSX.Element {
  const [rituals, setRituals] = useState<RitualTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRitualId, setEditingRitualId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadRituals = useCallback(async () => {
    setIsLoading(true);
    try {
      const allRituals = await ritualEditor.getRituals();
      setRituals(allRituals);
    } catch (error) {
      console.error('Failed to load rituals:', error);
      alert('Failed to load rituals: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [ritualEditor]);

  useEffect(() => {
    loadRituals();
  }, [loadRituals]);

  const handleCreateRitual = async () => {
    const name = prompt('Enter a name for the new ritual:');
    if (!name) return;

    try {
      const newRitualId = await ritualEditor.createRitual(name);
      await loadRituals();
      setEditingRitualId(newRitualId);
    } catch (error) {
      console.error('Failed to create ritual:', error);
      alert('Failed to create ritual: ' + (error as Error).message);
    }
  };

  const handleDeleteRitual = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this ritual?')) return;

    try {
      await ritualEditor.deleteRitual(id);
      await loadRituals();
    } catch (error) {
      console.error('Failed to delete ritual:', error);
      alert('Failed to delete ritual: ' + (error as Error).message);
    }
  };

  if (editingRitualId || isCreating) {
    return (
      <RitualEditor
        bus={bus}
        ritualEditor={ritualEditor}
        ritualId={editingRitualId}
        onBack={() => {
          setEditingRitualId(null);
          setIsCreating(false);
          loadRituals();
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-display font-medium text-text-primary tracking-tight mb-1">Ritual Library</h1>
          <p className="text-text-secondary text-sm">Manage your collection of rituals</p>
        </div>
        <Button onClick={handleCreateRitual} variant="primary">
          + Create Ritual
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-text-secondary animate-pulse">Loading rituals...</div>
        </div>
      ) : rituals.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface rounded-panel border border-border-default border-dashed">
          <div className="text-4xl mb-4">🌑</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No Rituals Found</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Create your first ritual to start building your personal system of habits and reflections.
          </p>
          <Button onClick={handleCreateRitual} variant="primary">
            Create Your First Ritual
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rituals.map((ritual) => (
            <div
              key={ritual.id}
              onClick={() => setEditingRitualId(ritual.id)}
              className="bg-bg-surface border border-border-default rounded-panel p-6 cursor-pointer hover:border-text-tertiary transition-all duration-300 hover:shadow-glow group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  onClick={(e) => handleDeleteRitual(ritual.id, e)}
                  variant="ghost"
                  size="sm"
                  className="!p-1.5 text-accent-danger hover:bg-accent-danger/10"
                >
                  🗑️
                </Button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-text-primary mb-1 group-hover:text-accent-primary transition-colors duration-200">
                  {ritual.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono">
                  <span>{new Date(ritual.meta.updatedAt).toLocaleDateString()}</span>
                  {ritual.meta.planet && (
                    <span className="bg-bg-canvas px-1.5 py-0.5 rounded border border-border-subtle">
                      {ritual.meta.planet}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary line-clamp-2 mb-4 h-10">
                {ritual.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between text-xs text-text-tertiary border-t border-border-subtle pt-4 mt-auto">
                <span className="font-medium">
                  {ritual.steps.length} {ritual.steps.length === 1 ? 'step' : 'steps'}
                </span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  Edit →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}