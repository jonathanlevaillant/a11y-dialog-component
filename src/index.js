/* a11y-dialog-component
 ========================================================================== */

import config from './defaults';
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
const setFocusableElements = Symbol('setFocusableElements');
const setFocus = Symbol('setFocus');
const restoreFocus = Symbol('restoreFocus');
const switchFocus = Symbol('switchFocus');
const maintainFocus = Symbol('maintainFocus');
const addObserver = Symbol('addObserver');
const removeObserver = Symbol('removeObserver');

let customConfig = config;

// Update the global configuration if needed
export function setDefaults({
  documentSelector = customConfig.documentSelector,
  documentDisabledClass = customConfig.documentDisabledClass,
  openingTriggerActiveClass = customConfig.openingTriggerActiveClass,
  delay = customConfig.delay,
} = {}) {
  customConfig = {
    ...config,
    ...{
      documentSelector,
      documentDisabledClass,
      openingTriggerActiveClass,
      delay,
    },
  };
}

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
      helperSelector,
      labelledby,
      describedby,
      isModal = true,
      isTooltip = false,
      isOpen = false,
      isCreated = true,
      disableScroll = true,
      openingTriggerActiveClass = customConfig.openingTriggerActiveClass,
      delay = customConfig.delay,
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
      helperSelector,
      labelledby,
      describedby,
      isModal,
      isTooltip,
      isCreated,
      isOpen,
      disableScroll,
      documentSelector: customConfig.documentSelector,
      documentDisabledClass: customConfig.documentDisabledClass,
      openingTriggerActiveClass,
      delay,
    };

    this.dialog = document.querySelector(dialogSelector);
    this.dialogArea = `${dialogSelector}, ${openingSelector}`;
    this.openingTriggers = document.querySelectorAll(openingSelector);
    this.closingTriggers = this.dialog.querySelectorAll(closingSelector);
    this.backdropTrigger = document.querySelector(backdropSelector);
    this.helpers = document.querySelectorAll(helperSelector);

    this.document = document.querySelector(this.config.documentSelector) || document.querySelector('html');
    this.documentIsAlreadyDisabled = false;

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

    if (this.config.disableScroll && this.isOpen && !this.documentIsAlreadyDisabled) {
      this.document.classList.remove(this.config.documentDisabledClass);
    }

    this.openingTriggers.forEach(openingTrigger => openingTrigger.removeAttribute('aria-haspopup'));

    if (this.currentOpeningTrigger) this.currentOpeningTrigger.classList.remove(this.config.openingTriggerActiveClass);

    this.helpers.forEach(helper => helper.classList.remove(this.config.openingTriggerActiveClass));
  }

  [setAttributes]() {
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

    if (this.config.disableScroll && !this.documentIsAlreadyDisabled) {
      if (this.isOpen) {
        this.document.classList.add(this.config.documentDisabledClass);
      } else {
        this.document.classList.remove(this.config.documentDisabledClass);
      }
    }

    if (this.currentOpeningTrigger) {
      if (this.isOpen) {
        this.currentOpeningTrigger.classList.add(this.config.openingTriggerActiveClass);
      } else {
        this.openingTriggers.forEach(openingTrigger => {
          openingTrigger.classList.remove(this.config.openingTriggerActiveClass);
        });
      }
    }

    this.helpers.forEach(helper => {
      if (this.isOpen) {
        helper.classList.add(this.config.openingTriggerActiveClass);
      } else {
        helper.classList.remove(this.config.openingTriggerActiveClass);
      }
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
    this.documentIsAlreadyDisabled = this.document.classList.contains(this.config.documentDisabledClass);

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
