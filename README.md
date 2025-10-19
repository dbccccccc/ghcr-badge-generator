# GHCR Badge Generator

A single-page tool for creating download badges for GitHub Container Registry (GHCR) packages.  
Everything lives in plain HTML, CSS, and JavaScript, so you can host it anywhere — including GitHub Pages — with zero build tooling.

## Features
- Guided three-step flow: enter repo &rarr; pick the package &rarr; customize the badge.
- Live shields.io preview and ready-to-copy Markdown, HTML, and direct badge URLs.
- Works entirely in the browser; no API keys, servers, or dependencies required.

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Paste a GitHub repository URL, fine-tune the badge, and copy the output you need.

That’s it — no install commands, no tooling prerequisites.

## Deploy to GitHub Pages

1. Push the repository to GitHub if it is not already there.
2. In your repository settings, enable **Pages** and select the `main` branch (root directory).
3. Save the settings; GitHub will serve the static site at `https://<user>.github.io/<repo>/`.

## How It Works

- Badge data comes from the public `ghcr-badge.elias.eu.org` API provided by [Elias](https://ghcr-badge.elias.eu.org/).
- The shields.io dynamic JSON badge is assembled directly in the browser based on your selections.
- Clipboard actions rely on the modern `navigator.clipboard` API; if that fails, just copy the text manually.

## Customization Options

- **Label** – default `ghcr pulls`.
- **Logo** – GitHub, Docker, or none.
- **Color** – default shields.io coloring or quick presets.
- **Style** – flat, flat-square, for-the-badge, plastic, or social.

## Contributing

Improvements and suggestions are welcome! Since the site is a simple static page, adjustments usually mean editing `index.html`, `styles.css`, or `script.js`.  
Please open an issue or pull request if you have an idea to share.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

