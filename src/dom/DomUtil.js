import { toPoint } from '../geometry/Point.js';

/**
 * @namespace DomUtil
 * @description Utility functions for working with the DOM.
 */
export const DomUtil = {
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
