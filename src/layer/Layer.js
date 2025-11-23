import { Evented } from '../core/Evented.js';

/**
 * @class Layer
 * @description An abstract base class for all map layers.
 * @augments Evented
 */
export class Layer extends Evented {
  constructor() {
    super();
  }

  /**
   * @method onAdd
   * @description Called when the layer is added to a map.
   * @param {Map} map - The map.
   */
  onAdd(map) {
    this._map = map;
  }

  /**
   * @method onRemove
   * @description Called when the layer is removed from a map.
   * @param {Map} map - The map.
   */
  onRemove(map) {
    this._map = null;
  }

  /**
   * @method addTo
   * @description Adds the layer to the given map.
   * @param {Map} map - The map to add the layer to.
   * @returns {Layer} `this`
   */
  addTo(map) {
    map.addLayer(this);
    return this;
  }
}
