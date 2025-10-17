import { BaseEvent, EventConstructor } from './BaseEvent';

/**
 * Type definition for event handler functions
 * @template T The event type that extends BaseEvent
 */
export type EventHandler<T extends BaseEvent<any>> = (args: import('./BaseEvent').ArgsExtractor<T>, emitInfo?: EmitInfo<T>) => void;

/**
 * Information about the current event emission
 * @template T The event type that extends BaseEvent
 */
export class EmitInfo<T extends BaseEvent<any>> {
    /** The event constructor that was emitted */
    public readonly event: EventConstructor<T>;
    
    private _continuePropagation: boolean = true;

    constructor(event: EventConstructor<T>) {
        this.event = event;
    }

    /** Whether propagation should continue to parent event classes */
    get shouldContinuePropagation(): boolean {
        return this._continuePropagation;
    }

    /** Stops propagation to parent event classes (only works with emit(), not emitAsync()) */
    stopEventPropagation(): void {
        this._continuePropagation = false;
    }
}
