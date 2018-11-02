/* dialogs
 ========================================================================== */

// save the global default configuration
const defaultConfig = {
  transitionDuration: 200,
  triggerActiveClass: 'is-active',
};

// save all keyboard focusable elements
const focusableElements = [
  '[href]:not([tabindex^="-"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex^="-"]):not([type="radio"])',
  'input[type="radio"]:checked',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
  '[contenteditable="true"]:not([tabindex^="-"])',
];

// save all keyboard codes
const keyCodes = {
  escape: 'Escape',
  tab: 'Tab',
  f6: 'F6',
};

// only get visible selectors
const getVisibleSelectors = (selectors) => {
  const visibleSelectors = [];

  selectors.forEach((selector) => {
    const bounding = selector.getBoundingClientRect();
    const isVisible = bounding.width > 0 || bounding.height > 0;

    if (isVisible) visibleSelectors.push(selector);
  });

  return visibleSelectors;
};

// only get no nested selectors
const getNoNestedSelectors = (dialog, selectors) => {
  const nestedDialogs = dialog.querySelectorAll('[role="dialog"]');
  const noNestedSelectors = [];
  let isNested = false;

  if (nestedDialogs.length === 0) return selectors;

  selectors.forEach((selector) => {
    nestedDialogs.forEach((nestedDialog) => {
      if (nestedDialog.contains(selector)) isNested = true;
    });

    if (!isNested) noNestedSelectors.push(selector);

    isNested = false;
  });

  return noNestedSelectors;
};

// create private methods with symbols
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

let customConfig = defaultConfig;

// update the global default configuration if needed
export function setDialogs({
  transitionDuration = customConfig.transitionDuration,
  triggerActiveClass = customConfig.triggerActiveClass,
} = {}) {
  customConfig = { ...defaultConfig, ...{ transitionDuration, triggerActiveClass } };
}

// export the core dialog class
export default class Dialog {
  constructor(dialog, {
    onOpen = () => {},
    onClose = () => {},
    openingTrigger,
    closingTrigger,
    backdropElement,
    labelledby,
    describedby,
    isModal = true,
    isTooltip = false,
    isOpen = false,
    transitionDuration = customConfig.transitionDuration,
    triggerActiveClass = customConfig.triggerActiveClass,
  } = {}) {
    // save the initial configuration
    this.config = {
      dialog,
      onOpen,
      onClose,
      openingTrigger,
      closingTrigger,
      backdropElement,
      labelledby,
      describedby,
      isModal,
      isTooltip,
      isOpen,
      transitionDuration,
      triggerActiveClass,
    };

    this.dialog = document.querySelector(dialog);
    this.openingTriggers = document.querySelectorAll(openingTrigger);
    this.closingTriggers = this.dialog.querySelectorAll(closingTrigger);
    this.backdropElement = document.querySelector(backdropElement);

    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.currentOpeningTrigger = null;

    this.isOpen = isOpen;

    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this[onClick] = this[onClick].bind(this);
    this[onKeydown] = this[onKeydown].bind(this);
    this[switchFocus] = this[switchFocus].bind(this);

    // add mutation observer to update focusable elements when a nested dialog is created
    this.observer = new MutationObserver((mutations => mutations.forEach(() => this[setFocusableElements]())));
  }

  [onClick](event) {
    if (this.config.isTooltip && !event.target.closest(`${this.config.dialog}, ${this.config.openingTrigger}`)) this.close(event);
    if (event.target === this.backdropElement) this.close(event);
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
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

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

    if (this.currentOpeningTrigger) this.currentOpeningTrigger.classList.remove(this.config.triggerActiveClass);
  }

  [setAttributes]() {
    this.dialog.setAttribute('aria-hidden', !this.isOpen);

    if (this.currentOpeningTrigger) this.currentOpeningTrigger.classList.toggle(this.config.triggerActiveClass);
  }

  [setFocusableElements]() {
    const focusableElems = getNoNestedSelectors(this.dialog, getVisibleSelectors(this.dialog.querySelectorAll(focusableElements)));

    this.focusableElements = focusableElems.length > 0 ? focusableElems : [this.dialog];
    [this.firstFocusableElement] = this.focusableElements;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  [setFocus]() {
    window.setTimeout(() => this.firstFocusableElement.focus(), this.config.transitionDuration);
  }

  [restoreFocus]() {
    window.setTimeout(() => this.currentOpeningTrigger.focus(), this.config.transitionDuration);

    // switch focus between the current opening trigger and the non-modal dialog
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
    this.observer.observe(this.dialog, { attributeFilter: ['role'], subtree: true });
  }

  [removeObserver]() {
    this.observer.disconnect();
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
    if (this.currentOpeningTrigger && (!this.config.isTooltip || (this.config.isTooltip && event.type !== 'click'))) this[restoreFocus]();

    this.config.onClose(this.dialog);
  }

  toggle(event) {
    // save the current opening trigger if it exists
    if (event) this.currentOpeningTrigger = event.currentTarget;

    this.isOpen ? this.close(event) : this.open();
  }

  create() {
    this[addAttributes]();
    this[setFocusableElements]();
    this[addObserver]();

    // if "isOpen" parameter is set to true when the dialog is created, then, open it
    if (this.isOpen) this.open();

    // add event listener to each opening trigger linked to dialog
    this.openingTriggers.forEach(openingTrigger => openingTrigger.addEventListener('click', this.toggle));
  }

  destroy() {
    this[removeAttributes]();
    this[removeEventListeners]();
    this[removeObserver]();

    // remove event listener to each opening trigger linked to dialog
    this.openingTriggers.forEach(openingTrigger => openingTrigger.removeEventListener('click', this.toggle));
  }
}
