/* dialogs
 ========================================================================== */

const Dialogs = (() => {
  const DATA_COMPONENT = '[data-component="dialog"]';
  const DATA_DISMISS = '[data-dismiss]';
  const DATA_NESTED = '[data-nested="true"]'; // prevent nested dialogs

  const CLASS_NAMES = {
    documentClass: 'js-document',
    disabledDocumentClass: 'is-disabled',
    activeTriggerClass: 'is-active',
  };

  const KEY_CODES = {
    tab: 9,
    enter: 13,
    escape: 27,
    f6: 117,
  };

  const FOCUSABLE_ELEMENTS = [
    '[href]:not([tabindex^="-"])',
    'input:not([disabled]):not([type="hidden"]):not([tabindex^="-"])',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
    '[contenteditable="true"]:not([tabindex^="-"])',
  ];

  const DIALOGS = []; // save all active dialogs

  const exists = (id) => {
    if (!document.getElementById(id)) {
      console.warn(`a11y-dialog-component: ID '${id}' is not defined`);
      return false;
    }
    return true;
  };

  const queryFilter = (component, selectors) => {
    const nestedComponents = component.querySelectorAll(DATA_NESTED);
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

  const getDialog = (dialogId) => {
    let myDialog = false;

    DIALOGS.forEach((dialog) => {
      if (dialogId === dialog.dialog.id) myDialog = dialog;
    });

    return myDialog;
  };

  const getDialogs = () => DIALOGS;

  const dropDialog = (dialogId) => {
    let find = false;

    DIALOGS.forEach((dialog, index) => {
      if (dialogId === dialog.dialog.id) {
        dialog.destroy();

        DIALOGS.splice(index, 1);
        find = true;
      }
    });

    if (!find) console.warn(`a11y-dialog-component: ID '${dialogId}' is not a registered dialog`);
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

      this.isOpen = options.isOpen;
      this.modal = options.modal;
      this.tooltip = options.tooltip;
      this.hasBackdrop = options.hasBackdrop;
      this.disableScroll = options.disableScroll;

      this.document = document.getElementsByClassName(options.documentClass)[0] || document.querySelector('html');
      this.disabledDocumentClass = options.disabledDocumentClass;
      this.activeTriggerClass = options.activeTriggerClass;

      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.toggle = this.toggle.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
    }

    onClick(event) {
      const dialogArea = `#${this.dialog.id}, ${DATA_COMPONENT}[data-target="${this.dialog.id}"]`;

      if (this.hasBackdrop && event.target === this.dialog) this.close();
      if (this.tooltip && !event.target.closest(dialogArea)) this.close();
    }

    onKeydown(event) {
      switch (event.which) {
        case KEY_CODES.escape:
          event.stopPropagation(); // prevent nested dialogs
          this.close();
          break;
        case KEY_CODES.f6:
          if (!this.modal) this.switchFocus();
          break;
        case KEY_CODES.tab:
          this.maintainFocus(event); // trap focus inside the dialog
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
        dismissTrigger.addEventListener('click', this.close);
        dismissTrigger.addEventListener('touchstart', this.close);
      });
    }

    removeEventListeners() {
      document.removeEventListener('click', this.onClick);
      document.removeEventListener('touchstart', this.onClick);
      this.dialog.removeEventListener('keydown', this.onKeydown);
      this.dismissTriggers.forEach((dismissTrigger) => {
        dismissTrigger.removeEventListener('click', this.close);
        dismissTrigger.removeEventListener('touchstart', this.close);
      });
    }

    addAriaAttributes() {
      if (this.trigger) this.trigger.setAttribute('aria-haspopup', 'dialog');

      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('tabindex', -1);

      if (this.modal) this.dialog.setAttribute('aria-modal', true);

      if (this.labelledby) this.dialog.setAttribute('aria-labelledby', this.labelledby);
      if (this.describedby) this.dialog.setAttribute('aria-describedby', this.describedby);
    }

    removeAriaAttributes() {
      if (this.trigger) this.trigger.removeAttribute('aria-haspopup');

      this.dialog.removeAttribute('role');
      this.dialog.removeAttribute('tabindex');
      this.dialog.removeAttribute('aria-hidden');

      if (this.modal) this.dialog.removeAttribute('aria-modal');

      if (this.labelledby) this.dialog.removeAttribute('aria-labelledby');
      if (this.describedby) this.dialog.removeAttribute('aria-describedby');

      if (this.disableScroll && this.isOpen) this.document.classList.remove(this.disabledDocumentClass);
    }

    setAriaAttributes() {
      this.dialog.setAttribute('aria-hidden', !this.isOpen);

      if (this.trigger && this.isOpen) this.trigger.classList.add(this.activeTriggerClass);
      if (this.trigger && !this.isOpen) this.trigger.classList.remove(this.activeTriggerClass);

      if (this.disableScroll && this.isOpen) this.document.classList.add(this.disabledDocumentClass);
      if (this.disableScroll && !this.isOpen) this.document.classList.remove(this.disabledDocumentClass);
    }

    setFocus() {
      this.focusableElements.length > 0 ? this.firstFocusableElement.focus() : this.dialog.focus();
    }

    restoreFocus() {
      if (this.trigger) this.trigger.focus();
    }

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

    switchFocus() {
      window.setTimeout(() => this.restoreFocus(), 100); // set delay to restore focus on the trigger
    }

    open(event) {
      if (event) event.preventDefault();

      this.isOpen = true;

      this.setAriaAttributes();
      this.addEventListeners();

      window.setTimeout(() => this.setFocus(), 100); // set delay to set focus inside the dialog
    }

    close(event) {
      if (event) event.preventDefault();

      this.isOpen = false;

      this.setAriaAttributes();
      this.removeEventListeners();

      window.setTimeout(() => this.restoreFocus(), 100); // set delay to restore focus on the trigger
    }

    toggle(event) {
      this.isOpen = !this.isOpen;

      this.isOpen ? this.open(event) : this.close(event); // enable toggle triggers for tooltips and modeless dialogs
    }

    destroy() {
      this.removeAriaAttributes();
      this.removeEventListeners();

      if (this.trigger) {
        this.trigger.removeEventListener('click', this.toggle);
        this.trigger.removeEventListener('touchstart', this.toggle);
      }
    }

    render() {
      this.addAriaAttributes();

      this.isOpen ? this.open() : this.setAriaAttributes();

      if (this.trigger) {
        this.trigger.addEventListener('click', this.toggle);
        this.trigger.addEventListener('touchstart', this.toggle);
      }
    }
  }

  let customClassNames; // save custom class names from the initial config

  const init = (config = CLASS_NAMES) => {
    const triggers = document.querySelectorAll(DATA_COMPONENT);
    const options = { ...CLASS_NAMES, ...config };

    customClassNames = { ...options };

    triggers.forEach((trigger) => {
      if (exists(trigger.dataset.target)) {
        const currentDialog = document.getElementById(trigger.dataset.target);

        options.trigger = trigger;
        options.dialog = currentDialog;
        options.labelledby = currentDialog.dataset.labelledby;
        options.describedby = currentDialog.dataset.describedby;

        options.isOpen = currentDialog.dataset.open === 'true';
        options.modal = currentDialog.dataset.modal !== 'false';
        options.tooltip = currentDialog.dataset.tooltip === 'true';
        options.hasBackdrop = currentDialog.dataset.backdrop === 'true';
        options.disableScroll = currentDialog.dataset.disableScroll !== 'false';

        const dialog = new Dialog(options);
        dialog.render();

        DIALOGS.push(dialog); // save dialog
      }
    });
  };

  const render = (dialogId, {
    triggerId = null,
    labelledbyId = null,
    describedbyId = null,
    isOpen = null,
    isNested = null,
    modal = null,
    tooltip = null,
    hasBackdrop = null,
    disableScroll = null,
  } = {}) => {
    const options = { ...customClassNames };

    if (exists(dialogId) && (!triggerId || exists(triggerId))) {
      const currentTrigger = document.getElementById(triggerId);
      const currentDialog = document.getElementById(dialogId);
      const duplicatedDialog = getDialog(dialogId);

      if (triggerId) {
        currentTrigger.dataset.component = 'dialog';
        currentTrigger.dataset.target = dialogId;
      }

      if (isNested === true) currentDialog.dataset.nested = true;

      options.trigger = currentTrigger;
      options.dialog = currentDialog;
      options.labelledby = labelledbyId !== null ? labelledbyId : currentDialog.dataset.labelledby;
      options.describedby = describedbyId !== null ? labelledbyId : currentDialog.dataset.describedby;

      options.isOpen = isOpen !== null ? isOpen : currentDialog.dataset.open === 'true';
      options.modal = modal !== null ? modal : currentDialog.dataset.modal !== 'false';
      options.tooltip = tooltip !== null ? tooltip : currentDialog.dataset.tooltip === 'true';
      options.hasBackdrop = hasBackdrop !== null ? hasBackdrop : currentDialog.dataset.backdrop === 'true';
      options.disableScroll = disableScroll !== null ? disableScroll : currentDialog.dataset.disableScroll !== 'false';

      // check if the current dialog is already registered (if true, drop it)
      if (duplicatedDialog) dropDialog(duplicatedDialog.dialog.id);

      const dialog = new Dialog(options);
      dialog.render();

      DIALOGS.push(dialog); // save dialog
    }
  };

  const open = (dialogId) => {
    if (exists(dialogId)) {
      const dialog = getDialog(dialogId);

      dialog ? dialog.open() : console.warn(`a11y-dialog-component: ID '${dialogId}' is not a registered dialog`);
    }
  };

  const close = (dialogId) => {
    if (exists(dialogId)) {
      const dialog = getDialog(dialogId);

      dialog ? dialog.close() : console.warn(`a11y-dialog-component: ID '${dialogId}' is not a registered dialog`);
    }
  };

  const destroy = (dialogId) => {
    if (exists(dialogId)) {
      dropDialog(dialogId);
    }
  };

  return {
    init,
    render,
    open,
    close,
    destroy,
    getDialogs,
  };
})();

export default Dialogs;
