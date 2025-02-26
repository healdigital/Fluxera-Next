// MessageChannel polyfill for Cloudflare Workers
(() => {
  // Only apply if MessageChannel is not already available
  if (!globalThis.MessageChannel) {
    const messagePorts = {};

    // Logging (disabled by default)
    const VERBOSE = true;
    const log = (prefix, ...args) => {
      if (VERBOSE) {
        console.log(`MessageChannel Polyfill ${prefix}:`, ...args);
      }
    };

    // UUID generator for port identification
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Simple event class
    class MessageEvent {
      constructor(data, ports = []) {
        this.data = data;
        this.ports = ports;
      }
    }

    // MessagePort implementation
    class MessagePort {
      constructor(uuid) {
        this._entangledPortUuid = null;
        this._listeners = {};
        this._messageQueue = [];
        this._messageQueueEnabled = false;

        this.uuid = uuid || generateUUID();
        messagePorts[this.uuid] = this;
        log('Port', `Created port ${this.uuid}`);
      }

      start() {
        setTimeout(() => {
          log('Port', `Starting port ${this.uuid}, draining ${this._messageQueue.length} messages`);

          while (this._messageQueueEnabled && this._messageQueue.length > 0) {
            const event = this._messageQueue.shift();
            this.dispatchEvent(event);
          }
        }, 0);

        this._messageQueueEnabled = true;
      }

      close() {
        this._messageQueueEnabled = false;

        if (this._entangledPortUuid) {
          const entangledPort = this._getEntangledPort();
          if (entangledPort) {
            entangledPort._entangledPortUuid = null;
          }
          this._entangledPortUuid = null;
        }

        log('Port', `Closed port ${this.uuid}`);
      }

      postMessage(message) {
        const entangledPort = this._getEntangledPort();

        if (!entangledPort) {
          log('Port', `Port ${this.uuid} not entangled, discarding message`, message);
          return;
        }

        log('Port', `Port ${this.uuid} posting message to ${entangledPort.uuid}`, message);

        // Create a structured clone of the message
        // In a real implementation, we would deep clone the message
        // For simplicity, we'll use JSON.stringify/parse as a basic clone
        let messageClone;
        try {
          messageClone = JSON.parse(JSON.stringify(message));
        } catch (e) {
          // Fall back to direct reference if not serializable
          messageClone = message;
        }

        const event = new MessageEvent(messageClone);
        entangledPort._enqueueEvent(event);
      }

      addEventListener(type, listener) {
        if (type !== 'message') return;

        if (!this._listeners[type]) {
          this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
        log('Port', `Added listener to port ${this.uuid} for ${type}`);
      }

      removeEventListener(type, listener) {
        if (!this._listeners[type]) return;

        const index = this._listeners[type].indexOf(listener);
        if (index !== -1) {
          this._listeners[type].splice(index, 1);
          log('Port', `Removed listener from port ${this.uuid} for ${type}`);
        }
      }

      dispatchEvent(event) {
        const listeners = this._listeners.message;
        if (!listeners) return;

        listeners.forEach(listener => {
          try {
            listener.call(this, event);
          } catch (err) {
            console.error(`Error in message listener on port ${this.uuid}:`, err);
          }
        });
      }

      _enqueueEvent(event) {
        if (this._messageQueueEnabled) {
          log('Port', `Port ${this.uuid} dispatching event immediately`);
          this.dispatchEvent(event);
        } else {
          log('Port', `Port ${this.uuid} queuing event for later`);
          this._messageQueue.push(event);
        }
      }

      _getEntangledPort() {
        if (!this._entangledPortUuid) return null;
        return messagePorts[this._entangledPortUuid];
      }
    }

    // MessageChannel constructor
    class MessageChannel {
      constructor() {
        const port1 = new MessagePort();
        const port2 = new MessagePort();

        // Connect the ports to each other
        port1._entangledPortUuid = port2.uuid;
        port2._entangledPortUuid = port1.uuid;

        this.port1 = port1;
        this.port2 = port2;

        log('Channel', `Created channel with ports ${port1.uuid} and ${port2.uuid}`);
      }
    }

    // Export to global scope
    globalThis.MessagePort = MessagePort;
    globalThis.MessageChannel = MessageChannel;
    globalThis.MessageEvent = MessageEvent;

    log('Setup', 'MessageChannel polyfill installed');
  }
})();