/**
 * @class Point
 * @description Represents a point with x and y coordinates in pixels.
 *
 * @property {number} x - The x coordinate.
 * @property {number} y - The y coordinate.
 */
export class Point {
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
    return new Point(this.x, this.y);
  }

  /**
   * @method add
   * @description Adds the coordinates of another point to this point.
   * @param {Point} otherPoint
   * @returns {Point} A new point with the added coordinates.
   */
  add(otherPoint) {
    return new Point(this.x + otherPoint.x, this.y + otherPoint.y);
  }

  /**
   * @method subtract
   * @description Subtracts the coordinates of another point from this point.
   * @param {Point} otherPoint
   * @returns {Point} A new point with the subtracted coordinates.
   */
  subtract(otherPoint) {
    return new Point(this.x - otherPoint.x, this.y - otherPoint.y);
  }

  /**
   * @method multiplyBy
   * @description Multiplies the coordinates of this point by a number.
   * @param {number} num
   * @returns {Point} A new point with the multiplied coordinates.
   */
  multiplyBy(num) {
    return new Point(this.x * num, this.y * num);
  }

  /**
   * @method divideBy
   * @description Divides the coordinates of this point by a number.
   * @param {number} num
   * @returns {Point} A new point with the divided coordinates.
   */
  divideBy(num) {
    return new Point(this.x / num, this.y / num);
  }
}

/**
 * @function toPoint
 * @description Creates a `Point` object from a given x and y coordinates.
 * @param {number} x
 * @param {number} y
 * @returns {Point} A new `Point` object.
 */
export function toPoint(x, y) {
  return new Point(x, y);
}
