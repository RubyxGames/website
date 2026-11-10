import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import { footerMessage } from './footer'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/website/',
  lang: 'ru-RU',
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
      { text: 'Главная', link: '/' },
      { text: 'Документация', link: '/docs' },
      { text: 'Rubyx', link: '/docs/rubyx/' },
      { text: 'Релизы', link: 'https://github.com/RubyxGames/PocketMine-MP/releases' }
    ],
    docFooter: { prev: 'Назад', next: 'Далее' },
    outline: { label: 'На этой странице' },
    returnToTopLabel: 'Наверх',
    sidebarMenuLabel: 'Меню',
    darkModeSwitchLabel: 'Тема',

    sidebar: [
      {
        text: 'Начало работы',
        items: [
          {
            text: 'Установка и обновление',
            link: '/docs/installation',
            collapsed: true,
            items: [
              { text: 'Требования', link: '/docs/installation/requirements' },
              { text: 'Официальный установщик (Linux/macOS)', link: '/docs/installation/get-dot-axolotl-pm-dot-org' },
              { text: 'Docker (Linux)', link: '/docs/installation/docker' },
              { text: 'Ручная установка', link: '/docs/installation/installing-manually' },
              { text: 'NetherNet', link: '/docs/installation/nethernet-usage' },
              { text: 'RubyxGames: релизы GitHub', link: '/docs/rubyx/installation' }
            ]
          },
          { text: 'Миграция с PMMP', link: '/docs/migrating-from-pocketmine-mp' },
          { text: 'Базовое использование', link: '/docs/basic-usage' },
          {
            text: 'Подключение',
            link: '/docs/connecting',
            collapsed: true,
            items: [
              { text: 'Добавить сервер в Minecraft', link: '/docs/connecting/add-external-server' },
              { text: 'Порты в firewall', link: '/docs/connecting/configure-firewall' },
              { text: 'Проброс портов на роутере', link: '/docs/connecting/portforward' }
            ]
          },
          { text: 'Конфигурация', link: '/docs/configuration' },
          { text: 'Плагины', link: '/docs/plugins' },
          { text: 'Миры', link: '/docs/worlds' },
          { text: 'Ресурс- и behavior-паки', link: '/docs/resourcepacks' },
          {
            text: 'Права',
            link: '/docs/permissions',
            collapsed: true,
            items: [
              { text: 'Встроенные permissions', link: '/docs/core-permissions' }
            ]
          },
          { text: 'Участие в разработке', link: '/docs/contributing' },
          {
            text: 'Сбои и ошибки',
            link: '/docs/issues',
            collapsed: true,
            items: [
              { text: 'Краши', link: '/docs/issues/crashes' },
              { text: 'Сообщить об ошибке', link: '/docs/issues/github-issues' }
            ]
          },
          { text: 'Контакты и поддержка', link: '/docs/contact' }
        ]
      },
      {
        text: 'FAQ и типичные проблемы',
        items: [
          {
            text: 'Установка',
            link: '/docs/faq/installation',
            collapsed: true,
            items: [
              { text: 'Не грузится opcache.so', link: '/docs/faq/installation/opcache.so' },
              { text: 'Не найден PocketMine-MP.phar', link: '/docs/faq/installation/pharnotfound' },
              { text: 'Установка под root', link: '/docs/faq/installation/rootuser' },
              { text: 'Windows XP', link: '/docs/faq/installation/windowsxp' }
            ]
          },
          {
            text: 'Подключение',
            link: '/docs/faq/connecting',
            collapsed: true,
            items: [
              { text: 'Типичные проблемы NetherNet', link: '/docs/faq/connecting/nethernet-common-issues' },
              { text: 'Нет подключения после обновления Minecraft', link: '/docs/faq/connecting/cantconnect' },
              { text: '«Opening server on 0.0.0.0:19132»', link: '/docs/faq/connecting/defaultrouteip' },
              { text: 'Login timeout', link: '/docs/faq/connecting/logintimeout' },
              { text: 'RakLib Thread Blocked', link: '/docs/faq/connecting/raklibthreadblocked' },
              { text: 'Зависание на resource packs', link: '/docs/faq/connecting/stuckduringconnect' },
              { text: 'VPN и игра', link: '/docs/faq/connecting/vpnproblems' },
              { text: 'localhost на Windows', link: '/docs/faq/connecting/win10localhostcantconnect' }
            ]
          },
          {
            text: 'Игра',
            link: '/docs/faq/playing',
            collapsed: true,
            items: [
              { text: 'Нет ванильной механики — это баг?', link: '/docs/faq/playing/missingfeatures' },
              { text: 'Java Edition клиенты', link: '/docs/faq/playing/playwithpc' }
            ]
          },
          {
            text: 'Плагины',
            link: '/docs/faq/plugins',
            collapsed: true,
            items: [
              { text: 'Incompatible API version', link: '/docs/faq/plugins/incompatibleapi' },
              { text: 'Как собрать .phar', link: '/docs/faq/plugins/makephar' },
              { text: 'Плагин без .phar', link: '/docs/faq/plugins/usephpfiles' }
            ]
          },
          {
            text: 'О PMMP и форках',
            link: '/docs/faq/about',
            collapsed: true,
            items: [
              { text: 'PMMP и PocketMine', link: '/docs/faq/about/pocketmine-vs-pmmp' },
              { text: 'Кто такой @shoghicp', link: '/docs/faq/about/shoghicp' },
              { text: 'Почему PHP', link: '/docs/faq/about/why-php' }
            ]
          }
        ]
      },
      {
        text: 'Разработчикам',
        items: [
          {
            text: 'Разработка плагинов',
            link: '/docs/developers/plugin-docs-index',
            collapsed: true,
            items: [
              { text: 'Версии API', link: '/docs/developers/plugin-docs/api-version-spec' },
              {
                text: 'События',
                link: '/docs/developers/plugin-docs/events',
                collapsed: true,
                items: [
                  { text: 'Listener', link: '/docs/developers/plugin-docs/events/listener-interface' },
                  { text: 'Приоритет обработчиков', link: '/docs/developers/plugin-docs/events/priority' }
                ]
              },
              { text: 'Транзакции инвентаря', link: '/docs/developers/plugin-docs/inventory-transactions' },
              {
                text: 'Форматы плагинов',
                link: '/docs/developers/plugin-docs/plugin-formats',
                collapsed: true,
                items: [
                  { text: 'Стандартные типы', link: '/docs/developers/plugin-docs/plugin-formats/standard' },
                  { text: 'Dev-типы', link: '/docs/developers/plugin-docs/plugin-formats/development' },
                  { text: 'FAQ', link: '/docs/developers/plugin-docs/plugin-formats/faq' }
                ]
              },
              { text: 'Поля plugin.yml', link: '/docs/developers/plugin-docs/plugin-manifest' }
            ]
          },
          {
            text: 'Разработка ядра',
            link: '/docs/developers/internals-docs-index',
            collapsed: true,
            items: [
              { text: 'Новый ванильный блок', link: '/docs/developers/internals-docs/adding-vanilla-blocks' },
              { text: 'Новая версия Minecraft', link: '/docs/developers/internals-docs/updating-minecraft-protocol' }
            ]
          },
          { text: 'Threading in PHP — WTF?', link: '/docs/developers/threading-in-php-wtf' }
        ]
      },
      {
        text: 'RubyxGames',
        items: [
          { text: 'Обзор', link: '/docs/rubyx/' },
          { text: 'Установка с релиза', link: '/docs/rubyx/installation' },
          {
            text: 'Changelog 1.0.0',
            link: 'https://github.com/RubyxGames/PocketMine-MP/blob/stable/changelogs/1.0.0.md'
          },
          { text: 'Обновления ядра', link: '/docs/rubyx/core-updates' },
          { text: 'Plugin API', link: '/docs/rubyx/plugin-api' },
          { text: 'DDUI API', link: '/docs/rubyx/plugin-api-ddui' },
          {
            text: 'Эксплуатация',
            collapsed: true,
            items: [
              { text: 'Сервис и метрики', link: '/docs/rubyx/ops' },
              { text: 'NetherNet', link: '/docs/rubyx/nethernet' },
              { text: 'Мультимиры', link: '/docs/rubyx/multiworld' },
              { text: 'WorldEdit', link: '/docs/rubyx/worldedit' },
              { text: 'Resource packs', link: '/docs/rubyx/resource-packs' },
              { text: 'Плагины (folder, reload)', link: '/docs/rubyx/plugins-ops' },
              { text: 'Datapacks', link: '/docs/rubyx/datapacks' },
              { text: 'Adaptive QoS', link: '/docs/rubyx/adaptive-qos' },
              { text: 'Запись сессий', link: '/docs/rubyx/session-recording' }
            ]
          },
          {
            text: 'DDUI',
            collapsed: true,
            items: [
              { text: 'Статус', link: '/docs/rubyx/DDUI_IMPLEMENTATION_STATUS' },
              { text: 'Wire contract', link: '/docs/rubyx/DDUI_WIRE_CONTRACT' },
              { text: 'Theming', link: '/docs/rubyx/DDUI_THEMING' },
              { text: 'Manual smoke', link: '/docs/rubyx/DDUI_MANUAL_SMOKE' },
              { text: 'Baseline', link: '/docs/rubyx/DDUI_BASELINE' }
            ]
          },
          { text: 'Сетевой аудит', link: '/docs/rubyx/AXOLOTL_NETWORK_AUDIT' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/RubyxGames/PocketMine-MP' }
    ]
  }
})
