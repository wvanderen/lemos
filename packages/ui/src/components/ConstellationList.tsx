import { useState, useEffect, useCallback } from 'react';
import type { EventBus } from '@lemos/core';
import type { ConstellationDefinition } from '@lemos/core';
import type { ConstellationOS } from '@lemos/modules-constellation-os';
import { Button, Input } from '../atoms';

interface ConstellationListProps {
  bus: EventBus;
  constellationOS: ConstellationOS;
}

export function ConstellationList({
  bus,
  constellationOS
}: ConstellationListProps): JSX.Element {
  const [constellations, setConstellations] = useState<ConstellationDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#4A90E2');
  const [formIcon, setFormIcon] = useState('star');

  const loadConstellations = useCallback(async () => {
    try {
      const items = await constellationOS.listConstellations(false);
      setConstellations(items);
    } catch (error) {
      console.error('Failed to load constellations:', error);
    } finally {
      setLoading(false);
    }
  }, [constellationOS]);

  useEffect(() => {
    loadConstellations();

    // Listen for constellation events
    const handleCreated = () => {
      loadConstellations();
    };

    const handleUpdated = () => {
      loadConstellations();
    };

    bus.on('ConstellationCreated', handleCreated);
    bus.on('ConstellationUpdated', handleUpdated);
  }, [bus, constellationOS, loadConstellations]);

  const handleEdit = (constellation: ConstellationDefinition) => {
    setEditingId(constellation.id);
    setFormName(constellation.name);
    setFormDescription(constellation.description);
    setFormColor(constellation.color);
    setFormIcon(constellation.icon);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setFormColor('#4A90E2');
    setFormIcon('star');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing constellation
        await constellationOS.updateConstellation(editingId, {
          name: formName,
          description: formDescription,
          color: formColor,
          icon: formIcon,
        });
      } else {
        // Create new constellation
        await constellationOS.createConstellation({
          name: formName,
          description: formDescription,
          color: formColor,
          icon: formIcon,
          archived: false,
        });
      }

      // Reset form
      setEditingId(null);
      setFormName('');
      setFormDescription('');
      setFormColor('#4A90E2');
      setFormIcon('star');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save constellation:', error);
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await constellationOS.archiveConstellation(id);
      loadConstellations();
    } catch (error) {
      console.error('Failed to archive constellation:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-text-secondary animate-pulse">
        Loading constellations...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-display font-bold text-text-primary">
          Your Constellations
        </div>
        <Button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
        >
          {showForm ? 'Cancel' : '+ New Constellation'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-4 bg-bg-canvas rounded-lg border border-border-default animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Name <span className="text-accent-danger">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="e.g., Launch SaaS"
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Description
              </label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What is this constellation about?"
                fullWidth
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Color
              </label>
              <div className="h-10 w-full rounded-md border border-border-default overflow-hidden relative">
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer p-0 border-0"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Icon
              </label>
              <Input
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                placeholder="emoji"
                fullWidth
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="success"
            fullWidth
          >
            {editingId ? 'Update Constellation' : 'Create Constellation'}
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {constellations.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary italic bg-bg-canvas rounded-lg border border-border-dashed border-border-default">
            No constellations yet. Create one to get started!
          </div>
        ) : (
          constellations.map((constellation) => (
            <div
              key={constellation.id}
              className="flex items-center gap-3 p-3 bg-bg-surface border border-border-default rounded-lg hover:border-text-tertiary transition-all duration-200 group relative"
            >
              <div
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shadow-sm"
                style={{
                  background: `${constellation.color}20`,
                  color: constellation.color
                }}
              >
                {constellation.icon}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: constellation.color }}
                >
                  {constellation.name}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {constellation.description}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  onClick={() => handleEdit(constellation)}
                  variant="ghost"
                  size="sm"
                  className="!p-1.5 h-8 w-8 text-accent-primary hover:bg-accent-primary/10"
                >
                  ✏️
                </Button>
                <Button
                  onClick={(e) => handleArchive(constellation.id, e)}
                  variant="ghost"
                  size="sm"
                  className="!p-1.5 h-8 w-8 text-accent-danger hover:bg-accent-danger/10"
                >
                  📥
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
