# Changelog

All notable changes to SnapStats will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-23

### Added
- Initial release of SnapStats Chrome extension
- Core Web Vitals measurement (TTFB, FCP, LCP, CLS)
- Performance metrics analysis and visualization
- Resource loading analysis and waterfall charts
- Historical performance tracking with charts
- Third-party resource analysis
- Performance recommendations and actionable insights
- Export functionality for performance data
- Privacy-focused design with local data storage
- Beautiful, modern UI with performance indicators

### Features
- **Performance Metrics**: Real-time measurement of Core Web Vitals
- **Resource Analysis**: Detailed breakdown of page resources
- **Network Monitoring**: Request timing and size analysis
- **Historical Tracking**: Performance trends over time
- **Recommendations**: Actionable performance improvement suggestions
- **Export Options**: JSON and CSV export capabilities
- **Privacy-First**: All data stored locally, no external tracking

### Technical Details
- Built with vanilla JavaScript and HTML5
- Uses Chrome Extension Manifest V3
- Implements Performance API and Navigation Timing API
- Local storage for data persistence
- Responsive design with modern CSS

### Permissions
- `activeTab`: To analyze current tab performance
- `scripting`: To run performance measurement code

---

## Future Plans

### Planned Features
- Performance comparison between different pages
- Custom performance thresholds
- Integration with popular analytics tools
- Advanced filtering and search capabilities
- Performance alerts and notifications
- Team collaboration features

### Technical Improvements
- Enhanced error handling and edge cases
- Performance optimizations
- Additional browser compatibility
- Advanced charting and visualization options 