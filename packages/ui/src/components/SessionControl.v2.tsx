import { useState, useEffect } from 'react';
import type { EventBus, BaseEvent, SessionTickPayload } from '@lemos/core';
import type { SessionTimer } from '@lemos/modules-session-timer';
import { Button, Panel, Badge } from '@lemos/ui';

interface SessionControlProps {
  bus: EventBus;
  timer: SessionTimer;
}

export function SessionControlV2({ bus, timer }: SessionControlProps): JSX.Element {
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

    return () => {
      bus.off('SessionTick', handleTick);
      bus.off('SessionStarted', handleStarted);
      bus.off('SessionEnded', handleEnded);
    };
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
    <Panel>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Focus Session</h3>
          {state !== 'Idle' && (
            <Badge variant={state === 'Running' ? 'success' : state === 'Paused' ? 'warning' : 'default'}>
              {state}
            </Badge>
          )}
        </div>

        {state === 'Idle' ? (
          /* Initial state */
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStart}
            >
              Start 25min Focus
            </Button>
          </div>
        ) : (
          /* Active session state */
          <div className="flex flex-col gap-4">
            {/* Timer display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-text-primary mb-2">
                {formatTime(remaining)}
              </div>
              <div className="text-sm text-text-secondary">
                Elapsed: {formatTime(elapsed)}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-2">
              {state === 'Running' ? (
                <Button
                  variant="warning"
                  onClick={handlePause}
                  className="flex-1"
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleResume}
                  className="flex-1"
                >
                  Resume
                </Button>
              )}
              <Button
                variant="danger"
                onClick={handleStop}
                className="flex-1"
              >
                Stop
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}