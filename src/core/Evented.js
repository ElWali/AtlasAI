/**
 * @class Evented
 * @description A base class for event handling.
 */
export class Evented {
  constructor() {
    this._events = {};
  }

  /**
   * @method on
   * @description Adds a listener function to a specified event.
   * @param {string} type - The event type.
   * @param {Function} fn - The listener function.
   * @param {Object} [context] - The context to bind the listener to.
   * @returns {Evented} `this`
   */
  on(type, fn, context) {
    if (!this._events[type]) {
      this._events[type] = [];
    }
    this._events[type].push({ fn, context });
    return this;
  }

  /**
   * @method off
   * @description Removes a previously added listener function from a specified event.
   * @param {string} type - The event type.
   * @param {Function} [fn] - The listener function to remove. If not specified, all listeners for the event are removed.
   * @param {Object} [context] - The context of the listener to remove.
   * @returns {Evented} `this`
   */
  off(type, fn, context) {
    if (!this._events[type]) {
      return this;
    }

    if (!fn) {
      this._events[type] = [];
      return this;
    }

    this._events[type] = this._events[type].filter(
      (listener) =>
        listener.fn !== fn || (context && listener.context !== context)
    );

    return this;
  }

  /**
   * @method fire
   * @description Fires an event of the specified type.
   * @param {string} type - The event type.
   * @param {Object} [data] - Data to pass to the listeners.
   * @returns {Evented} `this`
   */
  fire(type, data) {
    if (!this._events[type]) {
      return this;
    }

    const listeners = [...this._events[type]];

    for (const listener of listeners) {
      const { fn, context } = listener;
      const event = { type, target: this, ...data };
      fn.call(context || this, event);
    }

    return this;
  }
}
