/**
 * Strong Events - A strongly-typed event emitter for TypeScript
 * 
 * @packageDocumentation
 */

export { EventEmitter } from './EventEmitter';
export { BaseEvent } from './BaseEvent';
export { EmitInfo } from './EmitInfo';
export type { IEmitEvents } from './interfaces';
export type { ArgsExtractor, EventConstructor } from './BaseEvent';
export type { EventHandler } from './EmitInfo';

// Re-export for convenience
import { EventEmitter } from './EventEmitter';
export default EventEmitter;