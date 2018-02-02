<h3 align="center">A11Y Dialog Component</h3>

---

## Introduction

**a11y-dialog-component** est une librairie écrite en pur JavaScript permettant de configurer facilement des
fenêtres modales accessibles.

Cette librairie respecte l'ensemble des critères d'accessibilité définis par 
[WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal) tout en étant très légère (1.2 Ko minifiée / gzippée)
et simple à configurer.

## Fonctionnalités

- À l'ouverture d'une fenêtre modale, le focus clavier se positionne sur le premier élément focalisable de la fenêtre. 
- L'ordre de tabulation est contenu dans la fenêtre modale (touches `Tab` et `Shift + Tab`).
- Presser la touche `Escape` permet de fermer la fenêtre modale.
- Un clic en dehors d'une fenêtre modale ou sur un élément possédant l'attribut `data-dismiss` permet de fermer celle-ci.
- À la fermeture d'une fenêtre modale, le focus clavier est restauré sur le bouton d'appel.
- Possibilité d'imbriquer plusieurs fenêtres modales dans une même page.

## Installation

- via [npm](https://www.npmjs.com/) : `npm install a11y-dialog-component`
- via [yarn](https://yarnpkg.com/lang/en/) : `yarn add a11y-dialog-component`
- via [jsDelivr](https://www.jsdelivr.com/) : `<script src="https://cdn.jsdelivr.net/npm/a11y-dialog-component/dist/a11y-dialog-component.min.js"></script>`

## Utilisation

#### 1. Le document HTML

Afin de répondre aux critères d'accessibilité définis par WAI-ARIA, le document principal doit être désactivé à l'ouverture
d'une fenêtre modale. Il est également recommandé de désactiver le scroll vertical de la page.

Pour que la librairie JavaScript puisse cibler le document principal et la page, il est nécessaire de définir deux sélecteurs de classe :

- Sélecteur CSS requis pour la désactivation du scroll vertical de la page : `js-page`
- Sélecteur CSS requis pour la désactivation du document principal (lecteurs d'écran) : `js-inert-layer`

```
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>A11Y Dialog Component</title>
  </head>
  <body class="js-page">
    <main class="js-inert-layer">...</main>
    <div role="dialog">...</div>
  </body>
</html>

```

Il est à noter que la fenêtre modale doit se situer en dehors du document principal.

#### 2. Le(s) bouton(s) d'appel

Pour activer une fenêtre modale, il est nécessaire de définir un ou plusieurs boutons d'appel (trigger) avec les attributs suivants :

- Instanciation du composant : `data-component="dialog"`
- Identifiant de la fenêtre modale ciblée : `data-target="dialog-id"`

```
<button type="button" aria-haspopup="dialog" data-component="dialog" data-target="dialog-demo">Open dialog</button>
```

Deux autres attributs facultatifs sont disponibles :

- Ouverture de la fenêtre modale au chargement de la page : `data-open="true"`
- Laisser le document actif à l'ouverture de la fenêtre modale : `data-disabled-page="false"`

#### 3. La fenêtre modale

**Une fenêtre modale doit posséder un identifiant unique !**

Afin d'être parfaitement accessible, il est conseillé d'utiliser la structure suivante :

```
<div id="dialog-demo" class="c-dialog" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="dialog-title" aria-describedby="dialog-description" tabindex="-1">
  <div role="document" class="c-dialog__box">
    <h2 id="dialog-title">Dialog title</h2>
    <div id="dialog-description">Dialog description</div>
  </div>
</div>    
```

#### 4. Le(s) bouton(s) de fermeture

Un bouton de fermeture doit posséder l'attribut `data-dismiss`

```
<button type="button" aria-label="Close this window" data-dismiss>X</button>
```

#### 5. Ajout de la librairie JavaScript

Vous pouvez directement importer **a11y-dialog-component** dans votre projet JavaScript 
en utilisant une syntaxe ES6 (ES2015) ou CommonJS :

```
import Dialogs from 'a11y-dialog-component'; // es6 module
const Dialogs = require('a11y-dialog-component').default; // commonjs module
```

#### 6. Instanciation JavaScript

```
Dialogs.init();
```

#### 7. Personnalisation des classes CSS

Il est possible de personnaliser les classes CSS utilisées lors de l'instanciation de la librairie :

```
Dialogs.init({
  pageClassName: 'js-custom-page',
  inertLayersClassName: 'js-custom-inert-layer',
  disabledPageClassName: 'is-inactive',
});
```

#### 8. Évènements JavaScript

En cas de besoin, vous pouvez déclencher l'ouverture ou la fermeture d'une ou plusieurs fenêtres modales directement en JavaScript :

```
Dialogs.open('dialog-demo');
Dialogs.open('dialog-nested');
Dialogs.close('dialog-demo');
```

#### 9. Styles CSS

Styles CSS basiques pour l'ouverture et la fermeture d'une fenêtre modale :

```
.c-dialog {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  background-color: rgba(0, 0, 0, .75);
}

.c-dialog__box {  
  width: 100%;
  max-width: 48rem;
  margin: auto;
  background-color: #fff;
}

.c-dialog[aria-hidden="true"] {
  display: none;
}
```

## Contribution

Si vous désirez contribuer à ce projet, rien de plus simple, suivez ces quelques étapes ! :kissing_closed_eyes:

#### Environnement de développement

1. Cloner le dépôt GitHub : `$git clone https://github.com/jonathanlevaillant/a11y-dialog-component.git`
2. Installer le gestionnaire de packages [yarn](https://yarnpkg.com/en/docs/install#mac-tab)
3. Installer les dépendances à la racine du projet : `yarn start`
4. Lancer le projet : `yarn dev`
5. Créer une pull-request :ok_hand:

## Créateur

**Jonathan Levaillant**

- [https://twitter.com/jlwebart](https://twitter.com/jlwebart)
- [https://github.com/jonathanlevaillant](https://github.com/jonathanlevaillant)

## Licence

Ce projet est sous licence [MIT](https://opensource.org/licenses/MIT).
