import Dialog, { setDialogs } from './../../dist/a11y-dialog-component.es.js';

document.addEventListener('DOMContentLoaded', () => {
  const dialog = new Dialog('.js-dialog', {
    openingSelector: '.js-dialog-open',
    closingSelector: '.js-dialog-close',
    backdropSelector: '.js-dialog',
    labelledby: 'dialog-title',
    describedby: 'dialog-desc',
  });

  const dialogModeless = new Dialog('.js-dialog-modeless', {
    openingSelector: '.js-dialog-modeless-open',
    closingSelector: '.js-dialog-modeless-close',
    labelledby: 'dialog-modeless-title',
    describedby: 'dialog-modeless-desc',
    isModal: false,
    disableScroll: false,
  });

  const dialogTooltip = new Dialog('.js-dialog-tooltip', {
    openingSelector: '.js-dialog-tooltip-open',
    closingSelector: '.js-dialog-tooltip-close',
    labelledby: 'dialog-tooltip-title',
    isModal: false,
    isTooltip: true,
    disableScroll: false,
  });

  dialog.create();
  dialogModeless.create();
  dialogTooltip.create();
});
