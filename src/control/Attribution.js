import { Control } from './Control.js';
import { DomUtil } from '../dom/DomUtil.js';

/**
 * @class Attribution
 * @description A class for displaying attribution information on the map.
 * @augments Control
 */
export class Attribution extends Control {
  /**
   * @constructor
   * @param {Object} [options] - Attribution options.
   * @param {string} [options.prefix=''] - The prefix to display before the attributions.
   */
  constructor(options = {}) {
    super({ position: 'bottomright', ...options });
    this._attributions = {};
  }

  onAdd(map) {
    this._map = map;
    this._container = DomUtil.create('div', 'atlas-control-attribution');
    this._update();
    return this._container;
  }

  addAttribution(text) {
    if (!text) { return this; }
    if (!this._attributions[text]) {
      this._attributions[text] = 0;
    }
    this._attributions[text]++;
    this._update();
    return this;
  }

  removeAttribution(text) {
    if (!text) { return this; }
    if (this._attributions[text]) {
      this._attributions[text]--;
      if (this._attributions[text] === 0) {
        delete this._attributions[text];
      }
      this._update();
    }
    return this;
  }

  _update() {
    if (!this._map) { return; }
    const parts = [];
    for (const attr in this._attributions) {
      if (this._attributions.hasOwnProperty(attr)) {
        parts.push(attr);
      }
    }
    const prefix = this.options.prefix ? `<span>${this.options.prefix}</span>` : '';
    this._container.innerHTML = prefix + ' ' + parts.join(', ');
  }
}
