<h3 align="center">A11Y Dialog Component</h3>

---

## Introduction

**a11y-dialog-component.js** est une librairie écrite en pur JavaScript permettant de configurer facilement des
fenêtres modales accessibles.

Cette librairie respecte l'ensemble des critères d'accessibilité définis par 
[WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal) tout en étant très légère (1.2 Ko minifiée et gzippée)
et simple à configurer.

## Fonctionnalités

- À l'ouverture d'une fenêtre modale, le focus clavier se positionne sur le premier élément focalisable contenu dans cette fenêtre. 
- L'ordre de tabulation est contenu dans la fenêtre modale via les touches `Tab` et `Shift + Tab`.
- Presser la touche `Escape` permet de fermer la fenêtre modale.
- Un clic en dehors d'une fenêtre modale ou sur un élément possédant l'attribut `[data-dismiss]` permet de fermer celle-ci.
- À la fermeture d'une fenêtre modale, le focus clavier est restauré sur le bouton d'appel.
- Possibilité d'imbriquer plusieurs fenêtres modales dans une même page.

## Installation

- via [npm](https://www.npmjs.com/) : `npm install a11y-dialog-component`
- via [yarn](https://yarnpkg.com/lang/en/) : `yarn add a11y-dialog-component`
- via [jsDelivr](https://www.jsdelivr.com/) : `<script src="https://cdn.jsdelivr.net/npm/a11y-dialog-component/dist/a11y-dialog-component.min.js"></script>`

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
