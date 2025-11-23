import { Evented } from '../core/Evented.js';
import { toLatLng } from '../geo/LatLng.js';
import { toPoint, subtract, add, divideBy } from '../geometry/Point.js';
import { EPSG3857 } from '../geo/CRS.js';
import { DomUtil } from '../dom/DomUtil.js';

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
   * @param {CRS} [options.crs=EPSG3857] - The coordinate reference system to use.
   * @param {LatLng | Array<number>} [options.center=[0, 0]] - Initial geographical center of the map.
   * @param {number} [options.zoom=1] - Initial map zoom level.
   */
  constructor(id, options) {
    super();
    this.options = {
      crs: new EPSG3857(),
      center: [0, 0],
      zoom: 1,
      ...options,
    };
    this._container = typeof id === 'string' ? document.getElementById(id) : id;
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
    this._updateMapPanePos(); // Reset pane position on setView
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
    return subtract(projectedPoint, this.getPixelOrigin());
  }

  /**
   * @method layerPointToLatLng
   * @description Converts a point in layer coordinates to a geographical point.
   * @param {Point} point - The point in layer coordinates.
   * @returns {LatLng} The geographical point.
   */
  layerPointToLatLng(point) {
    const projectedPoint = add(point, this.getPixelOrigin());
    return this._unproject(projectedPoint);
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
      max: add(pixelOrigin, size),
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
   * @description Returns the pixel origin of the map view (top-left corner).
   * @returns {Point} The pixel origin.
   */
  getPixelOrigin() {
    return this._pixelOrigin;
  }

  /**
   * @method openPopup
   * @description Opens a popup on the map.
   * @param {Popup} popup - The popup to open.
   * @param {LatLng} latlng - The geographical point where to open the popup.
   * @returns {Map} `this`
   */
  openPopup(popup, latlng) {
    this.closePopup();
    this._popup = popup;
    popup.onAdd(this, latlng);
    this.getPanes().popupPane.appendChild(popup.getElement());
    this.on('drag', this.closePopup, this);
    return this;
  }

  /**
   * @method closePopup
   * @description Closes the currently open popup.
   * @returns {Map} `this`
   */
  closePopup() {
    if (this._popup) {
      this._popup.onRemove();
      this._popup = null;
      this.off('drag', this.closePopup, this);
    }
    return this;
  }

  _initLayout() {
    this._container.classList.add('atlas-container');
    this._mapPane = DomUtil.create('div', 'atlas-map-pane', this._container);
  }

  _initPanes() {
    this._panes = {
      tilePane: this._createPane('atlas-tile-pane', this._mapPane),
      overlayPane: this._createPane('atlas-overlay-pane', this._mapPane),
      markerPane: this._createPane('atlas-marker-pane', this._mapPane),
      popupPane: this._createPane('atlas-popup-pane', this._container), // Popups are outside the panning pane
    };
  }

  _createPane(className, container) {
    return DomUtil.create('div', className, container || this._mapPane);
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
        const diff = subtract(currentPos, startPos);
        startPos = currentPos;
        this._move(diff);
        this.fire('drag');
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
    DomUtil.setPosition(this._mapPane, add(DomUtil.getPosition(this._mapPane), offset));
  }

  _updateMapPanePos() {
    this._pixelOrigin = this._getTopLeftPoint();
    DomUtil.setPosition(this._mapPane, toPoint(0, 0)); // Reset position
  }

  _project(latlng) {
    return this.options.crs.latLngToPoint(latlng, this._zoom);
  }

  _unproject(point) {
    return this.options.crs.pointToLatLng(point, this._zoom);
  }

  _getTopLeftPoint() {
    const center = this._project(this._center);
    const size = this.getSize();
    return subtract(center, divideBy(size, 2));
  }
}
