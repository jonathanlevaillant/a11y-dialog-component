/* a11y-dialog-component
 ========================================================================== */

import config from './defaults';
import focusableElements from './focusableElements';
import keyCodes from './keyCodes';
import { getVisibleElements, getNoNestedElements, closest } from './utils';

// Use Symbols to create private methods
const onClick = Symbol('onClick');
const onKeydown = Symbol('onKeydown');
const addEventDelegation = Symbol('addEventDelegation');
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
      enableAutoFocus = true,
      openingTriggerActiveClass = customConfig.openingTriggerActiveClass,
      delay = customConfig.delay,
    } = {},
  ) {
    // Check if the dialog exists, if not, set `isInitialized` to false
    if (!document.querySelector(dialogSelector)) {
      this.isInitialized = false;
      return;
    }

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
      enableAutoFocus,
      documentSelector: customConfig.documentSelector,
      documentDisabledClass: customConfig.documentDisabledClass,
      openingTriggerActiveClass,
      delay,
    };

    this.dialog = document.querySelector(dialogSelector);
    this.dialogArea = `${dialogSelector}, ${openingSelector}`;
    this.openingTriggers = document.querySelectorAll(openingSelector);
    this.backdropTrigger = document.querySelector(backdropSelector);
    this.helpers = document.querySelectorAll(helperSelector);

    this.document = document.querySelector(this.config.documentSelector) || document.querySelector('html');
    this.documentIsAlreadyDisabled = false;

    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.openingTrigger = null;
    this.closingTrigger = null;

    this.isCreated = false;
    this.isOpen = false;

    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this[onClick] = this[onClick].bind(this);
    this[onKeydown] = this[onKeydown].bind(this);
    this[addEventDelegation] = this[addEventDelegation].bind(this);
    this[switchFocus] = this[switchFocus].bind(this);

    // Add mutation observer to update focusable elements
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => this[setFocusableElements]()));

    // initialize the dialog
    this.isInitialized = true;

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

  [addEventDelegation](event) {
    document.querySelectorAll(this.config.openingSelector).forEach((openingTrigger) => {
      if (closest(event.target, openingTrigger)) {
        this.openingTrigger = openingTrigger;
        this.toggle(event);
      }
    });

    document.querySelectorAll(this.config.closingSelector).forEach((closingTrigger) => {
      if (closest(event.target, closingTrigger)) {
        this.closingTrigger = closingTrigger;
        this.close();
      }
    });
  }

  [addEventListeners]() {
    document.addEventListener('click', this[onClick], { capture: true });
    this.dialog.addEventListener('keydown', this[onKeydown]);
  }

  [removeEventListeners]() {
    document.removeEventListener('click', this[onClick], { capture: true });
    this.dialog.removeEventListener('keydown', this[onKeydown]);

    if (this.openingTrigger) this.openingTrigger.removeEventListener('keydown', this[switchFocus]);
  }

  [addAttributes]() {
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('tabindex', -1);
    this.dialog.setAttribute('aria-hidden', true);

    if (this.config.labelledby) this.dialog.setAttribute('aria-labelledby', this.config.labelledby);
    if (this.config.describedby) this.dialog.setAttribute('aria-describedby', this.config.describedby);

    if (this.config.isModal) this.dialog.setAttribute('aria-modal', true);

    this.openingTriggers.forEach((openingTrigger) => openingTrigger.setAttribute('aria-haspopup', 'dialog'));
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

    this.openingTriggers.forEach((openingTrigger) => openingTrigger.removeAttribute('aria-haspopup'));

    if (this.openingTrigger) this.openingTrigger.classList.remove(this.config.openingTriggerActiveClass);

    this.helpers.forEach((helper) => helper.classList.remove(this.config.openingTriggerActiveClass));
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

    if (this.openingTrigger) {
      if (this.isOpen) {
        this.openingTrigger.classList.add(this.config.openingTriggerActiveClass);
      } else {
        this.openingTrigger.classList.remove(this.config.openingTriggerActiveClass);
      }
    }

    this.helpers.forEach((helper) => {
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
    if (this.config.enableAutoFocus) window.setTimeout(() => this.firstFocusableElement.focus(), this.config.delay);
  }

  [restoreFocus]() {
    if (this.config.enableAutoFocus) window.setTimeout(() => this.openingTrigger.focus(), this.config.delay);

    // Switch focus between the current opening trigger and the non-modal dialog
    if (this.isOpen) this.openingTrigger.addEventListener('keydown', this[switchFocus]);
  }

  [switchFocus](event) {
    if (event.key === keyCodes.f6) {
      this.openingTrigger.removeEventListener('keydown', this[switchFocus]);
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
    if (!this.isInitialized || !this.isCreated || this.isOpen) return;

    this.isOpen = true;
    this.documentIsAlreadyDisabled = this.document.classList.contains(this.config.documentDisabledClass);

    this[setAttributes]();
    this[addEventListeners]();
    this[setFocus]();

    this.config.onOpen(this.dialog, this.openingTrigger);
  }

  close(event) {
    if (!this.isInitialized || !this.isCreated || !this.isOpen) return;

    this.isOpen = false;

    if (event) event.preventDefault();

    this[setAttributes]();
    this[removeEventListeners]();

    // Restore focus except for tooltip click events
    if (this.openingTrigger && (!this.config.isTooltip || (this.config.isTooltip && event && event.type !== 'click'))) {
      this[restoreFocus]();
    }

    this.config.onClose(this.dialog, this.closingTrigger);
  }

  toggle(event) {
    if (!this.isInitialized || !this.isCreated) return;

    if (event) event.preventDefault();

    this.isOpen ? this.close() : this.open();
  }

  create() {
    if (!this.isInitialized || this.isCreated) return;

    this.isCreated = true;

    this[addAttributes]();
    this[setFocusableElements]();
    this[addObserver]();

    if (this.config.isOpen) this.open();

    document.addEventListener('click', this[addEventDelegation], { capture: true });
  }

  destroy() {
    if (!this.isInitialized || !this.isCreated) return;

    this.close();

    this.isCreated = false;

    this[removeAttributes]();
    this[removeEventListeners]();
    this[removeObserver]();

    document.removeEventListener('click', this[addEventDelegation], { capture: true });
  }
}
