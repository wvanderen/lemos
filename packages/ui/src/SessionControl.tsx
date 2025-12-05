import { useState, useEffect } from 'react';
import type { EventBus, BaseEvent, SessionTickPayload } from '@lemos/core';
import type { SessionTimer } from '@lemos/modules-session-timer';

interface SessionControlProps {
  bus: EventBus;
  timer: SessionTimer;
}

export function SessionControl({ bus, timer }: SessionControlProps): JSX.Element {
  const [state, setState] = useState<string>('Idle');
  const [remaining, setRemaining] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const handleTick = (event: BaseEvent<SessionTickPayload>) => {
      setRemaining(event.payload.remaining);
      setElapsed(event.payload.elapsed);
      setState(timer.getState());
    };

    const handleStarted = () => {
      setState('Running');
    };

    const handleEnded = () => {
      setState('Idle');
      setRemaining(0);
      setElapsed(0);
    };

    bus.on('SessionTick', handleTick);
    bus.on('SessionStarted', handleStarted);
    bus.on('SessionEnded', handleEnded);
  }, [bus, timer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    try {
      timer.startSession(25);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handlePause = () => {
    try {
      timer.pauseSession();
      setState('Paused');
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  };

  const handleResume = () => {
    try {
      timer.resumeSession();
      setState('Running');
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
  };

  const handleStop = () => {
    try {
      timer.stopSession();
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
        Focus Session
      </div>

      {state === 'Idle' ? (
        <button
          onClick={handleStart}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Start 25min Focus
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', textAlign: 'center' }}>
            {formatTime(remaining)}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
            Elapsed: {formatTime(elapsed)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {state === 'Running' ? (
              <button
                onClick={handlePause}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Resume
              </button>
            )}
            <button
              onClick={handleStop}
              style={{
                flex: 1,
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 600,
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
