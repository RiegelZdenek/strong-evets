import { EventEmitter, BaseEvent } from '../src';

// Async event handling example
interface IFileOperation {
    filename: string;
    size: number;
}

interface IApiRequest {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
}

class FileUploadedEvent extends BaseEvent<IFileOperation> {}
class ApiRequestEvent extends BaseEvent<IApiRequest> {}
class TaskCompletedEvent extends BaseEvent<{ taskId: string; result: any }> {}

const asyncEmitter = new EventEmitter();

// Register async event listeners
asyncEmitter.on(FileUploadedEvent, async (file) => {
    console.log(`🔄 Processing file: ${file.filename}`);
    
    // Simulate async file processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ File processed: ${file.filename} (${file.size} bytes)`);
});

asyncEmitter.on(FileUploadedEvent, async (file) => {
    console.log(`📊 Analyzing file: ${file.filename}`);
    
    // Simulate async analysis
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`📈 Analysis complete for: ${file.filename}`);
});

asyncEmitter.on(ApiRequestEvent, async (request) => {
    console.log(`🌐 Making ${request.method} request to ${request.endpoint}`);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log(`✅ API request successful: ${request.endpoint}`);
    } catch (error) {
        console.error(`❌ API request failed: ${request.endpoint}`, error);
    }
});

// Error handling in async context
asyncEmitter.on(TaskCompletedEvent, async (task) => {
    console.log(`📋 Task ${task.taskId} completed`);
    
    // Simulate an error in one listener
    if (task.taskId === 'error-task') {
        throw new Error('Simulated async error');
    }
    
    console.log(`💾 Task result saved: ${JSON.stringify(task.result)}`);
});

// Demonstrate async emission
async function runAsyncExample() {
    console.log('=== Async Event Emission Example ===\n');
    
    // Emit events asynchronously
    console.log('Emitting FileUploadedEvent...');
    await asyncEmitter.emitAsync(FileUploadedEvent, {
        filename: 'document.pdf',
        size: 1024000
    });
    
    console.log('\nEmitting ApiRequestEvent...');
    await asyncEmitter.emitAsync(ApiRequestEvent, {
        endpoint: '/api/users',
        method: 'GET'
    });
    
    console.log('\nEmitting TaskCompletedEvent (success)...');
    await asyncEmitter.emitAsync(TaskCompletedEvent, {
        taskId: 'task-123',
        result: { status: 'success', data: [1, 2, 3] }
    });
    
    console.log('\nEmitting TaskCompletedEvent (with error)...');
    await asyncEmitter.emitAsync(TaskCompletedEvent, {
        taskId: 'error-task',
        result: { status: 'error' }
    });
    
    console.log('\n🎯 All async events completed!');
}

// Mixed sync/async listeners
class MixedEvent extends BaseEvent<{ message: string }> {}

asyncEmitter.on(MixedEvent, (data) => {
    // Synchronous listener
    console.log(`🔄 Sync listener: ${data.message}`);
});

asyncEmitter.on(MixedEvent, async (data) => {
    // Asynchronous listener
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`⚡ Async listener: ${data.message}`);
});

async function runMixedExample() {
    console.log('\n=== Mixed Sync/Async Listeners ===\n');
    
    await asyncEmitter.emitAsync(MixedEvent, {
        message: 'This event has both sync and async listeners'
    });
    
    console.log('✅ Mixed event handling complete');
}

// Run the examples
runAsyncExample()
    .then(() => runMixedExample())
    .catch(console.error);