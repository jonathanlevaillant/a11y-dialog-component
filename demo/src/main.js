import Dialogs from './../../dist/a11y-dialog-component.js';

document.addEventListener('DOMContentLoaded', () => {

  // initial config
  Dialogs.init();

  // programmatically open modal
  document.getElementById('js-trigger-dialog-2').addEventListener('click', () => {
    Dialogs.open('dialog-2', {
      triggerId: 'js-trigger-dialog-2',
    });
  });
});
