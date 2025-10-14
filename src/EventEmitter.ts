/**
 * Utility type that extracts the argument type from a BaseEvent class
 * @template T The BaseEvent type to extract arguments from
 */
export type ArgsExtractor<T> = T extends BaseEvent<infer U> ? U : never

/**
 * Type definition for event constructor with static eventName property
 * @template T The event type
 */
export type EventConstructor<T extends BaseEvent<any>> = (new () => T) & { eventName: string };

/**
 * Abstract base class for creating strongly-typed events
 * @template TArgs The type of data this event carries
 * 
 * @example
 * ```typescript
 * interface IUser { name: string; age: number; }
 * class UserCreatedEvent extends BaseEvent<IUser> {}
 * 
 * // Usage
 * emitter.on(UserCreatedEvent, (user) => {
 *   console.log(user.name); // Fully typed!
 * });
 * ```
 */
export abstract class BaseEvent<TArgs>{
    private static _eventName?: string;
    
    /**
     * This property is used for type inference only and is not meant to be accessed at runtime.
     * It helps TypeScript understand the argument type for this event.
     */
    private _!: TArgs;
    
    /**
     * Gets the unique event name for this event class.
     * Generates a hash-based identifier to prevent collisions.
     * @returns A unique string identifier for this event type
     */
    static get eventName(): string {
        if (!this._eventName) {
            const hash = this.generateHash(this.name);
            this._eventName = `${this.name}(${hash})`;
        }
        return this._eventName;
    }
    
    /**
     * Generates a hash from the class name to create unique event identifiers
     * @param name The class name to hash
     * @returns A 4-character hexadecimal hash
     */
    private static generateHash(name: string): string {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const char = name.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).substring(0, 4);
    }
}

/**
 * Interface defining the contract for objects that can emit events
 * @template T The event type that extends BaseEvent
 */
export interface IEmitsEvents{
    on<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void;
    off<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void;
    once<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void;
    emit<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): boolean;
    emitAsync<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): Promise<boolean>;
    removeAllListeners<T extends BaseEvent<any>>(event: EventConstructor<T>): void;
}

/**
 * A strongly-typed event emitter that uses class-based event definitions
 * 
 * @example
 * ```typescript
 * import { EventEmitter, BaseEvent } from '@beautiful-types/strong-events';
 * 
 * interface IUser { name: string; age: number; }
 * class UserCreatedEvent extends BaseEvent<IUser> {}
 * 
 * const emitter = new EventEmitter();
 * 
 * // Type-safe event registration
 * emitter.on(UserCreatedEvent, (user) => {
 *   console.log(`User ${user.name} created`); // user is typed as IUser
 * });
 * 
 * // Type-safe event emission
 * emitter.emit(UserCreatedEvent, { name: 'Alice', age: 30 });
 * ```
 */
export class EventEmitter implements IEmitsEvents {
    private listeners: Map<string, Function[]> = new Map();

