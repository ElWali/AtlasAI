/**
 * @namespace Point
 * @description Utility functions for working with points.
 */

/**
 * @function toPoint
 * @description Creates a point object from x and y coordinates.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 * @returns {{x: number, y: number}} A point object.
 */
export function toPoint(x, y) {
  return { x: x, y: y };
}

/**
 * @function clone
 * @description Returns a copy of the point.
 * @param {{x: number, y: number}} point - The point to clone.
 * @returns {{x: number, y: number}} A new point.
 */
export function clone(point) {
  return toPoint(point.x, point.y);
}

/**
 * @function add
 * @description Adds the coordinates of two points.
 * @param {{x: number, y: number}} point1 - The first point.
 * @param {{x: number, y: number}} point2 - The second point.
 * @returns {{x: number, y: number}} A new point.
 */
export function add(point1, point2) {
  return toPoint(point1.x + point2.x, point1.y + point2.y);
}

/**
 * @function subtract
 * @description Subtracts the coordinates of one point from another.
 * @param {{x: number, y: number}} point1 - The first point.
 * @param {{x: number, y: number}} point2 - The second point.
 * @returns {{x: number, y: number}} A new point.
 */
export function subtract(point1, point2) {
  return toPoint(point1.x - point2.x, point1.y - point2.y);
}

/**
 * @function multiplyBy
 * @description Multiplies the coordinates of a point by a number.
 * @param {{x: number, y: number}} point - The point.
 * @param {number} num - The number to multiply by.
 * @returns {{x: number, y: number}} A new point.
 */
export function multiplyBy(point, num) {
  return toPoint(point.x * num, point.y * num);
}

/**
 * @function divideBy
 * @description Divides the coordinates of a point by a number.
 * @param {{x: number, y: number}} point - The point.
 * @param {number} num - The number to divide by.
 * @returns {{x: number, y: number}} A new point.
 */
export function divideBy(point, num) {
  return toPoint(point.x / num, point.y / num);
}
