import { Evented } from '../core/Evented.js';
import { toLatLng } from '../geo/LatLng.js';
import { toPoint } from '../geometry/Point.js';

/**
 * @class Map
 * @description The central class of the library, used to create a map on a page and manipulate it.
 * @augments Evented
 */
export class Map extends Evented {
  /**
   * @constructor
   * @param {string | HTMLElement} id - The id of the DOM element to create the map in.
   * @param {Object} [options] - Map options.
   */
  constructor(id, options) {
    super();
    this._container = typeof id === 'string' ? document.getElementById(id) : id;
    this.options = {
      center: [0, 0],
      zoom: 1,
      ...options,
    };
    this._initLayout();
    this._initPanes();
    this._initEvents();
    this.setView(toLatLng(this.options.center[0], this.options.center[1]), this.options.zoom);
  }

  /**
   * @method setView
   * @description Sets the view of the map (geographical center and zoom).
   * @param {LatLng} center - The new center.
   * @param {number} zoom - The new zoom level.
   * @returns {Map} `this`
   */
  setView(center, zoom) {
    this._center = toLatLng(center.lat, center.lng);
    this._zoom = zoom;
    this.fire('moveend');
    return this;
  }

  /**
   * @method addLayer
   * @description Adds the given layer to the map.
   * @param {Layer} layer - The layer to add.
   * @returns {Map} `this`
   */
  addLayer(layer) {
    layer.onAdd(this);
    return this;
  }

  /**
   * @method getCenter
   * @description Returns the geographical center of the map view.
   * @returns {LatLng} The center.
   */
  getCenter() {
    return this._center;
  }

  /**
   * @method getZoom
   * @description Returns the current zoom level of the map view.
   * @returns {number} The zoom level.
   */
  getZoom() {
    return this._zoom;
  }

  /**
   * @method getPanes
   * @description Returns the map panes.
   * @returns {Object} The map panes.
   */
  getPanes() {
    return this._panes;
  }

  /**
   * @method latLngToLayerPoint
   * @description Projects a geographical point to a point in layer coordinates.
   * @param {LatLng} latlng - The geographical point.
   * @returns {Point} The point in layer coordinates.
   */
  latLngToLayerPoint(latlng) {
    const projectedPoint = this._project(latlng);
    return projectedPoint.subtract(this.getPixelOrigin());
  }

  /**
   * @method getPixelBounds
   * @description Returns the pixel bounds of the map view.
   * @returns {{min: Point, max: Point}} The pixel bounds.
   */
  getPixelBounds() {
    const size = this.getSize();
    const pixelOrigin = this.getPixelOrigin();
    return {
      min: pixelOrigin,
      max: pixelOrigin.add(size),
    };
  }

  /**
   * @method getSize
   * @description Returns the size of the map container.
   * @returns {Point} The size.
   */
  getSize() {
    return toPoint(this._container.clientWidth, this._container.clientHeight);
  }

  /**
   * @method getPixelOrigin
   * @description Returns the pixel origin of the map view.
   * @returns {Point} The pixel origin.
   */
  getPixelOrigin() {
    return this._getTopLeftPoint();
  }

  /**
   * @method openPopup
   * @description Opens a popup on the map.
   * @param {string | HTMLElement} content - The popup content.
   * @param {LatLng} latlng - The geographical point where to open the popup.
   * @returns {Map} `this`
   */
  openPopup(content, latlng) {
    if (this._popup) {
      this._popup.remove();
    }
    this._popup = this._createPopup(content, latlng);
    this.getPanes().popupPane.appendChild(this._popup);
    return this;
  }

  _initLayout() {
    this._container.classList.add('atlas-container');
  }

  _initPanes() {
    this._panes = {
      tilePane: this._createPane('atlas-tile-pane'),
      overlayPane: this._createPane('atlas-overlay-pane'),
      markerPane: this._createPane('atlas-marker-pane'),
      popupPane: this._createPane('atlas-popup-pane'),
    };
  }

  _createPane(className) {
    const pane = document.createElement('div');
    pane.classList.add(className);
    this._container.appendChild(pane);
    return pane;
  }

  _initEvents() {
    let dragging = false;
    let startPos = null;

    this._container.addEventListener('mousedown', (e) => {
      dragging = true;
      startPos = toPoint(e.clientX, e.clientY);
    });

    this._container.addEventListener('mouseup', () => {
      dragging = false;
      startPos = null;
    });

    this._container.addEventListener('mousemove', (e) => {
      if (dragging) {
        const currentPos = toPoint(e.clientX, e.clientY);
        const diff = currentPos.subtract(startPos);
        startPos = currentPos;
        this._move(diff.multiplyBy(-1));
      }
    });

    this._container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      const newZoom = this._zoom - delta * 0.01;
      this.setView(this._center, newZoom);
    });
  }

  _move(offset) {
    const newPixelOrigin = this.getPixelOrigin().add(offset);
    const newCenter = this._unproject(newPixelOrigin.add(this.getSize().divideBy(2)));
    this.setView(newCenter, this._zoom);
  }

  _project(latlng) {
    const d = Math.PI / 180;
    const sin = Math.sin(latlng.lat * d);
    const scale = 256 * Math.pow(2, this._zoom);

    const x = (latlng.lng / 360 + 0.5) * scale;
    const y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI) * scale;

    return toPoint(x, y);
  }

  _unproject(point) {
    const scale = 256 * Math.pow(2, this._zoom);
    const x = point.x / scale;
    const y = point.y / scale;

    const lng = (x - 0.5) * 360;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y)));
    const lat = latRad * (180 / Math.PI);

    return toLatLng(lat, lng);
  }

  _getTopLeftPoint() {
    const center = this._project(this._center);
    const size = this.getSize();
    return center.subtract(size.divideBy(2));
  }

  _createPopup(content, latlng) {
    const popup = document.createElement('div');
    popup.classList.add('atlas-popup');
    popup.innerHTML = content;
    const pos = this.latLngToLayerPoint(latlng);
    popup.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    return popup;
  }
}
