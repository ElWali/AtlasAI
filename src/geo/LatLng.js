/**
 * @class LatLng
 * @description Represents a geographical point with a certain latitude and longitude.
 *
 * @property {number} lat - Latitude in degrees.
 * @property {number} lng - Longitude in degrees.
 */
export class LatLng {
  /**
   * @constructor
   * @param {number} lat
   * @param {number} lng
   */
  constructor(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
    }
    this.lat = +lat;
    this.lng = +lng;
  }
}

/**
 * @function toLatLng
 * @description Creates a `LatLng` object from a given latitude and longitude.
 * @param {number} lat
 * @param {number} lng
 * @returns {LatLng} A new `LatLng` object.
 */
export function toLatLng(lat, lng) {
  return new LatLng(lat, lng);
}
