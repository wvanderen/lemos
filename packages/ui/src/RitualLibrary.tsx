import { useState, useEffect, useCallback } from 'react';
import type { EventBus, RitualTemplate } from '@lemos/core';
import type { RitualEditor as RitualEditorDomain } from '@lemos/modules-ritual-editor';

interface RitualLibraryProps {
  bus: EventBus;
  ritualEditor: RitualEditorDomain;
  onSelectRitual?: (ritual: RitualTemplate) => void;
}

export function RitualLibrary({ bus, ritualEditor, onSelectRitual }: RitualLibraryProps): JSX.Element {
  const [rituals, setRituals] = useState<RitualTemplate[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formPlanet, setFormPlanet] = useState('');
  const [formIntensity, setFormIntensity] = useState<'low' | 'medium' | 'high' | ''>('');

  // Load rituals and tags
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allRituals, allTags] = await Promise.all([
        ritualEditor.getRituals(),
        ritualEditor.getAllTags(),
      ]);
      setRituals(allRituals);
      setTags(allTags);
    } catch (error) {
      console.error('Failed to load rituals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ritualEditor]);

  useEffect(() => {
    loadData();

    // Listen for ritual changes
    const handleRitualChange = () => {
      loadData();
    };

    bus.on('RitualCreated', handleRitualChange);
    bus.on('RitualUpdated', handleRitualChange);
    bus.on('RitualDeleted', handleRitualChange);

    return () => {
      bus.off('RitualCreated', handleRitualChange);
      bus.off('RitualUpdated', handleRitualChange);
      bus.off('RitualDeleted', handleRitualChange);
    };
  }, [bus, loadData]);

  // Filter rituals by selected tag
  const filteredRituals = selectedTag === 'all'
    ? rituals
    : rituals.filter(ritual =>
      ritual.tags?.some(tag =>
        tag.toLowerCase() === selectedTag.toLowerCase()
      )
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const tags = formTags
      ? formTags.split(',').map(t => t.trim()).filter(Boolean)
      : undefined;

    try {
      await ritualEditor.createRitual(
        formName.trim(),
        formDescription.trim() || undefined,
        tags
      );

      // Reset form
      setFormName('');
      setFormDescription('');
      setFormTags('');
      setFormPlanet('');
      setFormIntensity('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create ritual:', error);
    }
  };

  
  if (isLoading) {
    return (
      <div style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Loading rituals...</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#f3f4f6' }}>
          Ritual Editor
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            background: showForm ? '#374151' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {showForm ? 'Cancel' : 'Create Ritual'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 20,
            background: '#111827',
            borderRadius: 12,
            border: '1px solid #374151',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>
              Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="e.g., Morning Focus"
              style={{
                padding: '10px 14px',
                fontSize: 14,
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #4b5563',
                borderRadius: 8,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>
              Description
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="What is this ritual for?"
              style={{
                padding: '10px 14px',
                fontSize: 14,
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #4b5563',
                borderRadius: 8,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="morning, focus, energy"
              style={{
                padding: '10px 14px',
                fontSize: 14,
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #4b5563',
                borderRadius: 8,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>
                Planet
              </label>
              <select
                value={formPlanet}
                onChange={(e) => setFormPlanet(e.target.value)}
                style={{
                  padding: '10px 14px',
                  fontSize: 14,
                  background: '#1f2937',
                  color: '#f3f4f6',
                  border: '1px solid #4b5563',
                  borderRadius: 8,
                  outline: 'none',
                }}
              >
                <option value="">None</option>
                <option value="Earth">🌍 Earth</option>
                <option value="Mars">🔴 Mars</option>
                <option value="Jupiter">🟠 Jupiter</option>
                <option value="Saturn">🪐 Saturn</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>
                Intensity
              </label>
              <select
                value={formIntensity}
                onChange={(e) => setFormIntensity(e.target.value as 'low' | 'medium' | 'high' | '')}
                style={{
                  padding: '10px 14px',
                  fontSize: 14,
                  background: '#1f2937',
                  color: '#f3f4f6',
                  border: '1px solid #4b5563',
                  borderRadius: 8,
                  outline: 'none',
                }}
              >
                <option value="">None</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginTop: 8,
              transition: 'background 0.2s',
            }}
          >
            Create Ritual
          </button>
        </form>
      )}

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Filter:</span>
          <button
            onClick={() => setSelectedTag('all')}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 12,
              border: '1px solid #4b5563',
              backgroundColor: selectedTag === 'all' ? '#374151' : 'transparent',
              color: selectedTag === 'all' ? '#fff' : '#9ca3af',
              cursor: 'pointer',
            }}
          >
            All ({rituals.length})
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 12,
                border: '1px solid #4b5563',
                backgroundColor: selectedTag === tag ? '#374151' : 'transparent',
                color: selectedTag === tag ? '#fff' : '#9ca3af',
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Ritual List */}
      {filteredRituals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
          {selectedTag === 'all' ? 'No rituals yet. Create your first ritual!' : `No rituals with tag "${selectedTag}".`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredRituals.map(ritual => (
            <div
              key={ritual.id}
              style={{
                padding: 16,
                border: '1px solid #374151',
                borderRadius: 12,
                backgroundColor: '#111827',
                cursor: onSelectRitual ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (onSelectRitual) e.currentTarget.style.borderColor = '#6b7280';
              }}
              onMouseLeave={(e) => {
                if (onSelectRitual) e.currentTarget.style.borderColor = '#374151';
              }}
              onClick={() => onSelectRitual?.(ritual)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#f3f4f6', marginBottom: 6 }}>
                    {ritual.name}
                  </div>
                  {ritual.description && (
                    <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 10 }}>
                      {ritual.description}
                    </div>
                  )}

                  {ritual.tags && ritual.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {ritual.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            backgroundColor: '#374151',
                            color: '#d1d5db',
                            borderRadius: 10,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                    <div>{ritual.steps.length} steps</div>
                    <div>Created {new Date(ritual.meta.createdAt).toLocaleDateString()}</div>
                  </div>

                  {ritual.meta.planet && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      🪐 {ritual.meta.planet}
                    </div>
                  )}
                </div>

                {ritual.meta.intensity && (
                  <div
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background:
                        ritual.meta.intensity === 'high' ? '#fef2f2' :
                          ritual.meta.intensity === 'medium' ? '#fefce8' :
                            '#f0fdf4',
                      color:
                        ritual.meta.intensity === 'high' ? '#dc2626' :
                          ritual.meta.intensity === 'medium' ? '#ca8a04' :
                            '#16a34a',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginLeft: 12,
                    }}
                  >
                    {ritual.meta.intensity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}