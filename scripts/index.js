'use strict';

/* =====================================================================
   WayVR Theme Configurator
   Builds, previews and exports WayVR dashboard palettes.
   Palette format: https://wayvr.org/docs/basics/customization/#custom-colors
   ===================================================================== */

const DEFAULT_THEME_URL = 'data/default.json';
const STORAGE_KEY = 'wayvr-theme-configurator';

/* Mirror of data/default.json, used when the file cannot be fetched
   (for example when index.html is opened straight from disk). Keep in sync. */
const FALLBACK_DEFAULT = {
	primary: '#cba6f7',
	on_primary: '#11111b',
	secondary: '#fab387',
	on_secondary: '#11111b',
	tertiary: '#94e2d5',
	on_tertiary: '#11111b',
	success: '#00d443',
	on_success: '#ffffff',
	danger: '#f38ba8',
	on_danger: '#11111b',
	background: '#1e1e2e',
	on_background: '#cdd6f4',
	background_variant: '#313244',
	on_background_variant: '#a3b4eb',
	background_contrast: '#181825',
	on_background_contrast: '#cdd6f4',
	outline: '#4c4f69',
	shadow: '#11111b',
	highlight: '#45475a'
};

/* Output order and grouping of the palette, matching the docs. */
const SCHEMA = [
	{
		title: 'Accents',
		desc: 'Used for active states, text highlights and hover effects.',
		keys: [
			{ key: 'primary', label: 'Primary', desc: 'Pressed, checked and active state of controls' },
			{ key: 'on_primary', label: 'On Primary', desc: 'Foreground on top of Primary', auto: 'primary' },
			{ key: 'secondary', label: 'Secondary', desc: 'Second accent, used for text highlights' },
			{ key: 'on_secondary', label: 'On Secondary', desc: 'Foreground on top of Secondary', auto: 'secondary' },
			{ key: 'tertiary', label: 'Tertiary', desc: 'Highlights and hover effects' },
			{ key: 'on_tertiary', label: 'On Tertiary', desc: 'Foreground on top of Tertiary', auto: 'tertiary' }
		]
	},
	{
		title: 'Status',
		desc: 'Feedback colors for success states and errors.',
		keys: [
			{ key: 'success', label: 'Success', desc: 'Confirmations and healthy states' },
			{ key: 'on_success', label: 'On Success', desc: 'Foreground on top of Success', auto: 'success' },
			{ key: 'danger', label: 'Danger', desc: 'Errors and dangerous actions' },
			{ key: 'on_danger', label: 'On Danger', desc: 'Foreground on top of Danger', auto: 'danger' }
		]
	},
	{
		title: 'Backgrounds',
		desc: 'The three surface tones of the dashboard and their text colors.',
		keys: [
			{ key: 'background', label: 'Background', desc: 'Default background' },
			{ key: 'on_background', label: 'On Background', desc: 'Text on Background', auto: 'background' },
			{ key: 'background_variant', label: 'Background Variant', desc: 'Alternative background, less contrast' },
			{ key: 'on_background_variant', label: 'On Background Variant', desc: 'Text on Background Variant', auto: 'background_variant' },
			{ key: 'background_contrast', label: 'Background Contrast', desc: 'Higher-contrast background' },
			{ key: 'on_background_contrast', label: 'On Background Contrast', desc: 'Text on Background Contrast', auto: 'background_contrast' }
		]
	},
	{
		title: 'Borders & depth',
		desc: 'Borders, hover fills and shadows.',
		keys: [
			{ key: 'outline', label: 'Outline', desc: 'Borders and dividers' },
			{ key: 'shadow', label: 'Shadow', desc: 'Text shadows and elevation' },
			{ key: 'highlight', label: 'Highlight', desc: 'Hover fills and subtle borders' }
		]
	}
];

const ACCENT_KEYS = ['primary', 'secondary', 'tertiary', 'success', 'danger'];
const PAIR_KEYS = [
	['primary', 'on_primary'],
	['secondary', 'on_secondary'],
	['tertiary', 'on_tertiary'],
	['success', 'on_success'],
	['danger', 'on_danger'],
	['background', 'on_background'],
	['background_variant', 'on_background_variant'],
	['background_contrast', 'on_background_contrast']
];

