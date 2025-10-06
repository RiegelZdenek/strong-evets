import { BaseEvent, EventEmitter } from './EventEmitter';


interface IUser{
    name: string;
    age: number;
    //...
}

export class NewUserEvent extends BaseEvent<IUser> {}


const userEventEmitter = new EventEmitter();

userEventEmitter.on(NewUserEvent, (user) => {
    console.log('New user created:', user);
});

userEventEmitter.emit(NewUserEvent, { name: 'Alice', age: 30 });