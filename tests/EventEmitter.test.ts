import { EventEmitter, BaseEvent } from '../src';

// Test event classes
interface ITestData {
  message: string;
  value: number;
}

interface IComplexData {
  user: { id: string; name: string };
  metadata: { timestamp: Date; source: string };
}

class TestEvent extends BaseEvent<ITestData> {}
class ComplexEvent extends BaseEvent<IComplexData> {}
class EmptyEvent extends BaseEvent<{}> {}

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('Basic functionality', () => {
    it('should register and emit events', () => {
      const mockListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.on(TestEvent, mockListener);
      const result = emitter.emit(TestEvent, testData);

      expect(result).toBe(true);
      expect(mockListener).toHaveBeenCalledWith(testData);
      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('should return false when no listeners are registered', () => {
      const testData: ITestData = { message: 'test', value: 42 };
      const result = emitter.emit(TestEvent, testData);

      expect(result).toBe(false);
    });

    it('should handle multiple listeners for the same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.on(TestEvent, listener1);
      emitter.on(TestEvent, listener2);

      const result = emitter.emit(TestEvent, testData);

      expect(result).toBe(true);
      expect(listener1).toHaveBeenCalledWith(testData);
      expect(listener2).toHaveBeenCalledWith(testData);
    });

    it('should handle complex data types', () => {
      const mockListener = jest.fn();
      const complexData: IComplexData = {
        user: { id: '123', name: 'Alice' },
        metadata: { timestamp: new Date(), source: 'test' }
      };

      emitter.on(ComplexEvent, mockListener);
      emitter.emit(ComplexEvent, complexData);

      expect(mockListener).toHaveBeenCalledWith(complexData);
    });
  });

  describe('Event removal', () => {
    it('should remove specific listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.on(TestEvent, listener1);
      emitter.on(TestEvent, listener2);
      emitter.off(TestEvent, listener1);

      emitter.emit(TestEvent, testData);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith(testData);
    });

    it('should remove all listeners for an event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.on(TestEvent, listener1);
      emitter.on(TestEvent, listener2);
      emitter.removeAllListeners(TestEvent);

      const result = emitter.emit(TestEvent, testData);

      expect(result).toBe(false);
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle removing non-existent listeners gracefully', () => {
      const listener = jest.fn();
      
      expect(() => {
        emitter.off(TestEvent, listener);
      }).not.toThrow();
    });
  });

  describe('Once functionality', () => {
    it('should execute once listeners only once', () => {
      const mockListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.once(TestEvent, mockListener);

      emitter.emit(TestEvent, testData);
      emitter.emit(TestEvent, testData);

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should work alongside regular listeners', () => {
      const onceListener = jest.fn();
      const regularListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.once(TestEvent, onceListener);
      emitter.on(TestEvent, regularListener);

      emitter.emit(TestEvent, testData);
      emitter.emit(TestEvent, testData);

      expect(onceListener).toHaveBeenCalledTimes(1);
      expect(regularListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling', () => {
    it('should handle listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.on(TestEvent, errorListener);
      emitter.on(TestEvent, normalListener);

      const result = emitter.emit(TestEvent, testData);

      expect(result).toBe(false); // Should return false due to error
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled(); // Other listeners should still execute
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Async functionality', () => {
    it('should handle async emission', async () => {
      const asyncListener = jest.fn().mockResolvedValue(undefined);
      const syncListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      emitter.on(TestEvent, asyncListener);
      emitter.on(TestEvent, syncListener);

      const result = await emitter.emitAsync(TestEvent, testData);

      expect(result).toBe(true);
      expect(asyncListener).toHaveBeenCalledWith(testData);
      expect(syncListener).toHaveBeenCalledWith(testData);
    });

    it('should handle async listener errors gracefully', async () => {
      const errorListener = jest.fn().mockRejectedValue(new Error('Async error'));
      const normalListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.on(TestEvent, errorListener);
      emitter.on(TestEvent, normalListener);

      const result = await emitter.emitAsync(TestEvent, testData);

      expect(result).toBe(true); // Async version continues execution
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return false for async emission with no listeners', async () => {
      const testData: ITestData = { message: 'test', value: 42 };
      const result = await emitter.emitAsync(TestEvent, testData);

      expect(result).toBe(false);
    });
  });

  describe('Handlers object', () => {
    it('should provide bound handlers', () => {
      const { on, off, emit, once, emitAsync, removeAllListeners } = emitter.handlers;
      const mockListener = jest.fn();
      const testData: ITestData = { message: 'test', value: 42 };

      on(TestEvent, mockListener);
      const result = emit(TestEvent, testData);

      expect(result).toBe(true);
      expect(mockListener).toHaveBeenCalledWith(testData);

      off(TestEvent, mockListener);
      const result2 = emit(TestEvent, testData);

      expect(result2).toBe(false);
    });
  });
});

describe('BaseEvent', () => {
  it('should generate unique event names', () => {
    expect(TestEvent.eventName).toContain('TestEvent');
    expect(ComplexEvent.eventName).toContain('ComplexEvent');
    expect(TestEvent.eventName).not.toBe(ComplexEvent.eventName);
  });

  it('should generate consistent event names', () => {
    const name1 = TestEvent.eventName;
    const name2 = TestEvent.eventName;
    
    expect(name1).toBe(name2);
  });

  it('should include hash in event name', () => {
    const eventName = TestEvent.eventName;
    expect(eventName).toMatch(/TestEvent\([a-f0-9]{4}\)/);
  });
});

describe('Event Inheritance', () => {
  let emitter: EventEmitter;

  interface IOrderData {
    orderId: string;
    amount: number;
  }

  class BaseOrderEvent extends BaseEvent<IOrderData> {}
  class OrderCreatedEvent extends BaseOrderEvent {}
  class OrderCancelledEvent extends BaseOrderEvent {}
  
  // Three-level inheritance
  class BaseNotificationEvent extends BaseEvent<{ message: string }> {}
  class AdminNotificationEvent extends BaseNotificationEvent {}
  class CriticalAdminEvent extends AdminNotificationEvent {}

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('Two-level inheritance', () => {
    it('should call parent class listeners when emitting child event', () => {
      const parentListener = jest.fn();
      const childListener = jest.fn();

      emitter.on(BaseOrderEvent, parentListener);
      emitter.on(OrderCreatedEvent, childListener);

      emitter.emit(OrderCreatedEvent, { orderId: '123', amount: 99.99 });

      expect(parentListener).toHaveBeenCalledWith({ orderId: '123', amount: 99.99 });
      expect(childListener).toHaveBeenCalledWith({ orderId: '123', amount: 99.99 });
      expect(parentListener).toHaveBeenCalledTimes(1);
      expect(childListener).toHaveBeenCalledTimes(1);
    });

    it('should not call child listeners when emitting parent event', () => {
      const parentListener = jest.fn();
      const childListener = jest.fn();

      emitter.on(BaseOrderEvent, parentListener);
      emitter.on(OrderCreatedEvent, childListener);

      emitter.emit(BaseOrderEvent, { orderId: '456', amount: 49.99 });

      expect(parentListener).toHaveBeenCalledTimes(1);
      expect(childListener).not.toHaveBeenCalled();
    });

    it('should work with multiple child events sharing same parent', () => {
      const parentListener = jest.fn();
      const createdListener = jest.fn();
      const cancelledListener = jest.fn();

      emitter.on(BaseOrderEvent, parentListener);
      emitter.on(OrderCreatedEvent, createdListener);
      emitter.on(OrderCancelledEvent, cancelledListener);

      emitter.emit(OrderCreatedEvent, { orderId: '123', amount: 99.99 });

      expect(parentListener).toHaveBeenCalledTimes(1);
      expect(createdListener).toHaveBeenCalledTimes(1);
      expect(cancelledListener).not.toHaveBeenCalled();

      emitter.emit(OrderCancelledEvent, { orderId: '456', amount: 49.99 });

      expect(parentListener).toHaveBeenCalledTimes(2);
      expect(createdListener).toHaveBeenCalledTimes(1);
      expect(cancelledListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Three-level inheritance', () => {
    it('should call all ancestor listeners', () => {
      const baseListener = jest.fn();
      const adminListener = jest.fn();
      const criticalListener = jest.fn();

      emitter.on(BaseNotificationEvent, baseListener);
      emitter.on(AdminNotificationEvent, adminListener);
      emitter.on(CriticalAdminEvent, criticalListener);

      emitter.emit(CriticalAdminEvent, { message: 'System failure' });

      expect(baseListener).toHaveBeenCalledWith({ message: 'System failure' });
      expect(adminListener).toHaveBeenCalledWith({ message: 'System failure' });
      expect(criticalListener).toHaveBeenCalledWith({ message: 'System failure' });
      expect(baseListener).toHaveBeenCalledTimes(1);
      expect(adminListener).toHaveBeenCalledTimes(1);
      expect(criticalListener).toHaveBeenCalledTimes(1);
    });

    it('should respect inheritance chain for middle-level events', () => {
      const baseListener = jest.fn();
      const adminListener = jest.fn();
      const criticalListener = jest.fn();

      emitter.on(BaseNotificationEvent, baseListener);
      emitter.on(AdminNotificationEvent, adminListener);
      emitter.on(CriticalAdminEvent, criticalListener);

      emitter.emit(AdminNotificationEvent, { message: 'Admin alert' });

      expect(baseListener).toHaveBeenCalledTimes(1);
      expect(adminListener).toHaveBeenCalledTimes(1);
      expect(criticalListener).not.toHaveBeenCalled();
    });
  });

  describe('Wildcard listening with BaseEvent', () => {
    it('should call BaseEvent listener for any event', () => {
      const wildcardListener = jest.fn();
      const specificListener = jest.fn();

      emitter.on(BaseEvent, wildcardListener);
      emitter.on(OrderCreatedEvent, specificListener);

      emitter.emit(OrderCreatedEvent, { orderId: '789', amount: 199.99 });

      expect(wildcardListener).toHaveBeenCalledWith({ orderId: '789', amount: 199.99 });
      expect(specificListener).toHaveBeenCalledWith({ orderId: '789', amount: 199.99 });
    });

    it('should call BaseEvent listener for direct BaseEvent emission', () => {
      const wildcardListener = jest.fn();

      emitter.on(BaseEvent, wildcardListener);
      emitter.emit(BaseEvent, { test: 'data' });

      expect(wildcardListener).toHaveBeenCalledWith({ test: 'data' });
      expect(wildcardListener).toHaveBeenCalledTimes(1);
    });

    it('should work as catch-all for multiple event types', () => {
      const wildcardListener = jest.fn();

      emitter.on(BaseEvent, wildcardListener);

      emitter.emit(TestEvent, { message: 'test', value: 1 });
      emitter.emit(OrderCreatedEvent, { orderId: '123', amount: 50 });
      emitter.emit(ComplexEvent, {
        user: { id: '1', name: 'Alice' },
        metadata: { timestamp: new Date(), source: 'test' }
      });

      expect(wildcardListener).toHaveBeenCalledTimes(3);
    });
  });

  describe('Async inheritance', () => {
    it('should call all inherited listeners in parallel', async () => {
      const callLog: string[] = [];

      emitter.on(BaseOrderEvent, async (order) => {
        await new Promise(resolve => setTimeout(resolve, 20));
        callLog.push('parent');
      });

      emitter.on(OrderCreatedEvent, async (order) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        callLog.push('child');
      });

      const startTime = Date.now();
      await emitter.emitAsync(OrderCreatedEvent, { orderId: '123', amount: 99.99 });
      const duration = Date.now() - startTime;

      expect(callLog).toContain('parent');
      expect(callLog).toContain('child');
      expect(duration).toBeLessThan(40); // Should be ~20ms (parallel), not 30ms (sequential)
    });

    it('should call BaseEvent listeners in parallel with specific listeners', async () => {
      const callLog: string[] = [];

      emitter.on(BaseEvent, async () => {
        await new Promise(resolve => setTimeout(resolve, 15));
        callLog.push('base');
      });

      emitter.on(OrderCreatedEvent, async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        callLog.push('specific');
      });

      const startTime = Date.now();
      await emitter.emitAsync(OrderCreatedEvent, { orderId: '456', amount: 49.99 });
      const duration = Date.now() - startTime;

      expect(callLog).toContain('base');
      expect(callLog).toContain('specific');
      expect(duration).toBeLessThan(35); // Should be ~15ms (parallel), not 25ms (sequential)
    });
  });

  describe('Inheritance with once', () => {
    it('should work with once listeners on parent classes', () => {
      const parentListener = jest.fn();
      const childListener = jest.fn();

      emitter.once(BaseOrderEvent, parentListener);
      emitter.on(OrderCreatedEvent, childListener);

      emitter.emit(OrderCreatedEvent, { orderId: '123', amount: 99.99 });
      emitter.emit(OrderCreatedEvent, { orderId: '456', amount: 49.99 });

      expect(parentListener).toHaveBeenCalledTimes(1);
      expect(childListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Inheritance with removeAllListeners', () => {
    it('should remove listeners independently for parent and child', () => {
      const parentListener = jest.fn();
      const childListener = jest.fn();

      emitter.on(BaseOrderEvent, parentListener);
      emitter.on(OrderCreatedEvent, childListener);

      emitter.removeAllListeners(OrderCreatedEvent);
      emitter.emit(OrderCreatedEvent, { orderId: '123', amount: 99.99 });

      expect(parentListener).toHaveBeenCalledTimes(1);
      expect(childListener).not.toHaveBeenCalled();
    });
  });
});