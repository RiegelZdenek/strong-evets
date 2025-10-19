import { BaseEvent, EventConstructor, ArgsExtractor } from './BaseEvent';
import { EmitInfo, EventHandler } from './EmitInfo';

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
export class EventEmitter{
    private listeners: Map<string, Function[]> = new Map();

    /**
     * Gathers all listeners from the inheritance chain for a given event
     * @param emitInfo When provided, allows listeners to control propagation
     */
    private *gatherInheritanceListeners<T extends BaseEvent<any>>(
        event: EventConstructor<T>, 
        emitInfo: EmitInfo<T> = null as any
    ): Generator<Function> {
        let currentClass = event;
        
        do {
            const eventName = currentClass.eventName;
            if (this.listeners.has(eventName)) {
                const listeners = this.listeners.get(eventName) || [];
                
                // Yield each listener at this level
                for (const listener of listeners) {
                    yield listener;
                }
                
                // After yielding all listeners at this level, check propagation
                if (emitInfo !== null && !emitInfo.shouldContinuePropagation) {
                    return; // Stop the generator
                }
            }

            // Stop if we've reached BaseEvent
            if (currentClass.eventName === BaseEvent.eventName) {
                break;
            }

            // Move to parent class
            const parentClass = Object.getPrototypeOf(currentClass.prototype)?.constructor;
            if (parentClass && parentClass.eventName) {
                currentClass = parentClass;
            } else {
                break;
            }
        } while (currentClass);
    }

    /**
     * Registers an event listener for the specified event type
     * 
     * @example
     * ```typescript
     * // Simple handler
     * emitter.on(UserCreatedEvent, (user) => {
     *   console.log('New user:', user.name);
     * });
     * 
     * // With emit control
     * emitter.on(UserCreatedEvent, (user, emitInfo) => {
     *   console.log('New user:', user.name);
     *   emitInfo.stopEventPropagation();
     * });
     * ```
     */
    on<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: EventHandler<T>): void {
        const eventName = event.eventName;
        if(!this.listeners.has(eventName)){
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(listener);
    }

    /**
     * Removes a specific event listener for the specified event type
     * 
     * @example
     * ```typescript
     * const handler = (user) => console.log(user.name);
     * emitter.on(UserCreatedEvent, handler);
     * emitter.off(UserCreatedEvent, handler);
     * ```
     */
    off<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: EventHandler<T>): void {
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
     * Registers a one-time event listener that automatically removes itself after being called
     * 
     * @example
     * ```typescript
     * emitter.once(UserCreatedEvent, (user) => {
     *   console.log('First user created:', user.name);
     * });
     * ```
     */
    once<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: EventHandler<T>): void {
        const wrappedListener: EventHandler<T> = (args, emitInfo) => {
            listener(args, emitInfo);
            this.off(event, wrappedListener);
        };
        this.on(event, wrappedListener);
    }

    /**
     * Removes all listeners for a specific event type
     * 
     * @example
     * ```typescript
     * emitter.removeAllListenersFor(UserCreatedEvent);
     * ```
     */
    removeAllListenersFor<T extends BaseEvent<any>>(event: EventConstructor<T>): void {
        const eventName = event.eventName;
        this.listeners.delete(eventName);
    }

    removeAllListeners(): void {
        this.listeners.clear();
    }

    /**
     * Synchronously emits an event to all registered listeners
     * @returns true if all listeners succeeded, false if any threw an error
     * 
     * @example
     * ```typescript
     * const success = emitter.emit(UserCreatedEvent, { name: 'Alice', age: 30 });
     * ```
     */
    emit<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): boolean {
        //create emit info object
        const emitInfo = new EmitInfo<T>(event);
        
        let hasError = false;
        for (const listener of this.gatherInheritanceListeners(event, emitInfo)) {
            try {
                listener(args, emitInfo);
            } catch (error) {
                console.error(`Error occurred while emitting event:`, error);
                hasError = true;
            }
        }

        return !hasError;
    }

    /**
     * Asynchronously emits an event to all registered listeners in parallel
     * Note: stopEventPropagation() has no effect in async mode
     * @returns Promise resolving to true if all listeners succeeded, false if any threw an error
     * 
     * @example
     * ```typescript
     * const success = await emitter.emitAsync(UserCreatedEvent, { name: 'Alice', age: 30 });
     * ```
     */
    async emitAsync<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): Promise<boolean> {
        const emitInfo = new EmitInfo<T>(event);
        const promises: Promise<boolean>[] = [];
        
        for (const listener of this.gatherInheritanceListeners(event)) {
            const promise = Promise.resolve()
                .then(async () => {
                    await listener(args, emitInfo);
                    return true;
                })
                .catch(error => {
                    console.error(`Error occurred while emitting event asynchronously:`, error);
                    return false;
                });
            
            promises.push(promise);
        }
        
        const results = await Promise.all(promises);
        
        // Return true if all listeners succeeded (or if there were no listeners)
        return results.every(success => success);
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
        removeAllListeners: this.removeAllListenersFor.bind(this),
    };
}