const PRESETS = {
	'Catppuccin Mocha': { ...FALLBACK_DEFAULT },
	'Catppuccin Latte': {
		primary: '#8839ef', on_primary: '#ffffff',
		secondary: '#fe640b', on_secondary: '#11111b',
		tertiary: '#179299', on_tertiary: '#11111b',
		success: '#40a02b', on_success: '#11111b',
		danger: '#d20f39', on_danger: '#ffffff',
		background: '#eff1f5', on_background: '#4c4f69',
		background_variant: '#dce0e8', on_background_variant: '#4c4f69',
		background_contrast: '#ffffff', on_background_contrast: '#4c4f69',
		outline: '#bcc0cc', shadow: '#acb0be', highlight: '#ccd0da'
	},
	Dracula: {
		primary: '#bd93f9', on_primary: '#282a36',
		secondary: '#f1fa8c', on_secondary: '#282a36',
		tertiary: '#8be9fd', on_tertiary: '#282a36',
		success: '#50fa7b', on_success: '#282a36',
		danger: '#ff5555', on_danger: '#282a36',
		background: '#282a36', on_background: '#f8f8f2',
		background_variant: '#44475a', on_background_variant: '#f8f8f2',
		background_contrast: '#1e1f29', on_background_contrast: '#f8f8f2',
		outline: '#6272a4', shadow: '#171823', highlight: '#6272a4'
	},
	Nord: {
		primary: '#88c0d0', on_primary: '#2e3440',
		secondary: '#ebcb8b', on_secondary: '#2e3440',
		tertiary: '#8fbcbb', on_tertiary: '#2e3440',
		success: '#a3be8c', on_success: '#2e3440',
		danger: '#bf616a', on_danger: '#2e3440',
		background: '#2e3440', on_background: '#d8dee9',
		background_variant: '#3b4252', on_background_variant: '#d8dee9',
		background_contrast: '#292e39', on_background_contrast: '#d8dee9',
		outline: '#4c566a', shadow: '#1b2029', highlight: '#434c5e'
	},
	'Tokyo Night': {
		primary: '#7aa2f7', on_primary: '#1a1b26',
		secondary: '#e0af68', on_secondary: '#1a1b26',
		tertiary: '#bb9af7', on_tertiary: '#1a1b26',
		success: '#9ece6a', on_success: '#1a1b26',
		danger: '#f7768e', on_danger: '#1a1b26',
		background: '#1a1b26', on_background: '#c0caf5',
		background_variant: '#292e42', on_background_variant: '#c0caf5',
		background_contrast: '#16161e', on_background_contrast: '#c0caf5',
		outline: '#3b4261', shadow: '#0d0e14', highlight: '#2f3549'
	},
	'Solarized Dark': {
		primary: '#268bd2', on_primary: '#002b36',
		secondary: '#b58900', on_secondary: '#002b36',
		tertiary: '#2aa198', on_tertiary: '#002b36',
		success: '#859900', on_success: '#002b36',
		danger: '#dc322f', on_danger: '#002b36',
		background: '#002b36', on_background: '#93a1a1',
		background_variant: '#073642', on_background_variant: '#93a1a1',
		background_contrast: '#001f27', on_background_contrast: '#93a1a1',
		outline: '#586e75', shadow: '#001b22', highlight: '#0b3f4d'
	},
	Gruvbox: {
		primary: '#83a598', on_primary: '#282828',
		secondary: '#fabd2f', on_secondary: '#282828',
		tertiary: '#8ec07c', on_tertiary: '#282828',
		success: '#b8bb26', on_success: '#282828',
		danger: '#fb4934', on_danger: '#282828',
		background: '#282828', on_background: '#ebdbb2',
		background_variant: '#3c3836', on_background_variant: '#ebdbb2',
		background_contrast: '#1d2021', on_background_contrast: '#ebdbb2',
		outline: '#504945', shadow: '#1d2021', highlight: '#665c54'
	},
	'Nord Light': {
		primary: '#5e81ac', on_primary: '#11111b',
		secondary: '#b58900', on_secondary: '#11111b',
		tertiary: '#2f7f7f', on_tertiary: '#ffffff',
		success: '#5c8a3c', on_success: '#11111b',
		danger: '#b6455a', on_danger: '#ffffff',
		background: '#eceff4', on_background: '#3b4252',
		background_variant: '#e5e9f0', on_background_variant: '#434c5e',
		background_contrast: '#ffffff', on_background_contrast: '#3b4252',
		outline: '#c3ccd8', shadow: '#c3ccd8', highlight: '#d8dee9'
	}
};

