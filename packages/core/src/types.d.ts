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
