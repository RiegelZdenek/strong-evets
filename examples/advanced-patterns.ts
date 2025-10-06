import { EventEmitter, BaseEvent } from '../src';
import { ArgsExtractor, EventConstructor } from '../src/EventEmitter';

// Advanced patterns and use cases

// 1. Domain Events Pattern
interface IOrderData {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    total: number;
}

interface IPaymentData {
    orderId: string;
    amount: number;
    method: 'card' | 'paypal' | 'bank';
    transactionId: string;
}

interface IShippingData {
    orderId: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    estimatedDelivery: Date;
}

// Domain events
class OrderCreatedEvent extends BaseEvent<IOrderData> {}
class PaymentProcessedEvent extends BaseEvent<IPaymentData> {}
class OrderShippedEvent extends BaseEvent<IShippingData> {}
class OrderCancelledEvent extends BaseEvent<{ orderId: string; reason: string }> {}

// Create a domain-specific event emitter
class OrderService {
    private events = new EventEmitter();
    
    // Expose event handlers for external systems
    get eventHandlers() {
        return this.events.handlers;
    }
    
    async createOrder(orderData: IOrderData): Promise<boolean> {
        try {
            // Business logic here...
            console.log(`📦 Creating order ${orderData.orderId}`);
            
            // Emit domain event
            return this.events.emit(OrderCreatedEvent, orderData);
        } catch (error) {
            console.error('Failed to create order:', error);
            return false;
        }
    }
    
    async processPayment(paymentData: IPaymentData): Promise<boolean> {
        console.log(`💳 Processing payment for order ${paymentData.orderId}`);
        return this.events.emit(PaymentProcessedEvent, paymentData);
    }
    
    async shipOrder(shippingData: IShippingData): Promise<boolean> {
        console.log(`🚚 Shipping order ${shippingData.orderId}`);
        return this.events.emit(OrderShippedEvent, shippingData);
    }
    
    async cancelOrder(orderId: string, reason: string): Promise<boolean> {
        console.log(`❌ Cancelling order ${orderId}: ${reason}`);
        return this.events.emit(OrderCancelledEvent, { orderId, reason });
    }
}

// 2. Event Aggregation Pattern
class EventAggregator {
    private emitter = new EventEmitter();
    
    // Generic subscribe method
    subscribe<T extends BaseEvent<any>>(
        eventType: EventConstructor<T>,
        handler: (data: ArgsExtractor<T>) => void | Promise<void>
    ) {
        this.emitter.on(eventType, handler);
        
        // Return unsubscribe function
        return () => this.emitter.off(eventType, handler);
    }
    
    // Generic publish method
    async publish<T extends BaseEvent<any>>(
        eventType: EventConstructor<T>,
        data: ArgsExtractor<T>
    ): Promise<boolean> {
        return this.emitter.emitAsync(eventType, data);
    }
}

// 3. Saga Pattern (Event Choreography)
class OrderSaga {
    constructor(private eventAggregator: EventAggregator) {
        this.setupSaga();
    }
    
    private setupSaga() {
        // When order is created, process payment
        this.eventAggregator.subscribe(OrderCreatedEvent, async (order) => {
            console.log(`🎭 Saga: Order created, initiating payment for ${order.orderId}`);
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await this.eventAggregator.publish(PaymentProcessedEvent, {
                orderId: order.orderId,
                amount: order.total,
                method: 'card',
                transactionId: `txn_${Date.now()}`
            });
        });
        
        // When payment is processed, ship the order
        this.eventAggregator.subscribe(PaymentProcessedEvent, async (payment) => {
            console.log(`🎭 Saga: Payment processed, shipping order ${payment.orderId}`);
            
            // Simulate shipping preparation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await this.eventAggregator.publish(OrderShippedEvent, {
                orderId: payment.orderId,
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    postalCode: '12345',
                    country: 'USA'
                },
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
        });
        
