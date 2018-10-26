import Dialog, { setDialogs } from './../../dist/a11y-dialog-component.es.js';

document.addEventListener('DOMContentLoaded', () => {
  const dialog = new Dialog('.js-dialog', {
    openTrigger: '.js-dialog-open',
    closeTrigger: '.js-dialog-close',
    backdropTrigger: '.js-dialog',
    labelledby: 'dialog-title',
    describedby: 'dialog-desc',
  });

  const dialogModeless = new Dialog('.js-dialog-modeless', {
    openTrigger: '.js-dialog-modeless-open',
    closeTrigger: '.js-dialog-modeless-close',
    labelledby: 'dialog-modeless-title',
    describedby: 'dialog-modeless-desc',
    modal: false,
  });

  const dialogTooltip = new Dialog('.js-dialog-tooltip', {
    openTrigger: '.js-dialog-tooltip-open',
    closeTrigger: '.js-dialog-tooltip-close',
    labelledby: 'dialog-tooltip-title',
    modal: false,
    tooltip: true,
  });

  dialog.create();
  dialogModeless.create();
  dialogTooltip.create();
});
