(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dialogs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* dialogs
 ========================================================================== */

var Dialogs = function () {
  var CLASS_NAMES = {
    pageClassName: 'js-page',
    inertLayersClassName: 'js-inert-layer',
    disabledPageClassName: 'is-inactive'
  };

  var KEY_CODES = {
    tab: 9,
    enter: 13,
    escape: 27
  };

  var FOCUSABLE_ELEMENTS = ['[href]', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

  var Dialog = function () {
    function Dialog(options) {
      _classCallCheck(this, Dialog);

      this.trigger = options.trigger;
      this.dialog = document.getElementById(options.dialog);
      this.dismissTriggers = this.dialog.querySelectorAll('[data-dismiss]');

      this.focusableElements = this.dialog.querySelectorAll(FOCUSABLE_ELEMENTS);

      var _focusableElements = _slicedToArray(this.focusableElements, 1);

      this.firstFocusableElement = _focusableElements[0];

      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

      var _document$getElements = document.getElementsByClassName(options.pageClassName);

      var _document$getElements2 = _slicedToArray(_document$getElements, 1);

      this.page = _document$getElements2[0];

      this.inertLayers = document.getElementsByClassName(options.inertLayersClassName);
      this.disabledPageClassName = options.disabledPageClassName;

      this.isNested = options.isNested;
      this.isOpen = options.isOpen;

      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);

      if (this.isOpen) {
        this.open();
      }
    }

    _createClass(Dialog, [{
      key: 'focusTrap',
      value: function focusTrap(event) {
        if (event.shiftKey && event.target === this.firstFocusableElement) {
          event.preventDefault();
          this.lastFocusableElement.focus();
        }

        if (!event.shiftKey && event.target === this.lastFocusableElement) {
          event.preventDefault();
          this.firstFocusableElement.focus();
        }
      }
    }, {
      key: 'setFocus',
      value: function setFocus() {
        var _this = this;

        if (this.focusableElements.length > 0) {
          window.setTimeout(function () {
            _this.firstFocusableElement.focus();
          }, 100);
        }
      }
    }, {
      key: 'open',
      value: function open(event) {
        if (event) event.preventDefault();

        this.dialog.removeAttribute('aria-hidden');

        if (!this.isNested) {
          this.page.classList.add(this.disabledPageClassName);

          Array.prototype.forEach.call(this.inertLayers, function (inertLayer) {
            inertLayer.setAttribute('aria-hidden', true);
            inertLayer.setAttribute('inert', '');
          });
        }

        // setting focus on the first focusable element
        this.setFocus();

        // add event listeners
        this.addEventListeners();
      }
    }, {
      key: 'close',
      value: function close(event) {
        if (event) event.preventDefault();

        this.dialog.setAttribute('aria-hidden', true);

        if (!this.isNested) {
          this.page.classList.remove(this.disabledPageClassName);

          Array.prototype.forEach.call(this.inertLayers, function (inertLayer) {
            inertLayer.removeAttribute('aria-hidden');
            inertLayer.removeAttribute('inert');
          });
        }

        // restoring focus
        if (this.trigger) {
          this.trigger.focus();
        }

        // remove event listeners
        this.removeEventListeners();
      }
    }, {
      key: 'addEventListeners',
      value: function addEventListeners() {
        var _this2 = this;

        this.dialog.addEventListener('click', this.onClick);
        this.dialog.addEventListener('touchstart', this.onClick);
        this.dialog.addEventListener('keydown', this.onKeydown);
        this.dismissTriggers.forEach(function (dismissTrigger) {
          dismissTrigger.addEventListener('click', _this2.close);
        });
      }
    }, {
      key: 'removeEventListeners',
      value: function removeEventListeners() {
        var _this3 = this;

        this.dialog.removeEventListener('click', this.onClick);
        this.dialog.removeEventListener('touchstart', this.onClick);
        this.dialog.removeEventListener('keydown', this.onKeydown);
        this.dismissTriggers.forEach(function (dismissTrigger) {
          dismissTrigger.removeEventListener('click', _this3.close);
        });
      }
    }, {
      key: 'onClick',
      value: function onClick(event) {
        if (event.target === this.dialog) this.close(event);
      }
    }, {
      key: 'onKeydown',
      value: function onKeydown(event) {
        if (event.which === KEY_CODES.escape) this.close(event);
        if (event.which === KEY_CODES.enter && event.target.hasAttribute('data-dismiss')) this.close(event);
        if (event.which === KEY_CODES.tab) this.focusTrap(event);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        if (this.trigger) {
          this.trigger.addEventListener('click', this.open);
          this.trigger.addEventListener('keydown', function (event) {
            if (event.which === KEY_CODES.enter) {
              _this4.open(event);
            }
          });
        }
      }
    }]);

    return Dialog;
  }();

  var activeDialog = null;

  var open = function open(dialog) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CLASS_NAMES;

    var options = Object.assign({}, CLASS_NAMES, config);
    options.dialog = dialog;
    options.trigger = config.trigger ? document.getElementById(config.trigger) : false;

    options.isNested = config.isNested || false;
    options.isOpen = true;

    activeDialog = new Dialog(options);
    activeDialog.render();
  };

  var close = function close() {
    activeDialog.close();
  };

  var render = function render() {
    var selectors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-component="dialog"]';
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CLASS_NAMES;

    var triggers = document.querySelectorAll(selectors);
    var options = Object.assign({}, CLASS_NAMES, config);

    triggers.forEach(function (trigger) {
      options.trigger = trigger;
      options.dialog = trigger.dataset.target;

      options.isNested = trigger.dataset.nested === 'true';
      options.isOpen = trigger.dataset.open === 'true';

      var dialog = new Dialog(options);
      dialog.render();
    });
  };

  return { open: open, close: close, render: render };
}();

exports.default = Dialogs;

},{}]},{},[1])(1)
});

//# sourceMappingURL=a11y-dialog-component.js.map
