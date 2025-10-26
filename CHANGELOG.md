# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2025-10-26

### Fixed
- Fixed type inference mechanism in `BaseEvent` to prevent TypeScript from stripping the type information during compilation
- Replaced `private _!: TArgs;` field with `protected __getArgsType(): TArgs` method to ensure type information is preserved in compiled output

## [2.1.1] - 2025-10-19

### Changed
- Renamed `removeAllListeners(event)` to `removeAllListenersFor(event)` for better clarity
- Added new `removeAllListeners()` method (no parameters) to remove all listeners for all events

### Fixed
- Updated documentation to reflect new method names
- Updated all tests to use the new method names

## [2.1.0] - 2025-10-18

### Added
- **EmitInfo**: New optional second parameter for event handlers containing emission metadata
- **Event Propagation Control**: Added `stopEventPropagation()` method to prevent events from bubbling to parent event classes
- New `EmitInfo` class with `event`, `shouldContinuePropagation` properties and `stopEventPropagation()` method
- Comprehensive documentation for propagation control features in README
- 19 new tests covering EmitInfo and propagation control functionality

### Changed
- Event handlers now receive optional `emitInfo` parameter: `(args, emitInfo?) => void`
- Return value semantics: `emit()` and `emitAsync()` now return `true` if no errors occurred, `false` otherwise (previously based on listener count)
- Refactored codebase into modular files for better maintainability:
  - `BaseEvent.ts` - Base event class and core types
  - `EmitInfo.ts` - Emission information and event handler types
  - `EventEmitter.ts` - Main emitter logic (reduced from 339 to 217 lines)
  - `interfaces.ts` - Interface definitions
- Improved async listener handling to properly await async functions

### Fixed
- Async event emission now correctly awaits async listener functions

### Documentation
- Updated README with EmitInfo and propagation control examples
- Added clear notes about propagation control limitations in async mode
- Improved API documentation clarity

### Notes
- **Backward Compatible**: The `emitInfo` parameter is optional, so existing code continues to work
- Propagation control only works with synchronous `emit()`, not `emitAsync()` (by design)

## [1.0.0] - 2025-10-06

### Added
- Initial release of Strong Events
- Strongly-typed event emitter with class-based event definitions
- Support for both synchronous and asynchronous event emission
- Comprehensive error handling with resilience
- TypeScript support with full type inference
- Event listener management (on, off, once, removeAllListeners)
- Automatic memory cleanup for empty listener arrays
- Hash-based event naming to prevent collisions
- Complete JSDoc documentation
- Comprehensive test suite
- Multiple usage examples