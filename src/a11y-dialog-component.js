/* dialogs
 ========================================================================== */

const DEFAULT_CONFIG = {
  transitionDuration: 200,
  activeOpenTriggerClass: 'is-active',
};

const FOCUSABLE_ELEMENTS = [
  '[href]:not([tabindex^="-"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex^="-"]):not([type="radio"])',
  'input[type="radio"]:checked',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
  '[contenteditable="true"]:not([tabindex^="-"])',
];

const KEY_CODES = {
  tab: 9,
  escape: 27,
  f6: 117,
};

// set private methods with symbols
const onClick = Symbol('onClick');
const onKeydown = Symbol('onKeydown');
const addEventListeners = Symbol('addEventListeners');
const removeEventListeners = Symbol('removeEventListeners');
const addAttributes = Symbol('addAttributes');
const removeAttributes = Symbol('removeAttributes');
const setAttributes = Symbol('setAttributes');
const setFocusableElements = Symbol('setFocusableElements');
const setFocus = Symbol('setFocus');
const switchFocus = Symbol('switchFocus');
const restoreFocus = Symbol('restoreFocus');
const maintainFocus = Symbol('maintainFocus');

// set the custom configuration
let config = DEFAULT_CONFIG;

export function setDialogs({
  transitionDuration = config.transitionDuration,
  activeOpenTriggerClass = config.activeOpenTriggerClass,
} = {}) {
  config = { ...DEFAULT_CONFIG, ...{ transitionDuration, activeOpenTriggerClass } };
}

// core dialog class
export default class Dialog {
  constructor(dialog, {
    onOpen = () => {},
    onClose = () => {},
    openTrigger,
    closeTrigger,
    backdropTrigger,
    labelledby,
    describedby,
    modal = true,
    tooltip = false,
    open = false,
    transitionDuration = config.transitionDuration,
    activeOpenTriggerClass = config.activeOpenTriggerClass,
  } = {}) {
    // save the initial configuration
    this.config = {
      dialog,
      onOpen,
      onClose,
      openTrigger,
      closeTrigger,
      backdropTrigger,
      labelledby,
      describedby,
      modal,
      tooltip,
      open,
      transitionDuration,
      activeOpenTriggerClass,
    };

    this.dialog = document.querySelector(dialog);
    this.openTriggers = document.querySelectorAll(openTrigger);
    this.closeTriggers = this.dialog.querySelectorAll(closeTrigger);
    this.backdropTrigger = document.querySelector(backdropTrigger);

    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.currentOpenTrigger = null;

    this.isOpen = open;

    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this[onClick] = this[onClick].bind(this);
    this[onKeydown] = this[onKeydown].bind(this);
    this[switchFocus] = this[switchFocus].bind(this);
  }

  [onClick](event) {
    if (this.config.tooltip && !event.target.closest(`${this.config.dialog}, ${this.config.openTrigger}`)) this.close(event);
    if (event.target === this.backdropTrigger) this.close(event);
  }

  [onKeydown](event) {
    switch (event.which) {
      case KEY_CODES.escape:
        this.close(event);
        break;
      case KEY_CODES.f6:
        if (!this.config.modal && !this.config.tooltip) this[restoreFocus]();
        break;
      case KEY_CODES.tab:
        this[maintainFocus](event);
        break;
      default:
        break;
    }
  }

  [addEventListeners]() {
    document.addEventListener('click', this[onClick]);
    this.dialog.addEventListener('keydown', this[onKeydown]);
    this.closeTriggers.forEach(closeTrigger => closeTrigger.addEventListener('click', this.close));
  }

  [removeEventListeners]() {
    document.removeEventListener('click', this[onClick]);
    this.dialog.removeEventListener('keydown', this[onKeydown]);
    this.closeTriggers.forEach(closeTrigger => closeTrigger.removeEventListener('click', this.close));

    if (this.currentOpenTrigger) this.currentOpenTrigger.removeEventListener('keydown', this[switchFocus]);
  }

  [addAttributes]() {
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('tabindex', -1);
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

    if (this.config.labelledby) this.dialog.setAttribute('aria-labelledby', this.config.labelledby);
    if (this.config.describedby) this.dialog.setAttribute('aria-describedby', this.config.describedby);

    if (this.config.modal) this.dialog.setAttribute('aria-modal', true);

    this.openTriggers.forEach(openTrigger => openTrigger.setAttribute('aria-haspopup', 'dialog'));
  }

  [removeAttributes]() {
    this.dialog.removeAttribute('role');
    this.dialog.removeAttribute('tabindex');
    this.dialog.removeAttribute('aria-hidden');
    this.dialog.removeAttribute('aria-labelledby');
    this.dialog.removeAttribute('aria-describedby');
    this.dialog.removeAttribute('aria-modal');

    this.openTriggers.forEach(openTrigger => openTrigger.removeAttribute('aria-haspopup'));
  }

  [setAttributes]() {
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

    if (this.currentOpenTrigger) {
      this.isOpen ? this.currentOpenTrigger.classList.add(this.config.activeOpenTriggerClass) : this.currentOpenTrigger.classList.remove(this.config.activeOpenTriggerClass);
    }
  }

  [setFocusableElements]() {
    const focusableElements = this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS);

    this.focusableElements = focusableElements.length > 0 ? focusableElements : [this.dialog];
    [this.firstFocusableElement] = this.focusableElements;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  [setFocus]() {
    window.setTimeout(() => this.firstFocusableElement.focus(), this.config.transitionDuration);
  }

  [switchFocus](event) {
    if (event.which === KEY_CODES.f6) {
      this.currentOpenTrigger.removeEventListener('keydown', this[switchFocus]);
      this[setFocus]();
    }
  }

  [restoreFocus]() {
    window.setTimeout(() => this.currentOpenTrigger.focus(), this.config.transitionDuration);

    // switch focus between the application and the open non-modal dialog
    if (this.isOpen) this.currentOpenTrigger.addEventListener('keydown', this[switchFocus]);
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

  open() {
    this.isOpen = true;

    this[setAttributes]();
    this[addEventListeners]();
    this[setFocus]();

    this.config.onOpen(this.dialog);
  }

  close(event) {
    this.isOpen = false;

    this[setAttributes]();
    this[removeEventListeners]();

    // restore focus except for tooltip click events
    if (this.currentOpenTrigger && (!this.config.tooltip || (this.config.tooltip && event.type !== 'click'))) this[restoreFocus]();

    this.config.onClose(this.dialog);
  }

  toggle(event) {
    // save the current open trigger if it exists
    if (event) this.currentOpenTrigger = event.currentTarget;

    this.isOpen ? this.close(event) : this.open();
  }

  create() {
    this[addAttributes]();
    this[setFocusableElements]();

    // if "isOpen" parameter is set to true when the dialog is created, then, open it
    if (this.isOpen) this.open();

    // add event listener to each open trigger linked to dialog
    this.openTriggers.forEach(openTrigger => openTrigger.addEventListener('click', this.toggle));
  }

  destroy() {
    this[removeAttributes]();
    this[removeEventListeners]();

    // remove event listener to each open trigger linked to dialog
    this.openTriggers.forEach(openTrigger => openTrigger.removeEventListener('click', this.toggle));
  }
}
