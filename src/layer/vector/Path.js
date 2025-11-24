import { Layer } from '../Layer.js';
import { DomUtil } from '../../dom/DomUtil.js';
import { toPoint } from '../../geometry/Point.js';

/**
 * @class Path
 * @description An abstract base class for vector layers.
 * @augments Layer
 */
export class Path extends Layer {
  constructor(options = {}) {
    super();
    this.options = {
      stroke: true,
      color: '#3388ff',
      weight: 3,
      opacity: 1,
      ...options
    };
  }

  onAdd(map) {
    this._map = map;
    this._initElements();
    this._project();
    this._updateStyle();
    map.on('viewreset', this._onViewReset, this);
    map.on('moveend', this._update, this);
    this.getPane().appendChild(this._container);
    this._update();
  }

  onRemove() {
    this._map.off('viewreset', this._onViewReset, this);
    this._map.off('moveend', this._update, this);
    DomUtil.remove(this._container);
    this._map = null;
    this._svg = null;
  }

  getPane() {
    return this._map.getPanes().overlayPane;
  }

  _onViewReset() {
    this._project();
    this._update();
  }

  _initElements() {
    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._container = this._svg; // For now, the SVG is the container
    this._path = this._createElement('path');
    this._svg.appendChild(this._path);
  }

  _createElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  _project() {
    // Implemented by subclasses
  }

  _update() {
    // Implemented by subclasses
  }

  _updateStyle() {
    if (this.options.stroke) {
      this._path.setAttribute('stroke', this.options.color);
      this._path.setAttribute('stroke-opacity', this.options.opacity);
      this._path.setAttribute('stroke-width', this.options.weight);
      this._path.setAttribute('fill', 'none');
    }
  }

  _updatePath() {
    // Implemented by subclasses
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
