import { Layer } from '../Layer.js';

/**
 * @class TileLayer
 * @description Used to load and display tile layers on the map.
 * @augments Layer
 */
export class TileLayer extends Layer {
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
    map.on('moveend', this._update, this);
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
    map.off('moveend', this._update, this);
    super.onRemove(map);
  }

  /**
   * @method _initContainer
   * @description Initializes the tile container.
   * @private
   */
  _initContainer() {
    this._container = document.createElement('div');
    this._container.classList.add('atlas-layer', 'atlas-tile-layer');
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

    this._container.innerHTML = '';

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
    const tile = document.createElement('img');
    tile.src = this._getTileUrl(x, y, z);
    tile.style.position = 'absolute';
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
    return this._urlTemplate
      .replace('{s}', 'a') // Replace with a subdomain if needed
      .replace('{z}', z)
      .replace('{x}', x)
      .replace('{y}', y);
  }
}
