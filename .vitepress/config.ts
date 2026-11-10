import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import { footerMessage } from './footer'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/website/',
  title: 'RubyxGames',
  description:
    'Документация RubyxGames PocketMine-MP для Minecraft Bedrock и RubyxNet.',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: [
    /ingamepackethandler\.php/,
    /^\.\.\//
  ],
  sitemap: {
    hostname: 'https://rubyxgames.github.io'
  },
  transformPageData(pageData) {
    const canonicalUrl = `https://rubyxgames.github.io/website/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }])
  },
  // Sphinx curls quotes and dashes at render time (docutils smartquotes); this is the markdown-it equivalent.
  markdown: {
    typographer: true,
    config(md) {
      md.use(tabsMarkdownPlugin)
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: { src: '/img/rubyx-logo.svg', alt: 'RubyxGames' },
    footer: {
      message: footerMessage
    },

    search: {
      provider: 'local'
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/docs' },
      { text: 'RubyxGames', link: '/docs/rubyx/' },
      { text: 'Releases', link: 'https://github.com/RubyxGames/PocketMine-MP/releases' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          {
            text: 'Installation &amp; Updating',
            link: '/docs/installation',
            collapsed: true,
            items: [
              { text: 'Setup requirements', link: '/docs/installation/requirements' },
              { text: 'Using the official installer (Linux/MacOS only)', link: '/docs/installation/get-dot-axolotl-pm-dot-org' },
              { text: 'Using Docker (Linux only)', link: '/docs/installation/docker' },
              { text: 'Installing/updating manually', link: '/docs/installation/installing-manually' },
              { text: 'NetherNet Usage', link: '/docs/installation/nethernet-usage' },
              { text: 'RubyxGames: GitHub Releases', link: '/docs/rubyx/installation' }
            ]
          },
          { text: 'Migrating from PocketMine-MP (PMMP)', link: '/docs/migrating-from-pocketmine-mp' },
          { text: 'Basic usage', link: '/docs/basic-usage' },
          {
            text: 'Connecting',
            link: '/docs/connecting',
            collapsed: true,
            items: [
              { text: 'Adding the server to Minecraft', link: '/docs/connecting/add-external-server' },
              { text: 'Opening ports in your firewall', link: '/docs/connecting/configure-firewall' },
              { text: 'Forwarding ports in your router', link: '/docs/connecting/portforward' }
            ]
          },
          { text: 'Configuration', link: '/docs/configuration' },
          { text: 'Plugins', link: '/docs/plugins' },
          { text: 'Worlds', link: '/docs/worlds' },
          { text: 'Resource Packs &amp; Behaviour Packs', link: '/docs/resourcepacks' },
          {
            text: 'Permissions',
            link: '/docs/permissions',
            collapsed: true,
            items: [
              { text: 'List of built-in permissions', link: '/docs/core-permissions' }
            ]
          },
          { text: 'Contributing', link: '/docs/contributing' },
          {
            text: 'Bugs &amp; Crashes',
            link: '/docs/issues',
            collapsed: true,
            items: [
              { text: 'Crashes', link: '/docs/issues/crashes' },
              { text: 'Reporting Bugs', link: '/docs/issues/github-issues' }
            ]
          },
          { text: 'Contact and Support', link: '/docs/contact' }
        ]
      },
      {
        text: 'Frequently Asked Questions &amp; Common Issues',
        items: [
          {
            text: 'Installation',
            link: '/docs/faq/installation',
            collapsed: true,
            items: [
              { text: 'Failed loading opcache.so (or other PHP extensions)', link: '/docs/faq/installation/opcache.so' },
              { text: 'PocketMine-MP.phar not found when running server', link: '/docs/faq/installation/pharnotfound' },
              { text: 'Can’t install as user root', link: '/docs/faq/installation/rootuser' },
              { text: 'Can I install on Windows XP?', link: '/docs/faq/installation/windowsxp' }
            ]
          },
          {
            text: 'Connecting',
            link: '/docs/faq/connecting',
            collapsed: true,
            items: [
              { text: 'NetherNet common issues', link: '/docs/faq/connecting/nethernet-common-issues' },
              { text: 'Can’t connect to the server after updating Minecraft', link: '/docs/faq/connecting/cantconnect' },
              { text: 'What does “Opening server on 0.0.0.0:19132” mean?', link: '/docs/faq/connecting/defaultrouteip' },
              { text: '“Login timeout” when attempting to connect', link: '/docs/faq/connecting/logintimeout' },
              { text: 'RakLib Thread Blocked x.x.x.x for x seconds', link: '/docs/faq/connecting/raklibthreadblocked' },
              { text: 'Stuck on “Locating server” or at downloading resource packs', link: '/docs/faq/connecting/stuckduringconnect' },
              { text: 'VPN connection and gameplay issues', link: '/docs/faq/connecting/vpnproblems' },
              { text: 'Minecraft can’t connect to a server on the same computer on Windows', link: '/docs/faq/connecting/win10localhostcantconnect' }
            ]
          },
          {
            text: 'Playing',
            link: '/docs/faq/playing',
            collapsed: true,
            items: [
              { text: 'Why doesn’t X or Y gameplay feature work? Is it a bug?', link: '/docs/faq/playing/missingfeatures' },
              { text: 'Can Java Edition clients connect to the server?', link: '/docs/faq/playing/playwithpc' }
            ]
          },
          {
            text: 'Plugins',
            link: '/docs/faq/plugins',
            collapsed: true,
            items: [
              { text: 'What does “Incompatible API version” mean when loading a plugin?', link: '/docs/faq/plugins/incompatibleapi' },
              { text: 'I can’t get a <code>.phar</code> for a plugin. How do I create one?', link: '/docs/faq/plugins/makephar' },
              { text: 'Can I run a plugin from source without creating a <code>.phar</code>?', link: '/docs/faq/plugins/usephpfiles' }
            ]
          },
          {
            text: 'About PMMP & forks',
            link: '/docs/faq/about',
            collapsed: true,
            items: [
              { text: 'What’s the difference between PMMP and PocketMine?', link: '/docs/faq/about/pocketmine-vs-pmmp' },
              { text: 'Who is @shoghicp?', link: '/docs/faq/about/shoghicp' },
              { text: 'Why PHP?', link: '/docs/faq/about/why-php' }
            ]
          }
        ]
      },
      {
        text: 'Developer Resources',
        items: [
          {
            text: 'Plugin development docs',
            link: '/docs/developers/plugin-docs-index',
            collapsed: true,
            items: [
              { text: 'API versioning', link: '/docs/developers/plugin-docs/api-version-spec' },
              {
                text: 'Events',
                link: '/docs/developers/plugin-docs/events',
                collapsed: true,
                items: [
                  { text: 'Using the <code>pocketmine\\event\\Listener</code> interface', link: '/docs/developers/plugin-docs/events/listener-interface' },
                  { text: 'Event handler priority', link: '/docs/developers/plugin-docs/events/priority' }
                ]
              },
              { text: 'Inventory Transactions', link: '/docs/developers/plugin-docs/inventory-transactions' },
              {
                text: 'Plugin formats',
                link: '/docs/developers/plugin-docs/plugin-formats',
                collapsed: true,
                items: [
                  { text: 'Standard plugin types', link: '/docs/developers/plugin-docs/plugin-formats/standard' },
                  { text: 'Development plugin types', link: '/docs/developers/plugin-docs/plugin-formats/development' },
                  { text: 'Frequently Asked Questions', link: '/docs/developers/plugin-docs/plugin-formats/faq' }
                ]
              },
              { text: '<code>plugin.yml</code> fields', link: '/docs/developers/plugin-docs/plugin-manifest' }
            ]
          },
          {
            text: 'Core internal development',
            link: '/docs/developers/internals-docs-index',
            collapsed: true,
            items: [
              { text: 'How to add a new <em>vanilla</em> block', link: '/docs/developers/internals-docs/adding-vanilla-blocks' },
              { text: 'Implementing new Minecraft version support', link: '/docs/developers/internals-docs/updating-minecraft-protocol' }
            ]
          },
          { text: 'Threading in PHP - WTF?', link: '/docs/developers/threading-in-php-wtf' }
        ]
      },
      {
        text: 'RubyxGames (fork-specific)',
        items: [
          { text: 'Overview', link: '/docs/rubyx/' },
          { text: 'Releases & manual install', link: '/docs/rubyx/installation' },
          {
            text: 'Changelog 1.0.0',
            link: 'https://github.com/RubyxGames/PocketMine-MP/blob/stable/changelogs/1.0.0.md'
          },
          { text: 'Core updates digest', link: '/docs/rubyx/core-updates' },
          { text: 'Plugin API notes', link: '/docs/rubyx/plugin-api' },
          { text: 'DDUI plugin API', link: '/docs/rubyx/plugin-api-ddui' },
          {
            text: 'Operations',
            collapsed: true,
            items: [
              { text: 'Ops, health, shutdown', link: '/docs/rubyx/ops' },
              { text: 'NetherNet (Rubyx notes)', link: '/docs/rubyx/nethernet' },
              { text: 'Multiworld', link: '/docs/rubyx/multiworld' },
              { text: 'Resource packs', link: '/docs/rubyx/resource-packs' },
              { text: 'Adaptive QoS', link: '/docs/rubyx/adaptive-qos' },
              { text: 'Session recording', link: '/docs/rubyx/session-recording' },
              { text: 'Production checklist', link: '/docs/rubyx/prod-release-5.52-checklist' }
            ]
          },
          {
            text: 'DDUI',
            collapsed: true,
            items: [
              { text: 'Implementation status', link: '/docs/rubyx/DDUI_IMPLEMENTATION_STATUS' },
              { text: 'Wire contract', link: '/docs/rubyx/DDUI_WIRE_CONTRACT' },
              { text: 'Theming', link: '/docs/rubyx/DDUI_THEMING' },
              { text: 'Manual smoke', link: '/docs/rubyx/DDUI_MANUAL_SMOKE' },
              { text: 'Baseline', link: '/docs/rubyx/DDUI_BASELINE' },
              { text: 'MineChat / PostSystem', link: '/docs/rubyx/MINECHAT_DDUI_POSTSYSTEM_SCREEN' }
            ]
          },
          { text: 'Network audit (vs Axolotl)', link: '/docs/rubyx/AXOLOTL_NETWORK_AUDIT' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/RubyxGames/PocketMine-MP' }
    ]
  }
})
