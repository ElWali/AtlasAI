import { Path } from './Path.js';
import { toLatLng } from '../../geo/LatLng.js';

/**
 * @class Polyline
 * @description A class for drawing polyline overlays on a map.
 * @augments Path
 */
export class Polyline extends Path {
  /**
   * @constructor
   * @param {Array<LatLng|Array<number>>} latlngs - An array of geographical points.
   * @param {Object} [options] - Polyline options.
   */
  constructor(latlngs, options) {
    super(options);
    this._latlngs = latlngs.map(ll => Array.isArray(ll) ? toLatLng(ll[0], ll[1]) : ll);
  }

  getLatLngs() {
    return this._latlngs;
  }

  _project() {
    this._points = this._latlngs.map(latlng => this._map.latLngToLayerPoint(latlng));
  }

  _update() {
    if (!this._map) { return; }
    this._updatePath();
  }

  _updatePath() {
    const d = this._points.map((p, i) => (i ? 'L' : 'M') + `${p.x} ${p.y}`).join(' ');
    this._path.setAttribute('d', d);
  }
}
