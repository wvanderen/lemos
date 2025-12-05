export interface BaseEvent<T = unknown> {
    id: string;
    type: string;
    timestamp: string;
    payload: T;
}
export type EventListener<T = unknown> = (event: BaseEvent<T>) => void;
export interface LemOSModuleManifest {
    id: string;
    name: string;
    version: string;
}
export interface SessionStartedPayload {
    sessionId: string;
    intendedDuration: number;
}
export interface SessionTickPayload {
    sessionId: string;
    remaining: number;
    elapsed: number;
}
export interface SessionEndedPayload {
    sessionId: string;
    actualDuration: number;
    wasCompleted: boolean;
}
export interface EnergyUpdatedPayload {
    current: number;
    delta: number;
    source: string;
}
