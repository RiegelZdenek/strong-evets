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
 * Base class for creating strongly-typed events
 * Can also be used directly as BaseEvent<any> for wildcard event listening
 * @template TArgs The type of data this event carries
 * 
 * @example
 * ```typescript
 * interface IUser { name: string; age: number; }
 * class UserCreatedEvent extends BaseEvent<IUser> {}
 * 
 * // Specific event listening
 * emitter.on(UserCreatedEvent, (user) => {
 *   console.log(user.name); // Fully typed!
 * });
 * 
 * // Wildcard event listening
 * emitter.on(BaseEvent, (data) => {
 *   console.log('Any event:', data); // Catches all events
 * });
 * ```
 */
export class BaseEvent<TArgs = any>{
    private static _eventNameCache = new Map<Function, string>();
    
    /**
     * This method is used for type inference only and is not meant to be called at runtime.
     * It helps TypeScript understand the argument type for this event.
     * @internal
     */
    protected __getArgsType(): TArgs {
        throw new Error('This method is for type inference only and should never be called');
    }
    
    /**
     * Gets the unique event name for this event class.
     * Generates a hash-based identifier to prevent collisions.
     * @returns A unique string identifier for this event type
     */
    static get eventName(): string {
        if (!this._eventNameCache.has(this)) {
            const hash = this.generateHash(this.name);
            const eventName = `${this.name}(${hash})`;
            this._eventNameCache.set(this, eventName);
        }
        return this._eventNameCache.get(this)!;
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