const KEY_ORDER = SCHEMA.flatMap((group) => group.keys.map((entry) => entry.key));
const varName = (key) => '--' + key.replace(/_/g, '-');

/* ---------- state ---------- */

let initialized = false;

const state = {
	default: { ...FALLBACK_DEFAULT },
	theme: { ...FALLBACK_DEFAULT },
	name: '',
	preset: 'Catppuccin Mocha'
};

const el = {};
const rows = new Map();

/* ---------- color helpers ---------- */

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function hexToRgb(hex) {
	const h = hex.replace('#', '');
	const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
	const n = parseInt(full, 16);
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
	return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }) {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	const l = (max + min) / 2;
	let h = 0, s = 0;

	if (max !== min) {
		const d = max - min;
		s = l > .5 ? d / (2 - max - min) : d / (max + min);
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
	}
	return { h, s, l };
}

function hslToRgb({ h, s, l }) {
	h = ((h % 360) + 360) % 360;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let rgb;
	if (h < 60) rgb = [c, x, 0];
	else if (h < 120) rgb = [x, c, 0];
	else if (h < 180) rgb = [0, c, x];
	else if (h < 240) rgb = [0, x, c];
	else if (h < 300) rgb = [x, 0, c];
	else rgb = [c, 0, x];
	return { r: (rgb[0] + m) * 255, g: (rgb[1] + m) * 255, b: (rgb[2] + m) * 255 };
}

function hslToHex(hsl) {
	const { r, g, b } = hslToRgb(hsl);
	return rgbToHex(r, g, b);
}

function relativeLuminance(hex) {
	const { r, g, b } = hexToRgb(hex);
	const lin = (c) => {
		c /= 255;
		return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
	};
	return .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
}

function contrastRatio(a, b) {
	const la = relativeLuminance(a), lb = relativeLuminance(b);
	return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05);
}

const INK_DARK = '#11111b';
const INK_LIGHT = '#ffffff';

/* The readable counterpart of a background: whichever ink contrasts more. */
function bestInk(hex) {
	return contrastRatio(hex, INK_DARK) >= contrastRatio(hex, INK_LIGHT) ? INK_DARK : INK_LIGHT;
}

/* Re-lightness a color until it is readable against its best ink,
   keeping the hue and saturation and staying as close as possible
   to the requested lightness. */
function readableFrom(hex, desiredLightness, minRatio) {
	const { h, s, l: current } = rgbToHsl(hexToRgb(hex));
	const target = desiredLightness ?? current;
	let best = null;
	let bestDelta = Infinity;

	for (let l = .18; l <= .95; l += .01) {
		const candidate = hslToHex({ h, s, l });
		const ratio = Math.max(contrastRatio(candidate, INK_DARK), contrastRatio(candidate, INK_LIGHT));
		if (ratio < minRatio) continue;
		const delta = Math.abs(l - target);
		if (delta < bestDelta) {
			bestDelta = delta;
			best = candidate;
		}
	}
	return best ?? hex;
}

/* ---------- theme helpers ---------- */

function orderedTheme(theme) {
	const out = {};
	for (const key of KEY_ORDER) out[key] = theme[key];
	return out;
}

