import { useState, useEffect, useCallback } from 'react';
import type { EventBus } from '@lemos/core';
import type { ConstellationDefinition } from '@lemos/core';
import type { ConstellationOS } from '@lemos/modules-constellation-os';

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

  const handleArchive = async (id: string) => {
    try {
      await constellationOS.archiveConstellation(id);
      loadConstellations();
    } catch (error) {
      console.error('Failed to archive constellation:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 16, color: '#6b7280' }}>
        Loading constellations...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
          Your Constellations
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            fontWeight: 600,
            background: showForm ? '#6b7280' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ New Constellation'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
              Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="e.g., Launch SaaS"
              style={{
                padding: '8px 12px',
                fontSize: 14,
                border: '1px solid #d1d5db',
                borderRadius: 6,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
              Description
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="What is this constellation about?"
              style={{
                padding: '8px 12px',
                fontSize: 14,
                border: '1px solid #d1d5db',
                borderRadius: 6,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                Color
              </label>
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                style={{
                  height: 40,
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                Icon
              </label>
              <input
                type="text"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                placeholder="emoji or icon name"
                style={{
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {editingId ? 'Update Constellation' : 'Create Constellation'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {constellations.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
            No constellations yet. Create one to get started!
          </div>
        ) : (
          constellations.map((constellation) => (
            <div
              key={constellation.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: constellation.color + '20',
                  borderRadius: 8,
                }}
              >
                {constellation.icon}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: constellation.color,
                  }}
                >
                  {constellation.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {constellation.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleEdit(constellation)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'transparent',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(constellation.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Archive
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
