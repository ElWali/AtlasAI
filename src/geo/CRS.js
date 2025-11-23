import { Mercator } from './Projection.js';
import { multiplyBy, divideBy } from '../geometry/Point.js';

/**
 * @namespace Atlas.CRS
 * @description Contains Coordinate Reference System definitions.
 */

/**
 * @class CRS
 * @description An abstract class for defining coordinate reference systems.
 * @memberof Atlas.CRS
 */
export class CRS {
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
    throw new Error('Method scale() must be implemented.');
  }
}

/**
 * @class EPSG3857
 * @description The EPSG:3857 (Web Mercator) coordinate reference system.
 * @augments CRS
 * @memberof Atlas.CRS
 */
export class EPSG3857 extends CRS {
  constructor() {
    super(new Mercator());
  }

  static TILE_SIZE = 256;
  static R = 6378137;

  scale(zoom) {
    return EPSG3857.TILE_SIZE * Math.pow(2, zoom) / (2 * Math.PI * EPSG3857.R);
  }
}
