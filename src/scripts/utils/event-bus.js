export { EventBus };

class EventBus {
  #events = {};

  constructor() {}

  #createEvent(event) {
    this.#events[event] = [];
  }

  #hasEvent(event) {
    return Object.prototype.hasOwnProperty.call(this.#events, event);
  }

  #isEventEmpty(event) {
    let eventEmpty = false;
    if (this.#hasEvent(event)) {
      if (this.#events[event].length === 0) {
        eventEmpty = true;
      }
    }
    return eventEmpty;
  }

  #deleteEvent(event) {
    if (this.#hasEvent(event)) {
      delete this.#events[event];
    }
  }

  on(event, callback) {
    if (!this.#hasEvent(event)) {
      this.#createEvent(event);
    }
    this.#events[event].push(callback);
  }

  off(event, callback) {
    if (this.#hasEvent(event)) {
      const currentEventLength = this.#events[event].length;
      for (let i = 0; i < currentEventLength; i++) {
        if (this.#events[event][i] === callback) {
          this.#events[event].splice(i, 1);
          break;
        }
      }
      if (this.#isEventEmpty(event)) {
        this.#deleteEvent(event);
      }
    }
  }

  offAllInstances(event, callback) {
    if (this.#hasEvent(event)) {
      const currentEventLength = this.#events[event].length;
      for (let i = currentEventLength - 1; i >= 0; i--) {
        if (this.#events[event][i] === callback) {
          this.#events[event].splice(i, 1);
        }
      }
      if (this.#isEventEmpty(event)) {
        this.#deleteEvent(event);
      }
    }
  }

  emit(event, ...args) {
    if (this.#hasEvent(event)) {
      const currentEventLength = this.#events[event].length;
      for (let i = 0; i < currentEventLength; i++) {
        this.#events[event][i](...args);
      }
    }
  }
}
