import Dialogs from './../../dist/a11y-dialog-component.es.js';

document.addEventListener('DOMContentLoaded', () => {

  // initial config
  Dialogs.init({
    triggerActiveClass: 'is-expanded',
  });

  Dialogs.create('dialog-3', {
    triggerId: 'dialog-trigger-3',
    labelledbyId: 'dialog-title-3',
    describedbyId: 'dialog-desc-3',
    backdrop: true,
  });

  Dialogs.create('dialog-4', {
    triggerId: 'dialog-trigger-4',
    labelledbyId: 'dialog-title-4',
    describedbyId: 'dialog-desc-4',
    tooltip: true,
    modal: false,
    backdrop: false,
    disableScroll: false,
  });

  Dialogs.create('dialog-5', {
    labelledbyId: 'dialog-title-5',
    describedbyId: 'dialog-desc-5',
    backdrop: true,
  });

  Dialogs.create('dialog-nested-2', {
    triggerId: 'dialog-trigger-nested-2',
    labelledbyId: 'dialog-nested-title-2',
    describedbyId: 'dialog-nested-desc-2',
    backdrop: true,
    disableScroll: false,
  });

  window.setTimeout(() => Dialogs.show('dialog-5'), 2000);
  window.setTimeout(() => Dialogs.hide('dialog-5'), 4000);
});
