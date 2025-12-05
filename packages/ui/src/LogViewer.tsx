import { useState, useEffect, useCallback } from 'react';
import type { EventBus, LogEntry, ConstellationDefinition, RitualDefinition } from '@lemos/core';
import type { UnifiedLogger } from '@lemos/modules-logger';
import type { ConstellationOS } from '@lemos/modules-constellation-os';
import type { RitualOS } from '@lemos/modules-ritual-os';

interface LogViewerProps {
  bus: EventBus;
  logger: UnifiedLogger;
  constellationOS: ConstellationOS;
  ritualOS: RitualOS;
}

export function LogViewer({
  bus,
  logger,
  constellationOS,
  ritualOS
}: LogViewerProps): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [constellations, setConstellations] = useState<ConstellationDefinition[]>([]);
  const [rituals, setRituals] = useState<RitualDefinition[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      const entries = await logger.queryLogs({ limit: 10 });
      setLogs(entries);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }, [logger]);

  const loadConstellations = useCallback(async () => {
    try {
      const [constellationItems, ritualItems] = await Promise.all([
        constellationOS.listConstellations(false),
        ritualOS.getRitualDefinitions()
      ]);
      setConstellations(constellationItems);
      setRituals(ritualItems);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [constellationOS, ritualOS]);

  useEffect(() => {
    loadLogs();
    loadConstellations();
  }, [loadLogs, loadConstellations]);

  useEffect(() => {
    if (!autoRefresh) return;

    // Listen to events that trigger logging
    const handleEvent = () => {
      loadLogs();
    };

    bus.on('SessionEnded', handleEvent);
    bus.on('RitualCompleted', handleEvent);
    bus.on('NoteCreated', handleEvent);
    bus.on('TaskCompleted', handleEvent);

    return () => {
      bus.off('SessionEnded', handleEvent);
      bus.off('RitualCompleted', handleEvent);
      bus.off('NoteCreated', handleEvent);
      bus.off('TaskCompleted', handleEvent);
    };
  }, [bus, autoRefresh, loadLogs]);

  const getConstellationForLog = (log: LogEntry) => {
    return constellations.find(c => c.id === log.constellationId);
  };

  const getRitualForLog = (log: LogEntry) => {
    return rituals.find(r => r.id === log.ritualId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
          Recent Logs ({logs.length})
        </h3>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>

          <button
            onClick={loadLogs}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: '#9ca3af',
          fontStyle: 'italic',
          background: '#f9fafb',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
        }}>
          No logs yet. Complete a session or create a journal entry to see logs here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => {
            const constellation = getConstellationForLog(log);
            const ritual = getRitualForLog(log);
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                style={{
                  padding: 12,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13,
                }}
              >
                <div
                  onClick={() => toggleExpanded(log.id)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {formatTimestamp(log.timestamp)} - {log.eventType}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>

                  {constellation && (
                    <div style={{ fontSize: 12, color: constellation.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>├─ Constellation:</span>
                      <span style={{ fontWeight: 500 }}>
                        {constellation.icon} {constellation.name}
                      </span>
                    </div>
                  )}

                  {log.ritualId && (
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      ├─ Ritual: <span style={{ fontWeight: 500 }}>{ritual?.name || log.ritualId}</span>
                    </div>
                  )}

                  {log.eventType === 'NoteCreated' && typeof log.payload === 'object' && log.payload !== null && 'text' in log.payload && (
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      └─ Text: &quot;{String(log.payload.text).substring(0, 50)}{String(log.payload.text).length > 50 ? '...' : ''}&quot;
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 8,
                      background: '#f9fafb',
                      borderRadius: 4,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: '#374151',
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
