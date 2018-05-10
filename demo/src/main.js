import Dialogs from './../../dist/a11y-dialog-component.es.js';

document.addEventListener('DOMContentLoaded', () => {

  // initial config
  Dialogs.init({
    disabledDocumentClass: 'is-inactive',
    activeTriggerClass: 'is-expanded',
  });

  // programmatically render dialogs
  Dialogs.render('dialog-1', {
    triggerId: 'dialog-trigger-1',
    isOpen: true,
    labelledbyId: false,
  });

  Dialogs.close('dialog-1');

  Dialogs.render('dialog-tooltip-1', {
    triggerId: 'dialog-tooltip-trigger-1',
    hasBackdrop: false,
    modal: false,
    tooltip: true,
    disableScroll: false,
  });

  Dialogs.render('dialog-3');

  window.setTimeout(() => Dialogs.open('dialog-3'), 2000);

  console.log(Dialogs.getDialogs());
});
