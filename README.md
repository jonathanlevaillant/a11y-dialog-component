# A11y Dialog Component

a11y-dialog-component is a fast, lightweight and flexible vanilla JavaScript library to create accessible modal,
non-modal or tooltip dialogs.

These dialogs are fully accessible according to
[WAI-ARIA Authoring Practices 1.2](https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal).

## Getting Started

### Installing

A simple and fast way to get started is to include this script on your page. This will create the global variable
`Dialog`

```html
<script src="https://cdn.jsdelivr.net/npm/a11y-dialog-component@5.5.1/dist/a11y-dialog-component.min.js"></script>
```

If you prefer to install a11y-dialog-component locally in your project, you can either:

**Install with NPM**

```
npm install a11y-dialog-component
```

**Install with Yarn**

```
yarn add a11y-dialog-component
```

### Basic Usage

Should you install a11y-dialog-component locally, you can import it as ES module like the following:

```js
import Dialog from 'a11y-dialog-component';
```

It's also possible to use the `require` CommonJS syntax:

```js
const Dialog = require('a11y-dialog-component').default;
```

Finally, let's create a basic dialog:

**HTML**

```html
<!-- Opening trigger -->
<button type="button" class="js-dialog-open">Open dialog</button>

<!-- Dialog -->
<div class="c-dialog js-dialog">
  <h2 id="dialog-title">Hello! I'm an accessible dialog</h2>
  <button type="button" class="js-dialog-close">Cancel</button>
</div>
```

**JavaScript**

```js
const dialog = new Dialog('.js-dialog', {
  openingSelector: '.js-dialog-open',
  closingSelector: '.js-dialog-close',
  labelledby: 'dialog-title',
});
```

**CSS**

```css
.c-dialog[aria-hidden='true'] {
  display: none;
}
```

This previous code will generate an accessible dialog:

```html
<!-- Opening trigger -->
<button type="button" class="js-dialog-open" aria-haspopup="dialog">Open dialog</button>

<!-- Dialog -->
<div
  class="c-dialog js-dialog"
  role="dialog"
  tabindex="-1"
  aria-hidden="true"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Hello! I'm an accessible dialog</h2>
  <button type="button" class="js-dialog-close">Cancel</button>
</div>
```

## Configuration

### Global

Use the `setDefaults()` function to change the default configuration for dialogs. It will apply these settings to every
future instance.

```js
import Dialog, { setDefaults } from 'a11y-dialog-component';

setDefaults({
  documentSelector: '.js-page',
  delay: 400,
});
```

Below is a list of all possible options to change the default configuration.

| Option                        | Default        | Value    | Description                                                                                                                                        |
| ----------------------------- | -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **documentSelector**          | `.js-document` | `String` | CSS selector used to target the main document.                                                                                                     |
| **documentDisabledClass**     | `is-disabled`  | `String` | Add a class on the document (defined by `documentSelector`) while the dialog is open and if `disableScroll: true`.                                 |
| **openingTriggerActiveClass** | `is-active`    | `String` | Add a class on the opening trigger while the dialog is open.                                                                                       |
| **delay**                     | `200`          | `Number` | Delay in ms once a trigger event is fired before the dialog autofocus. Usually matches with the CSS transition value to open or close this dialog. |

### Options

Below is a list of all possible options you can pass to a dialog.