    /**
     * Registers an event listener for the specified event type
     * @template T The event type that extends BaseEvent
     * @param event The event class constructor
     * @param listener The callback function to execute when the event is emitted
     * 
     * @example
     * ```typescript
     * emitter.on(UserCreatedEvent, (user) => {
     *   console.log('New user:', user.name);
     * });
     * ```
     */
    on<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void {
        const eventName = event.eventName;
        if(!this.listeners.has(eventName)){
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(listener);
    }

    /**
     * Removes a specific event listener for the specified event type
     * @template T The event type that extends BaseEvent
     * @param event The event class constructor
     * @param listener The specific callback function to remove
     * 
     * @example
     * ```typescript
     * const handler = (user) => console.log(user.name);
     * emitter.on(UserCreatedEvent, handler);
     * emitter.off(UserCreatedEvent, handler); // Remove specific listener
     * ```
     */
    off<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void {
        const eventName = event.eventName;
        if(this.listeners.has(eventName)){
            const filtered = this.listeners.get(eventName)?.filter(l => l !== listener) || [];
            if (filtered.length === 0) {
                this.listeners.delete(eventName);
            } else {
                this.listeners.set(eventName, filtered);
            }
        }
    }

    /**
     * Registers a one-time event listener that will be automatically removed after being called once
     * @template T The event type that extends BaseEvent
     * @param event The event class constructor
     * @param listener The callback function to execute once when the event is emitted
     * 
     * @example
     * ```typescript
     * emitter.once(UserCreatedEvent, (user) => {
     *   console.log('First user created:', user.name);
     * }); // This will only fire once
     * ```
     */
    once<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void {
        const wrappedListener = (args: ArgsExtractor<T>) => {
            listener(args);
            this.off(event, wrappedListener);
        };
        this.on(event, wrappedListener);
    }

    /**
     * Removes all listeners for a specific event type
     * @template T The event type that extends BaseEvent
     * @param event The event class constructor
     * 
     * @example
     * ```typescript
     * emitter.removeAllListeners(UserCreatedEvent); // Remove all UserCreatedEvent listeners
     * ```
     */
    removeAllListeners<T extends BaseEvent<any>>(event: EventConstructor<T>): void {
        const eventName = event.eventName;
        this.listeners.delete(eventName);
    }

    /**
     * Synchronously emits an event to all registered listeners
     * @template T The event type that extends BaseEvent
     * @param event The event class constructor
     * @param args The event payload/arguments
     * @returns true if the event had listeners and was emitted successfully, false otherwise
     * 
     * @example
     * ```typescript
     * const success = emitter.emit(UserCreatedEvent, { name: 'Alice', age: 30 });
     * if (!success) {
     *   console.log('No listeners or emission failed');
     * }
     * ```
     */
    emit<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): boolean {
        const eventName = event.eventName;
        if(this.listeners.has(eventName)){
            const listeners = this.listeners.get(eventName) || [];
            let hasError = false;
            
            for (const listener of listeners) {
                try {
                    listener(args);
                } catch (error) {
                    console.error(`Error occurred while emitting event ${eventName}:`, error);
                    hasError = true;
                }
            }
            
            return !hasError;
        }
        return false;
    }

    /**
     * Asynchronously emits an event to all registered listeners
     * All listeners are executed in parallel, and individual listener errors are caught and logged
     * @template T The event type that extends BaseEvent
     * @param event The event class constructor
     * @param args The event payload/arguments
     * @returns Promise that resolves to true if the event had listeners, false otherwise
     * 
     * @example
     * ```typescript
     * const success = await emitter.emitAsync(UserCreatedEvent, { name: 'Alice', age: 30 });
     * if (success) {
     *   console.log('Event emitted to all listeners');
     * }
     * ```
     */
    async emitAsync<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): Promise<boolean> {
        const eventName = event.eventName;
        if(this.listeners.has(eventName)){
            const promises = this.listeners.get(eventName)?.map(listener => 
                Promise.resolve().then(() => listener(args)).catch(error => {
                    console.error(`Error occurred while emitting event ${eventName}:`, error);
                })
            ) || [];
            await Promise.all(promises);
            return true;
        }
        return false;
    }

    /**
     * Readonly object providing bound methods for event handling
     * Useful for passing around a subset of EventEmitter functionality
     * 
     * @example
     * ```typescript
     * const { on, off, emit } = emitter.handlers;
     * 
     * // Pass to other parts of your application
     * function setupUserEvents(handlers: typeof emitter.handlers) {
     *   handlers.on(UserCreatedEvent, handleUserCreated);
     * }
     * ```
     */
    readonly handlers = {
        on: this.on.bind(this),
        off: this.off.bind(this),
        once: this.once.bind(this),
        emit: this.emit.bind(this),
        emitAsync: this.emitAsync.bind(this),
        removeAllListeners: this.removeAllListeners.bind(this),
    };
}