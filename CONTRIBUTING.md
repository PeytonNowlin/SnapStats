# Contributing to SnapStats

Thank you for your interest in contributing to SnapStats! This document provides guidelines for contributing to this Chrome extension.

## 🚀 Getting Started

### Prerequisites

- Node.js (for development tools)
- Chrome browser
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/snapstats.git
   cd snapstats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

## 🛠️ Development

### Project Structure

```
snapstats/
├── manifest.json              # Extension configuration
├── popup.html                # Extension interface
├── popup.js                  # Extension functionality
├── icons/                    # Extension icons
├── PRIVACY.md                # Privacy policy
├── CONTRIBUTING.md           # This file
└── README.md                 # Project documentation
```

### Available Scripts

- `npm run generate-icons` - Generate extension icons
- `npm run generate-promotional` - Generate promotional images for Chrome Web Store
- `npm run prepare-store` - Prepare all store assets

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add JSDoc comments for new functions
- Test changes thoroughly before submitting

## 📝 Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing

Before submitting changes:

1. **Test the extension locally**
   - Load the extension in Chrome
   - Test on various websites
   - Verify all features work correctly

2. **Check for errors**
   - Open Chrome DevTools
   - Check the console for any errors
   - Ensure no performance regressions

## 📋 Pull Request Guidelines

- Provide a clear description of the changes
- Include screenshots if UI changes are made
- Test the changes thoroughly
- Follow the existing code style
- Update documentation if needed

## 🐛 Reporting Issues

When reporting issues, please include:

- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

By contributing to SnapStats, you agree that your contributions will be licensed under the MIT License.

## 📞 Contact

- **Developer**: Peyton Nowlin
- **Email**: peyton@teamnowlin.com
- **Chrome Web Store**: [SnapStats](https://chromewebstore.google.com/detail/snapstats/adcagjffhijnoljgdfejadhcabbfneda)

Thank you for contributing to SnapStats! 🎉 