var Atlas = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/Atlas.js
  var Atlas_exports = {};
  __export(Atlas_exports, {
    Control: () => Control,
    Evented: () => Evented,
    LatLng: () => LatLng,
    Layer: () => Layer,
    Map: () => Map,
    Marker: () => Marker,
    Path: () => Path,
    Point: () => Point,
    TileLayer: () => TileLayer,
    toLatLng: () => toLatLng,
    toPoint: () => toPoint
  });

  // src/core/Evented.js
  var Evented = class {
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
        (listener) => listener.fn !== fn || context && listener.context !== context
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
  };

  // src/geo/LatLng.js
  var LatLng = class {
    /**
     * @constructor
     * @param {number} lat
     * @param {number} lng
     */
    constructor(lat, lng) {
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid LatLng object: (" + lat + ", " + lng + ")");
      }
      this.lat = +lat;
      this.lng = +lng;
    }
  };
  function toLatLng(lat, lng) {
    return new LatLng(lat, lng);
  }

  // src/geometry/Point.js
  var Point = class _Point {
    /**
     * @constructor
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    /**
     * @method clone
     * @description Returns a copy of the point.
     * @returns {Point} A new point with the same coordinates.
     */
    clone() {
      return new _Point(this.x, this.y);
    }
    /**
     * @method add
     * @description Adds the coordinates of another point to this point.
     * @param {Point} otherPoint
     * @returns {Point} A new point with the added coordinates.
     */
    add(otherPoint) {
      return new _Point(this.x + otherPoint.x, this.y + otherPoint.y);
    }
    /**
     * @method subtract
     * @description Subtracts the coordinates of another point from this point.
     * @param {Point} otherPoint
     * @returns {Point} A new point with the subtracted coordinates.
     */
    subtract(otherPoint) {
      return new _Point(this.x - otherPoint.x, this.y - otherPoint.y);
    }
    /**
     * @method multiplyBy
     * @description Multiplies the coordinates of this point by a number.
     * @param {number} num
     * @returns {Point} A new point with the multiplied coordinates.
     */
    multiplyBy(num) {
      return new _Point(this.x * num, this.y * num);
    }
    /**
     * @method divideBy
     * @description Divides the coordinates of this point by a number.
     * @param {number} num
     * @returns {Point} A new point with the divided coordinates.
     */
    divideBy(num) {
      return new _Point(this.x / num, this.y / num);
    }
  };
  function toPoint(x, y) {
    return new Point(x, y);
  }

  // src/layer/Layer.js
  var Layer = class extends Evented {
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
  };

  // src/layer/tile/TileLayer.js
  var TileLayer = class extends Layer {
    /**
     * @constructor
     * @param {string} urlTemplate - A URL template for the tiles.
     * @param {Object} [options] - Tile layer options.
     */
    constructor(urlTemplate, options) {
      super();
      this._urlTemplate = urlTemplate;
      this.options = options || {};
    }
    /**
     * @method onAdd
     * @description Called when the layer is added to a map.
     * @param {Map} map - The map.
     */
    onAdd(map) {
      super.onAdd(map);
      this._initContainer();
      this._update();
      map.on("moveend", this._update, this);
    }
    /**
     * @method onRemove
     * @description Called when the layer is removed from a map.
     * @param {Map} map - The map.
     */
    onRemove(map) {
      if (this._container) {
        this._container.remove();
      }
      map.off("moveend", this._update, this);
      super.onRemove(map);
    }
    /**
     * @method _initContainer
     * @description Initializes the tile container.
     * @private
     */
    _initContainer() {
      this._container = document.createElement("div");
      this._container.classList.add("atlas-layer", "atlas-tile-layer");
      this._map.getPanes().tilePane.appendChild(this._container);
    }
    /**
     * @method _update
     * @description Updates the tiles.
     * @private
     */
    _update() {
      if (!this._map) {
        return;
      }
      const pixelOrigin = this._map.getPixelOrigin();
      this._container.style.transform = `translate3d(${-pixelOrigin.x}px, ${-pixelOrigin.y}px, 0)`;
      const bounds = this._map.getPixelBounds();
      const zoom = Math.round(this._map.getZoom());
      const tileSize = 256;
      this._container.innerHTML = "";
      for (let j = Math.floor(bounds.min.y / tileSize); j <= Math.ceil(bounds.max.y / tileSize); j++) {
        for (let i = Math.floor(bounds.min.x / tileSize); i <= Math.ceil(bounds.max.x / tileSize); i++) {
          const tile = this._createTile(i, j, zoom);
          this._container.appendChild(tile);
        }
      }
    }
    /**
     * @method _createTile
     * @description Creates a tile.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {HTMLImageElement} The tile.
     * @private
     */
    _createTile(x, y, z) {
      const tile = document.createElement("img");
      tile.src = this._getTileUrl(x, y, z);
      tile.style.position = "absolute";
      tile.style.left = `${x * 256}px`;
      tile.style.top = `${y * 256}px`;
      return tile;
    }
    /**
     * @method _getTileUrl
     * @description Gets the tile URL.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {string} The tile URL.
     * @private
     */
    _getTileUrl(x, y, z) {
      return this._urlTemplate.replace("{s}", "a").replace("{z}", z).replace("{x}", x).replace("{y}", y);
    }
  };

  // src/layer/marker/Marker.js
  var Marker = class extends Layer {
    /**
     * @constructor
     * @param {LatLng} latlng - The marker's position.
     * @param {Object} [options] - Marker options.
     */
    constructor(latlng, options) {
      super();
      this._latlng = toLatLng(latlng.lat, latlng.lng);
      this.options = options || {};
    }
    /**
     * @method onAdd
     * @description Called when the marker is added to a map.
     * @param {Map} map - The map.
     */
    onAdd(map) {
      super.onAdd(map);
      this._initIcon();
      this.update();
      map.on("viewreset", this.update, this);
    }
    /**
     * @method onRemove
     * @description Called when the marker is removed from a map.
     * @param {Map} map - The map.
     */
    onRemove(map) {
      if (this._icon) {
        this._icon.remove();
      }
      map.off("viewreset", this.update, this);
      super.onRemove(map);
    }
    /**
     * @method update
     * @description Updates the marker's position.
     */
    update() {
      if (this._map && this._latlng) {
        const pos = this._map.latLngToLayerPoint(this._latlng);
        this._icon.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
    }
    /**
     * @method bindPopup
     * @description Binds a popup to the marker.
     * @param {string | HTMLElement} content - The popup content.
     * @returns {Marker} `this`
     */
    bindPopup(content) {
      this._popupContent = content;
      this.on("click", this._openPopup, this);
      return this;
    }
    /**
     * @method _initIcon
     * @description Initializes the marker icon.
     * @private
     */
    _initIcon() {
      this._icon = document.createElement("div");
      this._icon.classList.add("atlas-marker-icon");
      this._map.getPanes().markerPane.appendChild(this._icon);
    }
    /**
     * @method _openPopup
     * @description Opens the popup.
     * @private
     */
    _openPopup() {
      if (this._popupContent) {
        this._map.openPopup(this._popupContent, this._latlng);
      }
    }
  };

  // src/layer/vector/Path.js
  var Path = class extends Layer {
    constructor(options) {
      super();
      this.options = { ...this.options, ...options };
    }
    onAdd(map) {
      super.onAdd(map);
      this._initElements();
      this._project();
      map.on("viewreset", this._project, this);
      this.update();
    }
    onRemove(map) {
      if (this._container) {
        this._container.remove();
      }
      map.off("viewreset", this._project, this);
      super.onRemove(map);
    }
    update() {
      if (this._map) {
        this._updatePath();
      }
    }
    _initElements() {
      this._container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this._path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this._container.appendChild(this._path);
      this._map.getPanes().overlayPane.appendChild(this._container);
    }
    _project() {
    }
    _updatePath() {
    }
  };

  // src/control/Control.js
  var Control = class {
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
      throw new Error("Method _initLayout() must be implemented.");
    }
  };

  // src/map/Map.js
  var Map = class extends Evented {
    /**
     * @constructor
     * @param {string | HTMLElement} id - The id of the DOM element to create the map in.
     * @param {Object} [options] - Map options.
     */
    constructor(id, options) {
      super();
      this._container = typeof id === "string" ? document.getElementById(id) : id;
      this.options = {
        center: [0, 0],
        zoom: 1,
        ...options
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
      this.fire("moveend");
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
        max: pixelOrigin.add(size)
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
      this._container.classList.add("atlas-container");
    }
    _initPanes() {
      this._panes = {
        tilePane: this._createPane("atlas-tile-pane"),
        overlayPane: this._createPane("atlas-overlay-pane"),
        markerPane: this._createPane("atlas-marker-pane"),
        popupPane: this._createPane("atlas-popup-pane")
      };
    }
    _createPane(className) {
      const pane = document.createElement("div");
      pane.classList.add(className);
      this._container.appendChild(pane);
      return pane;
    }
    _initEvents() {
      let dragging = false;
      let startPos = null;
      this._container.addEventListener("mousedown", (e) => {
        dragging = true;
        startPos = toPoint(e.clientX, e.clientY);
      });
      this._container.addEventListener("mouseup", () => {
        dragging = false;
        startPos = null;
      });
      this._container.addEventListener("mousemove", (e) => {
        if (dragging) {
          const currentPos = toPoint(e.clientX, e.clientY);
          const diff = currentPos.subtract(startPos);
          startPos = currentPos;
          this._move(diff.multiplyBy(-1));
        }
      });
      this._container.addEventListener("wheel", (e) => {
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
      const popup = document.createElement("div");
      popup.classList.add("atlas-popup");
      popup.innerHTML = content;
      const pos = this.latLngToLayerPoint(latlng);
      popup.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      return popup;
    }
  };
  return __toCommonJS(Atlas_exports);
})();

(function() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
.atlas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.atlas-tile-pane {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.atlas-overlay-pane,
.atlas-marker-pane,
.atlas-popup-pane {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.atlas-marker-icon {
  width: 25px;
  height: 41px;
  background-image: url('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png');
  background-size: 25px 41px;
  margin-left: -12px;
  margin-top: -41px;
}

.atlas-popup {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
  z-index: 10;
  white-space: nowrap;
}
`;
  document.head.appendChild(style);
})();
