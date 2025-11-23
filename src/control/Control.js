/**
 * @class Control
 * @description An abstract base class for map UI components.
 */
export class Control {
  /**
   * @constructor
   * @param {Object} [options] - Control options.
   */
  constructor(options) {
    this.options = options || {};
  }

  /**
   * @method onAdd
   * @description Called when the control is added to a map.
   * @param {Map} map - The map.
   * @returns {HTMLElement} The control's container element.
   */
  onAdd(map) {
    this._map = map;
    this._container = this._initLayout();
    return this._container;
  }

  /**
   * @method onRemove
   * @description Called when the control is removed from a map.
   * @param {Map} map - The map.
   */
  onRemove(map) {
    this._map = null;
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
  }

  /**
   * @method _initLayout
   * @description Initializes the control's layout.
   * @private
   */
  _initLayout() {
    throw new Error('Method _initLayout() must be implemented.');
  }
}
