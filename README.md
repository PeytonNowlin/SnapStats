# SnapStats ⚡

A Chrome extension that delivers in-depth performance insights for any website. SnapStats helps developers monitor **Core Web Vitals**, analyze network performance, and identify opportunities to optimize load times — all with privacy-first design.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome)](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)

---

## 🧠 Overview

Modern websites demand speed. **SnapStats** brings performance analytics directly into your browser, allowing you to measure, visualize, and improve page performance without relying on external dashboards or third-party tracking tools.

Built as a **lightweight Chrome extension**, it uses native browser APIs to measure metrics like **TTFB, FCP, LCP, and CLS**, and stores results locally for privacy and offline analysis.

---

## 🚀 Key Features

### 📊 Core Web Vitals Tracking

Measure and visualize essential metrics:
**TTFB (Time to First Byte)**, **FCP (First Contentful Paint)**, **LCP (Largest Contentful Paint)**, and **CLS (Cumulative Layout Shift)**.

### 🌐 Network Analysis

See which resources slow down your site. View file sizes, request times, and waterfall-style loading data.

### 📈 Performance History

Track site performance over time with interactive charts and detailed metric comparisons.

### 🧩 Actionable Recommendations

Get tailored suggestions for improving performance across key metrics.

### 🗂️ Resource Breakdown

Inspect each resource loaded by the page and identify heavy or redundant assets.

### 🔒 Privacy-Focused

All data is stored **locally** using `localStorage`. No remote servers. No analytics tracking. No external dependencies.

---

## 🛠️ Tech Stack

* **Platform:** Chrome Extension (Manifest v3)
* **Languages:** HTML, CSS, JavaScript
* **Charting:** Custom Canvas API visualizations
* **Storage:** LocalStorage for offline data retention
* **Build Tools:** Node.js for asset generation

---

## ⚙️ Installation

### From Chrome Web Store (Recommended)

1. Visit [SnapStats on Chrome Web Store](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)
2. Click **“Add to Chrome”**
3. Confirm installation — the icon will appear in your toolbar

### Local Development Setup

1. Clone the repository

   ```bash
   git clone https://github.com/PeytonNowlin/snapstats.git
   cd snapstats
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **“Load unpacked”** and select the `snapstats` directory
5. SnapStats will appear in your extensions toolbar

---

## 📖 Usage

1. Navigate to any website you want to analyze
2. Click the **SnapStats** icon in your Chrome toolbar
3. Click **“Run Audit”** to start performance analysis
4. Explore tabs for **metrics**, **history**, and **network** insights

---

## 🔧 Development

### Prerequisites

* Node.js (for generating Chrome Web Store promotional images)
* Google Chrome

### Setup

1. Install dependencies

   ```bash
   npm install
   ```
2. Generate promotional images

   ```bash
   npm run generate-promotional
   ```

### Project Structure

```
snapstats/
├── manifest.json          # Extension configuration
├── popup.html             # UI markup
├── popup.js               # Core logic for popup interface
├── icons/                 # Extension icons and assets
├── PRIVACY.md             # Privacy policy
└── README.md              # Documentation
```

---

## 🔒 Privacy

SnapStats only runs when you explicitly activate it.
No personal data is collected, shared, or transmitted externally.
All metrics and performance data are stored securely on your local device using Chrome’s `localStorage`.

### Required Permissions

* **activeTab** — to analyze the currently active website
* **scripting** — to inject and execute performance measurement scripts

---

## 🤝 Contributing

Contributions are welcome!
If you’d like to help improve SnapStats, please review the [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests or feature suggestions.

---

## 📄 License

**MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

* **Developer:** Peyton Nowlin
* **Email:** [peyton@teamnowlin.com](mailto:peyton@teamnowlin.com)
* **Chrome Web Store:** [SnapStats](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)

---

## ⭐ Support

If SnapStats helps you improve your site’s performance:

* ⭐ **Star this repository**
* 💬 **Share it with other developers**
* 🌟 **Leave a review on the [Chrome Web Store](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)**
