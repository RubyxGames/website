// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import './style.css'
import './content.css'
import './footer.css'
import { footerMessage } from '../footer'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h('p', { class: 'doc-disclaimer' }, footerMessage),
      'home-hero-image': () =>
        h('img', {
          class: 'hero-logo',
          src: '/img/rubyx-logo.svg',
          alt: 'Rubyx — rubyx.net',
          width: 400,
          height: 400,
          fetchpriority: 'high'
        })
    })
  },
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
  }
} satisfies Theme
