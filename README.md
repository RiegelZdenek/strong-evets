# Strong Events 🎯

A **strongly-typed event emitter** for TypeScript that uses class-based event definitions to provide complete type safety and an exceptional developer experience.

[![npm version](https://badge.fury.io/js/strong-events.svg)](https://badge.fury.io/js/strong-events)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🔒 Complete Type Safety** - Event payloads are fully typed at compile time
- **🎨 Intuitive API** - Uses classes as event identifiers instead of error-prone strings
- **⚡ Excellent DX** - Full IntelliSense support for events and payloads
- **🚀 Zero Dependencies** - Lightweight and fast
- **🔄 Async Support** - Built-in support for both sync and async event handling
- **🛡️ Error Resilience** - Individual listener failures don't break other listeners
- **📦 Modern TypeScript** - Uses advanced TypeScript features for maximum safety

## 🚀 Quick Start

### Installation

```bash
npm install strong-events
```

### Basic Usage

```typescript
import { EventEmitter, BaseEvent } from 'strong-events';

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
  console.log(`New user: ${user.name}`); // user is fully typed as IUser!
});

emitter.on(UserDeletedEvent, ({ userId }) => {
  console.log(`User ${userId} deleted`); // Destructuring works perfectly
});

// Emit events with full type checking
emitter.emit(UserCreatedEvent, {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
});

emitter.emit(UserDeletedEvent, { userId: '123' });
```

## 🎯 Why Strong Events?

### Before (Traditional Event Emitters)

```typescript
// ❌ Stringly-typed - prone to typos
emitter.on('user:created', (data: any) => {
  console.log(data.name); // No type safety, could be undefined
});

// ❌ Easy to make mistakes
emitter.emit('user:create', userData); // Typo! Should be 'user:created'
```

### After (Strong Events)

```typescript
// ✅ Class-based - impossible to typo
emitter.on(UserCreatedEvent, (user) => {
  console.log(user.name); // Fully typed, IntelliSense works!
});

// ✅ Type-safe emission
emitter.emit(UserCreatedEvent, userData); // TypeScript catches mismatches
```

## 📚 API Reference

### EventEmitter

The main class for managing events.

#### Methods

- **`on<T>(event, listener)`** - Register an event listener
- **`off<T>(event, listener)`** - Remove a specific listener
- **`once<T>(event, listener)`** - Register a one-time listener
- **`emit<T>(event, data)`** - Synchronously emit an event
- **`emitAsync<T>(event, data)`** - Asynchronously emit an event
- **`removeAllListeners<T>(event)`** - Remove all listeners for an event

### BaseEvent<TArgs>

Abstract base class for creating event types.

```typescript
class MyEvent extends BaseEvent<{ message: string }> {}
```

## 🔄 Async Support

Strong Events provides excellent async support:

```typescript
import { EventEmitter, BaseEvent } from 'strong-events';

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

// Emit to all listeners (parallel execution)
await emitter.emitAsync(FileProcessedEvent, { filename: 'document.pdf' });
```

## 🏗️ Advanced Patterns

### Domain Events

```typescript
class OrderCreatedEvent extends BaseEvent<IOrder> {}
class PaymentProcessedEvent extends BaseEvent<IPayment> {}

class OrderService {
  private events = new EventEmitter();
  
  get eventHandlers() {
    return this.events.handlers;
  }
  
  async createOrder(order: IOrder) {
    // Business logic...
    return this.events.emit(OrderCreatedEvent, order);
  }
}

// External systems can subscribe
const orderService = new OrderService();
orderService.eventHandlers.on(OrderCreatedEvent, (order) => {
  // Handle order creation
});
```

### Event Aggregation

```typescript
class EventAggregator {
  private emitter = new EventEmitter();
  
  subscribe<T extends BaseEvent<any>>(
    eventType: EventConstructor<T>,
    handler: (data: ArgsExtractor<T>) => void
  ) {
    this.emitter.on(eventType, handler);
    return () => this.emitter.off(eventType, handler); // Unsubscribe
  }
  
  async publish<T extends BaseEvent<any>>(
    eventType: EventConstructor<T>,
    data: ArgsExtractor<T>
  ) {
    return this.emitter.emitAsync(eventType, data);
  }
}
```

## 🛡️ Error Handling

Strong Events is designed to be resilient:

```typescript
emitter.on(MyEvent, (data) => {
  throw new Error('Oops!'); // This won't break other listeners
});

emitter.on(MyEvent, (data) => {
  console.log('This still runs!'); // ✅ Still executes
});

const success = emitter.emit(MyEvent, { test: true });
console.log(success); // false - indicates an error occurred
```

## 📊 Performance

Strong Events is designed for performance:

- **Lightweight**: No external dependencies
- **Efficient**: Uses Maps for O(1) listener lookup
- **Memory-safe**: Automatically cleans up empty listener arrays
- **Hash-based**: Event names are hashed to prevent collisions

## 🔧 TypeScript Configuration

For the best experience, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM"]
  }
}
```

## 📦 Examples

Check out the `/examples` directory for comprehensive examples:

- **`basic-usage.ts`** - Getting started
- **`async-events.ts`** - Async/await patterns
- **`advanced-patterns.ts`** - Domain events, sagas, event sourcing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ and TypeScript**