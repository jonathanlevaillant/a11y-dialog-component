/* utils.js
 ========================================================================== */

// Only get visible elements
export function getVisibleElements(elements) {
  const visibleElements = [];

  elements.forEach(element => {
    const bounding = element.getBoundingClientRect();
    const isVisible = bounding.width > 0 || bounding.height > 0;

    if (isVisible) visibleElements.push(element);
  });

  return visibleElements;
}

// Only get no nested elements
export function getNoNestedElements(context, selector, elements) {
  const nestedComponents = context.querySelectorAll(selector);
  const noNestedElements = [];
  let isNested = false;

  if (nestedComponents.length === 0) return elements;

  elements.forEach(element => {
    nestedComponents.forEach(nestedComponent => {
      if (nestedComponent.contains(element)) isNested = true;
    });

    if (!isNested) noNestedElements.push(element);

    isNested = false;
  });

  return noNestedElements;
}

// Check if the parent elements match the target
export function closest(element, target) {
  let currentElement = element;

  while (currentElement !== target && currentElement) {
    currentElement = currentElement.parentNode;
  }

  return !!currentElement;
}
