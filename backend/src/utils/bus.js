// Domain event bus. Services publish domain events here; the socket layer and the
// persistence layer subscribe. This decouples business logic from transport/storage.
import { EventEmitter } from 'events';
export const bus = new EventEmitter();
bus.setMaxListeners(50);
