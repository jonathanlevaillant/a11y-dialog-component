/* dialogs
 ========================================================================== */

const Dialogs = (() => {
  const DATA_COMPONENT = '[data-component="dialog"]';
  const DATA_DISMISS = '[data-dialog-hide]';
  const NESTED_ATTRIBUTE_PARSER = '[role="dialog"]';

  const CLASS_NAMES = {
    documentClass: 'js-document',
    documentDisabledClass: 'is-disabled',
    triggerActiveClass: 'is-active',
  };

  const KEY_CODES = {
    tab: 9,
    enter: 13,
    escape: 27,
    f6: 117,
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

  const DIALOGS = [];

  // check if the ID exists
  const exists = (id) => {
    if (!document.getElementById(id)) {
      console.warn(`a11y-dialog-component: ID '${id}' is not defined`);
      return false;
    }
    return true;
  };

  // prevent nested dialogs
  const queryFilter = (component, selectors) => {
    const nestedComponents = component.querySelectorAll(NESTED_ATTRIBUTE_PARSER);
    const elements = [];
    let isValidated = true;

    if (nestedComponents.length === 0) return selectors;

    selectors.forEach((selector) => {
      nestedComponents.forEach((nestedComponent) => {
        if (nestedComponent.contains(selector)) isValidated = false;
      });

      if (isValidated) elements.push(selector);
      isValidated = true;
    });

    return elements;
  };

  // return a dialog
  const getDialog = (dialogId) => {
    let myDialog = false;

    DIALOGS.forEach((dialog) => {
      if (dialogId === dialog.dialog.id) myDialog = dialog;
    });

    return myDialog;
  };

  // destroy a dialog and remove it from array
  const destroyDialog = (dialogId) => {
    let isDeleted = false;

    DIALOGS.forEach((dialog, index) => {
      if (dialogId === dialog.dialog.id) {
        dialog.destroy();

        DIALOGS.splice(index, 1);
        isDeleted = true;
      }
    });

    if (!isDeleted) console.warn(`a11y-dialog-component: ID '${dialogId}' is not a registered dialog`);
  };

  class Dialog {
    constructor(options) {
      this.trigger = options.trigger;
      this.dialog = options.dialog;
      this.dismissTriggers = queryFilter(this.dialog, this.dialog.querySelectorAll(DATA_DISMISS));
      this.labelledby = options.labelledby;
      this.describedby = options.describedby;

      this.focusableElements = queryFilter(this.dialog, this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS));
      [this.firstFocusableElement] = this.focusableElements;
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

      this.isShown = options.show;
      this.modal = options.modal;
      this.tooltip = options.tooltip;
      this.backdrop = options.backdrop;
      this.disableScroll = options.disableScroll;

      this.document = document.getElementsByClassName(options.documentClass)[0] || document.querySelector('html');
      this.documentDisabledClass = options.documentDisabledClass;
      this.triggerActiveClass = options.triggerActiveClass;

      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.toggle = this.toggle.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
    }

    onClick(event) {
      const dialogArea = `#${this.dialog.id}, ${DATA_COMPONENT}[data-target="${this.dialog.id}"]`;

      if (this.backdrop && event.target === this.dialog) this.hide();
      if (this.tooltip && !event.target.closest(dialogArea)) this.hide(event, false);
    }

    onKeydown(event) {
      switch (event.which) {
        case KEY_CODES.escape:
          event.stopPropagation();
          this.hide();
          break;
        case KEY_CODES.f6:
          if (!this.modal) !this.tooltip ? this.switchFocus() : this.hide();
          break;
        case KEY_CODES.tab:
          this.maintainFocus(event);
          break;
        default:
          break;
      }
    }

    addEventListeners() {
      document.addEventListener('click', this.onClick);
      document.addEventListener('touchstart', this.onClick);
      this.dialog.addEventListener('keydown', this.onKeydown);
      this.dismissTriggers.forEach((dismissTrigger) => {
        dismissTrigger.addEventListener('click', this.hide);
        dismissTrigger.addEventListener('touchstart', this.hide);
      });
    }

    removeEventListeners() {
      document.removeEventListener('click', this.onClick);
      document.removeEventListener('touchstart', this.onClick);
      this.dialog.removeEventListener('keydown', this.onKeydown);
      this.dismissTriggers.forEach((dismissTrigger) => {
        dismissTrigger.removeEventListener('click', this.hide);
        dismissTrigger.removeEventListener('touchstart', this.hide);
      });
    }

    // required to update dismiss triggers and focusable elements if a dialog is created in JS
    observer() {
      return new MutationObserver((mutations) => {
        mutations.forEach(() => {
          this.dismissTriggers = queryFilter(this.dialog, this.dialog.querySelectorAll(DATA_DISMISS));

          this.focusableElements = queryFilter(this.dialog, this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS));
          [this.firstFocusableElement] = this.focusableElements;
          this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
        });
      });
    }

    addObserver() {
      const observer = this.observer();
      const config = { attributes: true, attributeFilter: ['role'], subtree: true };

      observer.observe(this.dialog, config);
    }

    removeObserver() {
      const observer = this.observer();

      observer.disconnect();
    }

    // add aria attributes based on data attributes
    addAttributes() {
      if (this.trigger) this.trigger.setAttribute('aria-haspopup', 'dialog');

      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('tabindex', -1);

      if (this.modal) this.dialog.setAttribute('aria-modal', true);

      if (this.labelledby) this.dialog.setAttribute('aria-labelledby', this.labelledby);
      if (this.describedby) this.dialog.setAttribute('aria-describedby', this.describedby);
    }

    removeAttributes() {
      if (this.trigger) {
        this.trigger.removeAttribute('aria-haspopup');
        this.trigger.classList.remove(this.triggerActiveClass);
      }

      this.dialog.removeAttribute('role');
      this.dialog.removeAttribute('tabindex');
      this.dialog.removeAttribute('aria-hidden');
      this.dialog.removeAttribute('aria-modal');
      this.dialog.removeAttribute('aria-labelledby');
      this.dialog.removeAttribute('aria-describedby');
      this.document.classList.remove(this.documentDisabledClass);
    }

    // update aria attributes and classes
    setAttributes() {
      this.dialog.setAttribute('aria-hidden', !this.isShown);

      if (this.trigger && this.isShown) this.trigger.classList.add(this.triggerActiveClass);
      if (this.trigger && !this.isShown) this.trigger.classList.remove(this.triggerActiveClass);

      if (this.disableScroll && this.isShown) this.document.classList.add(this.documentDisabledClass);
      if (this.disableScroll && !this.isShown) this.document.classList.remove(this.documentDisabledClass);
    }

    // delete all data attributes if the dialog is destroyed
    removeDataAttributes() {
      if (this.trigger) {
        delete this.trigger.dataset.component;
        delete this.trigger.dataset.target;
        delete this.trigger.dataset.labelledby;
        delete this.trigger.dataset.describedby;
        delete this.trigger.dataset.show;
        delete this.trigger.dataset.modal;
        delete this.trigger.dataset.tooltip;
        delete this.trigger.dataset.backdrop;
        delete this.trigger.dataset.disableScroll;
      }
    }

    setFocus() {
      this.focusableElements.length > 0 ? this.firstFocusableElement.focus() : this.dialog.focus();
    }

    restoreFocus() {
      if (this.trigger) this.trigger.focus();
    }

    // focus trap
    maintainFocus(event) {
      if (this.focusableElements.length === 0) return;

      if (event.shiftKey && event.target === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }

      if (!event.shiftKey && event.target === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }

    // required for the non-modal dialogs (F6 key)
    switchFocus() {
      window.setTimeout(() => this.restoreFocus(), 100);
    }

    show(event) {
      if (event) event.preventDefault();

      this.isShown = true;

      this.setAttributes();
      this.addEventListeners();

      window.setTimeout(() => this.setFocus(), 100);
    }

    hide(event, restoreFocus = true) {
      if (event) event.preventDefault();

      this.isShown = false;

      this.setAttributes();
      this.removeEventListeners();

      if (restoreFocus) window.setTimeout(() => this.restoreFocus(), 100);
    }

    // required for the tooltip and non-modal dialogs
    toggle(event) {
      this.isShown = !this.isShown;

      this.isShown ? this.show(event) : this.hide(event);
    }

    destroy() {
      this.removeAttributes();
      this.removeDataAttributes();
      this.removeEventListeners();
      this.removeObserver();

      if (this.trigger) {
        this.trigger.removeEventListener('click', this.toggle);
        this.trigger.removeEventListener('touchstart', this.toggle);
      }
    }

    create() {
      this.addAttributes();
      this.addObserver();

      this.isShown ? this.show() : this.setAttributes();

      if (this.trigger) {
        this.trigger.addEventListener('click', this.toggle);
        this.trigger.addEventListener('touchstart', this.toggle);
      }
    }
  }

  // save all custom classes
  let customClassNames;

  const init = (config = CLASS_NAMES) => {
    const triggers = document.querySelectorAll(DATA_COMPONENT);
    const options = { ...CLASS_NAMES, ...config };

    customClassNames = { ...options };

    triggers.forEach((trigger) => {
      if (exists(trigger.dataset.target)) {
        const currentDialog = document.getElementById(trigger.dataset.target);

        options.trigger = trigger;
        options.dialog = currentDialog;
        options.labelledby = trigger.dataset.labelledby;
        options.describedby = trigger.dataset.describedby;

        options.show = trigger.dataset.show === 'true';
        options.modal = trigger.dataset.modal !== 'false';
        options.tooltip = trigger.dataset.tooltip === 'true';
        options.backdrop = options.tooltip ? false : trigger.dataset.backdrop !== 'false';
        options.disableScroll = trigger.dataset.disableScroll !== 'false';

        const dialog = new Dialog(options);
        dialog.create();

        // save each created dialogs
        DIALOGS.push(dialog);
      }
    });
  };

  const create = (dialogId, {
    triggerId = null,
    labelledbyId = null,
    describedbyId = null,
    show = false,
    modal = true,
    tooltip = false,
    backdrop = true,
    disableScroll = true,
  } = {}) => {
    const options = { ...customClassNames };

    if (exists(dialogId) && (!triggerId || exists(triggerId))) {
      const currentTrigger = document.getElementById(triggerId);
      const currentDialog = document.getElementById(dialogId);
      const duplicatedDialog = getDialog(dialogId);

      // if a dialog already exists, destroy oldest and keep the current
      if (duplicatedDialog) destroyDialog(duplicatedDialog.dialog.id);

      if (triggerId) {
        currentTrigger.dataset.component = 'dialog';
        currentTrigger.dataset.target = dialogId;
      }

      options.trigger = currentTrigger;
      options.dialog = currentDialog;
      options.labelledby = labelledbyId;
      options.describedby = describedbyId;

      options.show = show;
      options.modal = modal;
      options.tooltip = tooltip;
      options.backdrop = tooltip ? false : backdrop;
      options.disableScroll = disableScroll;

      const dialog = new Dialog(options);
      dialog.create();

      // save each created dialogs
      DIALOGS.push(dialog);
    }
  };

  const show = (dialogId) => {
    if (exists(dialogId)) {
      const dialog = getDialog(dialogId);

      dialog ? dialog.show() : console.warn(`a11y-dialog-component: ID '${dialogId}' is not a registered dialog`);
    }
  };

  const hide = (dialogId) => {
    if (exists(dialogId)) {
      const dialog = getDialog(dialogId);

      dialog ? dialog.hide() : console.warn(`a11y-dialog-component: ID '${dialogId}' is not a registered dialog`);
    }
  };

  const destroy = (dialogId) => {
    if (exists(dialogId)) {
      destroyDialog(dialogId);
    }
  };

  return {
    init,
    create,
    show,
    hide,
    destroy,
  };
})();

export default Dialogs;
