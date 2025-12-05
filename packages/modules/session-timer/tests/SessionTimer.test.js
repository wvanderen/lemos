import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@lemos/core';
import { SessionTimer } from '../src/domain/SessionTimer.js';
describe('SessionTimer', () => {
    let bus;
    let timer;
    beforeEach(() => {
        bus = new EventBus();
        timer = new SessionTimer(bus);
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('starts with Idle state', () => {
        expect(timer.getState()).toBe('Idle');
    });
    it('emits SessionStarted when starting a session', () => {
        const handler = vi.fn();
        bus.on('SessionStarted', handler);
        timer.startSession(25);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SessionStarted',
            payload: expect.objectContaining({
                intendedDuration: 25 * 60,
            }),
        }));
        expect(timer.getState()).toBe('Running');
    });
    it('throws error when starting a session while one is running', () => {
        timer.startSession(25);
        expect(() => timer.startSession(10)).toThrow('Cannot start a new session while one is already running');
    });
    it('emits SessionTick every second', () => {
        const handler = vi.fn();
        bus.on('SessionTick', handler);
        timer.startSession(1);
        vi.advanceTimersByTime(3000);
        expect(handler).toHaveBeenCalledTimes(3);
    });
    it('emits SessionEnded when timer completes', () => {
        const startHandler = vi.fn();
        const endHandler = vi.fn();
        bus.on('SessionStarted', startHandler);
        bus.on('SessionEnded', endHandler);
        timer.startSession(0.05);
        vi.advanceTimersByTime(3000);
        expect(endHandler).toHaveBeenCalledTimes(1);
        expect(endHandler).toHaveBeenCalledWith(expect.objectContaining({
            type: 'SessionEnded',
            payload: expect.objectContaining({
                wasCompleted: true,
                actualDuration: 3,
            }),
        }));
        expect(timer.getState()).toBe('Idle');
    });
    it('allows manual stop before completion', () => {
        const endHandler = vi.fn();
        bus.on('SessionEnded', endHandler);
        timer.startSession(25);
        vi.advanceTimersByTime(5000);
        timer.stopSession();
        expect(endHandler).toHaveBeenCalledTimes(1);
        expect(endHandler).toHaveBeenCalledWith(expect.objectContaining({
            payload: expect.objectContaining({
                wasCompleted: false,
                actualDuration: 5,
            }),
        }));
        expect(timer.getState()).toBe('Idle');
    });
    it('supports pause and resume', () => {
        const tickHandler = vi.fn();
        bus.on('SessionTick', tickHandler);
        timer.startSession(10);
        vi.advanceTimersByTime(2000);
        expect(tickHandler).toHaveBeenCalledTimes(2);
        timer.pauseSession();
        expect(timer.getState()).toBe('Paused');
        vi.advanceTimersByTime(3000);
        expect(tickHandler).toHaveBeenCalledTimes(2);
        timer.resumeSession();
        expect(timer.getState()).toBe('Running');
        vi.advanceTimersByTime(2000);
        expect(tickHandler).toHaveBeenCalledTimes(4);
    });
    it('tracks remaining and elapsed time correctly', () => {
        timer.startSession(1);
        expect(timer.getRemaining()).toBe(60);
        expect(timer.getElapsed()).toBe(0);
        vi.advanceTimersByTime(10000);
        expect(timer.getRemaining()).toBe(50);
        expect(timer.getElapsed()).toBe(10);
    });
});
