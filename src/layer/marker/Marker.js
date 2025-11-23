import { Layer } from '../Layer.js';
import { toLatLng } from '../../geo/LatLng.js';

/**
 * @class Marker
 * @description Represents a marker on the map.
 * @augments Layer
 */
export class Marker extends Layer {
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
    map.on('viewreset', this.update, this);
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
    map.off('viewreset', this.update, this);
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
    this.on('click', this._openPopup, this);
    return this;
  }

  /**
   * @method _initIcon
   * @description Initializes the marker icon.
   * @private
   */
  _initIcon() {
    this._icon = document.createElement('div');
    this._icon.classList.add('atlas-marker-icon');
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
}
