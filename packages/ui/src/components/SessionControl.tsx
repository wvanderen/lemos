import { useState, useEffect } from 'react';
import type { EventBus, BaseEvent, SessionTickPayload } from '@lemos/core';
import type { SessionTimer } from '@lemos/modules-session-timer';
import { Button } from '../atoms';

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
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-text-primary">
        Focus Session
      </div>

      {state === 'Idle' ? (
        <Button
          onClick={handleStart}
          variant="primary"
          size="lg"
          fullWidth
          className="bg-gradient-to-br from-accent-primary to-purple-600 hover:from-accent-primary-hover hover:to-purple-500 shadow-glow transition-all duration-300"
        >
          Start 25min Focus
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-text-primary font-display mb-1">
              {formatTime(remaining)}
            </div>
            <div className="text-sm text-text-secondary">
              Elapsed: {formatTime(elapsed)}
            </div>
          </div>

          <div className="flex gap-3">
            {state === 'Running' ? (
              <Button
                onClick={handlePause}
                variant="warning"
                className="flex-1"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                variant="success"
                className="flex-1"
              >
                Resume
              </Button>
            )}
            <Button
              onClick={handleStop}
              variant="danger"
              className="flex-1"
            >
              Stop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
