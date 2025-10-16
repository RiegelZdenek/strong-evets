# Strong Events

A strongly-typed event emitter for TypeScript that uses class-based event definitions to provide type safety.

[![npm version](https://badge.fury.io/js/@beautiful-types%2Fstrong-events.svg)](https://badge.fury.io/js/@beautiful-types%2Fstrong-events)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🔒 Type Safety**: Event payloads are typed at compile time.
- **🌳 Event Inheritance**: Create event hierarchies with automatic parent listener invocation.
- **🌐 Wildcard Listening**: Listen to all events or entire event families.
- **⚡ Async Support**: Built-in support for parallel async event handling.
- **📦 Zero Dependencies**: Lightweight and dependency-free.

## 🚀 Quick Start

### Installation

```bash
npm install @beautiful-types/strong-events
```

### Basic Usage

```typescript
import { EventEmitter, BaseEvent } from '@beautiful-types/strong-events';

// Define your event data types
interface IUser {
  name: string;
  age: number;
  email: string;
}

// Create strongly-typed events
class UserCreatedEvent extends BaseEvent<IUser> {}
class UserDeletedEvent extends BaseEvent<{ userId: string }> {}

// Create the event emitter
const emitter = new EventEmitter();

// Register type-safe listeners
emitter.on(UserCreatedEvent, (user) => {
  console.log(`New user: ${user.name}`); // user is fully typed as IUser
});

emitter.on(UserDeletedEvent, ({ userId }) => {
  console.log(`User ${userId} deleted`);
});

// Emit events with type checking
emitter.emit(UserCreatedEvent, {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
});

emitter.emit(UserDeletedEvent, { userId: '123' });
```

## 🔍 Comparison with String-Based Emitters

### Traditional Event Emitters

String-based event names are prone to typos and require manual type assertions.

```typescript
// Prone to typos and requires casting
emitter.on('user:created', (data: any) => {
  console.log(data.name); // No type safety, could be undefined
});

// A typo here ('user:create' instead of 'user:created') would fail silently.
emitter.emit('user:create', userData);
```

### Strong Events

Class-based events prevent typos and provide full type safety for payloads.

```typescript
// The event name is a class, so typos are impossible.
emitter.on(UserCreatedEvent, (user) => {
  console.log(user.name); // `user` is fully typed, so autocompletion works.
});

// The compiler ensures the payload matches the event's type definition.
emitter.emit(UserCreatedEvent, userData);
```

## 📚 API Reference

### EventEmitter

The main class for managing events.

#### Methods

- **`on<T>(event, listener)`**: Register an event listener.
- **`off<T>(event, listener)`**: Remove a specific listener.
- **`once<T>(event, listener)`**: Register a one-time listener.
- **`emit<T>(event, data)`**: Synchronously emit an event.
- **`emitAsync<T>(event, data)`**: Asynchronously emit an event.
- **`removeAllListeners<T>(event)`**: Remove all listeners for an event.

### BaseEvent<TArgs>

The base class for creating event types.

```typescript
class MyEvent extends BaseEvent<{ message: string }> {}
```

## ⚡ Async Support

Listeners can be synchronous or asynchronous. When using `emitAsync`, all listeners are executed in parallel.

```typescript
import { EventEmitter, BaseEvent } from '@beautiful-types/strong-events';

class FileProcessedEvent extends BaseEvent<{ filename: string }> {}

const emitter = new EventEmitter();

// Mix sync and async listeners
emitter.on(FileProcessedEvent, (file) => {
  console.log(`Processing: ${file.filename}`); // Sync
});

emitter.on(FileProcessedEvent, async (file) => {
  await uploadToCloud(file.filename); // Async
  console.log(`Uploaded: ${file.filename}`);
});

// All listeners execute in parallel.
await emitter.emitAsync(FileProcessedEvent, { filename: 'document.pdf' });
```

## 🌳 Event Inheritance

Events can inherit from a base event, allowing for structured event hierarchies.

```typescript
interface OrderData {
  orderId: string;
  amount: number;
}

// A base event for all order-related events
class BaseOrderEvent extends BaseEvent<OrderData> {}

// Specific order events that inherit from the base
class OrderCreatedEvent extends BaseOrderEvent {}
class OrderCancelledEvent extends BaseOrderEvent {}

const emitter = new EventEmitter();

// This listener will catch ALL events that inherit from BaseOrderEvent
emitter.on(BaseOrderEvent, (order) => {
  console.log(`Order event: ${order.orderId}`);
});

// This listener only catches OrderCreatedEvent
emitter.on(OrderCreatedEvent, (order) => {
  console.log(`Order created: ${order.orderId}`);
});

// Emitting OrderCreatedEvent will trigger BOTH listeners above.
emitter.emit(OrderCreatedEvent, { orderId: '123', amount: 99.99 });
// Output:
// "Order event: 123"
// "Order created: 123"
```

### Wildcard Listening with BaseEvent

You can listen to all events emitted by an emitter by subscribing to `BaseEvent`.

```typescript
// A catch-all listener for logging or debugging
emitter.on(BaseEvent, (data, eventType) => {
  console.log(`An event of type ${eventType.name} was fired.`);
});

emitter.emit(UserCreatedEvent, { name: 'Alice', age: 30, email: 'a@a.com' });
emitter.emit(OrderCreatedEvent, { orderId: '456', amount: 49.99 });
```

## 🛡️ Error Handling

An error thrown in one listener will not prevent other listeners from running. The `emit` method returns `false` if one or more listeners threw an error.

```typescript
emitter.on(MyEvent, (data) => {
  throw new Error('This listener failed.');
});

emitter.on(MyEvent, (data) => {
  console.log('This listener still runs.');
});

const success = emitter.emit(MyEvent, { test: true });
console.log(success); // false
```

## ⚙️ Performance

- Uses Maps for O(1) listener lookup.
- Automatically cleans up empty listener sets to manage memory.

## TypeScript Configuration

For best results, your `tsconfig.json` should have `strict` mode enabled.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM"]
  }
}
```

## Examples

The `/examples` directory contains more usage patterns:

- **`basic-usage.ts`**
- **`async-events.ts`**
- **`advanced-patterns.ts`**

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ and TypeScript**