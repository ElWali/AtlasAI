import { Evented } from '../core/Evented.js';
import { DomUtil } from '../dom/DomUtil.js';

/**
 * @class Popup
 * @description A class for displaying popups on the map.
 * @augments Evented
 */
export class Popup extends Evented {
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
    this._map.on('move', this._updatePosition, this);
  }

  onRemove() {
    if (this._map) {
      this._map.off('move', this._updatePosition, this);
    }
    DomUtil.remove(this._container);
    this._map = null;
  }

  getElement() {
    return this._container;
  }

  _initLayout() {
    this._container = DomUtil.create('div', 'atlas-popup');
    this._contentNode = DomUtil.create('div', 'atlas-popup-content', this._container);
    this._contentNode.innerHTML = this._content;
    this._tipContainer = DomUtil.create('div', 'atlas-popup-tip-container', this._container);
    this._tip = DomUtil.create('div', 'atlas-popup-tip', this._tipContainer);
    this._closeButton = DomUtil.create('a', 'atlas-popup-close-button', this._container);
    this._closeButton.href = '#close';
    this._closeButton.innerHTML = '&#215;';

    this._closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      this._map.closePopup();
    });
  }

  _updatePosition() {
    if (!this._map) { return; }
    const pos = this._map.latLngToLayerPoint(this._latlng);
    const offset = this.options.offset;
    const newPos = pos.add(offset);
    DomUtil.setPosition(this._container, newPos);
  }
}
