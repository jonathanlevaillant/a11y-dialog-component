/* dialogs
 ========================================================================== */

const DATA_COMPONENT = '[data-component="dialog"]';
const DATA_TRIGGER = '[data-dialog-target]';
const DATA_CLOSE = '[data-dialog-close]';

const DEFAULT_CONFIG = {
  transitionDuration: 200,
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
};

// set private methods with symbols
const onKeydown = Symbol('onKeydown');
const addEventListeners = Symbol('addEventListeners');
const removeEventListeners = Symbol('removeEventListeners');
const addAttributes = Symbol('addAttributes');
const removeAttributes = Symbol('removeAttributes');
const setAttributes = Symbol('setAttributes');
const setFocusableElements = Symbol('setFocusableElements');
const setFocus = Symbol('setFocus');
const restoreFocus = Symbol('restoreFocus');
const maintainFocus = Symbol('maintainFocus');

// set the custom configuration
let config = DEFAULT_CONFIG;

export function setDialogs({
  transitionDuration = config.transitionDuration,
} = {}) {
  config = { ...DEFAULT_CONFIG, ...{ transitionDuration } };
}

// core dialog class
export default class Dialog {
  constructor(dialogSelector, {
    dialog = document.querySelector(dialogSelector),
    onOpen = () => {},
    onClose = () => {},
    triggers = [],
    labelledby,
    describedby,
    modal = true,
    open = false,
    transitionDuration = config.transitionDuration,
  } = {}, dataComponent = false) {
    this.dialog = dialog;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.triggers = !dataComponent ? triggers.map(trigger => document.querySelector(trigger)) : triggers;
    this.currentTrigger = null;
    this.closeTriggers = this.dialog.querySelectorAll(DATA_CLOSE);
    this.labelledby = labelledby;
    this.describedby = describedby;
    this.modal = modal;
    this.isOpen = open;
    this.transitionDuration = transitionDuration;
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;

    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this[onKeydown] = this[onKeydown].bind(this);
  }

  [onKeydown](event) {
    switch (event.which) {
      case KEY_CODES.escape:
        this.close();
        break;
      case KEY_CODES.tab:
        this[maintainFocus](event);
        break;
      default:
        break;
    }
  }

  [addEventListeners]() {
    this.dialog.addEventListener('keydown', this[onKeydown]);
    this.closeTriggers.forEach(closeTrigger => closeTrigger.addEventListener('click', this.close));
  }

  [removeEventListeners]() {
    this.dialog.removeEventListener('keydown', this[onKeydown]);
    this.closeTriggers.forEach(closeTrigger => closeTrigger.removeEventListener('click', this.close));
  }

  [addAttributes]() {
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('tabindex', -1);
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

    if (this.labelledby) this.dialog.setAttribute('aria-labelledby', this.labelledby);
    if (this.describedby) this.dialog.setAttribute('aria-describedby', this.describedby);

    if (this.modal) this.dialog.setAttribute('aria-modal', true);

    this.triggers.forEach(trigger => trigger.setAttribute('aria-haspopup', 'dialog'));
  }

  [removeAttributes]() {
    this.dialog.removeAttribute('role');
    this.dialog.removeAttribute('tabindex');
    this.dialog.removeAttribute('aria-hidden');
    this.dialog.removeAttribute('aria-labelledby');
    this.dialog.removeAttribute('aria-describedby');
    this.dialog.removeAttribute('aria-modal');

    this.triggers.forEach(trigger => trigger.removeAttribute('aria-haspopup'));
  }

  [setAttributes]() {
    this.dialog.setAttribute('aria-hidden', !this.isOpen);
  }

  [setFocusableElements]() {
    const focusableElements = this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS);

    this.focusableElements = focusableElements.length > 0 ? focusableElements : [this.dialog];
    [this.firstFocusableElement] = this.focusableElements;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  [setFocus]() {
    window.setTimeout(() => this.firstFocusableElement.focus(), this.transitionDuration);
  }

  [restoreFocus]() {
    if (this.currentTrigger) window.setTimeout(() => this.currentTrigger.focus(), this.transitionDuration);
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

    this.onOpen(this.dialog);
  }

  close() {
    this.isOpen = false;

    this[setAttributes]();
    this[removeEventListeners]();
    this[restoreFocus]();

    this.onClose(this.dialog);
  }

  toggle(event) {
    this.isOpen ? this.close() : this.open();

    // save the current trigger if it exists
    if (event) this.currentTrigger = event.currentTarget;
  }

  create() {
    this[addAttributes]();
    this[setFocusableElements]();

    // if "isOpen" parameter is set to true when the dialog is created, then, open it
    if (this.isOpen) this.open();

    // add event listener to each trigger linked to dialog
    this.triggers.forEach(trigger => trigger.addEventListener('click', this.toggle));
  }

  destroy() {
    this[removeAttributes]();
    this[removeEventListeners]();

    // remove event listener to each trigger linked to dialog
    this.triggers.forEach(trigger => trigger.removeEventListener('click', this.toggle));
  }
}

// add dialogs based on data components
export function addDialogs() {
  const dialogs = document.querySelectorAll(DATA_COMPONENT);
  const triggers = [...document.querySelectorAll(DATA_TRIGGER)]; // convert nodelist to triggers array
  const parameters = { ...config };

  dialogs.forEach((dialog) => {
    const { transitionDuration } = dialog.dataset;

    parameters.dialog = dialog;
    parameters.triggers = triggers.filter(trigger => trigger.dataset.dialogTarget === dialog.id);
    parameters.labelledby = dialog.dataset.labelledby;
    parameters.describedby = dialog.dataset.describedby;
    parameters.modal = dialog.dataset.modal !== 'false';
    parameters.open = dialog.dataset.open === 'true';
    parameters.transitionDuration = transitionDuration ? parseInt(transitionDuration, 10) : config.transitionDuration;

    // create the dialog with previous parameters
    const currentDialog = new Dialog(null, parameters, true);
    currentDialog.create();
  });
}
