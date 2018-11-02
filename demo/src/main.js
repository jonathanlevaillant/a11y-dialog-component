import Dialog, { setDialogs } from './../../dist/a11y-dialog-component.es.js';

document.addEventListener('DOMContentLoaded', () => {
  const dialog = new Dialog('.js-dialog', {
    openingTrigger: '.js-dialog-open',
    closingTrigger: '.js-dialog-close',
    backdropElement: '.js-dialog',
    labelledby: 'dialog-title',
    describedby: 'dialog-desc',
  });

  const dialogModeless = new Dialog('.js-dialog-modeless', {
    openingTrigger: '.js-dialog-modeless-open',
    closingTrigger: '.js-dialog-modeless-close',
    labelledby: 'dialog-modeless-title',
    describedby: 'dialog-modeless-desc',
    isModal: false,
    disableScroll: false,
  });

  const dialogTooltip = new Dialog('.js-dialog-tooltip', {
    openingTrigger: '.js-dialog-tooltip-open',
    closingTrigger: '.js-dialog-tooltip-close',
    labelledby: 'dialog-tooltip-title',
    isModal: false,
    isTooltip: true,
    disableScroll: false,
  });

  dialog.create();
  dialogModeless.create();
  dialogTooltip.create();
});
