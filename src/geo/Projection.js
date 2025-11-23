import { toPoint } from '../geometry/Point.js';
import { toLatLng } from './LatLng.js';

/**
 * @namespace Atlas.Projection
 * @description Contains projection classes for converting between geographical coordinates and flat map coordinates.
 */

/**
 * @class Projection
 * @description An abstract class for projecting geographical coordinates.
 * @memberof Atlas.Projection
 */
export class Projection {
  /**
   * @method project
   * @description Projects geographical coordinates into a flat point.
   * @param {LatLng} latlng - The geographical coordinates.
   * @returns {Point} The projected point.
   * @abstract
   */
  project(latlng) {
    throw new Error('Method project() must be implemented.');
  }

  /**
   * @method unproject
   * @description Unprojects a flat point into geographical coordinates.
   * @param {Point} point - The projected point.
   * @returns {LatLng} The geographical coordinates.
   * @abstract
   */
  unproject(point) {
    throw new Error('Method unproject() must be implemented.');
  }
}

/**
 * @class Mercator
 * @description The Spherical Mercator projection.
 * @augments Projection
 * @memberof Atlas.Projection
 */
export class Mercator extends Projection {
  /**
   * @method project
   * @description Projects geographical coordinates using the Spherical Mercator projection.
   * @param {LatLng} latlng - The geographical coordinates.
   * @returns {Point} The projected point.
   */
  project(latlng) {
    const R = 6378137; // Earth radius in meters
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
}