function isHex(value) { return typeof value === 'string' && /^#?[0-9a-fA-F]{6}$/.test(value.trim()); }

function normalizeHex(value) {
	let v = value.trim().toLowerCase();
	if (!v.startsWith('#')) v = '#' + v;
	return v;
}

function sanitizeName(name) {
	const cleaned = name.trim()
		.replace(/\s+/g, '-')
		.replace(/[^A-Za-z0-9._-]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^[-.]+|[-.]+$/g, '');
	return cleaned || 'theme';
}

function serialize(theme) {
	return JSON.stringify(orderedTheme(theme), null, '\t');
}

function setTheme(theme) {
	state.theme = orderedTheme(theme);
	save();
	render();
}

function save() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: state.name, theme: state.theme, preset: state.preset }));
	} catch (_) { /* storage unavailable (private mode, file://) — non-fatal */ }
}

function load() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const saved = JSON.parse(raw);
		if (!saved || !saved.theme) return null;
		const theme = {};
		for (const key of KEY_ORDER) {
			if (isHex(saved.theme[key])) theme[key] = normalizeHex(saved.theme[key]);
		}
		if (Object.keys(theme).length !== KEY_ORDER.length) return null;
		return { theme, name: typeof saved.name === 'string' ? saved.name : '', preset: saved.preset };
	} catch (_) {
		return null;
	}
}

/* ---------- editor construction ---------- */

function buildEditor() {
	const groups = el.groups;

	for (const [name, preset] of Object.entries(PRESETS)) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'preset';
		button.dataset.preset = name;

		const strip = document.createElement('span');
		strip.className = 'preset__strip';
		for (const key of [...ACCENT_KEYS, 'background', 'background_variant', 'background_contrast']) {
			const dot = document.createElement('i');
			dot.style.background = preset[key];
			strip.appendChild(dot);
		}

		const label = document.createElement('span');
		label.className = 'preset__name';
		label.textContent = name;

		button.append(strip, label);
		button.addEventListener('click', () => {
			state.preset = name;
			setTheme(preset);
			notice('Loaded preset “' + name + '”.');
		});
		el.presets.appendChild(button);
	}

	for (const group of SCHEMA) {
		const section = document.createElement('section');
		section.className = 'group';

		const title = document.createElement('h3');
		title.className = 'group__title';
		title.textContent = group.title;

		section.appendChild(title);

		if (group.desc) {
			const desc = document.createElement('p');
			desc.className = 'group__desc';
			desc.textContent = group.desc;
			section.appendChild(desc);
		}

		for (const entry of group.keys) {
			section.appendChild(buildRow(entry));
		}

		groups.appendChild(section);
	}
}

function buildRow(entry) {
	const row = document.createElement('div');
	row.className = 'crow';

	const picker = document.createElement('input');
	picker.type = 'color';
	picker.className = 'crow__picker';
	picker.id = 'c-' + entry.key;
	picker.setAttribute('aria-label', entry.label + ' color picker');
	picker.addEventListener('input', () => {
		state.theme[entry.key] = picker.value.toLowerCase();
		state.preset = null;
		save();
		render();
	});

	const meta = document.createElement('div');
	meta.className = 'crow__meta';

	const label = document.createElement('label');
	label.className = 'crow__label';
	label.htmlFor = picker.id;
	label.textContent = entry.label;

	const key = document.createElement('span');
	key.className = 'crow__key';
	key.textContent = entry.key;

	const desc = document.createElement('span');
	desc.className = 'crow__desc';
	desc.textContent = entry.desc;

	meta.append(label, key, desc);

	const hexWrap = document.createElement('div');
	hexWrap.className = 'crow__hexwrap';

	const hex = document.createElement('input');
	hex.type = 'text';
	hex.className = 'input crow__hex';
	hex.value = state.theme[entry.key];
	hex.spellcheck = false;
	hex.autocomplete = 'off';
	hex.setAttribute('aria-label', entry.label + ' hex value');
	hex.addEventListener('input', () => {
		if (!isHex(hex.value)) {
			hex.classList.add('is-bad');
			return;
		}
		hex.classList.remove('is-bad');
		const value = normalizeHex(hex.value);
		state.theme[entry.key] = value;
		rows.get(entry.key).picker.value = value;
		state.preset = null;
		save();
		render({ skipHex: entry.key });
	});
	hex.addEventListener('blur', () => render());

	hexWrap.appendChild(hex);

	let auto = null;
	if (entry.auto) {
		auto = document.createElement('button');
		auto.type = 'button';
		auto.className = 'crow__auto';
		auto.textContent = 'auto';
		auto.title = 'Pick the most readable foreground for ' + entry.auto;
		auto.addEventListener('click', () => {
			state.theme[entry.key] = bestInk(state.theme[entry.auto]);
			state.preset = null;
			setTheme(state.theme);
			notice(entry.key.replace(/_/g, ' ') + ' set for readability on ' + entry.auto + '.');
		});
		hexWrap.appendChild(auto);
	}

	row.append(picker, meta, hexWrap);
	rows.set(entry.key, { picker, hex });

	return row;
}