        // When order is shipped, log completion
        this.eventAggregator.subscribe(OrderShippedEvent, (shipping) => {
            console.log(`🎭 Saga: Order ${shipping.orderId} shipped successfully!`);
            console.log(`   Estimated delivery: ${shipping.estimatedDelivery.toDateString()}`);
        });
    }
}

// 4. Event Sourcing Pattern
interface IEventStore {
    eventId: string;
    eventType: string;
    eventData: any;
    timestamp: Date;
    aggregateId: string;
}

class EventStore {
    private events: IEventStore[] = [];
    private eventEmitter = new EventEmitter();
    
    async appendEvent<T extends BaseEvent<any>>(
        eventType: EventConstructor<T>,
        eventData: ArgsExtractor<T>,
        aggregateId: string
    ): Promise<void> {
        const eventRecord: IEventStore = {
            eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventType: eventType.name,
            eventData,
            timestamp: new Date(),
            aggregateId
        };
        
        this.events.push(eventRecord);
        console.log(`📝 Event stored: ${eventRecord.eventType} for ${aggregateId}`);
        
        // Emit the event for real-time processing
        await this.eventEmitter.emitAsync(eventType, eventData);
    }
    
    getEvents(aggregateId: string): IEventStore[] {
        return this.events.filter(e => e.aggregateId === aggregateId);
    }
    
    getAllEvents(): IEventStore[] {
        return [...this.events];
    }
    
    subscribe<T extends BaseEvent<any>>(
        eventType: EventConstructor<T>,
        handler: (data: ArgsExtractor<T>) => void | Promise<void>
    ) {
        this.eventEmitter.on(eventType, handler);
    }
}

// Demo function
async function runAdvancedPatterns() {
    console.log('=== Advanced Event Patterns Demo ===\n');
    
    // 1. Domain Events
    console.log('1. Domain Events Pattern:');
    const orderService = new OrderService();
    
    // External systems can subscribe to domain events
    orderService.eventHandlers.on(OrderCreatedEvent, (order) => {
        console.log(`   📊 Analytics: New order ${order.orderId} worth $${order.total}`);
    });
    
    orderService.eventHandlers.on(PaymentProcessedEvent, (payment) => {
        console.log(`   💰 Finance: Payment ${payment.transactionId} processed`);
    });
    
    // 2. Event Aggregation with Saga
    console.log('\n2. Event Aggregation + Saga Pattern:');
    const eventAggregator = new EventAggregator();
    const orderSaga = new OrderSaga(eventAggregator);
    
    // 3. Event Sourcing
    console.log('\n3. Event Sourcing Pattern:');
    const eventStore = new EventStore();
    
    eventStore.subscribe(OrderCreatedEvent, (order) => {
        console.log(`   📚 Read Model: Updating order projection for ${order.orderId}`);
    });
    
    // Execute the workflow
    const sampleOrder: IOrderData = {
        orderId: 'ORD-001',
        customerId: 'CUST-123',
        items: [
            { productId: 'PROD-1', quantity: 2, price: 29.99 },
            { productId: 'PROD-2', quantity: 1, price: 49.99 }
        ],
        total: 109.97
    };
    
    // Start the order process
    await orderService.createOrder(sampleOrder);
    
    // Trigger saga via event aggregator
    console.log('\n   Triggering saga workflow...');
    await eventAggregator.publish(OrderCreatedEvent, sampleOrder);
    
    // Store events for event sourcing
    await eventStore.appendEvent(OrderCreatedEvent, sampleOrder, sampleOrder.orderId);
    
    // Show stored events
    setTimeout(() => {
        console.log('\n4. Event Store Contents:');
        const storedEvents = eventStore.getAllEvents();
        storedEvents.forEach(event => {
            console.log(`   📦 ${event.eventType} - ${event.timestamp.toISOString()}`);
        });
    }, 3000);
}

runAdvancedPatterns().catch(console.error);