import { BaseEvent, EventConstructor } from './BaseEvent';
import { EventHandler } from './EmitInfo';

/**
 * Interface for objects that emit events and allow listener registration
 * Implement this to expose event subscription without exposing emit methods
 */
export interface IEmitEvents{
    on<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: EventHandler<T>): void;
    off<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: EventHandler<T>): void;
    once<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: EventHandler<T>): void;
}