/* ---------- render ---------- */

function render(options) {
	const opts = options || {};

	for (const key of KEY_ORDER) {
		const value = state.theme[key];
		el.preview.style.setProperty(varName(key), value);
		const row = rows.get(key);
		row.picker.value = value;
		if (opts.skipHex !== key) {
			row.hex.value = value;
			row.hex.classList.remove('is-bad');
		}
	}

	renderContrast();
	renderExport();
	renderPresetState();
}

/* ---------- contrast report ---------- */

function grade(ratio) {
	if (ratio >= 7) return { label: 'AAA', badge: 'badge--aaa' };
	if (ratio >= 4.5) return { label: 'AA', badge: 'badge--aa' };
	if (ratio >= 3) return { label: 'AA large', badge: 'badge--large' };
	return { label: 'Fails AA', badge: 'badge--fail' };
}

function renderContrast() {
	const container = el.contrast;
	container.textContent = '';
	let worst = 21;

	for (const [base, on] of PAIR_KEYS) {
		const ratio = contrastRatio(state.theme[base], state.theme[on]);
		worst = Math.min(worst, ratio);
		const info = grade(ratio);

		const item = document.createElement('div');
		item.className = 'citem' + (ratio < 3 ? ' is-fail' : '');

		const sample = document.createElement('div');
		sample.className = 'citem__sample';
		sample.style.background = state.theme[base];
		sample.style.color = state.theme[on];
		sample.textContent = 'Aa';

		const meta = document.createElement('div');
		meta.className = 'citem__meta';

		const pair = document.createElement('div');
		pair.className = 'citem__pair';
		pair.textContent = on + ' on ' + base;

		const badge = document.createElement('span');
		badge.className = 'citem__badge ' + info.badge;
		badge.textContent = ratio.toFixed(2) + ':1 · ' + info.label;

		meta.append(pair, badge);
		item.append(sample, meta);
		container.appendChild(item);
	}

	el.contrastSummary.textContent = 'lowest pair ' + worst.toFixed(2) + ':1';
}

/* ---------- export ---------- */

function renderExport() {
	const json = serialize(state.theme);
	el.jsonOut.textContent = json;
	el.filenameOut.textContent = sanitizeName(state.name) + '.json';
}