| Option                          | Default     | Value      | Description                                                                                                                                                            |
| ------------------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **onOpen**                      | `noop`      | `Function` | Lifecycle function invoked when the dialog is opening. The function receives the dialog object as the first parameter and the opening trigger as the second parameter. |
| **onClose**                     | `noop`      | `Function` | Lifecycle function invoked when the dialog is closing. The function receives the dialog object as the first parameter and the closing trigger as the second parameter. |
| **openingSelector**             | `""`        | `String`   | CSS selector used to open the dialog.                                                                                                                                  |
| **closingSelector**             | `""`        | `String`   | CSS selector used to close the dialog.                                                                                                                                 |
| **backdropSelector**            | `""`        | `String`   | CSS selector used to include a backdrop element which close the dialog on click.                                                                                       |
| **helperSelector**              | `""`        | `String`   | CSS selector used to add active class name(\*) while the dialog is open.                                                                                               |
| **labelledby**                  | `""`        | `String`   | ID selector to provide a dialog label (a11y compliant).                                                                                                                |
| **describedby**                 | `""`        | `String`   | ID selector to provide a dialog description (a11y compliant).                                                                                                          |
| **isModal**                     | `true`      | `Boolean`  | If `true`, tells assistive technologies that the windows underneath the current dialog are not available for interaction `aria-modal="true"`.                          |
| **isTooltip**                   | `false`     | `Boolean`  | If `true`, click outside the current dialog to close it.                                                                                                               |
| **isCreated**                   | `true`      | `Boolean`  | If `true`, create the dialog when initialized. If disabled, then you need to create it manually by using `create()` method.                                            |
| **isOpen**                      | `false`     | `Boolean`  | If `true`, open the dialog when initialized.                                                                                                                           |
| **disableScroll**               | `true`      | `Boolean`  | If `true`, disable scrolling on the page while the dialog is open.                                                                                                     |
| **enableAutoFocus**             | `true`      | `Boolean`  | If `true`, focus moves to an element contained in the dialog when it opens.                                                                                            |
| **openingTriggerActiveClass\*** | `is-active` | `String`   | Add a class on the opening trigger and helper selectors while the dialog is open.                                                                                      |
| **delay**                       | `200`       | `Number`   | Delay in ms once a trigger event is fired before the dialog autofocus. Usually matches with the CSS transition value to open or close this dialog.                     |

### Methods

Dialog instances have 5 methods available which allow you to control the dialog without the use of UI events.

**Open the dialog**

```js
dialog.open();
```

**Close the dialog**

```js
dialog.close();
```

**Toggle the dialog**

```js
dialog.toggle();
```

**Destroy the dialog**

```js
dialog.destroy();
```

**Create the dialog**

The `create()` method is **automatically called on instantiation** so there is no need to call it again directly (unless
you have destroyed the dialog previously).

```js
dialog.create();
```

## Demos

Didn't find the recipe that exactly matches your case? We have demos!

The [demos](https://github.com/jonathanlevaillant/a11y-dialog-component/tree/master/demos) folder contains 10 use cases
of a11y-dialog-component. You might find there what you're looking for.

## Deployment

On production use files only from `dist/` folder, there will be the most stable versions.

a11y-dialog-component uses [Rollup](https://rollupjs.org/guide/en) to build a development and production versions.

1. Install Rollup `npm install --global rollup`
2. Clone Github repo `git clone https://github.com/jonathanlevaillant/a11y-dialog-component.git`
3. Install all dependencies, in repo's root `npm install`

### Development build

```
npm run dev
```

Development files (`iife`) will be available in `demos/js/` folder.

### Production build

```
npm run build
```

Production files (`cjs`, `esm`, `iife`) will be available in `dist/` folder.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/jonathanlevaillant/a11y-dialog-component/blob/master/CONTRIBUTING.md)
for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](https://semver.org/) for versioning. For the versions available, see the
[tags on this repository](https://github.com/jonathanlevaillant/a11y-dialog-component/tags).

## Authors

- **Jonathan Levaillant** - _Initial work_ - [jonathanlevaillant](https://github.com/jonathanlevaillant)

See also the list of [contributors](https://github.com/jonathanlevaillant/a11y-dialog-component/graphs/contributors) who
participated in this project.

## License

This project is licensed under the MIT License - see the
[LICENSE.md](https://github.com/jonathanlevaillant/a11y-dialog-component/blob/master/LICENSE.md) file for details

## Acknowledgments

<p>
    <a href="https://jolicode.com/"><img src="https://jolicode.com/images/logo.svg" width=200 height=46 alt="JoliCode" /></a>
</p>
