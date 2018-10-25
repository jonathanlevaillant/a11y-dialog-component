import Dialog, { setDialogs, addDialogs } from './../../dist/a11y-dialog-component.es.js';

document.addEventListener('DOMContentLoaded', () => {
  setDialogs({
    transitionDuration: 250,
  });

  //addDialogs();

  const dialogDemo = new Dialog('#dialog-demo', {
    triggers: ['#trigger-dialog-1', '#trigger-dialog-2'],
    labelledby: 'dialog-title-1',
    modal: false,
    onOpen: (dialog) => {
      console.log(`${dialog.id} is open`);
    },
    onClose: (dialog) => {
      console.log(`${dialog.id} is closed`);
    }
  });

  dialogDemo.create();

  //dialogDemo.destroy();
});
