/* dialogs
 ========================================================================== */

const Dialogs = (() => {
  const DATA_COMPONENT = '[data-component="dialog"]';
  const DATA_TRIGGER = '[data-dialog-trigger]';

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

  class Dialog {
    constructor(options) {
      this.dialog = options.dialog;
      this.triggers = options.triggers;
      this.labelledby = options.labelledby;
      this.describedby = options.describedby;
      this.isOpen = options.open;
      this.transitionDuration = options.transitionDuration;
      this.focusableElements = [];
      this.firstFocusableElement = [];
      this.lastFocusableElement = [];

      this.toggle = this.toggle.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
    }

    onKeydown(event) {
      switch (event.which) {
        case KEY_CODES.escape:
          this.close();
          break;
        case KEY_CODES.tab:
          this.maintainFocus(event);
          break;
        default:
          break;
      }
    }

    addEventListeners() {
      this.dialog.addEventListener('keydown', this.onKeydown);
    }

    removeEventListeners() {
      this.dialog.removeEventListener('keydown', this.onKeydown);
    }

    addAttributes() {
      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('tabindex', -1);
      this.dialog.setAttribute('aria-hidden', !this.isOpen);

      this.triggers.forEach((trigger) => {
        trigger.setAttribute('aria-haspopup', 'dialog');
      });

      if (this.labelledby) this.dialog.setAttribute('aria-labelledby', this.labelledby);
      if (this.describedby) this.dialog.setAttribute('aria-describedby', this.describedby);
    }

    setAttributes() {
      this.dialog.setAttribute('aria-hidden', !this.isOpen);
    }

    setFocusableElements() {
      const focusableElement = this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS);

      this.focusableElements = focusableElement.length > 0 ? focusableElement : [this.dialog];
      [this.firstFocusableElement] = this.focusableElements;
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }

    setFocus() {
      window.setTimeout(() => this.firstFocusableElement.focus(), this.transitionDuration);
    }

    // set focus trap
    maintainFocus(event) {
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

      this.setAttributes();
      this.addEventListeners();
      this.setFocus();
    }

    close() {
      this.isOpen = false;

      this.setAttributes();
      this.removeEventListeners();
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    create() {
      this.addAttributes();
      this.setFocusableElements();

      // if "isOpen" parameter is set to true when the dialog is created, then, open it
      if (this.isOpen) this.open();

      // add event listener to each trigger linked to dialog
      this.triggers.forEach((trigger) => {
        trigger.addEventListener('click', this.toggle);
      });
    }
  }

  const init = (config = DEFAULT_CONFIG) => {
    const dialogs = document.querySelectorAll(DATA_COMPONENT);
    const triggers = document.querySelectorAll(DATA_TRIGGER);
    const options = { ...DEFAULT_CONFIG, ...config };

    dialogs.forEach((dialog) => {
      const { transitionDuration } = dialog.dataset;

      options.dialog = dialog;
      options.triggers = [];
      options.labelledby = dialog.dataset.labelledby;
      options.describedby = dialog.dataset.describedby;
      options.open = dialog.dataset.open === 'true';

      // set custom transition duration if exists
      if (transitionDuration) options.transitionDuration = parseInt(transitionDuration, 10);

      // if one or some triggers are linked to dialog, just add them to dialog options
      triggers.forEach((trigger) => {
        if (trigger.dataset.dialogTrigger === dialog.id) {
          options.triggers.push(trigger);
        }
      });

      // create the dialog with previous options
      const currentDialog = new Dialog(options);
      currentDialog.create();
    });
  };

  return { init };
})();

export default Dialogs;
