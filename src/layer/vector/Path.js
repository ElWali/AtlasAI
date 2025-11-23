import { Layer } from '../Layer.js';

/**
 * @class Path
 * @description An abstract base class for vector layers.
 * @augments Layer
 */
export class Path extends Layer {
  constructor(options) {
    super();
    this.options = { ...this.options, ...options };
  }

  onAdd(map) {
    super.onAdd(map);
    this._initElements();
    this._project();
    map.on('viewreset', this._project, this);
    this.update();
  }

  onRemove(map) {
    if (this._container) {
      this._container.remove();
    }
    map.off('viewreset', this._project, this);
    super.onRemove(map);
  }

  update() {
    if (this._map) {
      this._updatePath();
    }
  }

  _initElements() {
    this._container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this._container.appendChild(this._path);
    this._map.getPanes().overlayPane.appendChild(this._container);
  }

  _project() {
    // This method will be implemented by subclasses
  }

  _updatePath() {
    // This method will be implemented by subclasses
  }
}
