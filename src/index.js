/* a11y-dialog-component
 ========================================================================== */

import focusableElements from './focusableElements';
import keyCodes from './keyCodes';
import { getVisibleElements, getNoNestedElements } from './utils';

// Use Symbols to create private methods
const onClick = Symbol('onClick');
const onKeydown = Symbol('onKeydown');
const addEventListeners = Symbol('addEventListeners');
const removeEventListeners = Symbol('removeEventListeners');
const addAttributes = Symbol('addAttributes');
const removeAttributes = Symbol('removeAttributes');
const setAttributes = Symbol('setAttributes');
const setHelpers = Symbol('setHelpers');
const setFocusableElements = Symbol('setFocusableElements');
const setFocus = Symbol('setFocus');
const restoreFocus = Symbol('restoreFocus');
const switchFocus = Symbol('switchFocus');
const maintainFocus = Symbol('maintainFocus');
const addObserver = Symbol('addObserver');
const removeObserver = Symbol('removeObserver');

// Export the default Dialog() class
export default class Dialog {
  constructor(
    dialogSelector,
    {
      onOpen = () => {},
      onClose = () => {},
      openingSelector,
      closingSelector,
      backdropSelector,
      labelledby,
      describedby,
      helpers = [],
      isModal = true,
      isTooltip = false,
      isOpen = false,
      isCreated = true,
      delay = 200,
    } = {},
  ) {
    // Check if the dialog exists, if not, return an empty constructor
    if (!document.querySelector(dialogSelector)) return;

    // Save the initial configuration
    this.config = {
      dialogSelector,
      onOpen,
      onClose,
      openingSelector,
      closingSelector,
      backdropSelector,
      labelledby,
      describedby,
      helpers,
      isModal,
      isTooltip,
      isCreated,
      isOpen,
      delay,
    };

    this.dialog = document.querySelector(dialogSelector);
    this.dialogArea = `${dialogSelector}, ${openingSelector}`;
    this.openingTriggers = document.querySelectorAll(openingSelector);
    this.closingTriggers = this.dialog.querySelectorAll(closingSelector);
    this.backdropTrigger = document.querySelector(backdropSelector);
    this.helpers = helpers;

    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.currentOpeningTrigger = null;

    this.isCreated = false;
    this.isOpen = false;

    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this[onClick] = this[onClick].bind(this);
    this[onKeydown] = this[onKeydown].bind(this);
    this[switchFocus] = this[switchFocus].bind(this);

    // Add mutation observer to update focusable elements
    this.observer = new MutationObserver(mutations => mutations.forEach(() => this[setFocusableElements]()));

    // Create the dialog
    if (isCreated) this.create();
  }

  [onClick](event) {
    if (this.config.isTooltip && !event.target.closest(this.dialogArea)) {
      this.close(event);
    }
    if (event.target === this.backdropTrigger) this.close(event);
  }

  [onKeydown](event) {
    switch (event.key) {
      case keyCodes.escape:
        event.stopPropagation();
        this.close(event);
        break;
      case keyCodes.f6:
        if (!this.config.isModal) !this.config.isTooltip ? this[restoreFocus]() : this.close(event);
        break;
      case keyCodes.tab:
        this[maintainFocus](event);
        break;
      default:
        break;
    }
  }

  [addEventListeners]() {
    document.addEventListener('click', this[onClick], { capture: true });
    this.dialog.addEventListener('keydown', this[onKeydown]);
    this.closingTriggers.forEach(closingTrigger => closingTrigger.addEventListener('click', this.close));
  }

  [removeEventListeners]() {
    document.removeEventListener('click', this[onClick], { capture: true });
    this.dialog.removeEventListener('keydown', this[onKeydown]);
    this.closingTriggers.forEach(closingTrigger => closingTrigger.removeEventListener('click', this.close));

    if (this.currentOpeningTrigger) this.currentOpeningTrigger.removeEventListener('keydown', this[switchFocus]);
  }

  [addAttributes]() {
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('tabindex', -1);
    this.dialog.setAttribute('aria-hidden', true);

    if (this.config.labelledby) this.dialog.setAttribute('aria-labelledby', this.config.labelledby);
    if (this.config.describedby) this.dialog.setAttribute('aria-describedby', this.config.describedby);

    if (this.config.isModal) this.dialog.setAttribute('aria-modal', true);

    this.openingTriggers.forEach(openingTrigger => openingTrigger.setAttribute('aria-haspopup', 'dialog'));
  }

