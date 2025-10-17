import { EventEmitter, BaseEvent } from '../src';

// Define your data types
interface IUser {
    id: string;
    name: string;
    age: number;
    email: string;
}

interface IUserUpdate {
    oldUser: IUser;
    newUser: IUser;
}

// Create strongly-typed events
class UserCreatedEvent extends BaseEvent<IUser> {}
class UserUpdatedEvent extends BaseEvent<IUserUpdate> {}
class UserDeletedEvent extends BaseEvent<{ userId: string }> {}

// Create the event emitter
const userEventEmitter = new EventEmitter();

// Register type-safe event listeners
userEventEmitter.on(UserCreatedEvent, (user) => {
    console.log('✅ New user created:', user.name);
    console.log('   Email:', user.email);
    console.log('   Age:', user.age);
});

// You can optionally use emitInfo for metadata
userEventEmitter.on(UserUpdatedEvent, ({ oldUser, newUser }, emitInfo) => {
    console.log('📝 User updated:');
    console.log('   From:', oldUser.name);
    console.log('   To:', newUser.name);
    console.log('   Event:', emitInfo?.event.name);
});

userEventEmitter.on(UserDeletedEvent, ({ userId }) => {
    console.log('🗑️ User deleted:', userId);
});

// One-time listeners
userEventEmitter.once(UserCreatedEvent, (user) => {
    console.log('🎉 First user ever created:', user.name);
});

// Emit events with full type safety
console.log('=== Emitting Events ===\n');

const newUser: IUser = {
    id: '1',
    name: 'Alice Johnson',
    age: 30,
    email: 'alice@example.com'
};

// This is fully type-checked - you'll get IntelliSense!
userEventEmitter.emit(UserCreatedEvent, newUser);

const updatedUser: IUser = {
    ...newUser,
    name: 'Alice Smith',
    age: 31
};

userEventEmitter.emit(UserUpdatedEvent, {
    oldUser: newUser,
    newUser: updatedUser
});

userEventEmitter.emit(UserDeletedEvent, { userId: '1' });

// Create another user (note: the 'once' listener won't fire again)
userEventEmitter.emit(UserCreatedEvent, {
    id: '2',
    name: 'Bob Wilson',
    age: 25,
    email: 'bob@example.com'
});

// Example of error handling
const success = userEventEmitter.emit(UserCreatedEvent, {
    id: '3',
    name: 'Charlie Brown',
    age: 35,
    email: 'charlie@example.com'
});

if (success) {
    console.log('\n✅ Event emitted successfully');
} else {
    console.log('\n❌ Event emission failed or no listeners');
}