# Dopamine Hero API

## Events

### Listens To

#### SessionTick

Listens for every second of active session time to award Energy.

```typescript
{
  type: 'SessionTick',
  payload: {
    sessionId: string;
    remaining: number;  // seconds remaining
    elapsed: number;    // seconds elapsed
  }
}
```

**Behavior:**
- Awards energy based on current `energyPerSecond` rate (default: 1)
- Emits `EnergyUpdated` event after each tick

### Emits

#### EnergyUpdated

Emitted when Energy balance changes.

```typescript
{
  type: 'EnergyUpdated',
  payload: {
    current: number;  // new total energy
    delta: number;    // amount added (positive)
    source: string;   // identifier for what triggered the update (e.g., "session-abc123")
  }
}
```

## Public Methods

### getEnergy(): number

Returns the current Energy balance.

**Returns:** Integer representing total energy accumulated.

### setEnergyPerSecond(rate: number): void

Sets the energy accumulation rate.

**Parameters:**
- `rate`: Energy to award per second (must be >= 0)

**Usage:**
```typescript
hero.setEnergyPerSecond(2); // Double the energy rate
```

### getEnergyPerSecond(): number

Returns the current energy accumulation rate.

**Returns:** Energy awarded per second (default: 1)

## Reward Formula

```typescript
energyPerTick = energyPerSecond * 1  // 1 second per tick
```

**Examples (at default rate of 1 energy/second):**
- 10 seconds of focus → 10 Energy
- 1 minute of focus → 60 Energy
- 25 minutes of focus → 1500 Energy
