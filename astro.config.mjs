// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
	site: 'https://punctumactus.github.io',
	base: '/cks-website/',
	integrations: [
		starlight({
			title: 'CKS Documentation',
			description:
				'Canonical Knowledge Structure — verifiable knowledge graphs for LLMs',
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
			},
			logo: {
				src: './src/assets/logo.svg',
				replacesTitle: false,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/PunctumActus' },
			],
			sidebar: [
				{ label: 'Home', link: '/' },
				{ label: 'FAQ / Troubleshooting', link: '/faq/' },
				{ label: 'Quick Start', link: '/quickstart/' },
				{ label: 'Demo', link: '/demo/' },
				{
					label: 'Case Studies',
					collapsed: true,
					items: [
						{
							autogenerate: { directory: 'case-studies', collapsed: true },
						},
					],
				},
				{
					label: 'Components',
					collapsed: true,
					items: [
						{
							label: 'cks-core',
							collapsed: true,
							items: [
								{
									autogenerate: { directory: 'cks-core', collapsed: true },
								},
							],
						},
						{
							label: 'cks-runtime',
							collapsed: true,
							items: [
								{
									autogenerate: { directory: 'cks-runtime', collapsed: true },
								},
							],
						},
						{
							label: 'cks-mcp',
							collapsed: true,
							items: [
								{
									autogenerate: { directory: 'cks-mcp', collapsed: true },
								},
							],
						},
						{
							label: 'cks-studio',
							collapsed: true,
							items: [
								{
									autogenerate: { directory: 'cks-studio', collapsed: true },
								},
							],
						},
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			plugins: [
				starlightLlmsTxt({
					projectName: 'CKS',
				}),
			],
			head: [
				// Open Graph
				{
					tag: 'meta',
					attrs: { property: 'og:type', content: 'website' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:site_name', content: 'CKS Documentation' },
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://punctumactus.github.io/cks-website/og-card.png',
					},
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:width', content: '1200' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:height', content: '630' },
				},
				// Twitter Card
				{
					tag: 'meta',
					attrs: { name: 'twitter:card', content: 'summary_large_image' },
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:image',
						content: 'https://punctumactus.github.io/cks-website/og-card.png',
					},
				},
				// Theme color for browser UI (matches --cks-ink from custom.css)
				{
					tag: 'meta',
					attrs: { name: 'theme-color', content: '#0b0e14' },
				},
			],
		}),
	],
});