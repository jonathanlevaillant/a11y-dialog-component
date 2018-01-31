/* dialogs
 ========================================================================== */

const Dialogs = (() => {
  const CLASS_NAMES = {
    pageClassName: 'js-page',
    inertLayersClassName: 'js-inert-layer',
    disabledPageClassName: 'is-inactive',
  };

  const KEY_CODES = {
    tab: 9,
    enter: 13,
    escape: 27,
  };

  const FOCUSABLE_ELEMENTS = [
    '[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])',
  ];

  class Dialog {
    constructor(options) {
      this.trigger = options.trigger;
      this.dialog = document.getElementById(options.dialog);
      this.dismissTriggers = this.dialog.querySelectorAll('[data-dismiss]');

      this.focusableElements = this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS);
      [this.firstFocusableElement] = this.focusableElements;
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

      this.page = document.getElementsByClassName(options.pageClassName)[0] || document.querySelector('html');
      this.inertLayers = document.getElementsByClassName(options.inertLayersClassName);
      this.disabledPageClassName = options.disabledPageClassName;

      this.isNested = options.isNested;
      this.isOpen = options.isOpen;

      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
      this.onTransitionEnd = this.onTransitionEnd.bind(this);
      this.onAnimationEnd = this.onAnimationEnd.bind(this);

      if (this.isOpen) this.open();
    }

    focusTrap(event) {
      if (this.focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && event.target === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }

      if (!event.shiftKey && event.target === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }

    setFocus() {
      this.focusableElements.length > 0 ? this.firstFocusableElement.focus() : this.dialog.focus();
    }

    open(event) {
      if (event) event.preventDefault();

      this.dialog.removeAttribute('aria-hidden');

      if (!this.isNested) {
        this.page.classList.add(this.disabledPageClassName);

        Array.prototype.forEach.call(this.inertLayers, (inertLayer) => {
          inertLayer.setAttribute('aria-hidden', true);
          inertLayer.setAttribute('inert', '');
        });
      }

      // setting focus on the first focusable element
      this.setFocus();

      // add event listeners
      this.addEventListeners();
    }

    close(event) {
      if (event) event.preventDefault();

      this.dialog.setAttribute('aria-hidden', true);

      if (!this.isNested) {
        this.page.classList.remove(this.disabledPageClassName);

        Array.prototype.forEach.call(this.inertLayers, (inertLayer) => {
          inertLayer.removeAttribute('aria-hidden');
          inertLayer.removeAttribute('inert');
        });
      }

      // restoring focus
      if (this.trigger) this.trigger.focus();

      // remove event listeners
      this.removeEventListeners();
    }

    addEventListeners() {
      this.dialog.addEventListener('click', this.onClick);
      this.dialog.addEventListener('touchstart', this.onClick);
      this.dialog.addEventListener('keydown', this.onKeydown);
      this.dialog.addEventListener('transitionend', this.onTransitionEnd);
      this.dialog.addEventListener('animationend', this.onAnimationEnd);
      this.dismissTriggers.forEach((dismissTrigger) => {
        dismissTrigger.addEventListener('click', this.close);
      });
    }

    removeEventListeners() {
      this.dialog.removeEventListener('click', this.onClick);
      this.dialog.removeEventListener('touchstart', this.onClick);
      this.dialog.removeEventListener('keydown', this.onKeydown);
      this.dialog.removeEventListener('transitionend', this.onTransitionEnd);
      this.dialog.removeEventListener('animationend', this.onAnimationEnd);
      this.dismissTriggers.forEach((dismissTrigger) => {
        dismissTrigger.removeEventListener('click', this.close);
      });
    }

    onClick(event) {
      if (event.target === this.dialog) this.close(event);
    }

    onKeydown(event) {
      if (event.which === KEY_CODES.escape) this.close(event);
      if (event.which === KEY_CODES.enter && event.target.hasAttribute('data-dismiss')) this.close(event);
      if (event.which === KEY_CODES.tab) this.focusTrap(event);
    }

    onTransitionEnd(event) {
      // setting focus on the first focusable element after the css transition
      if (event.target === this.dialog) this.setFocus();
      this.dialog.removeEventListener('transitionend', this.onTransitionEnd);
    }

    onAnimationEnd(event) {
      // setting focus on the first focusable element after the css animation
      if (event.target === this.dialog) this.setFocus();
      this.dialog.removeEventListener('animationend', this.onAnimationEnd);
    }

    render() {
      if (this.trigger) {
        this.trigger.addEventListener('click', this.open);
        this.trigger.addEventListener('keydown', (event) => {
          if (event.which === KEY_CODES.enter) this.open(event);
        });
      }
    }
  }

  // save all active dialogs
  const activeDialogs = [];

  const open = (dialog, config = CLASS_NAMES) => {
    const options = Object.assign({}, CLASS_NAMES, config);
    options.dialog = dialog;
    options.trigger = config.trigger ? document.getElementById(config.trigger) : false;

    options.isNested = config.isNested || false;
    options.isOpen = true;

    const currentDialog = new Dialog(options);
    currentDialog.render();

    // add targeted dialog to array
    activeDialogs.push(currentDialog);
  };

  const close = (dialog) => {
    activeDialogs.forEach((activeDialog, index) => {
      if (dialog === activeDialog.dialog.id) {
        activeDialog.close();

        // remove targeted dialog from array
        activeDialogs.splice(index, 1);
      }
    });
  };

  const init = (selectors = '[data-component="dialog"]', config = CLASS_NAMES) => {
    const triggers = document.querySelectorAll(selectors);
    const options = Object.assign({}, CLASS_NAMES, config);

    triggers.forEach((trigger) => {
      options.trigger = trigger;
      options.dialog = trigger.dataset.target;

      options.isNested = trigger.dataset.nested === 'true';
      options.isOpen = trigger.dataset.open === 'true';

      const dialog = new Dialog(options);
      dialog.render();
    });
  };

  return { open, close, init };
})();

export default Dialogs;
