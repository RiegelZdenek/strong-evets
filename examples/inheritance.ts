import { EventEmitter, BaseEvent, EmitInfo } from '../src';

/**
 * Event Inheritance Example
 * 
 * This example demonstrates how to use event inheritance to create
 * hierarchical event systems where parent event listeners can catch
 * all child events.
 */

// Define data types
interface OrderData {
  orderId: string;
  amount: number;
  customerId: string;
}

interface NotificationData {
  message: string;
  timestamp: Date;
}

// Create a base event for all order-related events
class BaseOrderEvent extends BaseEvent<OrderData> {}

// Specific order events extend the base
class OrderCreatedEvent extends BaseOrderEvent {}
class OrderCancelledEvent extends BaseOrderEvent {}
class OrderCompletedEvent extends BaseOrderEvent {}

// Create notification hierarchy
class BaseNotificationEvent extends BaseEvent<NotificationData> {}
class UserNotificationEvent extends BaseNotificationEvent {}
class AdminNotificationEvent extends BaseNotificationEvent {}
class CriticalAdminEvent extends AdminNotificationEvent {}

const emitter = new EventEmitter();

console.log('=== Example 1: Two-Level Inheritance ===\n');

// Listen to ALL order events
emitter.on(BaseOrderEvent, (order) => {
  console.log(`📊 [Analytics] Order event tracked: ${order.orderId}`);
});

// Listen to specific order events
emitter.on(OrderCreatedEvent, (order) => {
  console.log(`✅ [Orders] New order created: ${order.orderId} ($${order.amount})`);
});

emitter.on(OrderCancelledEvent, (order) => {
  console.log(`❌ [Orders] Order cancelled: ${order.orderId}`);
});

// Emit different order events
emitter.emit(OrderCreatedEvent, {
  orderId: 'ORD-001',
  amount: 99.99,
  customerId: 'CUST-123'
});
// Output:
// 📊 [Analytics] Order event tracked: ORD-001
// ✅ [Orders] New order created: ORD-001 ($99.99)

console.log('');

emitter.emit(OrderCancelledEvent, {
  orderId: 'ORD-002',
  amount: 49.99,
  customerId: 'CUST-456'
});
// Output:
// 📊 [Analytics] Order event tracked: ORD-002
// ❌ [Orders] Order cancelled: ORD-002

console.log('\n=== Example 2: Three-Level Inheritance ===\n');

// Listen at different levels
emitter.on(BaseNotificationEvent, (notification) => {
  console.log(`📝 [Logger] ${notification.message}`);
});

emitter.on(AdminNotificationEvent, (notification) => {
  console.log(`👤 [Admin Panel] ${notification.message}`);
});

emitter.on(CriticalAdminEvent, (notification) => {
  console.log(`🚨 [ALERT] CRITICAL: ${notification.message}`);
});

// Emit a critical admin event - ALL THREE listeners fire!
emitter.emit(CriticalAdminEvent, {
  message: 'Database connection lost',
  timestamp: new Date()
});
// Output:
// 📝 [Logger] Database connection lost
// 👤 [Admin Panel] Database connection lost
// 🚨 [ALERT] CRITICAL: Database connection lost

console.log('\n=== Example 3: Wildcard Listening ===\n');

// Create a catch-all logger
emitter.on(BaseEvent, (data) => {
  console.log(`🔍 [Debug] Event fired with data:`, data);
});

emitter.emit(OrderCompletedEvent, {
  orderId: 'ORD-003',
  amount: 299.99,
  customerId: 'CUST-789'
});
// The BaseEvent listener catches this too!

console.log('\n=== Example 4: Async Inheritance (Parallel Execution) ===\n');

(async () => {
  const asyncEmitter = new EventEmitter();

  asyncEmitter.on(BaseOrderEvent, async (order) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`💾 [Database] Logged order ${order.orderId}`);
  });

  asyncEmitter.on(OrderCreatedEvent, async (order) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`📧 [Email] Confirmation sent for ${order.orderId}`);
  });

  const startTime = Date.now();
  await asyncEmitter.emitAsync(OrderCreatedEvent, {
    orderId: 'ORD-004',
    amount: 149.99,
    customerId: 'CUST-999'
  });
  const duration = Date.now() - startTime;

  console.log(`\n⚡ Both async operations completed in ~${duration}ms (parallel execution)`);
  console.log('   If sequential, it would have taken ~150ms!\n');
})();

console.log('\n=== Example 5: Practical Use Case - Event Bus ===\n');

class EventBus {
  private emitter = new EventEmitter();

  // Domain events
  subscribeToAllOrders(handler: (order: OrderData, emitInfo?: EmitInfo<BaseOrderEvent>) => void) {
    this.emitter.on(BaseOrderEvent, handler);
    return () => this.emitter.off(BaseOrderEvent, handler);
  }

  subscribeToOrderCreated(handler: (order: OrderData, emitInfo?: EmitInfo<OrderCreatedEvent>) => void) {
    this.emitter.on(OrderCreatedEvent, handler);
    return () => this.emitter.off(OrderCreatedEvent, handler);
  }

  publishOrderCreated(order: OrderData) {
    return this.emitter.emit(OrderCreatedEvent, order);
  }

  publishOrderCancelled(order: OrderData) {
    return this.emitter.emit(OrderCancelledEvent, order);
  }
}

const eventBus = new EventBus();

// Subscribe to all orders (for analytics)
const unsubscribe = eventBus.subscribeToAllOrders((order, emitInfo) => {
  console.log(`📈 [Analytics Dashboard] Order ${order.orderId} tracked`);
  console.log(`   Event type: ${emitInfo?.event.name}`);
});

// Subscribe to specific event (for order processing)
eventBus.subscribeToOrderCreated((order, emitInfo) => {
  console.log(`🏭 [Fulfillment] Processing order ${order.orderId}`);
  // Stop propagation to prevent parent listeners from executing
  emitInfo?.stopEventPropagation();
  console.log('   ⚠️  Propagation stopped - parent listeners will not run');
});

// Publish events
eventBus.publishOrderCreated({
  orderId: 'ORD-005',
  amount: 79.99,
  customerId: 'CUST-111'
});

console.log('');

eventBus.publishOrderCancelled({
  orderId: 'ORD-006',
  amount: 29.99,
  customerId: 'CUST-222'
});

// Clean up
unsubscribe();

console.log('\n=== Key Takeaways ===');
console.log('✅ Parent listeners catch child events automatically');
console.log('✅ Child listeners do NOT catch parent events');
console.log('✅ BaseEvent acts as a wildcard to catch ALL events');
console.log('✅ Async listeners in inheritance chain execute in parallel');
console.log('✅ stopEventPropagation() prevents parent listeners from executing');
console.log('✅ EmitInfo provides metadata about the current event emission');
console.log('✅ Perfect for analytics, logging, and event bus patterns\n');
