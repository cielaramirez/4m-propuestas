// Componentes FrYDA (web components cargados por CDN en index.html).
// Los atributos van en kebab-case y los eventos como `onfryClick`, `onfryChange`, etc.
import type { HTMLAttributes, Ref } from 'react'

type FryElement = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>
  key?: string | number
  // atributos propios de cada componente (hierarchy, text, label, checked…)
  [attr: string]: unknown
}

type FryTags =
  | 'fry-button'
  | 'fry-button-icon'
  | 'fry-chip'
  | 'fry-icon'
  | 'fry-input-text'
  | 'fry-input-currency'
  | 'fry-switch'
  | 'fry-tag'
  | 'fry-badge'
  | 'fry-dropdown'
  | 'fry-list-group'
  | 'fry-list-item'
  | 'fry-searchbar'
  | 'fry-tab-group'
  | 'fry-tab'
  | 'fry-alert'
  | 'fry-snackbar'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends Record<FryTags, FryElement> {}
  }
}
