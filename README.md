# SnapStats

A Chrome extension that provides detailed performance metrics for websites. Track and analyze key Web Vitals and performance metrics to optimize your web applications.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome)](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)

## ✨ Features

- **Core Web Vitals Tracking**: Measure TTFB, FCP, LCP, and CLS
- **Network Analysis**: View resource size and loading time
- **Performance History**: Track metrics over time with visual charts
- **Actionable Recommendations**: Get suggestions to improve performance
- **Resource Analysis**: See detailed breakdown of loaded resources
- **Privacy-Focused**: All data stored locally, no external tracking

## 🚀 Installation

### From Chrome Web Store (Recommended)

1. Visit [SnapStats on Chrome Web Store](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)
2. Click "Add to Chrome"
3. Confirm the installation

### Local Development

1. Clone this repository
   ```bash
   git clone https://github.com/PeytonNowlin/snapstats.git
   cd snapstats
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top-right corner)

4. Click "Load unpacked" and select the extension directory

5. The extension icon will appear in your toolbar

## 📖 Usage

1. Navigate to any website you want to analyze
2. Click the SnapStats icon in your Chrome toolbar
3. Click "Run Audit" to analyze the current page
4. View the different tabs for metrics, history, and network analysis

## 🔧 Development

### Prerequisites

- Node.js (for generating promotional images)
- Chrome browser

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate promotional images (for store assets):
   ```bash
   npm run generate-promotional
   ```

### Project Structure

```
snapstats/
├── manifest.json          # Extension configuration
├── popup.html            # Extension interface
├── popup.js              # Extension functionality
├── icons/                # Extension icons
├── PRIVACY.md            # Privacy policy
└── README.md             # This file
```

## 🔒 Privacy

This extension only runs when explicitly activated and does not collect any personal data. All performance data is stored locally on your device using localStorage and is not transmitted to any external servers.

### Permissions

- **activeTab**: To analyze the current tab's performance metrics
- **scripting**: To run performance measurement scripts on the current page

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started, development setup, and submission process.

## 📄 License

MIT License - See the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Developer**: Peyton Nowlin
- **Email**: peyton@teamnowlin.com
- **Chrome Web Store**: [SnapStats](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)

## ⭐ Support

If you find this extension helpful, please consider:
- Rating it on the [Chrome Web Store](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)
- Starring this repository
- Sharing it with other developers 