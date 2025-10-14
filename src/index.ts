/**
 * Strong Events - A strongly-typed event emitter for TypeScript
 * 
 * @packageDocumentation
 */

export { EventEmitter } from './EventEmitter';
export { BaseEvent } from './EventEmitter';
export type { IEmitsEvents } from './EventEmitter';

// Re-export for convenience
import { EventEmitter } from './EventEmitter';
export default EventEmitter;