function download() {
	const name = sanitizeName(state.name);
	const blob = new Blob([serialize(state.theme) + '\n'], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = name + '.json';
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
	notice('Saved ' + name + '.json — copy it into ~/.config/wayvr/palettes/.', 'ok');
}

async function copyJson() {
	const text = serialize(state.theme);
	try {
		await navigator.clipboard.writeText(text);
		notice('Palette JSON copied to clipboard.', 'ok');
	} catch (_) {
		const range = document.createRange();
		range.selectNodeContents(el.jsonOut);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		notice('Clipboard unavailable — JSON selected, press Ctrl+C.', 'error');
	}
}

/* ---------- presets / random ---------- */

function renderPresetState() {
	for (const button of el.presets.children) {
		const active = button.dataset.preset === state.preset;
		button.classList.toggle('is-active', active);
		button.setAttribute('aria-pressed', String(active));
	}
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function hasFiles(event) {
	return !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');
}

/* Moves a surface's lightness until `ink` is readable on top of it. */
function surfaceFor(h, s, l, ink, minRatio) {
	let best = null;
	let bestDelta = Infinity;

	for (let x = .02; x <= .98; x += .01) {
		const candidate = hslToHex({ h, s, l: x });
		if (contrastRatio(candidate, ink) < minRatio) continue;
		const delta = Math.abs(x - l);
		if (delta < bestDelta) {
			bestDelta = delta;
			best = candidate;
		}
	}
	return best ?? hslToHex({ h, s, l });
}

function randomPalette() {
	const theme = {};
	const baseHue = Math.random() * 360;
	const light = Math.random() < .28;

	const hues = {
		primary: baseHue,
		secondary: (baseHue + 35 + randomInt(0, 25)) % 360,
		tertiary: (baseHue + 300 + randomInt(0, 25)) % 360,
		success: 130 + randomInt(0, 25),
		danger: (348 + randomInt(0, 24)) % 360
	};

	/* Accents: pick a readable fill, then let the foreground follow it. */
	const accentSat = light ? .55 : .62;
	const accentLightness = light ? .48 : .68;
	for (const key of ACCENT_KEYS) {
		theme[key] = readableFrom(hslToHex({ h: hues[key], s: accentSat, l: accentLightness }), accentLightness, 4.5);
		theme['on_' + key] = bestInk(theme[key]);
	}

	/* Surfaces: the text color is fixed by the scheme, so move the surface. */
	const ink = light ? INK_DARK : INK_LIGHT;
	const surfaces = light
		? { background: .94, background_variant: .88, background_contrast: .99 }
		: { background: .16, background_variant: .22, background_contrast: .09 };

	for (const [key, l] of Object.entries(surfaces)) {
		theme[key] = surfaceFor(baseHue, .18, l, ink, 7);
		theme['on_' + key] = ink;
	}

	if (light) {
		theme.outline = hslToHex({ h: baseHue, s: .14, l: .78 });
		theme.highlight = hslToHex({ h: baseHue, s: .16, l: .84 });
		theme.shadow = hslToHex({ h: baseHue, s: .18, l: .72 });
	} else {
		theme.outline = hslToHex({ h: baseHue, s: .14, l: .36 });
		theme.highlight = hslToHex({ h: baseHue, s: .14, l: .3 });
		theme.shadow = hslToHex({ h: baseHue, s: .3, l: .04 });
	}

	return theme;
}

/* ---------- import ---------- */

function importTheme(raw, label) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (_) {
		notice('Could not parse ' + label + ' — the file is not valid JSON.', 'error');
		return;
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		notice('Could not read ' + label + ' — expected a JSON object of colors.', 'error');
		return;
	}

	const theme = {};
	const unknown = [];
	let missing = 0;

	for (const key of KEY_ORDER) {
		if (isHex(parsed[key])) theme[key] = normalizeHex(parsed[key]);
		else missing++;
	}
	for (const key of Object.keys(parsed)) {
		if (!KEY_ORDER.includes(key)) unknown.push(key);
	}

	if (missing) {
		notice('Skipped ' + missing + ' missing or invalid color' + (missing > 1 ? 's' : '') + ' in ' + label + '.', 'error');
		return;
	}

	state.preset = null;
	state.name = state.name || sanitizeName(label.replace(/\.json$/i, ''));
	el.name.value = state.name;
	setTheme(theme);

	notice('Imported ' + label + (unknown.length ? ' — ignored unknown keys: ' + unknown.join(', ') : '') + '.', 'ok');
}

/* ---------- notices ---------- */

let noticeTimer = null;

function notice(message, kind) {
	el.notice.textContent = message;
	el.notice.className = 'notice' + (kind ? ' notice--' + kind : '');
	el.notice.hidden = false;
	clearTimeout(noticeTimer);
	noticeTimer = setTimeout(() => { el.notice.hidden = true; }, 6000);
}

/* ---------- events ---------- */

function wire() {
	el.name.addEventListener('input', () => {
		state.name = el.name.value;
		save();
		renderExport();
	});

	el.download.addEventListener('click', download);
	el.copy.addEventListener('click', copyJson);

	el.reset.addEventListener('click', () => {
		state.preset = 'Catppuccin Mocha';
		setTheme(state.default);
		notice('Reset to the default WayVR palette.');
	});

	el.randomize.addEventListener('click', () => {
		state.preset = null;
		setTheme(randomPalette());
		notice('Generated a new palette — on-colors were picked for readability.', 'ok');
	});

	el.importBtn.addEventListener('click', () => el.importFile.click());
	el.importFile.addEventListener('change', (event) => {
		const file = event.target.files && event.target.files[0];
		if (!file) return;
		file.text().then((text) => importTheme(text, file.name));
		event.target.value = '';
	});

	el.preview.addEventListener('dragover', (event) => {
		if (!hasFiles(event)) return;
		event.preventDefault();
		el.preview.dataset.dragging = 'true';
	});
	el.preview.addEventListener('dragleave', () => { delete el.preview.dataset.dragging; });
	el.preview.addEventListener('drop', (event) => {
		if (!hasFiles(event)) return;
		event.preventDefault();
		delete el.preview.dataset.dragging;
		const file = event.dataTransfer && event.dataTransfer.files[0];
		if (file) file.text().then((text) => importTheme(text, file.name));
	});

	/* Keep a dropped file from replacing the page when it misses the preview. */
	window.addEventListener('dragover', (event) => { if (hasFiles(event)) event.preventDefault(); });
	window.addEventListener('drop', (event) => { if (hasFiles(event)) event.preventDefault(); });

	for (const button of el.modes.children) {
		button.addEventListener('click', () => {
			for (const other of el.modes.children) {
				const active = other === button;
				other.classList.toggle('is-active', active);
				other.setAttribute('aria-selected', String(active));
			}
			el.preview.dataset.view = button.dataset.surface;
		});
	}

	document.addEventListener('keydown', (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
			event.preventDefault();
			download();
		}
	});
}

