export function getShadowRoot(v: Element) {
  if (v.shadowRoot)
    return v.shadowRoot
}

export function findLeafActiveElement(doc: DocumentOrShadowRoot): Element | undefined {
  const active = doc?.activeElement
  if (!active)
    return

  const shadowRoot = getShadowRoot(active)
  if (shadowRoot && shadowRoot.activeElement)
    return findLeafActiveElement(shadowRoot)

  return active
}

export const focusableElementSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'summary',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ')

export function isVisibleFocusableElement(element: HTMLElement): boolean {
  if (element.getAttribute('tabindex') === '-1'
    || element.getAttribute('aria-hidden') === 'true'
    || element.closest('[inert]')) {
    return false
  }

  const style = window.getComputedStyle(element)
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && element.getClientRects().length > 0
}

export function getFocusableElements(root: ParentNode | null | undefined): HTMLElement[] {
  if (!root)
    return []

  return Array.from(root.querySelectorAll<HTMLElement>(focusableElementSelector))
    .filter(isVisibleFocusableElement)
}
