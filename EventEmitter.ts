type ArgsExtractor<T> = T extends BaseEvent<infer U> ? U : never
type EventConstructor<T> = (new () => T) & { eventName: string };

export abstract class BaseEvent<TArgs>{
    private static _eventName?: string;
    // This property is used for type inference only and is not meant to be accessed at runtime.
    private _!: TArgs;
    
    static get eventName(): string {
        if (!this._eventName) {
            const hash = this.generateHash(this.name);
            this._eventName = `${this.name}(${hash})`;
        }
        return this._eventName;
    }
    
    private static generateHash(name: string): string {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const char = name.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).substring(0, 4);
    }
}


export interface IEmitsEvents{
    on<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void;
    off<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void;
    once<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void;
}

export class EventEmitter{
    private listeners: Map<string, Function[]> = new Map();

    on<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void {
        const eventName = event.eventName;
        if(!this.listeners.has(eventName)){
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(listener);
    }

    off<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void {
        const eventName = event.eventName;
        if(this.listeners.has(eventName)){
            this.listeners.set(eventName, this.listeners.get(eventName)?.filter(l => l !== listener) || []);
            if (this.listeners.get(eventName)?.length === 0) {
                this.listeners.delete(eventName);
            }
        }
    }

    once<T extends BaseEvent<any>>(event: EventConstructor<T>, listener: (args: ArgsExtractor<T>) => void): void {
        const wrappedListener = (args: ArgsExtractor<T>) => {
            listener(args);
            this.off(event, wrappedListener);
        };
        this.on(event, wrappedListener);
    }

    removeAllListeners<T extends BaseEvent<any>>(event: EventConstructor<T>): void {
        const eventName = event.eventName;
        this.listeners.delete(eventName);
    }

    emit<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): boolean {
        const eventName = event.eventName;
        if(this.listeners.has(eventName)){
            try{
                this.listeners.get(eventName)?.forEach(listener => listener(args));
                return true;
            } catch (error) {
                console.error(`Error occurred while emitting event ${eventName}:`, error);
                return false;
            }
        }
        return false;
    }

    async emitAsync<T extends BaseEvent<any>>(event: EventConstructor<T>, args: ArgsExtractor<T>): Promise<boolean> {
        const eventName = event.eventName;
        if(this.listeners.has(eventName)){
            const promises = this.listeners.get(eventName)?.map(listener => 
                Promise.resolve().then(() => listener(args)).catch(error => {
                    console.error(`Error occurred while emitting event ${eventName}:`, error);
                })
            ) || [];
            await Promise.all(promises);
            return true;
        }
        return false;
    }

    readonly handlers = {
        on: this.on.bind(this),
        off: this.off.bind(this),
        once: this.once.bind(this),
        emit: this.emit.bind(this),
        emitAsync: this.emitAsync.bind(this),
        removeAllListeners: this.removeAllListeners.bind(this),
    };
}
    
