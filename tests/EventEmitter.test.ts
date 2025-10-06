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