// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://deus-corp.github.io',
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
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/Deus-corp' },
			],
			sidebar: [
				{ label: 'Home', link: '/' },
				{ label: 'Quick Start', link: '/quickstart/' },
				{ label: 'Demo', link: '/demo/' },
				{
					label: 'Case Studies',
					collapsed: true,
					items: [{ autogenerate: { directory: 'case-studies' } }],
				},
				{
					label: 'Components',
					collapsed: true,
					items: [
						{
							label: 'cks-core',
							collapsed: true,
							items: [{ autogenerate: { directory: 'cks-core' } }],
						},
						{
							label: 'cks-runtime',
							collapsed: true,
							items: [{ autogenerate: { directory: 'cks-runtime' } }],
						},
						{
							label: 'cks-mcp',
							collapsed: true,
							items: [{ autogenerate: { directory: 'cks-mcp' } }],
						},
						{
							label: 'cks-studio',
							collapsed: true,
							items: [{ autogenerate: { directory: 'cks-studio' } }],
						},
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
			},
		}),
	],
});