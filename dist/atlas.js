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
    Attribution: () => Attribution,
    CRS: () => CRS,
    Control: () => Control,
    DomUtil: () => DomUtil,
    EPSG3857: () => EPSG3857,
    Evented: () => Evented,
    LatLng: () => LatLng,
    Layer: () => Layer,
    Map: () => Map,
    Marker: () => Marker,
    Mercator: () => Mercator,
    Path: () => Path,
    Polyline: () => Polyline,
    Popup: () => Popup,
    Projection: () => Projection,
    TileLayer: () => TileLayer,
    add: () => add,
    clone: () => clone,
    divideBy: () => divideBy,
    multiplyBy: () => multiplyBy,
    subtract: () => subtract,
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

  // src/geometry/Point.js
  function toPoint(x, y) {
    return { x, y };
  }
  function clone(point) {
    return toPoint(point.x, point.y);
  }
  function add(point1, point2) {
    return toPoint(point1.x + point2.x, point1.y + point2.y);
  }
  function subtract(point1, point2) {
    return toPoint(point1.x - point2.x, point1.y - point2.y);
  }
  function multiplyBy(point, num) {
    return toPoint(point.x * num, point.y * num);
  }
  function divideBy(point, num) {
    return toPoint(point.x / num, point.y / num);
  }

  // src/dom/DomUtil.js
  var DomUtil = {
    /**
     * @method create
     * @description Creates an element with an optional class name and appends it to a container.
     * @param {string} tagName - The tag name of the element to create.
     * @param {string} [className] - The class name to assign to the element.
     * @param {HTMLElement} [container] - The container to append the element to.
     * @returns {HTMLElement} The created element.
     */
    create: (tagName, className, container) => {
      const el = document.createElement(tagName);
      if (className) {
        el.className = className;
      }
      if (container) {
        container.appendChild(el);
      }
      return el;
    },
    /**
     * @method remove
     * @description Removes an element from its parent.
     * @param {HTMLElement} el - The element to remove.
     */
    remove: (el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    },
    /**
     * @method setPosition
     * @description Sets the position of an element using CSS transforms.
     * @param {HTMLElement} el - The element to position.
     * @param {Point} point - The position to set.
     */
    setPosition: (el, point) => {
      el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    },
    /**
     * @method getPosition
     * @description Gets the position of an element from its CSS transform.
     * @param {HTMLElement} el - The element.
     * @returns {Point} The position.
     */
    getPosition: (el) => {
      const transform = el.style.transform;
      if (!transform) {
        return toPoint(0, 0);
      }
      const parts = transform.match(/translate3d\(([^,]+)px, ([^,]+)px/);
      if (!parts) {
        return toPoint(0, 0);
      }
      return toPoint(parseFloat(parts[1]), parseFloat(parts[2]));
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

  // src/geo/Projection.js
  var Projection = class {
    /**
     * @method project
     * @description Projects geographical coordinates into a flat point.
     * @param {LatLng} latlng - The geographical coordinates.
     * @returns {Point} The projected point.
     * @abstract
     */
    project(latlng) {
      throw new Error("Method project() must be implemented.");
    }
    /**
     * @method unproject
     * @description Unprojects a flat point into geographical coordinates.
     * @param {Point} point - The projected point.
     * @returns {LatLng} The geographical coordinates.
     * @abstract
     */
    unproject(point) {
      throw new Error("Method unproject() must be implemented.");
    }
  };
  var Mercator = class extends Projection {
    /**
     * @method project
     * @description Projects geographical coordinates using the Spherical Mercator projection.
     * @param {LatLng} latlng - The geographical coordinates.
     * @returns {Point} The projected point.
     */
    project(latlng) {
      const R = 6378137;
      const d = Math.PI / 180;
      const latRad = latlng.lat * d;
      const lngRad = latlng.lng * d;
      const x = R * lngRad;
      const y = R * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
      return toPoint(x, y);
    }
    /**
     * @method unproject
     * @description Unprojects a flat point using the Spherical Mercator projection.
     * @param {Point} point - The projected point.
     * @returns {LatLng} The geographical coordinates.
     */
    unproject(point) {
      const R = 6378137;
      const d = 180 / Math.PI;
      const lng = point.x / R * d;
      const lat = (2 * Math.atan(Math.exp(point.y / R)) - Math.PI / 2) * d;
      return toLatLng(lat, lng);
    }
  };

  // src/geo/CRS.js
  var CRS = class {
    constructor(projection) {
      this.projection = projection;
    }
    latLngToPoint(latlng, zoom) {
      const projectedPoint = this.projection.project(latlng);
      const scale = this.scale(zoom);
      return multiplyBy(projectedPoint, scale);
    }
    pointToLatLng(point, zoom) {
      const scale = this.scale(zoom);
      const untransformedPoint = divideBy(point, scale);
      return this.projection.unproject(untransformedPoint);
    }
    scale(zoom) {
      throw new Error("Method scale() must be implemented.");
    }
  };
  var EPSG3857 = class _EPSG3857 extends CRS {
    constructor() {
      super(new Mercator());
    }
    static TILE_SIZE = 256;
    static R = 6378137;
    scale(zoom) {
      return _EPSG3857.TILE_SIZE * Math.pow(2, zoom) / (2 * Math.PI * _EPSG3857.R);
    }
  };
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
    constructor(options = {}) {
      super();
      this.options = {
        stroke: true,
        color: "#3388ff",
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
      map.on("viewreset", this._onViewReset, this);
      map.on("moveend", this._update, this);
      this.getPane().appendChild(this._container);
      this._update();
    }
    onRemove() {
      this._map.off("viewreset", this._onViewReset, this);
      this._map.off("moveend", this._update, this);
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
      this._svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this._container = this._svg;
      this._path = this._createElement("path");
      this._svg.appendChild(this._path);
    }
    _createElement(name) {
      return document.createElementNS("http://www.w3.org/2000/svg", name);
    }
    _project() {
    }
    _update() {
    }
    _updateStyle() {
      if (this.options.stroke) {
        this._path.setAttribute("stroke", this.options.color);
        this._path.setAttribute("stroke-opacity", this.options.opacity);
        this._path.setAttribute("stroke-width", this.options.weight);
        this._path.setAttribute("fill", "none");
      }
    }
    _updatePath() {
    }
  };

  // src/layer/vector/Polyline.js
  var Polyline = class extends Path {
    /**
     * @constructor
     * @param {Array<LatLng|Array<number>>} latlngs - An array of geographical points.
     * @param {Object} [options] - Polyline options.
     */
    constructor(latlngs, options) {
      super(options);
      this._latlngs = latlngs.map((ll) => toLatLng(ll[0], ll[1]));
    }
    getLatLngs() {
      return this._latlngs;
    }
    _project() {
      this._points = this._latlngs.map((latlng) => this._map.latLngToLayerPoint(latlng));
    }
    _update() {
      if (!this._map) {
        return;
      }
      this._updatePath();
    }
    _updatePath() {
      const d = this._points.map((p, i) => (i ? "L" : "M") + `${p.x} ${p.y}`).join(" ");
      this._path.setAttribute("d", d);
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

  // src/control/Attribution.js
  var Attribution = class extends Control {
    /**
     * @constructor
     * @param {Object} [options] - Attribution options.
     * @param {string} [options.prefix=''] - The prefix to display before the attributions.
     */
    constructor(options = {}) {
      super({ position: "bottomright", ...options });
      this._attributions = {};
    }
    onAdd(map) {
      this._map = map;
      this._container = DomUtil.create("div", "atlas-control-attribution");
      this._update();
      return this._container;
    }
    addAttribution(text) {
      if (!text) {
        return this;
      }
      if (!this._attributions[text]) {
        this._attributions[text] = 0;
      }
      this._attributions[text]++;
      this._update();
      return this;
    }
    removeAttribution(text) {
      if (!text) {
        return this;
      }
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
      if (!this._map) {
        return;
      }
      const parts = [];
      for (const attr in this._attributions) {
        if (this._attributions.hasOwnProperty(attr)) {
          parts.push(attr);
        }
      }
      const prefix = this.options.prefix ? `<span>${this.options.prefix}</span>` : "";
      this._container.innerHTML = prefix + " " + parts.join(", ");
    }
  };

  // src/ui/Popup.js
  var Popup = class extends Evented {
    /**
     * @constructor
     * @param {Object} [options] - Popup options.
     * @param {string | HTMLElement} [content] - The content of the popup.
     */
    constructor(options, content) {
      super();
      this.options = {
        offset: [0, 7],
        ...options
      };
      this._content = content;
    }
    onAdd(map, latlng) {
      this._map = map;
      this._latlng = latlng;
      this._initLayout();
      this._updatePosition();
      this._container.style.opacity = 1;
      this._map.on("move", this._updatePosition, this);
    }
    onRemove() {
      if (this._map) {
        this._map.off("move", this._updatePosition, this);
      }
      DomUtil.remove(this._container);
      this._map = null;
    }
    getElement() {
      return this._container;
    }
    _initLayout() {
      this._container = DomUtil.create("div", "atlas-popup");
      this._contentNode = DomUtil.create("div", "atlas-popup-content", this._container);
      this._contentNode.innerHTML = this._content;
      this._tipContainer = DomUtil.create("div", "atlas-popup-tip-container", this._container);
      this._tip = DomUtil.create("div", "atlas-popup-tip", this._tipContainer);
      this._closeButton = DomUtil.create("a", "atlas-popup-close-button", this._container);
      this._closeButton.href = "#close";
      this._closeButton.innerHTML = "&#215;";
      this._closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        this._map.closePopup();
      });
    }
    _updatePosition() {
      if (!this._map) {
        return;
      }
      const pos = this._map.latLngToLayerPoint(this._latlng);
      const offset = this.options.offset;
      const newPos = pos.add(offset);
      DomUtil.setPosition(this._container, newPos);
    }
  };

  // src/map/Map.js
  var Map = class extends Evented {
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
        ...options
      };
      this._container = typeof id === "string" ? document.getElementById(id) : id;
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
      this._updateMapPanePos();
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
        max: add(pixelOrigin, size)
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
     * @description Returns the pixel origin of the map view (top-left corner).
     * @returns {Point} The pixel origin.
     */
    getPixelOrigin() {
      return this._pixelOrigin;
     * @description Returns the pixel origin of the map view.
     * @returns {Point} The pixel origin.
     */
    getPixelOrigin() {
      return this._getTopLeftPoint();
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
      this.on("drag", this.closePopup, this);
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
        this.off("drag", this.closePopup, this);
      }
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
      this._mapPane = DomUtil.create("div", "atlas-map-pane", this._container);
    }
    _initPanes() {
      this._panes = {
        tilePane: this._createPane("atlas-tile-pane", this._mapPane),
        overlayPane: this._createPane("atlas-overlay-pane", this._mapPane),
        markerPane: this._createPane("atlas-marker-pane", this._mapPane),
        popupPane: this._createPane("atlas-popup-pane", this._container)
        // Popups are outside the panning pane
      };
    }
    _createPane(className, container) {
      return DomUtil.create("div", className, container || this._mapPane);
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
          const diff = subtract(currentPos, startPos);
          startPos = currentPos;
          this._move(diff);
          this.fire("drag");
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
      DomUtil.setPosition(this._mapPane, add(DomUtil.getPosition(this._mapPane), offset));
    }
    _updateMapPanePos() {
      this._pixelOrigin = this._getTopLeftPoint();
      DomUtil.setPosition(this._mapPane, toPoint(0, 0));
    }
    _project(latlng) {
      return this.options.crs.latLngToPoint(latlng, this._zoom);
    }
    _unproject(point) {
      return this.options.crs.pointToLatLng(point, this._zoom);
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
      return subtract(center, divideBy(size, 2));
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

.atlas-map-pane {
  position: absolute;
  width: 100%;
  height: 100%;
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
