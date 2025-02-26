// MessageChannel polyfill for Cloudflare Workers
(function installMessageChannelPolyfill() {
  // Ensure we're running in the correct global context
  const global = typeof globalThis !== 'undefined' ? globalThis :
    typeof self !== 'undefined' ? self :
      typeof window !== 'undefined' ? window :
        typeof global !== 'undefined' ? global : this;

  console.log("MessageChannel Polyfill: Starting installation");

  // If MessageChannel is already defined, don't override it
  if (global.MessageChannel) {
    console.log("MessageChannel Polyfill: Native implementation already exists");
    return;
  }

  // UUID generator for port identification
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Track all created ports
  const messagePorts = {};

  // Simple event class
  class MessageEvent {
    constructor(data, ports) {
      this.data = data;
      this.ports = ports || [];
      this.type = 'message';
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
      console.log(`MessageChannel Polyfill: Created port ${this.uuid}`);
    }

    start() {
      console.log(`MessageChannel Polyfill: Starting port ${this.uuid}`);

      // Use Promise.resolve().then to ensure async behavior
      Promise.resolve().then(() => {
        console.log(`MessageChannel Polyfill: Draining ${this._messageQueue.length} messages`);

        while (this._messageQueueEnabled && this._messageQueue.length > 0) {
          const event = this._messageQueue.shift();
          this.dispatchEvent(event);
        }
      });

      this._messageQueueEnabled = true;
    }

    close() {
      console.log(`MessageChannel Polyfill: Closing port ${this.uuid}`);
      this._messageQueueEnabled = false;

      if (this._entangledPortUuid) {
        const entangledPort = this._getEntangledPort();
        if (entangledPort) {
          entangledPort._entangledPortUuid = null;
        }
        this._entangledPortUuid = null;
      }

      // Clean up
      delete messagePorts[this.uuid];
    }

    postMessage(message) {
      const entangledPort = this._getEntangledPort();

      if (!entangledPort) {
        console.log(`MessageChannel Polyfill: Port ${this.uuid} not entangled, discarding message`);
        return;
      }

      console.log(`MessageChannel Polyfill: Port ${this.uuid} posting message to ${entangledPort.uuid}`);

      // Create a clone of the message
      // In a real implementation, we'd use structured clone algorithm
      // For simplicity, we use JSON as a basic approximation
      let messageClone;
      try {
        messageClone = JSON.parse(JSON.stringify(message));
      } catch (e) {
        console.log(`MessageChannel Polyfill: Message could not be cloned, using reference`);
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
      console.log(`MessageChannel Polyfill: Added listener to port ${this.uuid}`);
    }

    removeEventListener(type, listener) {
      if (!this._listeners[type]) return;

      const index = this._listeners[type].indexOf(listener);
      if (index !== -1) {
        this._listeners[type].splice(index, 1);
      }
    }

    dispatchEvent(event) {
      const listeners = this._listeners.message;
      if (!listeners) return;

      listeners.forEach(listener => {
        try {
          listener.call(this, event);
        } catch (err) {
          console.error(`MessageChannel Polyfill: Error in listener:`, err);
        }
      });
    }

    _enqueueEvent(event) {
      if (this._messageQueueEnabled) {
        console.log(`MessageChannel Polyfill: Port ${this.uuid} dispatching event immediately`);
        this.dispatchEvent(event);
      } else {
        console.log(`MessageChannel Polyfill: Port ${this.uuid} queuing event for later`);
        this._messageQueue.push(event);
      }
    }

    _getEntangledPort() {
      if (!this._entangledPortUuid) return null;
      return messagePorts[this._entangledPortUuid];
    }
  }

  // Add onmessage property handlers
  Object.defineProperty(MessagePort.prototype, 'onmessage', {
    get: function() {
      return this._onmessage;
    },
    set: function(callback) {
      if (this._onmessage) {
        this.removeEventListener('message', this._onmessage);
      }
      this._onmessage = callback;
      if (callback) {
        this.addEventListener('message', callback);
      }
    }
  });

  // MessageChannel constructor
  class MessageChannel {
    constructor() {
      console.log(`MessageChannel Polyfill: Creating new channel`);

      // Create ports
      const port1 = new MessagePort();
      const port2 = new MessagePort();

      // Connect the ports to each other
      port1._entangledPortUuid = port2.uuid;
      port2._entangledPortUuid = port1.uuid;

      this.port1 = port1;
      this.port2 = port2;
    }
  }

  // Explicitly set constructors and prototypes
  MessagePort.prototype.constructor = MessagePort;
  MessageChannel.prototype.constructor = MessageChannel;

  // Export to global scope
  global.MessagePort = MessagePort;
  global.MessageChannel = MessageChannel;
  global.MessageEvent = MessageEvent;

  console.log("MessageChannel Polyfill: Successfully installed");

  // Return the implementation for immediate use
  return {
    MessageChannel,
    MessagePort,
    MessageEvent
  };
})();