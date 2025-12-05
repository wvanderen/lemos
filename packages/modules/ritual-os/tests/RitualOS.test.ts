import { describe, expect, it, beforeEach } from 'vitest';
import { EventBus } from '@lemos/core';
import { RitualOS } from '../src/domain/RitualOS.js';
import morningAnchor from '../rituals/morning-anchor.json';

describe('RitualOS', () => {
  let bus: EventBus;
  let ritualOS: RitualOS;

  beforeEach(() => {
    bus = new EventBus();
    ritualOS = new RitualOS(bus, [morningAnchor]);
  });

  it('loads ritual definitions', () => {
    const rituals = ritualOS.getRitualDefinitions();
    expect(rituals).toHaveLength(1);
    expect(rituals[0].id).toBe('morning-anchor');
  });

  it('retrieves ritual definition by id', () => {
    const ritual = ritualOS.getRitualDefinition('morning-anchor');
    expect(ritual).toBeDefined();
    expect(ritual?.name).toBe('Morning Anchor');
    expect(ritual?.steps).toHaveLength(3);
  });

  it('starts with no active ritual', () => {
    expect(ritualOS.getActiveRitual()).toBeNull();
  });

  it('starts a ritual', () => {
    const events: any[] = [];
    bus.on('RitualStarted', (event) => events.push(event));

    ritualOS.startRitual('morning-anchor');

    expect(events).toHaveLength(1);
    expect(events[0].payload.ritualId).toBe('morning-anchor');
    expect(ritualOS.getActiveRitual()).not.toBeNull();
  });

  it('completes ritual steps', () => {
    const stepEvents: any[] = [];
    const completeEvents: any[] = [];

    bus.on('RitualStepCompleted', (event) => stepEvents.push(event));
    bus.on('RitualCompleted', (event) => completeEvents.push(event));

    ritualOS.startRitual('morning-anchor');

    // Complete all 3 steps
    ritualOS.completeStep(); // Step 1
    expect(stepEvents).toHaveLength(1);
    expect(ritualOS.getActiveRitual()?.currentStepIndex).toBe(1);

    ritualOS.completeStep(); // Step 2
    expect(stepEvents).toHaveLength(2);
    expect(ritualOS.getActiveRitual()?.currentStepIndex).toBe(2);

    ritualOS.completeStep(); // Step 3 - completes ritual
    expect(stepEvents).toHaveLength(3);
    expect(completeEvents).toHaveLength(1);
    expect(ritualOS.getActiveRitual()).toBeNull();
  });

  it('abandons an active ritual', () => {
    const events: any[] = [];
    bus.on('RitualAbandoned', (event) => events.push(event));

    ritualOS.startRitual('morning-anchor');
    ritualOS.abandonRitual();

    expect(events).toHaveLength(1);
    expect(ritualOS.getActiveRitual()).toBeNull();
  });

  it('throws error when starting ritual that does not exist', () => {
    expect(() => ritualOS.startRitual('nonexistent')).toThrow('Ritual not found');
  });

  it('throws error when completing step without active ritual', () => {
    expect(() => ritualOS.completeStep()).toThrow('No active ritual');
  });
});