/* ---------- init ---------- */

async function loadDefault() {
	try {
		const response = await fetch(DEFAULT_THEME_URL, { cache: 'no-cache' });
		if (!response.ok) throw new Error('HTTP ' + response.status);
		const data = await response.json();
		const theme = {};
		for (const key of KEY_ORDER) {
			if (isHex(data[key])) theme[key] = normalizeHex(data[key]);
		}
		if (Object.keys(theme).length === KEY_ORDER.length) return theme;
	} catch (_) { /* fall back to the built-in copy */ }
	return { ...FALLBACK_DEFAULT };
}

async function init() {
	if (initialized) return;
	initialized = true;

	el.name = document.getElementById('theme-name');
	el.notice = document.getElementById('notice');
	el.presets = document.getElementById('presets');
	el.groups = document.getElementById('color-groups');
	el.preview = document.getElementById('preview');
	el.contrast = document.getElementById('contrast');
	el.contrastSummary = document.getElementById('contrast-summary');
	el.jsonOut = document.getElementById('json-out');
	el.filenameOut = document.getElementById('filename-out');
	el.download = document.getElementById('download-json');
	el.copy = document.getElementById('copy-json');
	el.reset = document.getElementById('reset-theme');
	el.randomize = document.getElementById('randomize');
	el.importBtn = document.getElementById('import-json');
	el.importFile = document.getElementById('import-file');
	el.modes = document.getElementById('preview-modes');

	state.default = await loadDefault();
	state.theme = { ...state.default };

	buildEditor();
	wire();

	const saved = load();
	if (saved) {
		state.theme = saved.theme;
		state.name = saved.name;
		state.preset = saved.preset || null;
	}
	el.name.value = state.name;

	render();
}

/* Works whether the script is parsed before or after DOMContentLoaded. */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
