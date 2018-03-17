<h3 align="center">A11Y Dialog Component</h3>

---

## Introduction

**a11y-dialog-component** est une librairie écrite en JavaScript natif permettant de configurer facilement des
fenêtres modales accessibles.

Cette librairie respecte l'ensemble des critères d'accessibilité définis par 
[WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal) tout en étant très légère (1.3 Ko minifiée et gzippée)
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

#### 1. Structure HTML du document

Afin de répondre aux critères d'accessibilité définis par WAI-ARIA, le contenu principal du document HTML doit être 
désactivé à l'ouverture d'une fenêtre modale. Il est également recommandé de désactiver le scroll vertical.

Pour que la librairie JavaScript puisse cibler ces éléments, il est conseillé d'ajouter dans le document HTML ces sélecteurs de classe :

- Sélecteur CSS requis pour la désactivation du scroll vertical (à ajouter généralement sur la balise `<html>` ou `<body>`) : `js-document`
- Sélecteur CSS requis pour la désactivation du contenu principal du document (nécessaire aux lecteurs d'écran) : `js-inert-layer`

```
<!doctype html>
<html class="js-document">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>A11Y Dialog Component</title>
  </head>
  <body>
    <main class="js-inert-layer">...</main>
    <div role="dialog">...</div>
  </body>
</html>

```

Il est à noter que la fenêtre modale doit se situer en dehors du contenu principal du document.

#### 2. Structure HTML d'un bouton d'appel (trigger)

**Attributs obligatoires :**

- L'attribut de données `data-component="dialog"` permet d'instancier une nouvelle fenêtre modale.
- L'attribut de données `data-target="dialog-ID"` permet de cibler une fenêtre modale avec l'identifiant `dialog-ID`
- L'attribut ARIA `aria-haspopup="dialog"` indique aux lecteurs d'écran que l'activation du bouton d'appel déclenchera 
l'ouverture d'une fenêtre modale.

```
<button type="button" aria-haspopup="dialog" data-component="dialog" data-target="dialog-demo">Open dialog</button>
```

**Attributs facultatifs :**

- `data-open="true"` : Déclenche l'ouverture de la fenêtre modale au chargement de la page.
- `data-disabled-page="false"` : Laisse le document actif à l'ouverture de la fenêtre modale. 

#### 3. Structure HTML d'une fenêtre modale

**Attention : Une fenêtre modale doit posséder un identifiant unique !**

Afin de répondre aux critères d'accessibilité définis par WAI-ARIA, il est conseillé d'utiliser la structure suivante :

```
<div id="dialog-demo" class="c-dialog" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="dialog-title" aria-describedby="dialog-description" tabindex="-1">
  <div role="document" class="c-dialog__box">
    <h2 id="dialog-title">Dialog title</h2>
    <div id="dialog-description">Dialog description</div>
  </div>
</div>    
```

Pour davantage de précisions sur ces attributs, vous pouvez vous rendre sur le [blog de JoliCode](https://jolicode.com/blog/une-fenetre-modale-accessible)

#### 4. Structure HTML d'un bouton de fermeture

Un bouton de fermeture doit posséder l'attribut `data-dismiss`

```
<button type="button" aria-label="Close this window" data-dismiss>X</button>
```

#### 5. Ajout de la librairie JavaScript

Vous pouvez importer directement **a11y-dialog-component** dans votre projet JavaScript 
en utilisant une syntaxe ES6 (ES2015) ou CommonJS :

```
import Dialogs from 'a11y-dialog-component'; // es6 module
const Dialogs = require('a11y-dialog-component').default; // commonjs module
```

#### 6. Instanciation JavaScript

```
Dialogs.init();
```

#### 7. Personnalisation des sélecteurs CSS

Il est possible de personnaliser les sélecteurs CSS utilisés lors de l'instanciation des fenêtres modales :

```
Dialogs.init({
  pageClassName: 'js-custom-document',
  inertLayersClassName: 'js-custom-inert-layer',
  disabledPageClassName: 'is-inactive',
});
```

#### 8. Événements JavaScript

En cas de besoin, vous pouvez déclencher l'ouverture ou la fermeture d'une ou plusieurs fenêtres modales directement en JavaScript
grâce aux méthodes `open('dialog-ID')` et `close('dialog-ID')` :

```
Dialogs.open('dialog-demo');
Dialogs.open('dialog-nested');
Dialogs.close('dialog-demo');
```

**Paramètres facultatifs :**

- `triggerId: 'trigger-ID'` : Associe la fenêtre modale à un bouton d'appel. 
- `disabledPage: false` : Laisse le document actif à l'ouverture de la fenêtre modale.

```
Dialogs.open('dialog-demo', {
  triggerId: 'js-trigger-demo',
  disabledPage: false,
});
```

#### 9. Styles CSS

**a11y-dialog-component** a fait le choix de ne pas embarquer de styles CSS par défaut.  
Vous êtes donc libres d'utiliser les styles que vous souhaitez !

Néanmoins, nous recommandons au minimum ces styles nécessaires à l'ouverture et à la fermeture d'une fenêtre modale :

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
  max-width: 48rem;
  margin: auto;
  background-color: #fff;
}

.c-dialog[aria-hidden="true"] {
  display: none;
}
```

Si vous désirez utiliser des styles CSS par défaut, vous pouvez consulter le fichier `main.css` de la démo disponible 
[ici](https://github.com/jonathanlevaillant/a11y-dialog-component/blob/master/demo/src/main.css)

## Contribution

Si vous désirez contribuer à ce projet, rien de plus simple, suivez ces quelques étapes ! :kissing_closed_eyes:
**a11y-dialog-component** suit les standards de développement JavaScript ES2015.

#### Environnement de développement

1. Clonez le dépôt GitHub : `$git clone https://github.com/jonathanlevaillant/a11y-dialog-component.git`
2. Installez le gestionnaire de packages [yarn](https://yarnpkg.com/en/docs/install#mac-tab)
3. Installez les dépendances de développement : `yarn start`
4. Lancez le projet (watch) : `yarn dev`
5. Créez une pull-request :ok_hand:

## D'autres librairies accessibles ?

- [a11y-accordion-component](https://github.com/jonathanlevaillant/a11y-accordion-component) - Accordéons accessibles.

## Créateur

**Jonathan Levaillant**

- [https://twitter.com/jlwebart](https://twitter.com/jlwebart)
- [https://github.com/jonathanlevaillant](https://github.com/jonathanlevaillant)

## Licence

Ce projet est sous licence [MIT](https://opensource.org/licenses/MIT).
