# WayVR Theme Configurator

A web tool for designing custom color palettes for the [WayVR](https://github.com/wayvr-org)
dashboard. Pick your colors, watch the dashboard update live, then download the palette
as a JSON file.

## Features

- All 19 palette colors from the [custom colors spec](https://wayvr.org/docs/basics/customization/#custom-colors)
- Live preview of a WayVR dashboard mock plus a gallery of real wgui components
- WCAG contrast report for every `on_` / base color pair
- 8 built-in presets, plus a randomizer that only generates readable palettes
- Import an existing palette to tweak it further (button or drag and drop)
- Work is saved to your browser, so you can come back to it

## Usage

No build step and no dependencies. Either serve the folder:

```sh
python3 -m http.server 8000
```

...or just open `index.html` in a browser (the default palette is embedded as a
fallback for `file://`).

## Installing a theme

Type a name, hit **Download** (or `Ctrl+S`), then copy the file into:

```
~/.config/wayvr/palettes/[theme_name].json
```

The filename without the extension is the name shown in WayVR's color palette
picker. Restart WayVR, or reopen the picker, and your theme is there.

## Credits

- WayVR and the palette format: [wayvr-org](https://github.com/wayvr-org)
- This tool: [F1dg3tXD](https://github.com/F1dg3tXD)

## License

MIT — see [LICENSE](LICENSE).
