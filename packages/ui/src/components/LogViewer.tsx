import { useState, useEffect, useCallback } from 'react';
import type { EventBus, LogEntry, ConstellationDefinition, RitualDefinition } from '@lemos/core';
import type { UnifiedLogger } from '@lemos/modules-logger';
import type { ConstellationOS } from '@lemos/modules-constellation-os';
import type { RitualOS } from '@lemos/modules-ritual-os';
import { Button } from '../atoms';

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
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-text-primary">
          Recent Logs <span className="text-text-tertiary font-normal text-xs ml-1">({logs.length})</span>
        </h3>

        <div className="flex gap-3 items-center">
          <label className="text-xs text-text-secondary flex items-center gap-2 cursor-pointer hover:text-text-primary transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-border-default text-accent-primary focus:ring-accent-primary/20"
            />
            Auto-refresh
          </label>

          <Button
            onClick={loadLogs}
            size="sm"
            variant="secondary"
            className="!py-1 !px-2 text-xs h-7"
          >
            ↻ Refresh
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-6 text-center text-text-tertiary italic bg-bg-canvas rounded-lg border border-border-default text-sm">
          No logs yet. Complete a session or create a journal entry to see logs here.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => {
            const constellation = getConstellationForLog(log);
            const ritual = getRitualForLog(log);
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className={`p-3 bg-bg-surface border rounded-md transition-all duration-200 text-sm
                  ${isExpanded ? 'border-accent-primary/30 shadow-sm' : 'border-border-default hover:border-text-tertiary'}
                `}
              >
                <div
                  onClick={() => toggleExpanded(log.id)}
                  className="cursor-pointer flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <span className="font-mono text-xs text-text-tertiary">{formatTimestamp(log.timestamp)}</span>
                      <span>{log.eventType}</span>
                    </div>
                    <div className={`text-[10px] text-text-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>

                  {constellation && (
                    <div className="text-xs flex items-center gap-1.5" style={{ color: constellation.color }}>
                      <span>├─</span>
                      <span className="opacity-75">Constellation:</span>
                      <span className="font-medium flex items-center gap-1">
                        {constellation.icon} {constellation.name}
                      </span>
                    </div>
                  )}

                  {log.ritualId && (
                    <div className="text-xs text-text-secondary flex items-center gap-1.5 ml-[1px]">
                      <span className="text-text-tertiary">├─</span>
                      <span className="opacity-75">Ritual:</span>
                      <span className="font-medium text-text-primary">{ritual?.name || log.ritualId}</span>
                    </div>
                  )}

                  {log.eventType === 'NoteCreated' && typeof log.payload === 'object' && log.payload !== null && 'text' in log.payload && (
                    <div className="text-xs text-text-secondary flex items-center gap-1.5 ml-[1px]">
                      <span className="text-text-tertiary">└─</span>
                      <span className="italic opacity-90">&quot;{String(log.payload.text).substring(0, 50)}{String(log.payload.text).length > 50 ? '...' : ''}&quot;</span>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-2 p-2 bg-bg-canvas rounded border border-border-subtle text-[11px] font-mono text-text-secondary overflow-auto max-h-40">
                    <pre className="m-0 whitespace-pre-wrap break-all">
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