  [removeAttributes]() {
    this.dialog.removeAttribute('role');
    this.dialog.removeAttribute('tabindex');
    this.dialog.removeAttribute('aria-hidden');
    this.dialog.removeAttribute('aria-labelledby');
    this.dialog.removeAttribute('aria-describedby');
    this.dialog.removeAttribute('aria-modal');

    this.openingTriggers.forEach(openingTrigger => openingTrigger.removeAttribute('aria-haspopup'));
  }

  [setAttributes]() {
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

    // Set custom helper class names
    this[setHelpers]();
  }

  [setHelpers]() {
    if (this.isOpen) this.helpers = this.helpers.map(helper => ({ ...helper, isValid: [] }));

    this.helpers.forEach(helper => {
      const elements = document.querySelectorAll(helper.selector);
      const { className } = helper;

      elements.forEach((element, index) => {
        if (this.isOpen) {
          if (!element.classList.contains(className)) {
            helper.isValid.push(true);
            element.classList.add(className);
          } else {
            helper.isValid.push(false);
          }
        } else if (!this.isOpen && helper.isValid[index]) element.classList.remove(className);
      });
    });
  }

  [setFocusableElements]() {
    const visibleFocusableElements = getVisibleElements(this.dialog.querySelectorAll(focusableElements));
    const filteredFocusableElements = getNoNestedElements(this.dialog, '[role="dialog"]', visibleFocusableElements);

    this.focusableElements = filteredFocusableElements.length > 0 ? filteredFocusableElements : [this.dialog];
    [this.firstFocusableElement] = this.focusableElements;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  [setFocus]() {
    window.setTimeout(() => this.firstFocusableElement.focus(), this.config.delay);
  }

  [restoreFocus]() {
    window.setTimeout(() => this.currentOpeningTrigger.focus(), this.config.delay);

    // Switch focus between the current opening trigger and the non-modal dialog
    if (this.isOpen) this.currentOpeningTrigger.addEventListener('keydown', this[switchFocus]);
  }

  [switchFocus](event) {
    if (event.key === keyCodes.f6) {
      this.currentOpeningTrigger.removeEventListener('keydown', this[switchFocus]);
      this[setFocus]();
    }
  }

  [maintainFocus](event) {
    if (event.shiftKey && event.target === this.firstFocusableElement) {
      event.preventDefault();
      this.lastFocusableElement.focus();
    }

    if (!event.shiftKey && event.target === this.lastFocusableElement) {
      event.preventDefault();
      this.firstFocusableElement.focus();
    }
  }

  [addObserver]() {
    this.observer.observe(this.dialog, { childList: true, attributes: true, subtree: true });
  }

  [removeObserver]() {
    this.observer.disconnect();
  }

  open() {
    if (!this.isCreated || this.isOpen) return;

    this.isOpen = true;

    this[setAttributes]();
    this[addEventListeners]();
    this[setFocus]();

    this.config.onOpen(this.dialog, this.currentOpeningTrigger);
  }

  close(event) {
    if (!this.isCreated || !this.isOpen) return;

    this.isOpen = false;

    this[setAttributes]();
    this[removeEventListeners]();

    // Restore focus except for tooltip click events
    if (
      this.currentOpeningTrigger &&
      (!this.config.isTooltip || (this.config.isTooltip && event && event.type !== 'click'))
    ) {
      this[restoreFocus]();
    }

    this.config.onClose(this.dialog, this.currentOpeningTrigger);
  }

  toggle(event) {
    if (!this.isCreated) return;

    // Save the current opening trigger if it exists
    if (event) this.currentOpeningTrigger = event.currentTarget;

    this.isOpen ? this.close(event) : this.open();
  }

  create() {
    if (this.isCreated) return;

    this.isCreated = true;

    this[addAttributes]();
    this[setFocusableElements]();
    this[addObserver]();

    if (this.config.isOpen) this.open();

    this.openingTriggers.forEach(openingTrigger => openingTrigger.addEventListener('click', this.toggle));
  }

  destroy() {
    if (!this.isCreated) return;

    this.close();

    this.isCreated = false;

    this[removeAttributes]();
    this[removeEventListeners]();
    this[removeObserver]();

    // Remove event listener to each opening trigger linked to dialog
    this.openingTriggers.forEach(openingTrigger => openingTrigger.removeEventListener('click', this.toggle));
  }
}
