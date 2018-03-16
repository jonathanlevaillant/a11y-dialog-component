/* dialogs
 ========================================================================== */

const Dialogs = (() => {
  const DATA_COMPONENT = '[data-component="dialog"]';

  const CLASS_NAMES = {
    pageClassName: 'js-document',
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
      this.dismissTriggers = this.queryFilter(this.dialog.querySelectorAll('[data-dismiss]'));

      this.focusableElements = this.queryFilter(this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS));
      [this.firstFocusableElement] = this.focusableElements;
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

      this.page = document.getElementsByClassName(options.pageClassName)[0] || document.querySelector('html');
      this.inertLayers = document.getElementsByClassName(options.inertLayersClassName);
      this.disabledPageClassName = options.disabledPageClassName;

      this.disabledPage = options.disabledPage;
      this.isOpen = options.isOpen;

      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
      this.onTransitionEnd = this.onTransitionEnd.bind(this);
      this.onAnimationEnd = this.onAnimationEnd.bind(this);

      if (this.isOpen) this.open();
    }

    queryFilter(selectors) {
      const triggers = this.dialog.querySelectorAll(DATA_COMPONENT);
      const elements = [];
      let isValidated = true;

      if (triggers.length === 0) return selectors;

      selectors.forEach((selector) => {
        triggers.forEach((trigger) => {
          const dialog = document.getElementById(trigger.dataset.target);

          if (dialog.contains(selector)) isValidated = false;
        });

        if (isValidated) elements.push(selector);
        isValidated = true;
      });

      return elements;
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

      if (this.disabledPage) {
        this.page.classList.add(this.disabledPageClassName);

        Array.prototype.forEach.call(this.inertLayers, (inertLayer) => {
          inertLayer.setAttribute('aria-hidden', true);
          inertLayer.setAttribute('inert', '');
        });
      }

      // add event listeners
      this.addEventListeners();

      // setting focus on the first focusable element
      this.setFocus();
    }

    close(event) {
      if (event) event.preventDefault();

      this.dialog.setAttribute('aria-hidden', true);

      if (this.disabledPage) {
        this.page.classList.remove(this.disabledPageClassName);

        Array.prototype.forEach.call(this.inertLayers, (inertLayer) => {
          inertLayer.removeAttribute('aria-hidden');
          inertLayer.removeAttribute('inert');
        });
      }

      // remove event listeners
      this.removeEventListeners();

      // restoring focus
      if (this.trigger) this.trigger.focus();
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
      // prevent nested dialogs
      event.stopPropagation();

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
      this.trigger.addEventListener('click', this.open);
      this.trigger.addEventListener('keydown', (event) => {
        if (event.which === KEY_CODES.enter) this.open(event);
      });
    }
  }

  // save all active dialogs
  const activeDialogs = [];
  let customClassNames;

  const open = (dialog, { triggerId = null, disabledPage = true } = {}) => {
    const options = { ...customClassNames, ...{ dialog, disabledPage } };

    options.trigger = document.getElementById(triggerId);
    options.isOpen = true;

    const activeDialog = new Dialog(options);

    // add active dialog to array
    activeDialogs.push(activeDialog);
  };

  const close = (dialog) => {
    activeDialogs.forEach((activeDialog, index) => {
      if (dialog === activeDialog.dialog.id) {
        activeDialog.close();

        // remove closed dialog from array
        activeDialogs.splice(index, 1);
      }
    });
  };

  const init = (config = CLASS_NAMES) => {
    const triggers = document.querySelectorAll(DATA_COMPONENT);
    const options = { ...CLASS_NAMES, ...config };

    customClassNames = { ...options };

    triggers.forEach((trigger) => {
      options.trigger = trigger;
      options.dialog = trigger.dataset.target;

      options.disabledPage = trigger.dataset.disabledPage !== 'false';
      options.isOpen = trigger.dataset.open === 'true';

      const dialog = new Dialog(options);
      dialog.render();
    });
  };

  return { open, close, init };
})();

export default Dialogs;
